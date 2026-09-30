<?php
declare(strict_types=1);

namespace HopoShop\Controllers;

use HopoShop\Config\Database;
use HopoShop\Services\PricingService;
use HopoShop\Utils\Response;
use HopoShop\Utils\Validator;

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/Services/PricingService.php';
require_once dirname(__DIR__) . '/Utils/Response.php';
require_once dirname(__DIR__) . '/Utils/Validator.php';

class CartController
{
    private function getCartId(array $request): string
    {
        $pdo = Database::getConnection();
        $user = $request['user'] ?? null;
        $userId = $user['id'] ?? null;

        $headers = $request['headers'] ?? [];
        $sessionId = $headers['X-Session-ID'] ?? $headers['x-session-id'] ?? ($request['body']['sessionId'] ?? 'default-guest-session');

        if ($userId) {
            $stmt = $pdo->prepare("SELECT id, applied_coupon FROM carts WHERE user_id = ? LIMIT 1");
            $stmt->execute([$userId]);
            $cart = $stmt->fetch();

            if ($cart) {
                return $cart['id'];
            }

            $cartId = 'CRT-' . strtoupper(substr(uniqid(), -8));
            $insert = $pdo->prepare("INSERT INTO carts (id, user_id, session_id, created_at) VALUES (?, ?, ?, NOW())");
            $insert->execute([$cartId, $userId, $sessionId]);
            return $cartId;
        }

        // Guest session
        $stmt = $pdo->prepare("SELECT id FROM carts WHERE session_id = ? AND user_id IS NULL LIMIT 1");
        $stmt->execute([$sessionId]);
        $cart = $stmt->fetch();

        if ($cart) {
            return $cart['id'];
        }

        $cartId = 'CRT-' . strtoupper(substr(uniqid(), -8));
        $insert = $pdo->prepare("INSERT INTO carts (id, user_id, session_id, created_at) VALUES (?, NULL, ?, NOW())");
        $insert->execute([$cartId, $sessionId]);
        return $cartId;
    }

