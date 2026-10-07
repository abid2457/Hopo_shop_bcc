<?php
declare(strict_types=1);

namespace HopoShop\Controllers;

use PDO;
use Exception;
use HopoShop\Config\Database;
use HopoShop\Services\CouponService;
use HopoShop\Services\InventoryService;
use HopoShop\Services\PricingService;
use HopoShop\Services\NotificationService;
use HopoShop\Services\EmailService;
use HopoShop\Utils\Response;
use HopoShop\Utils\Validator;

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/Services/CouponService.php';
require_once dirname(__DIR__) . '/Services/InventoryService.php';
require_once dirname(__DIR__) . '/Services/PricingService.php';
require_once dirname(__DIR__) . '/Services/NotificationService.php';
require_once dirname(__DIR__) . '/Services/EmailService.php';
require_once dirname(__DIR__) . '/Utils/Response.php';
require_once dirname(__DIR__) . '/Utils/Validator.php';

class OrderController
{
    public function checkout(array $params, array $request): void
    {
        $body = $request['body'] ?? [];
        $user = $request['user'] ?? null;
        $userId = $user['id'] ?? ($body['userId'] ?? 'USR-GUEST-' . strtoupper(substr(uniqid(), -6)));

        $items = $body['items'] ?? [];
        if (empty($items)) {
            Response::validationError('Cart or order items cannot be empty.');
        }

        $address = $body['deliveryAddress'] ?? $body['address'] ?? null;
        if (!$address || empty($address['fullName']) || empty($address['addressLine1']) || empty($address['city']) || empty($address['pincode'])) {
            Response::validationError('Complete delivery address is required.');
        }

        $paymentMethod = strtoupper(trim((string)($body['paymentMethod'] ?? 'UPI')));
        if (!in_array($paymentMethod, ['UPI', 'CARD', 'NET_BANKING', 'COD'], true)) {
            $paymentMethod = 'UPI';
        }

        $couponCode = $body['appliedCoupon'] ?? $body['couponCode'] ?? null;

        $pdo = Database::getConnection();
        $pdo->beginTransaction();

        try {
            // 1. Authoritative financial calculation
            $pricing = PricingService::calculateOrderTotals($items, $couponCode, $userId);

            if (empty($pricing['items'])) {
                throw new Exception("No valid items found in order payload.");
            }

            // 2. Generate Order ID and tracking details
            $orderId = 'ORD-' . strtoupper(bin2hex(random_bytes(4)));
            $trackingNumber = 'BD' . strtoupper(substr(uniqid(), -6)) . 'IN';
            $courierPartner = 'BlueDart Express Luxe';
            $estimatedDays = 5;
            $estimatedDelivery = date('Y-m-d', strtotime("+{$estimatedDays} weekdays"));

            // 3. Inventory reservation & Stock deduction (row locks)
            foreach ($pricing['items'] as $item) {
                $varId = $item['variantId'] ?? null;
                if ($varId) {
                    $checkV = $pdo->prepare("SELECT id FROM product_variants WHERE id = ? LIMIT 1");
                    $checkV->execute([$varId]);
                    if (!$checkV->fetch()) {
                        $varId = null;
                    }
                }
                if (!$varId) {
                    $vLookup = $pdo->prepare("SELECT id FROM product_variants WHERE product_id = ? LIMIT 1");
                    $vLookup->execute([$item['productId']]);
                    $varId = $vLookup->fetchColumn() ?: null;
                }

                if ($varId) {
                    InventoryService::deductStock($pdo, (string)$varId, $item['size'], (int)$item['quantity'], $orderId);
                }
            }

            // 4. Record coupon usage if applied
            if (!empty($pricing['couponCode']) && $pricing['couponDiscount'] > 0) {
                $cStmt = $pdo->prepare("SELECT id FROM coupons WHERE code = ? LIMIT 1");
                $cStmt->execute([$pricing['couponCode']]);
                if ($couponRow = $cStmt->fetch()) {
                    CouponService::recordUsage((int)$couponRow['id'], $userId, $orderId, $pricing['couponDiscount']);
                }
            }

            // 5. Insert order
            $orderSql = "
                INSERT INTO orders (
                    id, user_id, subtotal, mrp_total, coupon_code, coupon_discount,
                    shipping_fee, gst_amount, total_amount, payment_method, payment_status,
                    order_status, tracking_number, courier_partner, estimated_delivery,
                    shipping_address, created_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    'CONFIRMED', ?, ?, ?,
                    ?, NOW()
                )
            ";

            $paymentStatus = ($paymentMethod === 'COD') ? 'PENDING' : 'PAID';

            $orderStmt = $pdo->prepare($orderSql);
            $orderStmt->execute([
                $orderId,
                $userId,
                $pricing['subtotal'],
                $pricing['mrpTotal'],
                $pricing['couponCode'],
                $pricing['couponDiscount'],
                $pricing['shippingFee'],
                $pricing['gstAmount'],
                $pricing['totalAmount'],
                $paymentMethod,
                $paymentStatus,
                $trackingNumber,
                $courierPartner,
                $estimatedDelivery,
                json_encode($address, JSON_UNESCAPED_UNICODE),
            ]);

            // 6. Insert order items
            $itemSql = "
                INSERT INTO order_items (
                    order_id, product_id, product_title, brand, image_url,
                    size, color, unit_price, quantity, total_price
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ";
            $itemStmt = $pdo->prepare($itemSql);

            foreach ($pricing['items'] as $it) {
                $itemStmt->execute([
                    $orderId,
                    $it['productId'],
                    $it['title'],
                    $it['brand'],
                    $it['image'],
                    $it['size'],
                    $it['color'],
                    $it['unitPrice'],
                    $it['quantity'],
                    $it['totalPrice'],
                ]);
            }

            // 7. Insert initial order confirmed timeline event
            $timelineSql = "
                INSERT INTO order_timeline (order_id, status, title, description, completed, event_time)
                VALUES (?, 'CONFIRMED', 'Order Placed & Confirmed', 'Your luxury couture order has been verified and registered with Hopo Atelier.', 1, NOW())
            ";
            $timelineStmt = $pdo->prepare($timelineSql);
            $timelineStmt->execute([$orderId]);

            // 8. Record payment
            $paySql = "
                INSERT INTO payments (id, order_id, transaction_id, payment_method, amount, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ";
            $payStmt = $pdo->prepare($paySql);
            $payId = 'PAY-' . strtoupper(substr(uniqid(), -8));
            $txId = 'TXN-' . strtoupper(bin2hex(random_bytes(6)));
            $payStmt->execute([$payId, $orderId, $txId, $paymentMethod, $pricing['totalAmount'], ($paymentStatus === 'PAID' ? 'SUCCESS' : 'PENDING')]);

            // 9. Record shipment
            $shipSql = "
                INSERT INTO shipments (id, order_id, tracking_number, courier, status, estimated_delivery, created_at)
                VALUES (?, ?, ?, ?, 'MANIFESTED', ?, NOW())
            ";
            $shipStmt = $pdo->prepare($shipSql);
            $shipId = 'SHP-' . strtoupper(substr(uniqid(), -8));
            $shipStmt->execute([$shipId, $orderId, $trackingNumber, $courierPartner, $estimatedDelivery]);

            // 10. Clear user's cart
            if (!empty($user['id'])) {
                $cClear = $pdo->prepare("DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ?)");
                $cClear->execute([$user['id']]);
                $cReset = $pdo->prepare("UPDATE carts SET applied_coupon = NULL WHERE user_id = ?");
                $cReset->execute([$user['id']]);
            }

            // Award loyalty points to user
            if (!empty($user['id'])) {
                $earnedPoints = (int)floor($pricing['totalAmount'] / 100);
                $ptsUpd = $pdo->prepare("UPDATE users SET points = points + ? WHERE id = ?");
                $ptsUpd->execute([$earnedPoints, $user['id']]);
            }

            $pdo->commit();

            // Dispatch order placement notifications to customer and atelier
            try {
                NotificationService::notifyOrderPlaced($pdo, $orderId, $userId, (float)$pricing['totalAmount'], $pricing['items']);
            } catch (\Throwable $ne) {
                error_log('Order placement notification error: ' . $ne->getMessage());
            }

            // Return full order record matching frontend structure
            $fullOrder = $this->fetchOrderById($orderId);

            // Dispatch transactional emails (Customer Receipt + Admin Alert)
            try {
                $customerData = [
                    'name'  => $address['fullName'] ?? ($user['name'] ?? 'Valued Customer'),
                    'email' => $address['email'] ?? ($user['email'] ?? ($body['email'] ?? '')),
                    'phone' => $address['phone'] ?? ($user['phone'] ?? ($body['phone'] ?? '')),
                ];
                if (!empty($customerData['email'])) {
                    EmailService::sendOrderConfirmation($fullOrder ?: ['id' => $orderId, 'total_amount' => $pricing['totalAmount']], $customerData, $pricing['items']);
                }
                EmailService::sendAdminNewOrderAlert($fullOrder ?: ['id' => $orderId, 'total_amount' => $pricing['totalAmount'], 'payment_method' => $paymentMethod], $customerData, $pricing['items']);
            } catch (\Throwable $me) {
                error_log('Order email dispatch warning: ' . $me->getMessage());
            }

            Response::success($fullOrder, 'Order placed successfully!', 201);

        } catch (Exception $e) {
            $pdo->rollBack();
            error_log("Checkout transaction failed: " . $e->getMessage());
            Response::error('Checkout could not be completed: ' . $e->getMessage(), 400);
        }
    }

    public function index(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user) {
            Response::unauthorized();
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id FROM orders WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user['id']]);
        $orderIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $orders = [];
        foreach ($orderIds as $orderId) {
            $order = $this->fetchOrderById($orderId);
            if ($order) {
                $orders[] = $order;
            }
        }

        Response::success($orders);
    }

