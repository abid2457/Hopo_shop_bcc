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

class ProductController
{
    public function index(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $query = $request['query'] ?? [];

        $category = $query['category'] ?? null;
        $search = $query['search'] ?? null;
        $fabric = $query['fabric'] ?? null;
        $occasion = $query['occasion'] ?? null;
        $minPrice = isset($query['min_price']) ? (float)$query['min_price'] : null;
        $maxPrice = isset($query['max_price']) ? (float)$query['max_price'] : null;
        $sort = $query['sort'] ?? 'popular';
        $page = max(1, (int)($query['page'] ?? 1));
        $limit = max(1, min(100, (int)($query['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;

        $includeArchived = isset($query['include_archived']) && $query['include_archived'] === '1';

        $where = [];
        $bindings = [];

        if (!$includeArchived) {
            $where[] = "p.status = 'active' AND p.is_archived = 0";
        }

        if ($category) {
            if (is_numeric($category)) {
                $where[] = "(c.name = ? OR c.slug = ? OR p.category_id = ?)";
                $bindings[] = $category;
                $bindings[] = $category;
                $bindings[] = (int)$category;
            } else {
                $where[] = "(c.name = ? OR c.slug = ?)";
                $bindings[] = $category;
                $bindings[] = $category;
            }
        }

        $subcategory = $query['subcategory'] ?? null;
        if ($subcategory) {
            $where[] = "p.subcategory = ?";
            $bindings[] = $subcategory;
        }

        $brand = $query['brand'] ?? $query['designer'] ?? null;
        if ($brand) {
            $where[] = "p.brand = ?";
            $bindings[] = $brand;
        }

        if ($fabric) {
            $where[] = "p.fabric = ?";
            $bindings[] = $fabric;
        }

        if ($occasion) {
            $where[] = "p.occasion = ?";
            $bindings[] = $occasion;
        }

        if ($search) {
            $where[] = "(p.title LIKE ? OR p.brand LIKE ? OR p.work_type LIKE ? OR p.tag LIKE ? OR p.fabric LIKE ?)";
            $term = "%{$search}%";
            $bindings[] = $term;
            $bindings[] = $term;
            $bindings[] = $term;
            $bindings[] = $term;
            $bindings[] = $term;
        }

        if ($minPrice !== null) {
            $where[] = "COALESCE(ppo.override_price, p.base_price) >= ?";
            $bindings[] = $minPrice;
        }

        if ($maxPrice !== null) {
            $where[] = "COALESCE(ppo.override_price, p.base_price) <= ?";
            $bindings[] = $maxPrice;
        }

        $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

        // Sort order
        $orderBy = match ($sort) {
            'price-asc'  => "COALESCE(ppo.override_price, p.base_price) ASC",
            'price-desc' => "COALESCE(ppo.override_price, p.base_price) DESC",
            'rating'     => "p.rating DESC, p.reviews_count DESC",
            'newest'     => "p.created_at DESC",
            default      => "p.rating DESC, p.reviews_count DESC",
        };

        // Total count
        $countSql = "
            SELECT COUNT(*) AS total
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_price_overrides ppo ON ppo.product_id = p.id
            {$whereClause}
        ";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($bindings);
        $total = (int)$countStmt->fetchColumn();

        // Products query
        $sql = "
            SELECT 
                p.id,
                p.brand,
                p.title,
                p.category_id,
                c.name AS category_name,
                p.subcategory,
                COALESCE(ppo.override_price, p.base_price) AS price,
                COALESCE(ppo.override_mrp, p.mrp) AS mrp,
                p.base_price AS original_base_price,
                p.mrp AS original_mrp,
                (ppo.override_price IS NOT NULL) AS has_price_override,
                p.rating,
                p.reviews_count AS reviews,
                p.tag,
                p.fabric,
                p.occasion,
                p.neckline,
                p.sleeve,
                p.work_type AS workType,
                p.padding,
                p.closure,
                p.margin,
                p.primary_image AS image,
                p.is_archived AS isArchived,
                p.status
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_price_overrides ppo ON ppo.product_id = p.id
            {$whereClause}
            ORDER BY {$orderBy}
            LIMIT {$limit} OFFSET {$offset}
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($bindings);
        $products = $stmt->fetchAll();

        // Attach gallery images & variants summary for each product
        foreach ($products as &$prod) {
            $prod['price'] = (float)$prod['price'];
            $prod['mrp'] = (float)$prod['mrp'];
            $prod['rating'] = (float)$prod['rating'];
            $prod['reviews'] = (int)$prod['reviews'];
            $prod['isArchived'] = (bool)$prod['isArchived'];
            $prod['has_price_override'] = (bool)$prod['has_price_override'];
            $prod['category'] = $prod['category_name'];

            $prod['image'] = self::normalizeImageUrl($prod['image']);

            // Fetch images
            $imgStmt = $pdo->prepare("SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC");
            $imgStmt->execute([$prod['id']]);
            $rawImages = $imgStmt->fetchAll(\PDO::FETCH_COLUMN);
            $normalizedImages = array_map([self::class, 'normalizeImageUrl'], $rawImages);
            $prod['images'] = !empty($normalizedImages) ? $normalizedImages : [$prod['image']];

            // Fetch variants
            $varStmt = $pdo->prepare("SELECT id, color_name AS colorName, color_hex AS colorHex, image_url AS image FROM product_variants WHERE product_id = ?");
            $varStmt->execute([$prod['id']]);
            $variants = $varStmt->fetchAll();
            foreach ($variants as &$var) {
                $var['image'] = self::normalizeImageUrl($var['image']);
            }
            $prod['variants'] = $variants;
        }

        Response::success([
            'products' => $products,
            'total'    => $total,
            'page'     => $page,
            'limit'    => $limit,
            'pages'    => ceil($total / $limit),
        ]);
    }

    public function show(array $params, array $request): void
    {
        $productId = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            SELECT 
                p.id,
                p.brand,
                p.title,
                p.category_id,
                c.name AS category_name,
                p.subcategory,
                COALESCE(ppo.override_price, p.base_price) AS price,
                COALESCE(ppo.override_mrp, p.mrp) AS mrp,
                p.base_price AS original_base_price,
                p.mrp AS original_mrp,
                (ppo.override_price IS NOT NULL) AS has_price_override,
                p.rating,
                p.reviews_count AS reviews,
                p.tag,
                p.fabric,
                p.occasion,
                p.neckline,
                p.sleeve,
                p.work_type AS workType,
                p.padding,
                p.closure,
                p.margin,
                p.primary_image AS image,
                p.is_archived AS isArchived,
                p.status
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_price_overrides ppo ON ppo.product_id = p.id
            WHERE p.id = ?
            LIMIT 1
        ");
        $stmt->execute([$productId]);
        $prod = $stmt->fetch();

        if (!$prod) {
            Response::notFound("Product '{$productId}' not found.");
        }

        $prod['price'] = (float)$prod['price'];
        $prod['mrp'] = (float)$prod['mrp'];
        $prod['rating'] = (float)$prod['rating'];
        $prod['reviews'] = (int)$prod['reviews'];
        $prod['isArchived'] = (bool)$prod['isArchived'];
        $prod['has_price_override'] = (bool)$prod['has_price_override'];
        $prod['category'] = $prod['category_name'];

        $prod['image'] = self::normalizeImageUrl($prod['image']);

        // Fetch gallery images
        $imgStmt = $pdo->prepare("SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC");
        $imgStmt->execute([$productId]);
        $rawImages = $imgStmt->fetchAll(\PDO::FETCH_COLUMN);
        $normalizedImages = array_map([self::class, 'normalizeImageUrl'], $rawImages);
        $prod['images'] = !empty($normalizedImages) ? $normalizedImages : [$prod['image']];

        // Fetch variants and their sizes & live stock
        $varStmt = $pdo->prepare("
            SELECT id, color_name AS colorName, color_hex AS colorHex, image_url AS image, price_override AS price, mrp_override AS mrp
            FROM product_variants 
            WHERE product_id = ?
        ");
        $varStmt->execute([$productId]);
        $variants = $varStmt->fetchAll();

        foreach ($variants as &$variant) {
            $variant['image'] = self::normalizeImageUrl($variant['image']);
            $sizesStmt = $pdo->prepare("SELECT size, stock FROM variant_sizes WHERE variant_id = ? ORDER BY id ASC");
            $sizesStmt->execute([$variant['id']]);
            $variant['sizes'] = $sizesStmt->fetchAll();
            $variant['price'] = $variant['price'] !== null ? (float)$variant['price'] : null;
            $variant['mrp'] = $variant['mrp'] !== null ? (float)$variant['mrp'] : null;
        }
        $prod['variants'] = $variants;

        // Fetch reviews
        $revStmt = $pdo->prepare("SELECT id, author_name AS author, rating, comment, verified_purchase AS verified, created_at AS createdAt FROM reviews WHERE product_id = ? ORDER BY created_at DESC");
        $revStmt->execute([$productId]);
        $prod['customerReviews'] = $revStmt->fetchAll();

        Response::success($prod);
    }

    public static function normalizeImageUrl(?string $url): string
    {
        if (empty($url)) {
            return '';
        }
        $url = trim($url);
        // Normalize any hardcoded http(s)://.../uploads/ to clean relative /uploads/
        if (preg_match('#^https?://[^/]+/uploads/(.+)#i', $url, $matches)) {
            return '/uploads/' . $matches[1];
        }
        if (substr($url, 0, 16) === '/images/uploads/') {
            return '/uploads/' . substr($url, 16);
        }
        if (substr($url, 0, 8) === 'uploads/') {
            return '/' . $url;
        }
        return $url;
    }
}