    public function get(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $cartId = $this->getCartId($request);

        // Fetch applied coupon
        $cStmt = $pdo->prepare("SELECT applied_coupon FROM carts WHERE id = ?");
        $cStmt->execute([$cartId]);
        $appliedCoupon = $cStmt->fetchColumn() ?: null;

        // Fetch items
        $stmt = $pdo->prepare("
            SELECT 
                ci.id AS cart_item_id,
                ci.product_id,
                ci.variant_id,
                ci.size,
                ci.quantity,
                p.title,
                p.brand,
                p.category_id,
                p.primary_image,
                pv.color_name,
                pv.color_hex,
                pv.image_url AS variant_image
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            LEFT JOIN product_variants pv ON pv.id = ci.variant_id
            WHERE ci.cart_id = ?
            ORDER BY ci.created_at ASC
        ");
        $stmt->execute([$cartId]);
        $rawItems = $stmt->fetchAll();

        // Calculate totals authoritatively via PricingService
        $calculation = PricingService::calculateOrderTotals($rawItems, $appliedCoupon, $request['user']['id'] ?? null);

        // Attach cart_item_id to resolved items
        foreach ($calculation['items'] as $index => &$item) {
            $item['cartItemId'] = $rawItems[$index]['cart_item_id'] ?? null;
            $item['selectedColor'] = $rawItems[$index]['color_name'] ?? 'Classic';
            $item['colorHex'] = $rawItems[$index]['color_hex'] ?? '#8B1E3F';
            $item['image'] = $rawItems[$index]['variant_image'] ?: $rawItems[$index]['primary_image'];
        }

        Response::success([
            'cartId'     => $cartId,
            'items'      => $calculation['items'],
            'itemCount'  => count($calculation['items']),
            'totals'     => [
                'subtotal'              => $calculation['subtotal'],
                'mrpTotal'              => $calculation['mrpTotal'],
                'savings'               => $calculation['savings'],
                'couponCode'            => $calculation['couponCode'],
                'couponDiscount'        => $calculation['couponDiscount'],
                'shippingFee'           => $calculation['shippingFee'],
                'freeShippingThreshold' => $calculation['freeShippingThreshold'],
                'gstAmount'             => $calculation['gstAmount'],
                'totalAmount'           => $calculation['totalAmount'],
            ],
        ]);
    }

    public function addItem(array $params, array $request): void
    {
        $body = $request['body'] ?? [];
        $missing = Validator::requireFields($body, ['productId', 'size']);
        if (!empty($missing)) {
            Response::validationError('Product ID and Size are required', ['missing' => $missing]);
        }

        $productId = (string)$body['productId'];
        $variantId = isset($body['variantId']) && $body['variantId'] !== '' ? (string)$body['variantId'] : null;
        $size = (string)$body['size'];
        $quantity = max(1, (int)($body['quantity'] ?? 1));

        $pdo = Database::getConnection();
        $cartId = $this->getCartId($request);

        // Check if item already exists in cart -> update quantity
        $checkStmt = $pdo->prepare("
            SELECT id, quantity 
            FROM cart_items 
            WHERE cart_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL)) AND size = ?
            LIMIT 1
        ");
        $checkStmt->execute([$cartId, $productId, $variantId, $variantId, $size]);
        $existing = $checkStmt->fetch();

        if ($existing) {
            $newQty = $existing['quantity'] + $quantity;
            $upd = $pdo->prepare("UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?");
            $upd->execute([$newQty, $existing['id']]);
        } else {
            $ins = $pdo->prepare("
                INSERT INTO cart_items (cart_id, product_id, variant_id, size, quantity, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $ins->execute([$cartId, $productId, $variantId, $size, $quantity]);
        }

        $this->get($params, $request);
    }

    public function updateItem(array $params, array $request): void
    {
        $itemId = (int)($params['id'] ?? 0);
        $body = $request['body'] ?? [];
        $quantity = (int)($body['quantity'] ?? $body['qty'] ?? 1);

        $pdo = Database::getConnection();
        $cartId = $this->getCartId($request);

        if ($quantity <= 0) {
            $del = $pdo->prepare("DELETE FROM cart_items WHERE id = ? AND cart_id = ?");
            $del->execute([$itemId, $cartId]);
        } else {
            $upd = $pdo->prepare("UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ? AND cart_id = ?");
            $upd->execute([$quantity, $itemId, $cartId]);
        }

        $this->get($params, $request);
    }

    public function removeItem(array $params, array $request): void
    {
        $itemId = (int)($params['id'] ?? 0);
        $pdo = Database::getConnection();
        $cartId = $this->getCartId($request);

        $del = $pdo->prepare("DELETE FROM cart_items WHERE id = ? AND cart_id = ?");
        $del->execute([$itemId, $cartId]);

        $this->get($params, $request);
    }

    public function clear(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $cartId = $this->getCartId($request);

        $del = $pdo->prepare("DELETE FROM cart_items WHERE cart_id = ?");
        $del->execute([$cartId]);

        $upd = $pdo->prepare("UPDATE carts SET applied_coupon = NULL WHERE id = ?");
        $upd->execute([$cartId]);

        Response::success(null, 'Cart cleared successfully');
    }

    public function applyCoupon(array $params, array $request): void
    {
        $code = trim((string)($request['body']['code'] ?? ''));
        if ($code === '') {
            Response::validationError('Coupon code is required');
        }

        $pdo = Database::getConnection();
        $cartId = $this->getCartId($request);

        // Fetch cart items to test coupon
        $stmt = $pdo->prepare("
            SELECT ci.product_id, ci.variant_id, ci.size, ci.quantity, p.category_id
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = ?
        ");
        $stmt->execute([$cartId]);
        $items = $stmt->fetchAll();

        if (empty($items)) {
            Response::error('Your cart is empty. Add items before applying a coupon.');
        }

        require_once dirname(__DIR__) . '/Services/CouponService.php';
        $calc = PricingService::calculateOrderTotals($items, null, $request['user']['id'] ?? null);
        $couponCheck = \HopoShop\Services\CouponService::validateCoupon($code, $calc['subtotal'], $calc['items'], $request['user']['id'] ?? null);

        if (!$couponCheck['valid']) {
            Response::error($couponCheck['message']);
        }

        // Save coupon to cart
        $upd = $pdo->prepare("UPDATE carts SET applied_coupon = ? WHERE id = ?");
        $upd->execute([$code, $cartId]);

        $this->get($params, $request);
    }

    public function removeCoupon(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $cartId = $this->getCartId($request);

        $upd = $pdo->prepare("UPDATE carts SET applied_coupon = NULL WHERE id = ?");
        $upd->execute([$cartId]);

        $this->get($params, $request);
    }
}