    public function show(array $params, array $request): void
    {
        $orderId = $params['id'] ?? '';
        $order = $this->fetchOrderById($orderId);

        if (!$order) {
            Response::notFound("Order '{$orderId}' not found.");
        }

        // Security check if logged in
        $user = $request['user'] ?? null;
        if ($user && ($user['role'] ?? '') !== 'ADMIN' && $order['userId'] !== $user['id']) {
            Response::forbidden("You are not authorized to view this order.");
        }

        Response::success($order);
    }

    public function cancel(array $params, array $request): void
    {
        $orderId = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? LIMIT 1");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();

        if (!$order) {
            Response::notFound("Order not found.");
        }

        if (in_array($order['order_status'], ['CANCELLED', 'DELIVERED', 'SHIPPED'], true)) {
            Response::error("Cannot cancel order in status '{$order['order_status']}'.");
        }

        $pdo->beginTransaction();
        try {
            // Restore inventory
            $itemStmt = $pdo->prepare("SELECT product_id, size, quantity FROM order_items WHERE order_id = ?");
            $itemStmt->execute([$orderId]);
            $items = $itemStmt->fetchAll();

            foreach ($items as $item) {
                // Find variant id
                $vStmt = $pdo->prepare("SELECT id FROM product_variants WHERE product_id = ? LIMIT 1");
                $vStmt->execute([$item['product_id']]);
                $varId = $vStmt->fetchColumn();

                if ($varId) {
                    InventoryService::restoreStock($pdo, (string)$varId, $item['size'], (int)$item['quantity'], $orderId);
                }
            }

            // Update order status
            $upd = $pdo->prepare("UPDATE orders SET order_status = 'CANCELLED', updated_at = NOW() WHERE id = ?");
            $upd->execute([$orderId]);

            // Add timeline event
            $tl = $pdo->prepare("INSERT INTO order_timeline (order_id, status, title, description, completed, event_time) VALUES (?, 'CANCELLED', 'Order Cancelled', 'Customer requested order cancellation.', 1, NOW())");
            $tl->execute([$orderId]);

            $pdo->commit();

            try {
                NotificationService::notifyOrderStatusChanged($pdo, $orderId, 'CANCELLED');
            } catch (\Throwable $ne) {
                error_log('Order cancel notification error: ' . $ne->getMessage());
            }

            $updated = $this->fetchOrderById($orderId);
            Response::success($updated, 'Order cancelled successfully.');
        } catch (Exception $e) {
            $pdo->rollBack();
            Response::error('Failed to cancel order: ' . $e->getMessage());
        }
    }

