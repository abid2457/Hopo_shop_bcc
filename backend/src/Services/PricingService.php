<?php
declare(strict_types=1);

namespace HopoShop\Services;

use PDO;
use HopoShop\Config\Config;
use HopoShop\Config\Database;

require_once dirname(__DIR__, 2) . '/config/config.php';
require_once dirname(__DIR__, 2) . '/config/database.php';

class PricingService
{
    /**
     * Resolves the authoritative live price and MRP for a product/variant combination.
     * Considers:
     * 1. Admin real-time price overrides table
     * 2. Variant price/mrp override
     * 3. Product base_price and mrp
     */
    public static function resolveItemPrice(string $productId, ?string $variantId = null): array
    {
        $pdo = Database::getConnection();

        // 1. Check admin price override
        $overrideStmt = $pdo->prepare("SELECT override_price, override_mrp FROM product_price_overrides WHERE product_id = ?");
        $overrideStmt->execute([$productId]);
        $override = $overrideStmt->fetch();

        if ($override) {
            return [
                'price' => (float)$override['override_price'],
                'mrp'   => (float)$override['override_mrp'],
            ];
        }

        // 2. Check variant price override if variantId is provided
        if ($variantId) {
            $varStmt = $pdo->prepare("SELECT price_override, mrp_override FROM product_variants WHERE id = ? AND product_id = ?");
            $varStmt->execute([$variantId, $productId]);
            $variant = $varStmt->fetch();

            if ($variant && $variant['price_override'] !== null) {
                return [
                    'price' => (float)$variant['price_override'],
                    'mrp'   => (float)($variant['mrp_override'] ?? $variant['price_override']),
                ];
            }
        }

        // 3. Fallback to product base price
        $prodStmt = $pdo->prepare("SELECT base_price, mrp FROM products WHERE id = ?");
        $prodStmt->execute([$productId]);
        $prod = $prodStmt->fetch();

        if (!$prod) {
            return ['price' => 0.0, 'mrp' => 0.0];
        }

        return [
            'price' => (float)$prod['base_price'],
            'mrp'   => (float)$prod['mrp'],
        ];
    }

    /**
     * Calculates complete order financial breakdown from an array of cart items.
     * Each item: ['productId' => ..., 'variantId' => ..., 'size' => ..., 'quantity' => ...]
     */
    public static function calculateOrderTotals(array $items, ?string $couponCode = null, ?string $userId = null): array
    {
        $subtotal = 0.0;
        $mrpTotal = 0.0;
        $resolvedItems = [];
        $pdo = Database::getConnection();

        foreach ($items as $item) {
            $productId = $item['productId'] ?? $item['product_id'] ?? $item['id'] ?? '';
            $variantId = $item['variantId'] ?? $item['variant_id'] ?? null;
            $size = $item['size'] ?? 'M';
            $qty = max(1, (int)($item['quantity'] ?? $item['qty'] ?? 1));

            // Fetch product details
            $prodStmt = $pdo->prepare("SELECT id, brand, title, primary_image, category_id FROM products WHERE id = ?");
            $prodStmt->execute([$productId]);
            $product = $prodStmt->fetch();

            if (!$product) {
                continue;
            }

            $pricing = self::resolveItemPrice($productId, $variantId);
            $itemSubtotal = $pricing['price'] * $qty;
            $itemMrpTotal = $pricing['mrp'] * $qty;

            $subtotal += $itemSubtotal;
            $mrpTotal += $itemMrpTotal;

            // Fetch variant info if present
            $color = 'Classic';
            $image = $product['primary_image'];
            if ($variantId) {
                $vStmt = $pdo->prepare("SELECT color_name, image_url FROM product_variants WHERE id = ?");
                $vStmt->execute([$variantId]);
                if ($vRow = $vStmt->fetch()) {
                    $color = $vRow['color_name'];
                    $image = $vRow['image_url'] ?: $image;
                }
            }

            $resolvedItems[] = [
                'productId'    => $productId,
                'variantId'    => $variantId,
                'title'        => $product['title'],
                'brand'        => $product['brand'],
                'image'        => $image,
                'size'         => $size,
                'color'        => $color,
                'unitPrice'    => $pricing['price'],
                'mrp'          => $pricing['mrp'],
                'quantity'     => $qty,
                'totalPrice'   => $itemSubtotal,
                'categoryId'   => $product['category_id'],
            ];
        }

        // Coupon calculation
        $couponDiscount = 0.0;
        $appliedCoupon = null;
        if (!empty($couponCode)) {
            require_once __DIR__ . '/CouponService.php';
            $couponResult = CouponService::validateCoupon($couponCode, $subtotal, $resolvedItems, $userId);
            if ($couponResult['valid']) {
                $couponDiscount = (float)$couponResult['discount_amount'];
                $appliedCoupon = $couponResult['coupon'];
            }
        }

        // Business rules
        $freeShippingThreshold = (float)Config::get('FREE_SHIPPING_THRESHOLD', 1999.00);
        $standardShippingFee = (float)Config::get('SHIPPING_FEE', 149.00);
        $shippingFee = ($subtotal >= $freeShippingThreshold || $subtotal == 0) ? 0.00 : $standardShippingFee;

        $gstRate = (float)Config::get('GST_RATE', 0.05);
        $taxableAmount = max(0.0, $subtotal - $couponDiscount);
        $gstAmount = round($taxableAmount * $gstRate, 2);

        $totalAmount = round($taxableAmount + $shippingFee + $gstAmount, 2);

        return [
            'items'                 => $resolvedItems,
            'subtotal'              => round($subtotal, 2),
            'mrpTotal'              => round($mrpTotal, 2),
            'savings'               => round(max(0, $mrpTotal - $subtotal + $couponDiscount), 2),
            'couponCode'            => $appliedCoupon ? $appliedCoupon['code'] : null,
            'couponDiscount'        => round($couponDiscount, 2),
            'shippingFee'           => round($shippingFee, 2),
            'freeShippingThreshold' => $freeShippingThreshold,
            'gstAmount'             => round($gstAmount, 2),
            'gstRate'               => $gstRate,
            'totalAmount'           => $totalAmount,
        ];
    }
}
