<?php
declare(strict_types=1);

namespace HopoShop\Controllers;

use HopoShop\Config\Database;
use HopoShop\Services\CouponService;
use HopoShop\Utils\Response;

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/Services/CouponService.php';
require_once dirname(__DIR__) . '/Utils/Response.php';

class CouponController
{
    public function index(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("
            SELECT 
                code,
                title,
                description,
                discount_type AS discountType,
                discount_value AS discountValue,
                min_order_amount AS minOrderAmount,
                max_discount_cap AS maxDiscountCap,
                category_restriction AS categoryRestriction,
                expiry_date AS expiryDate,
                enabled
            FROM coupons
            WHERE enabled = 1 AND expiry_date >= NOW()
            ORDER BY min_order_amount ASC
        ");

        $coupons = $stmt->fetchAll();
        foreach ($coupons as &$c) {
            $c['discountValue'] = (float)$c['discountValue'];
            $c['minOrderAmount'] = (float)$c['minOrderAmount'];
            $c['maxDiscountCap'] = $c['maxDiscountCap'] !== null ? (float)$c['maxDiscountCap'] : null;
            $c['enabled'] = (bool)$c['enabled'];
        }

        Response::success($coupons);
    }

    public function validate(array $params, array $request): void
    {
        $body = $request['body'] ?? [];
        $code = trim((string)($body['code'] ?? ''));
        $subtotal = (float)($body['subtotal'] ?? 0.0);
        $items = $body['items'] ?? [];
        $userId = $request['user']['id'] ?? ($body['userId'] ?? null);

        if ($code === '') {
            Response::validationError('Coupon code is required');
        }

        $result = CouponService::validateCoupon($code, $subtotal, $items, $userId);

        if (!$result['valid']) {
            Response::error($result['message'], 400);
        }

        $coupon = $result['coupon'];
        Response::success([
            'valid'               => true,
            'message'             => $result['message'],
            'discountAmount'      => $result['discount_amount'],
            'code'                => $coupon['code'],
            'discountType'        => $coupon['discount_type'],
            'discountValue'       => (float)$coupon['discount_value'],
            'minOrderAmount'      => (float)$coupon['min_order_amount'],
            'maxDiscountCap'      => $coupon['max_discount_cap'] !== null ? (float)$coupon['max_discount_cap'] : null,
            'categoryRestriction' => $coupon['category_restriction'],
        ]);
    }
}
