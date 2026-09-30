<?php
declare(strict_types=1);

namespace HopoShop\Services;

use PDO;
use HopoShop\Config\Database;

require_once dirname(__DIR__, 2) . '/config/database.php';

class CouponService
{
    public static function validateCoupon(string $code, float $orderSubtotal, array $items = [], ?string $userId = null): array
    {
        $pdo = Database::getConnection();
        $code = strtoupper(trim($code));

        $stmt = $pdo->prepare("SELECT * FROM coupons WHERE code = ? LIMIT 1");
        $stmt->execute([$code]);
        $coupon = $stmt->fetch();

        if (!$coupon) {
            return [
                'valid'   => false,
                'message' => "Coupon code '{$code}' does not exist.",
            ];
        }

        if ((int)$coupon['enabled'] !== 1) {
            return [
                'valid'   => false,
                'message' => "Coupon '{$code}' is currently inactive.",
            ];
        }

        $expiry = strtotime($coupon['expiry_date']);
        if ($expiry < time()) {
            return [
                'valid'   => false,
                'message' => "Coupon '{$code}' expired on " . date('d M Y', $expiry) . ".",
            ];
        }

        $minOrder = (float)$coupon['min_order_amount'];
        if ($orderSubtotal < $minOrder) {
            return [
                'valid'   => false,
                'message' => "Minimum order of ₹" . number_format($minOrder, 2) . " required for '{$code}'.",
            ];
        }

        // Category restriction check
        if (!empty($coupon['category_restriction'])) {
            $catStmt = $pdo->prepare("SELECT id FROM categories WHERE name = ? LIMIT 1");
            $catStmt->execute([$coupon['category_restriction']]);
            $catId = $catStmt->fetchColumn();

            if ($catId) {
                $hasMatchingCategory = false;
                foreach ($items as $item) {
                    if (($item['categoryId'] ?? null) == $catId) {
                        $hasMatchingCategory = true;
                        break;
                    }
                }
                if (!$hasMatchingCategory) {
                    return [
                        'valid'   => false,
                        'message' => "Coupon '{$code}' applies only to items in the '{$coupon['category_restriction']}' collection.",
                    ];
                }
            }
        }

        // Calculate discount
        $discountAmount = 0.0;
        if ($coupon['discount_type'] === 'PERCENTAGE') {
            $percent = (float)$coupon['discount_value'];
            $discountAmount = round(($orderSubtotal * $percent) / 100, 2);
            if ($coupon['max_discount_cap'] !== null) {
                $cap = (float)$coupon['max_discount_cap'];
                $discountAmount = min($discountAmount, $cap);
            }
        } else {
            // FLAT discount
            $flat = (float)$coupon['discount_value'];
            $discountAmount = min($orderSubtotal, $flat);
        }

        return [
            'valid'           => true,
            'message'         => "Coupon '{$code}' applied successfully!",
            'discount_amount' => $discountAmount,
            'coupon'          => $coupon,
        ];
    }

    public static function recordUsage(int $couponId, string $userId, ?string $orderId, float $discountAmount): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount, used_at) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([$couponId, $userId, $orderId, $discountAmount]);
    }
}