    public function returnOrder(array $params, array $request): void
    {
        $orderId = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? LIMIT 1");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();

        if (!$order) {
            Response::notFound("Order not found.");
        }

        $reason = $request['body']['reason'] ?? 'Standard return request';

        $upd = $pdo->prepare("UPDATE orders SET order_status = 'RETURN_REQUESTED', updated_at = NOW() WHERE id = ?");
        $upd->execute([$orderId]);

        $tl = $pdo->prepare("INSERT INTO order_timeline (order_id, status, title, description, completed, event_time) VALUES (?, 'RETURN_REQUESTED', 'Return Requested', ?, 1, NOW())");
        $tl->execute([$orderId, $reason]);

        try {
            NotificationService::notifyOrderStatusChanged($pdo, $orderId, 'RETURN_REQUESTED');
        } catch (\Throwable $ne) {
            error_log('Order return notification error: ' . $ne->getMessage());
        }

        $updated = $this->fetchOrderById($orderId);
        Response::success($updated, 'Return request registered.');
    }

    private function fetchOrderById(string $orderId): ?array
    {
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? LIMIT 1");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();

        if (!$order) {
            return null;
        }

        // Fetch items
        $iStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $iStmt->execute([$orderId]);
        $rawItems = $iStmt->fetchAll();

        $items = array_map(function ($it) {
            return [
                'id'            => $it['product_id'],
                'productId'     => $it['product_id'],
                'title'         => $it['product_title'],
                'brand'         => $it['brand'],
                'image'         => $it['image_url'],
                'size'          => $it['size'],
                'selectedColor' => $it['color'],
                'price'         => (float)$it['unit_price'],
                'unitPrice'     => (float)$it['unit_price'],
                'qty'           => (int)$it['quantity'],
                'quantity'      => (int)$it['quantity'],
                'totalPrice'    => (float)$it['total_price'],
            ];
        }, $rawItems);

        // Fetch timeline
        $tStmt = $pdo->prepare("SELECT status, title, description, event_time, completed FROM order_timeline WHERE order_id = ? ORDER BY id ASC");
        $tStmt->execute([$orderId]);
        $rawTimeline = $tStmt->fetchAll();

        $timeline = array_map(function ($tl) {
            return [
                'status'      => $tl['status'],
                'title'       => $tl['title'],
                'description' => $tl['description'],
                'timestamp'   => $tl['event_time'],
                'completed'   => (bool)$tl['completed'],
            ];
        }, $rawTimeline);

        $address = json_decode($order['shipping_address'], true) ?? [];

        return [
            'id'                    => $order['id'],
            'userId'                => $order['user_id'],
            'items'                 => $items,
            'subtotal'              => (float)$order['subtotal'],
            'mrpTotal'              => (float)$order['mrp_total'],
            'couponDiscount'        => (float)$order['coupon_discount'],
            'appliedCoupon'         => $order['coupon_code'],
            'shippingFee'           => (float)$order['shipping_fee'],
            'gstAmount'             => (float)$order['gst_amount'],
            'totalAmount'           => (float)$order['total_amount'],
            'paymentMethod'         => $order['payment_method'],
            'paymentStatus'         => $order['payment_status'],
            'orderStatus'           => $order['order_status'],
            'deliveryAddress'       => $address,
            'createdAt'             => $order['created_at'],
            'estimatedDeliveryDate' => $order['estimated_delivery'],
            'trackingNumber'        => $order['tracking_number'],
            'courierPartner'        => $order['courier_partner'],
            'timeline'              => $timeline,
        ];
    }
}
