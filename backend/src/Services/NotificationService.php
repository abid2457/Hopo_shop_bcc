<?php
declare(strict_types=1);

namespace HopoShop\Services;

use PDO;

class NotificationService
{
    /**
     * Inserts a notification record with deduplication via event_key.
     * Returns notification ID or null if duplicate or invalid.
     */
    public static function create(PDO $pdo, array $data): ?string
    {
        $id = $data['id'] ?? ('ntf_' . bin2hex(random_bytes(8)));
        $userId = $data['user_id'] ?? null;
        $recipientRole = in_array($data['recipient_role'] ?? 'CUSTOMER', ['CUSTOMER', 'ADMIN'], true) ? $data['recipient_role'] : 'CUSTOMER';
        $eventKey = !empty($data['event_key']) ? (string)$data['event_key'] : null;
        $category = strtoupper(trim((string)($data['category'] ?? 'ORDERS')));
        $title = trim((string)($data['title'] ?? ''));
        $body = trim((string)($data['body'] ?? ''));
        $actionUrl = !empty($data['action_url']) ? (string)$data['action_url'] : null;
        $entityType = !empty($data['entity_type']) ? (string)$data['entity_type'] : null;
        $entityId = !empty($data['entity_id']) ? (string)$data['entity_id'] : null;
        $imageUrl = !empty($data['image_url']) ? (string)$data['image_url'] : null;

        if (empty($title) || empty($body)) {
            return null;
        }

        // Deduplication check
        if ($eventKey) {
            $check = $pdo->prepare("SELECT id FROM notifications WHERE event_key = ? LIMIT 1");
            $check->execute([$eventKey]);
            if ($check->fetch()) {
                return null; // Already exists, prevent duplicate
            }
        }

        $stmt = $pdo->prepare("
            INSERT INTO notifications 
            (id, user_id, recipient_role, event_key, category, title, body, action_url, entity_type, entity_id, image_url, is_read, is_cleared, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW())
        ");
        $stmt->execute([
            $id, $userId, $recipientRole, $eventKey, $category, $title, $body, $actionUrl, $entityType, $entityId, $imageUrl
        ]);

        return $id;
    }

    /**
     * Dispatches order notifications on placement for both Customer and Admin.
     */
    public static function notifyOrderPlaced(PDO $pdo, string $orderId, string $userId, float $totalAmount, array $items = []): void
    {
        // 1. Customer notification
        $firstItemTitle = !empty($items[0]['title']) ? $items[0]['title'] : (!empty($items[0]['product_title']) ? $items[0]['product_title'] : 'Couture Ensemble');
        $firstItemImage = !empty($items[0]['image']) ? $items[0]['image'] : (!empty($items[0]['image_url']) ? $items[0]['image_url'] : null);
        $moreCount = count($items) > 1 ? ' and ' . (count($items) - 1) . ' more piece' . (count($items) > 2 ? 's' : '') : '';

        self::create($pdo, [
            'user_id'        => $userId,
            'recipient_role' => 'CUSTOMER',
            'event_key'      => "ORDER_{$orderId}_PLACED",
            'category'       => 'ORDERS',
            'title'          => 'Order Placed Successfully',
            'body'           => "Your order #{$orderId} for ₹" . number_format($totalAmount, 2) . " has been confirmed ({$firstItemTitle}{$moreCount}).",
            'action_url'     => "/order/{$orderId}",
            'entity_type'    => 'order',
            'entity_id'      => $orderId,
            'image_url'      => $firstItemImage,
        ]);

        // 2. Admin notification
        $uStmt = $pdo->prepare("SELECT name, email FROM users WHERE id = ? LIMIT 1");
        $uStmt->execute([$userId]);
        $uRow = $uStmt->fetch();
        $customerName = $uRow['name'] ?? 'VIP Customer';

        self::create($pdo, [
            'user_id'        => null,
            'recipient_role' => 'ADMIN',
            'event_key'      => "ADMIN_NEW_ORDER_{$orderId}",
            'category'       => 'ORDERS',
            'title'          => 'New Customer Order Received',
            'body'           => "Order #{$orderId} (₹" . number_format($totalAmount, 2) . ") was placed by {$customerName}.",
            'action_url'     => "/admin/orders",
            'entity_type'    => 'order',
            'entity_id'      => $orderId,
            'image_url'      => $firstItemImage,
        ]);
    }

    /**
     * Dispatches status transition notifications when an order progresses.
     */
    public static function notifyOrderStatusChanged(PDO $pdo, string $orderId, string $newStatus, string $prevStatus = ''): void
    {
        if ($newStatus === $prevStatus) {
            return;
        }

        // Lookup order details
        $stmt = $pdo->prepare("SELECT user_id, tracking_number FROM orders WHERE id = ? LIMIT 1");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        if (!$order) {
            return;
        }
        $userId = $order['user_id'];
        $tracking = $order['tracking_number'] ?? '';

        // Lookup first product image and title
        $itemStmt = $pdo->prepare("SELECT product_title, image_url FROM order_items WHERE order_id = ? LIMIT 1");
        $itemStmt->execute([$orderId]);
        $item = $itemStmt->fetch();
        $itemTitle = $item['product_title'] ?? 'Couture Piece';
        $imageUrl = $item['image_url'] ?? null;

        $messages = [
            'CONFIRMED' => [
                'title' => 'Order Confirmed & Tailoring Initiated',
                'body'  => "{$itemTitle} • Atelier tailoring verified. Order #{$orderId}",
            ],
            'PACKED' => [
                'title' => 'Packed and Ready to Ship',
                'body'  => "{$itemTitle} • Atelier quality inspection passed. Boxed in luxury crate. Order #{$orderId}",
            ],
            'SHIPPED' => [
                'title' => 'Dispatched via BlueDart Luxe',
                'body'  => "{$itemTitle} • Handed over for express transit" . ($tracking ? " (AWB: {$tracking})" : "") . ". Order #{$orderId}",
            ],
            'OUT_FOR_DELIVERY' => [
                'title' => 'Your Order is Out for Delivery',
                'body'  => "{$itemTitle} • Courier partner is delivering today by 7 PM. Order #{$orderId}",
            ],
            'DELIVERED' => [
                'title' => 'Order Delivered Successfully',
                'body'  => "{$itemTitle} • Delivered successfully. We hope you cherish your piece. Order #{$orderId}",
            ],
            'CANCELLED' => [
                'title' => 'Order Cancelled',
                'body'  => "Order #{$orderId} for {$itemTitle} has been cancelled by administration.",
            ],
            'RETURN_REQUESTED' => [
                'title' => 'Return Request Received',
                'body'  => "Exchange / return concierge inquiry initiated for Order #{$orderId}.",
            ],
        ];

        if (isset($messages[$newStatus])) {
            // Customer notification
            self::create($pdo, [
                'user_id'        => $userId,
                'recipient_role' => 'CUSTOMER',
                'event_key'      => "ORDER_{$orderId}_{$newStatus}",
                'category'       => 'ORDERS',
                'title'          => $messages[$newStatus]['title'],
                'body'           => $messages[$newStatus]['body'],
                'action_url'     => "/order/{$orderId}",
                'entity_type'    => 'order',
                'entity_id'      => $orderId,
                'image_url'      => $imageUrl,
            ]);

            // Admin notification
            self::create($pdo, [
                'user_id'        => null,
                'recipient_role' => 'ADMIN',
                'event_key'      => "ADMIN_ORDER_{$orderId}_{$newStatus}",
                'category'       => 'ORDERS',
                'title'          => "Order #{$orderId} Status Updated",
                'body'           => "Order #{$orderId} status transitioned to {$newStatus}.",
                'action_url'     => "/admin/orders",
                'entity_type'    => 'order',
                'entity_id'      => $orderId,
                'image_url'      => $imageUrl,
            ]);
        }
    }

    /**
     * Dispatches low stock or out of stock alert for Admin.
     */
    public static function notifyStockLevel(PDO $pdo, int $variantSizeId, int $newStock): void
    {
        $stmt = $pdo->prepare("
            SELECT vs.size, p.id as product_id, p.title, p.primary_image
            FROM variant_sizes vs
            JOIN product_variants pv ON pv.id = vs.variant_id
            JOIN products p ON p.id = pv.product_id
            WHERE vs.id = ?
            LIMIT 1
        ");
        $stmt->execute([$variantSizeId]);
        $row = $stmt->fetch();
        if (!$row) return;

        $title = $row['title'];
        $size = $row['size'];
        $image = $row['primary_image'];
        $productId = $row['product_id'];

        if ($newStock === 0) {
            self::create($pdo, [
                'user_id'        => null,
                'recipient_role' => 'ADMIN',
                'event_key'      => "ADMIN_OUT_OF_STOCK_{$variantSizeId}_" . date('Ymd'),
                'category'       => 'INVENTORY',
                'title'          => 'Out of Stock Alert',
                'body'           => "{$title} (Size {$size}) has reached 0 units. Replenish immediately.",
                'action_url'     => "/admin/inventory",
                'entity_type'    => 'inventory',
                'entity_id'      => $productId,
                'image_url'      => $image,
            ]);
        } elseif ($newStock <= 2) {
            self::create($pdo, [
                'user_id'        => null,
                'recipient_role' => 'ADMIN',
                'event_key'      => "ADMIN_LOW_STOCK_{$variantSizeId}_" . date('Ymd'),
                'category'       => 'INVENTORY',
                'title'          => 'Low Stock Alert',
                'body'           => "{$title} (Size {$size}) is running low with only {$newStock} units left.",
                'action_url'     => "/admin/inventory",
                'entity_type'    => 'inventory',
                'entity_id'      => $productId,
                'image_url'      => $image,
            ]);
        }
    }

    /**
     * Dispatches offer notifications to customers and admins.
     */
    public static function notifyOfferCreated(PDO $pdo, string $offerId, string $code, string $title, string $desc = ''): void
    {
        // 1. Admin record
        self::create($pdo, [
            'user_id'        => null,
            'recipient_role' => 'ADMIN',
            'event_key'      => "ADMIN_OFFER_{$offerId}_CREATED",
            'category'       => 'OFFERS',
            'title'          => 'Special Offer Activated',
            'body'           => "Offer '{$title}' ({$code}) is now active on the atelier storefront.",
            'action_url'     => "/admin/offers",
            'entity_type'    => 'offer',
            'entity_id'      => $offerId,
        ]);

        // 2. Customer broadcast record for active customers
        $custStmt = $pdo->query("SELECT id FROM users WHERE role = 'CUSTOMER'");
        $customers = $custStmt->fetchAll(PDO::FETCH_COLUMN);
        foreach ($customers as $cId) {
            self::create($pdo, [
                'user_id'        => $cId,
                'recipient_role' => 'CUSTOMER',
                'event_key'      => "OFFER_{$offerId}_USER_{$cId}",
                'category'       => 'OFFERS',
                'title'          => $title,
                'body'           => $desc ?: "Exclusive privilege offer {$code} is now available on selected collections.",
                'action_url'     => "/offers",
                'entity_type'    => 'offer',
                'entity_id'      => $offerId,
                'image_url'      => '/images/category_festive_wear.png',
            ]);
        }
    }
}
