<?php
declare(strict_types=1);

namespace HopoShop\Controllers;

use PDO;
use Exception;
use HopoShop\Config\Database;
use HopoShop\Services\ImageUploadService;
use HopoShop\Services\NotificationService;
use HopoShop\Services\EmailService;
use HopoShop\Utils\Response;
use HopoShop\Utils\Validator;

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/Services/ImageUploadService.php';
require_once dirname(__DIR__) . '/Services/NotificationService.php';
require_once dirname(__DIR__) . '/Services/EmailService.php';
require_once dirname(__DIR__) . '/Utils/Response.php';
require_once dirname(__DIR__) . '/Utils/Validator.php';

class AdminController
{
    // =========================================================================
    // 0. IMAGE UPLOADS
    // =========================================================================

    public function upload(array $params, array $request): void
    {
        try {
            $files = $_FILES['file'] ?? $_FILES['image'] ?? null;
            if (!$files) {
                // Check if any file was uploaded
                if (!empty($_FILES)) {
                    $firstKey = array_key_first($_FILES);
                    $files = $_FILES[$firstKey];
                }
            }

            if (!$files) {
                Response::validationError('No file was uploaded.');
            }

            // Check if multiple files were uploaded in an array
            if (is_array($files['name'])) {
                $results = [];
                $count = count($files['name']);
                for ($i = 0; $i < $count; $i++) {
                    if (empty($files['name'][$i])) {
                        continue;
                    }
                    $singleFile = [
                        'name'     => $files['name'][$i],
                        'type'     => $files['type'][$i],
                        'tmp_name' => $files['tmp_name'][$i],
                        'error'    => $files['error'][$i],
                        'size'     => $files['size'][$i],
                    ];
                    $results[] = ImageUploadService::handleUpload($singleFile);
                }
                Response::success($results, 'Images uploaded successfully.');
            } else {
                $result = ImageUploadService::handleUpload($files);
                Response::success($result, 'Image uploaded successfully.');
            }
        } catch (Exception $e) {
            Response::validationError($e->getMessage());
        }
    }

    public function deleteUpload(array $params, array $request): void
    {
        $url = (string)($request['body']['url'] ?? '');
        if ($url === '') {
            Response::validationError('Image URL is required.');
        }

        $deleted = ImageUploadService::deleteUpload($url);
        if ($deleted) {
            Response::success(null, 'Image file removed from disk.');
        } else {
            Response::error('Could not delete image file (file might not exist or is protected).', 400);
        }
    }

    // =========================================================================
    // 1. EXECUTIVE OVERVIEW
    // =========================================================================

    public function overview(array $params, array $request): void
    {
        $pdo = Database::getConnection();

        // Total sales from paid orders
        $salesStmt = $pdo->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'PAID'");
        $totalSales = (float)$salesStmt->fetchColumn();

        // Total orders
        $ordersStmt = $pdo->query("SELECT COUNT(*) FROM orders");
        $totalOrders = (int)$ordersStmt->fetchColumn();

        // Customer count
        $custStmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER'");
        $totalCustomers = (int)$custStmt->fetchColumn();

        // Low stock count (<= 2)
        $lowStockStmt = $pdo->query("
            SELECT vs.id, vs.size, vs.stock, pv.color_name, p.title, p.id AS product_id, p.primary_image
            FROM variant_sizes vs
            JOIN product_variants pv ON pv.id = vs.variant_id
            JOIN products p ON p.id = pv.product_id
            WHERE vs.stock <= 2 AND p.is_archived = 0
            ORDER BY vs.stock ASC
            LIMIT 10
        ");
        $lowStockItems = $lowStockStmt->fetchAll();

        // Recent 5 orders
        $recentStmt = $pdo->query("
            SELECT o.id, o.user_id, o.total_amount, o.order_status, o.payment_status, o.created_at, u.name AS customer_name
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC
            LIMIT 5
        ");
        $recentOrders = $recentStmt->fetchAll();

        // 7-day revenue trend
        $trendStmt = $pdo->query("
            SELECT DATE(created_at) as order_date, COALESCE(SUM(total_amount), 0) as daily_revenue, COUNT(*) as daily_orders
            FROM orders
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY order_date ASC
        ");
        $revenueTrend = $trendStmt->fetchAll();

        // Traffic channels from analytics_events
        $channelsStmt = $pdo->query("
            SELECT COALESCE(channel, 'Direct VIP Concierge') as channel, COUNT(*) as count
            FROM analytics_events
            GROUP BY channel
            ORDER BY count DESC
            LIMIT 6
        ");
        $trafficChannels = $channelsStmt->fetchAll();

        Response::success([
            'metrics' => [
                'totalSales'     => $totalSales,
                'totalOrders'    => $totalOrders,
                'totalCustomers' => $totalCustomers,
                'lowStockCount'  => count($lowStockItems),
            ],
            'lowStockItems'   => $lowStockItems,
            'recentOrders'    => $recentOrders,
            'revenueTrend'    => $revenueTrend,
            'trafficChannels' => $trafficChannels,
        ]);
    }

    // =========================================================================
    // 2. COUTURE PRODUCTS (CRUD + GALLERY)
    // =========================================================================

    public function products(array $params, array $request): void
    {
        $pdo = Database::getConnection();

        $stmt = $pdo->query("
            SELECT 
                p.id,
                p.brand,
                p.title,
                p.category_id,
                c.name AS category,
                p.subcategory,
                p.base_price,
                p.mrp,
                ppo.override_price,
                ppo.override_mrp,
                COALESCE(ppo.override_price, p.base_price) AS effective_price,
                COALESCE(ppo.override_mrp, p.mrp) AS effective_mrp,
                (ppo.override_price IS NOT NULL) AS has_price_override,
                p.rating,
                p.reviews_count AS reviews,
                p.primary_image AS image,
                p.is_archived AS isArchived,
                p.status,
                p.tag,
                p.fabric,
                p.occasion,
                p.neckline,
                p.sleeve,
                p.work_type,
                p.padding,
                p.closure,
                p.margin,
                p.created_at,
                COALESCE(SUM(vs.stock), 0) AS total_stock
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_price_overrides ppo ON ppo.product_id = p.id
            LEFT JOIN product_variants pv ON pv.product_id = p.id
            LEFT JOIN variant_sizes vs ON vs.variant_id = pv.id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        ");

        $products = $stmt->fetchAll();

        // Fetch gallery images for each product
        $galleryStmt = $pdo->query("SELECT product_id, image_url, display_order FROM product_images ORDER BY display_order ASC");
        $allGallery = $galleryStmt->fetchAll();
        $galleryMap = [];
        foreach ($allGallery as $g) {
            $galleryMap[$g['product_id']][] = $g['image_url'];
        }

        foreach ($products as &$p) {
            $p['base_price'] = (float)$p['base_price'];
            $p['mrp'] = (float)$p['mrp'];
            $p['effective_price'] = (float)$p['effective_price'];
            $p['effective_mrp'] = (float)$p['effective_mrp'];
            $p['total_stock'] = (int)$p['total_stock'];
            $p['has_price_override'] = (bool)$p['has_price_override'];
            $p['isArchived'] = (bool)$p['isArchived'];
            $p['image'] = self::normalizeImageUrl($p['image']);
            $rawImages = $galleryMap[$p['id']] ?? [$p['image']];
            $p['images'] = array_map([self::class, 'normalizeImageUrl'], $rawImages);
        }

        Response::success($products);
    }

    public function createProduct(array $params, array $request): void
    {
        $body = $request['body'] ?? [];
        $pdo = Database::getConnection();

        // Support flexible aliases
        if (isset($body['price']) && !isset($body['base_price'])) {
            $body['base_price'] = $body['price'];
        }
        if (empty($body['brand'])) {
            $body['brand'] = 'HOPO Atelier';
        }
        if (empty($body['primary_image']) && !empty($body['images'][0])) {
            $body['primary_image'] = $body['images'][0];
        }
        if (empty($body['category_id']) && !empty($body['category'])) {
            $catStmt = $pdo->prepare("SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1");
            $catStmt->execute([$body['category'], $body['category']]);
            $foundCatId = $catStmt->fetchColumn();
            $body['category_id'] = $foundCatId ?: 1;
        }

        $missing = Validator::requireFields($body, ['title', 'brand', 'category_id', 'base_price', 'mrp', 'primary_image']);
        if (!empty($missing)) {
            Response::validationError('Missing required product fields: ' . implode(', ', $missing));
        }

        // Generate clean product ID e.g. p30, p31...
        $maxStmt = $pdo->query("SELECT id FROM products WHERE id LIKE 'p%' ORDER BY LENGTH(id) DESC, id DESC LIMIT 1");
        $lastId = $maxStmt->fetchColumn();
        if ($lastId && preg_match('/^p(\d+)$/', $lastId, $m)) {
            $newId = 'p' . ((int)$m[1] + 1);
        } else {
            $newId = 'p' . time();
        }

        $brand = Validator::sanitizeString($body['brand']);
        $title = Validator::sanitizeString($body['title']);
        $categoryId = (int)$body['category_id'];
        $subcategory = Validator::sanitizeString($body['subcategory'] ?? 'General');
        $basePrice = (float)$body['base_price'];
        $mrp = (float)$body['mrp'];
        $tag = Validator::sanitizeString($body['tag'] ?? 'ATELIER COUTURE');
        $fabric = Validator::sanitizeString($body['fabric'] ?? 'Heritage Pure Silk');
        $occasion = Validator::sanitizeString($body['occasion'] ?? 'Wedding & Celebrations');
        $neckline = Validator::sanitizeString($body['neckline'] ?? 'Sweetheart');
        $sleeve = Validator::sanitizeString($body['sleeve'] ?? 'Elbow Sleeve');
        $workType = Validator::sanitizeString($body['work_type'] ?? 'Handcrafted Zardozi & Resham');
        $padding = Validator::sanitizeString($body['padding'] ?? 'Built-in Luxury Cups');
        $closure = Validator::sanitizeString($body['closure'] ?? 'Back Hook & Eye');
        $margin = Validator::sanitizeString($body['margin'] ?? '2 inches on both sides');
        $primaryImage = self::normalizeImageUrl(trim((string)$body['primary_image']));
        $rawStatus = $body['status'] ?? 'active';
        $status = ($rawStatus === 'archived' || $rawStatus === 'inactive') ? 'archived' : 'active';

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("
                INSERT INTO products 
                (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, NOW())
            ");
            $stmt->execute([
                $newId, $brand, $title, $categoryId, $subcategory, $basePrice, $mrp, $tag, $fabric, $occasion, $neckline, $sleeve, $workType, $padding, $closure, $margin, $primaryImage, $status
            ]);

            // Save gallery images
            $images = is_array($body['images'] ?? null) ? $body['images'] : [$primaryImage];
            $imgStmt = $pdo->prepare("INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)");
            foreach ($images as $idx => $imgUrl) {
                $normalizedUrl = self::normalizeImageUrl(trim((string)$imgUrl));
                if (!empty($normalizedUrl)) {
                    $imgStmt->execute([$newId, $normalizedUrl, $idx]);
                }
            }

            // Create default variant and initial size stock
            $variantId = $newId . '-default';
            $varStmt = $pdo->prepare("INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES (?, ?, 'Classic', '#8B1E3F', ?)");
            $varStmt->execute([$variantId, $newId, $primaryImage]);

            $sizeStockMap = is_array($body['sizes'] ?? null) ? $body['sizes'] : ['XS' => 3, 'S' => 5, 'M' => 5, 'L' => 4, 'XL' => 2, 'XXL' => 1];
            $sizeStmt = $pdo->prepare("INSERT INTO variant_sizes (variant_id, size, stock) VALUES (?, ?, ?)");
            foreach ($sizeStockMap as $size => $stock) {
                $sizeStmt->execute([$variantId, (string)$size, max(0, (int)$stock)]);
            }

            $pdo->commit();
            Response::success(['id' => $newId], 'Couture product created successfully!', 201);
        } catch (\Throwable $e) {
            $pdo->rollBack();
            Response::error('Failed to create product: ' . $e->getMessage(), 500);
        }
    }

    public function updateProduct(array $params, array $request): void
    {
        $id = $params['id'] ?? '';
        $body = $request['body'] ?? [];

        $pdo = Database::getConnection();
        $check = $pdo->prepare("SELECT id FROM products WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) {
            Response::notFound('Product not found.');
        }

        $brand = Validator::sanitizeString($body['brand'] ?? '');
        $title = Validator::sanitizeString($body['title'] ?? '');
        $categoryId = isset($body['category_id']) ? (int)$body['category_id'] : null;
        if ($categoryId === null && !empty($body['category'])) {
            $catStmt = $pdo->prepare("SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1");
            $catStmt->execute([$body['category'], $body['category']]);
            $foundCatId = $catStmt->fetchColumn();
            if ($foundCatId) {
                $categoryId = (int)$foundCatId;
            }
        }
        $subcategory = Validator::sanitizeString($body['subcategory'] ?? '');
        $basePrice = isset($body['base_price']) ? (float)$body['base_price'] : (isset($body['price']) ? (float)$body['price'] : null);
        $mrp = isset($body['mrp']) ? (float)$body['mrp'] : null;
        $tag = Validator::sanitizeString($body['tag'] ?? '');
        $fabric = Validator::sanitizeString($body['fabric'] ?? '');
        $occasion = Validator::sanitizeString($body['occasion'] ?? '');
        $neckline = Validator::sanitizeString($body['neckline'] ?? '');
        $sleeve = Validator::sanitizeString($body['sleeve'] ?? '');
        $workType = Validator::sanitizeString($body['work_type'] ?? '');
        $padding = Validator::sanitizeString($body['padding'] ?? '');
        $closure = Validator::sanitizeString($body['closure'] ?? '');
        $margin = Validator::sanitizeString($body['margin'] ?? '');
        $primaryImage = isset($body['primary_image']) ? self::normalizeImageUrl(trim((string)$body['primary_image'])) : (!empty($body['images'][0]) ? self::normalizeImageUrl(trim((string)$body['images'][0])) : null);
        $status = null;
        if (isset($body['status'])) {
            $status = ($body['status'] === 'archived' || $body['status'] === 'inactive') ? 'archived' : 'active';
        }

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("
                UPDATE products SET
                    brand = COALESCE(NULLIF(?, ''), brand),
                    title = COALESCE(NULLIF(?, ''), title),
                    category_id = COALESCE(?, category_id),
                    subcategory = COALESCE(NULLIF(?, ''), subcategory),
                    base_price = COALESCE(?, base_price),
                    mrp = COALESCE(?, mrp),
                    tag = COALESCE(NULLIF(?, ''), tag),
                    fabric = COALESCE(NULLIF(?, ''), fabric),
                    occasion = COALESCE(NULLIF(?, ''), occasion),
                    neckline = COALESCE(NULLIF(?, ''), neckline),
                    sleeve = COALESCE(NULLIF(?, ''), sleeve),
                    work_type = COALESCE(NULLIF(?, ''), work_type),
                    padding = COALESCE(NULLIF(?, ''), padding),
                    closure = COALESCE(NULLIF(?, ''), closure),
                    margin = COALESCE(NULLIF(?, ''), margin),
                    primary_image = COALESCE(NULLIF(?, ''), primary_image),
                    status = COALESCE(NULLIF(?, ''), status),
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([
                $brand, $title, $categoryId, $subcategory, $basePrice, $mrp,
                $tag, $fabric, $occasion, $neckline, $sleeve, $workType, $padding, $closure, $margin,
                $primaryImage, $status, $id
            ]);

            // Sync gallery if provided
            if (isset($body['images']) && is_array($body['images'])) {
                $delImg = $pdo->prepare("DELETE FROM product_images WHERE product_id = ?");
                $delImg->execute([$id]);

                $insImg = $pdo->prepare("INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)");
                foreach ($body['images'] as $idx => $imgUrl) {
                    $normalizedUrl = self::normalizeImageUrl(trim((string)$imgUrl));
                    if (!empty($normalizedUrl)) {
                        $insImg->execute([$id, $normalizedUrl, $idx]);
                    }
                }
            }

            $pdo->commit();
            Response::success(['id' => $id], 'Product updated successfully.');
        } catch (\Throwable $e) {
            $pdo->rollBack();
            Response::error('Failed to update product: ' . $e->getMessage(), 500);
        }
    }

    public function deleteProduct(array $params, array $request): void
    {
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        // Check if in order items
        $orderCheck = $pdo->prepare("SELECT COUNT(*) FROM order_items WHERE product_id = ?");
        $orderCheck->execute([$id]);
        $inOrders = (int)$orderCheck->fetchColumn() > 0;

        if ($inOrders) {
            // Soft-archive to preserve customer order history
            $stmt = $pdo->prepare("UPDATE products SET is_archived = 1, status = 'inactive' WHERE id = ?");
            $stmt->execute([$id]);
            Response::success(['id' => $id, 'archived' => true], 'Product is linked to previous customer orders. Safely archived and hidden from storefront.');
        } else {
            // Clean hard delete
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            Response::success(['id' => $id, 'deleted' => true], 'Product completely removed from database.');
        }
    }

    // =========================================================================
    // 3. HEIRLOOM CATEGORIES (CRUD)
    // =========================================================================

    public function categories(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("
            SELECT 
                c.*,
                COUNT(p.id) AS product_count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id AND p.is_archived = 0 AND p.status = 'active'
            GROUP BY c.id
            ORDER BY c.display_order ASC, c.id ASC
        ");

        $categories = $stmt->fetchAll();
        foreach ($categories as &$c) {
            $c['id'] = (int)$c['id'];
            $c['display_order'] = (int)$c['display_order'];
            $c['product_count'] = (int)$c['product_count'];
            $subs = !empty($c['subcategories']) ? json_decode((string)$c['subcategories'], true) : [];
            $c['subs'] = is_array($subs) ? $subs : [];
        }

        Response::success($categories);
    }

    public function createCategory(array $params, array $request): void
    {
        $body = $request['body'] ?? [];
        if (empty($body['title']) && !empty($body['name'])) {
            $body['title'] = $body['name'];
        }
        if (empty($body['subs']) && !empty($body['subcategories'])) {
            $body['subs'] = $body['subcategories'];
        }

        $missing = Validator::requireFields($body, ['name', 'slug']);
        if (!empty($missing)) {
            Response::validationError('Missing category fields: ' . implode(', ', $missing));
        }

        $name = Validator::sanitizeString($body['name']);
        $slug = preg_replace('/[^a-z0-9-]+/', '-', strtolower(trim((string)$body['slug'])));
        $title = !empty($body['title']) ? Validator::sanitizeString($body['title']) : $name;
        $subtitle = Validator::sanitizeString($body['subtitle'] ?? '');
        $eyebrow = Validator::sanitizeString($body['eyebrow'] ?? 'ATELIER COLLECTION');
        $description = Validator::sanitizeString($body['description'] ?? '');
        $imageUrl = !empty($body['image_url']) ? trim((string)$body['image_url']) : '/images/bridal_blouse_crimson_peacock.png';
        $displayOrder = (int)($body['display_order'] ?? 1);
        $status = ($body['status'] ?? 'active') === 'inactive' ? 'inactive' : 'active';
        
        $subs = is_array($body['subs'] ?? null) ? $body['subs'] : [];
        $subcategoriesJson = json_encode(array_values(array_filter($subs)));

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO categories (name, slug, title, subtitle, eyebrow, description, image_url, display_order, status, subcategories, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $name, $slug, $title, $subtitle, $eyebrow, $description, $imageUrl, $displayOrder, $status, $subcategoriesJson
        ]);

        Response::success(['id' => (int)$pdo->lastInsertId()], 'Category created successfully!', 201);
    }

    public function updateCategory(array $params, array $request): void
    {
        $id = (int)($params['id'] ?? 0);
        $body = $request['body'] ?? [];
        if (!isset($body['subs']) && isset($body['subcategories'])) {
            $body['subs'] = $body['subcategories'];
        }

        $pdo = Database::getConnection();
        $check = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
        $check->execute([$id]);
        if (!$check->fetch()) {
            Response::notFound('Category not found.');
        }

        $name = isset($body['name']) ? Validator::sanitizeString($body['name']) : null;
        $slug = isset($body['slug']) ? preg_replace('/[^a-z0-9-]+/', '-', strtolower(trim((string)$body['slug']))) : null;
        $title = isset($body['title']) ? Validator::sanitizeString($body['title']) : null;
        $subtitle = isset($body['subtitle']) ? Validator::sanitizeString($body['subtitle']) : null;
        $eyebrow = isset($body['eyebrow']) ? Validator::sanitizeString($body['eyebrow']) : null;
        $description = isset($body['description']) ? Validator::sanitizeString($body['description']) : null;
        $imageUrl = isset($body['image_url']) ? trim((string)$body['image_url']) : null;
        $displayOrder = isset($body['display_order']) ? (int)$body['display_order'] : null;
        $status = isset($body['status']) ? ($body['status'] === 'inactive' ? 'inactive' : 'active') : null;
        $subcategoriesJson = isset($body['subs']) && is_array($body['subs']) ? json_encode(array_values(array_filter($body['subs']))) : null;

        $stmt = $pdo->prepare("
            UPDATE categories SET
                name = COALESCE(?, name),
                slug = COALESCE(?, slug),
                title = COALESCE(?, title),
                subtitle = COALESCE(?, subtitle),
                eyebrow = COALESCE(?, eyebrow),
                description = COALESCE(?, description),
                image_url = COALESCE(?, image_url),
                display_order = COALESCE(?, display_order),
                status = COALESCE(?, status),
                subcategories = COALESCE(?, subcategories)
            WHERE id = ?
        ");
        $stmt->execute([
            $name, $slug, $title, $subtitle, $eyebrow, $description, $imageUrl, $displayOrder, $status, $subcategoriesJson, $id
        ]);

        Response::success(['id' => $id], 'Category updated successfully.');
    }

    public function deleteCategory(array $params, array $request): void
    {
        $id = (int)($params['id'] ?? 0);
        $pdo = Database::getConnection();

        $prodCount = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_id = ? AND is_archived = 0");
        $prodCount->execute([$id]);
        $count = (int)$prodCount->fetchColumn();

        if ($count > 0) {
            Response::validationError("Cannot delete category: it currently contains {$count} active products. Please reassign or archive those products first.");
        }

        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(['id' => $id], 'Category deleted successfully.');
    }

    // =========================================================================
    // 4. SILK STOCK & INVENTORY
    // =========================================================================

    public function inventory(array $params, array $request): void
    {
        $pdo = Database::getConnection();

        $stmt = $pdo->query("
            SELECT 
                vs.id AS variant_size_id,
                vs.size,
                vs.stock,
                pv.id AS variant_id,
                pv.color_name,
                pv.color_hex,
                p.id AS product_id,
                p.title AS product_title,
                p.brand,
                p.primary_image AS image,
                c.name AS category_name,
                COALESCE(ppo.override_price, p.base_price) AS unit_price,
                (vs.stock * COALESCE(ppo.override_price, p.base_price)) AS valuation,
                (vs.stock <= 2) AS is_low_stock,
                (vs.stock = 0) AS is_out_of_stock
            FROM variant_sizes vs
            JOIN product_variants pv ON pv.id = vs.variant_id
            JOIN products p ON p.id = pv.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_price_overrides ppo ON ppo.product_id = p.id
            WHERE p.is_archived = 0
            ORDER BY vs.stock ASC, p.title ASC
        ");

        $items = $stmt->fetchAll();
        $totalUnits = 0;
        $totalValuation = 0.0;
        $lowStockCount = 0;
        $outOfStockCount = 0;

        foreach ($items as &$it) {
            $it['id'] = (int)$it['variant_size_id'];
            $it['variant_size_id'] = (int)$it['variant_size_id'];
            $it['stock'] = (int)$it['stock'];
            $it['unit_price'] = (float)$it['unit_price'];
            $it['valuation'] = (float)$it['valuation'];
            $it['is_low_stock'] = (bool)$it['is_low_stock'];
            $it['is_out_of_stock'] = (bool)$it['is_out_of_stock'];

            $totalUnits += $it['stock'];
            $totalValuation += $it['valuation'];
            if ($it['is_low_stock']) $lowStockCount++;
            if ($it['is_out_of_stock']) $outOfStockCount++;
        }

        Response::success([
            'summary' => [
                'totalSKUs'        => count($items),
                'totalUnits'       => $totalUnits,
                'totalValuation'   => $totalValuation,
                'lowStockCount'    => $lowStockCount,
                'outOfStockCount'  => $outOfStockCount,
            ],
            'items' => $items,
        ]);
    }

    public function updateInventory(array $params, array $request): void
    {
        $variantSizeId = (int)($params['id'] ?? 0);
        $newStock = isset($request['body']['stock']) ? (int)$request['body']['stock'] : null;

        if ($newStock === null || $newStock < 0) {
            Response::validationError('Valid stock quantity is required.');
        }

        $pdo = Database::getConnection();

        $getStmt = $pdo->prepare("SELECT stock FROM variant_sizes WHERE id = ?");
        $getStmt->execute([$variantSizeId]);
        $row = $getStmt->fetch();

        if (!$row) {
            Response::notFound('Variant size record not found.');
        }

        $prevStock = (int)$row['stock'];
        $delta = $newStock - $prevStock;

        $upd = $pdo->prepare("UPDATE variant_sizes SET stock = ? WHERE id = ?");
        $upd->execute([$newStock, $variantSizeId]);

        // Record audit
        $audit = $pdo->prepare("
            INSERT INTO inventory_transactions 
            (variant_size_id, type, quantity_delta, previous_stock, new_stock, reference_type, notes, created_at)
            VALUES (?, 'MANUAL_ADJUSTMENT', ?, ?, ?, 'ADMIN_DASHBOARD', 'Stock adjusted manually by atelier admin', NOW())
        ");
        $audit->execute([$variantSizeId, $delta, $prevStock, $newStock]);

        // Dispatch operational stock notification if threshold crossed
        NotificationService::notifyStockLevel($pdo, $variantSizeId, $newStock);

        Response::success([
            'id'       => $variantSizeId,
            'previous' => $prevStock,
            'new'      => $newStock,
            'stock'    => $newStock,
        ], 'Inventory stock updated successfully.');
    }

    // =========================================================================
    // 5. ORDERS
    // =========================================================================

    public function orders(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $status = $request['query']['status'] ?? null;

        $where = [];
        $bindings = [];

        if ($status) {
            $where[] = "o.order_status = ?";
            $bindings[] = $status;
        }

        $whereClause = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";

        $stmt = $pdo->prepare("
            SELECT 
                o.id,
                o.user_id,
                u.name AS customer_name,
                u.email AS customer_email,
                u.phone AS customer_phone,
                o.subtotal,
                o.mrp_total,
                o.coupon_code,
                o.coupon_discount,
                o.shipping_fee,
                o.gst_amount,
                o.total_amount,
                o.payment_method,
                o.payment_status,
                o.order_status,
                o.tracking_number,
                o.courier_partner,
                o.estimated_delivery,
                o.shipping_address,
                o.created_at,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            {$whereClause}
            ORDER BY o.created_at DESC
        ");
        $stmt->execute($bindings);
        $orders = $stmt->fetchAll();

        foreach ($orders as &$ord) {
            $ord['subtotal'] = (float)$ord['subtotal'];
            $ord['total_amount'] = (float)$ord['total_amount'];
            $ord['coupon_discount'] = (float)$ord['coupon_discount'];
            $ord['item_count'] = (int)$ord['item_count'];
            if (!empty($ord['shipping_address']) && is_string($ord['shipping_address'])) {
                $ord['shipping_address'] = json_decode($ord['shipping_address'], true);
            }
        }

        Response::success($orders);
    }

    public function orderDetails(array $params, array $request): void
    {
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            WHERE o.id = ?
        ");
        $stmt->execute([$id]);
        $order = $stmt->fetch();

        if (!$order) {
            Response::notFound('Order not found.');
        }

        // Items
        $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $itemStmt->execute([$id]);
        $items = $itemStmt->fetchAll();

        // Timeline
        $timeStmt = $pdo->prepare("SELECT * FROM order_timeline WHERE order_id = ? ORDER BY event_time ASC, id ASC");
        $timeStmt->execute([$id]);
        $timeline = $timeStmt->fetchAll();

        // Payments
        $payStmt = $pdo->prepare("SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC");
        $payStmt->execute([$id]);
        $payments = $payStmt->fetchAll();

        $order['shipping_address'] = !empty($order['shipping_address']) ? json_decode((string)$order['shipping_address'], true) : null;
        $order['items'] = $items;
        $order['timeline'] = $timeline;
        $order['payments'] = $payments;

        Response::success($order);
    }

    public function updateOrderStatus(array $params, array $request): void
    {
        $orderId = $params['id'] ?? '';
        $body = $request['body'] ?? [];
        $newStatus = strtoupper(trim((string)($body['status'] ?? '')));
        $trackingNumber = isset($body['trackingNumber']) ? trim((string)$body['trackingNumber']) : null;
        $courierPartner = isset($body['courierPartner']) ? trim((string)$body['courierPartner']) : null;
        $note = isset($body['note']) ? trim((string)$body['note']) : '';

        $allowedStatuses = ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED'];
        if (!in_array($newStatus, $allowedStatuses, true)) {
            Response::validationError("Invalid order status '{$newStatus}'.");
        }

        $pdo = Database::getConnection();

        $prevStmt = $pdo->prepare("SELECT order_status, tracking_number, courier_partner FROM orders WHERE id = ?");
        $prevStmt->execute([$orderId]);
        $prevRow = $prevStmt->fetch();
        if (!$prevRow) {
            Response::notFound("Order '{$orderId}' not found.");
        }
        $prevStatus = $prevRow['order_status'] ?? '';

        $effectiveTracking = ($trackingNumber !== null && $trackingNumber !== '') ? $trackingNumber : ($prevRow['tracking_number'] ?: '');
        $effectiveCourier = ($courierPartner !== null && $courierPartner !== '') ? $courierPartner : ($prevRow['courier_partner'] ?: 'BlueDart Express Luxe');

        $stmt = $pdo->prepare("
            UPDATE orders 
            SET order_status = ?, tracking_number = ?, courier_partner = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$newStatus, $effectiveTracking, $effectiveCourier, $orderId]);

        $statusDescriptions = [
            'CONFIRMED'        => ['Order Confirmed', 'Payment and measurements verified by Hopo Atelier.'],
            'PACKED'           => ['Atelier Quality Inspection & Packing', 'Garment inspected by master artisan and boxed in luxury crate.'],
            'SHIPPED'          => ['Dispatched / In Transit', "Handed over to {$effectiveCourier} (Tracking ID: " . ($effectiveTracking ?: 'In Transit') . ")."],
            'OUT_FOR_DELIVERY' => ['Out for Delivery', 'Courier partner delivery executive is out for delivery to destination today.'],
            'DELIVERED'        => ['Delivered to Customer', 'Order successfully received with recipient verification.'],
            'CANCELLED'        => ['Order Cancelled', 'Order has been cancelled by administration.'],
            'RETURN_REQUESTED' => ['Return Requested', 'Customer initiated exchange/return request.'],
        ];

        if (isset($statusDescriptions[$newStatus])) {
            [$title, $desc] = $statusDescriptions[$newStatus];
            if (!empty($note)) {
                $desc .= ' Note: ' . $note;
            }
            $tl = $pdo->prepare("INSERT INTO order_timeline (order_id, status, title, description, completed, event_time) VALUES (?, ?, ?, ?, 1, NOW())");
            $tl->execute([$orderId, $newStatus, $title, $desc]);
        }

        // Also update shipments table if exists
        try {
            $shipCheck = $pdo->prepare("SELECT id FROM shipments WHERE order_id = ? LIMIT 1");
            $shipCheck->execute([$orderId]);
            if ($shipCheck->fetch()) {
                $shipStatus = in_array($newStatus, ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'], true) ? $newStatus : 'MANIFESTED';
                $pdo->prepare("UPDATE shipments SET status = ?, tracking_number = ?, courier = ?, updated_at = NOW() WHERE order_id = ?")
                    ->execute([$shipStatus, $effectiveTracking, $effectiveCourier, $orderId]);
            }
        } catch (\Throwable $se) {
            error_log('Shipment sync notice: ' . $se->getMessage());
        }

        // Dispatch order progression notification to customer and admin
        NotificationService::notifyOrderStatusChanged($pdo, $orderId, $newStatus, (string)$prevStatus);

        // Dispatch status update email to customer
        try {
            $oStmt = $pdo->prepare("SELECT o.*, u.email as user_email, u.name as user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ? LIMIT 1");
            $oStmt->execute([$orderId]);
            $oRow = $oStmt->fetch();
            if ($oRow) {
                $shipping = !empty($oRow['shipping_address']) ? json_decode($oRow['shipping_address'], true) : [];
                $customerEmail = $shipping['email'] ?? ($oRow['user_email'] ?? '');
                $customerName = $shipping['fullName'] ?? ($oRow['user_name'] ?? 'Valued Customer');
                if (!empty($customerEmail)) {
                    EmailService::sendOrderStatusUpdate($oRow, ['name' => $customerName, 'email' => $customerEmail], $newStatus);
                }
            }
        } catch (\Throwable $me) {
            error_log('Order status update email dispatch warning: ' . $me->getMessage());
        }

        Response::success([
            'orderId'        => $orderId,
            'newStatus'      => $newStatus,
            'trackingNumber' => $effectiveTracking,
            'courierPartner' => $effectiveCourier,
        ], "Order status updated to '{$newStatus}'.");
    }

    public function addOrderTimeline(array $params, array $request): void
    {
        $orderId = $params['id'] ?? '';
        $body = $request['body'] ?? [];
        $title = Validator::sanitizeString($body['title'] ?? 'Milestone Update');
        $desc = Validator::sanitizeString($body['description'] ?? '');
        $status = strtoupper(trim((string)($body['status'] ?? 'IN_PROGRESS')));

        $pdo = Database::getConnection();
        $tl = $pdo->prepare("INSERT INTO order_timeline (order_id, status, title, description, completed, event_time) VALUES (?, ?, ?, ?, 1, NOW())");
        $tl->execute([$orderId, $status, $title, $desc]);

        Response::success(['orderId' => $orderId], 'Timeline milestone recorded successfully.');
    }

    // =========================================================================
    // 6. CUSTOMERS
    // =========================================================================

    public function customers(array $params, array $request): void
    {
        $pdo = Database::getConnection();

        $stmt = $pdo->query("
            SELECT 
                u.id,
                u.name,
                u.email,
                u.phone,
                u.role,
                u.tier,
                u.points,
                u.avatar_url,
                u.created_at,
                COUNT(DISTINCT o.id) AS total_orders,
                COALESCE(SUM(CASE WHEN o.payment_status = 'PAID' THEN o.total_amount ELSE 0 END), 0) AS total_spent,
                MAX(o.created_at) AS last_order_date
            FROM users u
            LEFT JOIN orders o ON o.user_id = u.id
            WHERE u.role = 'CUSTOMER'
            GROUP BY u.id
            ORDER BY total_spent DESC, u.created_at DESC
        ");

        $customers = $stmt->fetchAll();
        foreach ($customers as &$c) {
            $c['total_orders'] = (int)$c['total_orders'];
            $c['total_spent'] = (float)$c['total_spent'];
            $c['ltv'] = (float)$c['total_spent'];
            $c['points'] = (int)$c['points'];
            $c['loyalty_points'] = (int)$c['points'];
        }

        Response::success($customers);
    }

    public function updateCustomerTier(array $params, array $request): void
    {
        $id = $params['id'] ?? '';
        $body = $request['body'] ?? [];
        $tier = Validator::sanitizeString($body['tier'] ?? 'Silver');
        $points = isset($body['points']) ? (int)$body['points'] : null;

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE users SET tier = ?, points = COALESCE(?, points), updated_at = NOW() WHERE id = ?");
        $stmt->execute([$tier, $points, $id]);

        Response::success(['id' => $id, 'tier' => $tier], 'Customer loyalty tier updated.');
    }

    // =========================================================================
    // 7. SPECIAL OFFERS
    // =========================================================================

    public function offers(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM special_offers ORDER BY created_at DESC");
        $offers = $stmt->fetchAll();

        foreach ($offers as &$off) {
            $off['discount_value'] = (float)$off['discount_value'];
            $off['min_order_amount'] = (float)$off['min_order_amount'];
            $off['max_discount'] = $off['max_discount'] !== null ? (float)$off['max_discount'] : null;
        }

        Response::success($offers);
    }

    public function createOffer(array $params, array $request): void
    {
        $body = $request['body'] ?? [];
        if (!isset($body['min_order_amount'])) {
            $body['min_order_amount'] = $body['minOrderAmount'] ?? $body['min_spend'] ?? 0;
        }
        if (!isset($body['valid_until'])) {
            $body['valid_until'] = $body['validUntil'] ?? $body['end_date'] ?? $body['endDate'] ?? date('Y-12-31 23:59:59');
        }
        if (!isset($body['valid_from'])) {
            $body['valid_from'] = $body['validFrom'] ?? $body['start_date'] ?? $body['startDate'] ?? date('Y-m-d H:i:s');
        }
        if (!isset($body['discount_type'])) {
            $body['discount_type'] = $body['discountType'] ?? 'PERCENTAGE';
        }
        if (!isset($body['discount_value'])) {
            $body['discount_value'] = $body['discountValue'] ?? 0;
        }
        if (!isset($body['max_discount'])) {
            $body['max_discount'] = $body['maxDiscount'] ?? null;
        }
        if (!isset($body['applicable_category'])) {
            $body['applicable_category'] = $body['applicableCategory'] ?? $body['category'] ?? 'All';
        }

        $missing = Validator::requireFields($body, ['code', 'title', 'discount_type', 'discount_value', 'min_order_amount', 'valid_until']);
        if (!empty($missing)) {
            Response::validationError('Missing offer fields: ' . implode(', ', $missing));
        }

        $id = 'OFF-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        $code = strtoupper(trim((string)$body['code']));
        $title = Validator::sanitizeString($body['title']);
        $description = Validator::sanitizeString($body['description'] ?? '');
        $discountType = strtoupper(trim((string)$body['discount_type'])) === 'FLAT' ? 'FLAT' : 'PERCENTAGE';
        $discountValue = (float)$body['discount_value'];
        $minOrderAmount = (float)$body['min_order_amount'];
        $maxDiscount = isset($body['max_discount']) && $body['max_discount'] !== '' ? (float)$body['max_discount'] : null;
        $category = Validator::sanitizeString($body['applicable_category'] ?? 'All');
        $status = in_array(strtoupper($body['status'] ?? 'ACTIVE'), ['ACTIVE', 'PAUSED', 'EXPIRED']) ? strtoupper($body['status']) : 'ACTIVE';
        $validFrom = !empty($body['valid_from']) ? date('Y-m-d H:i:s', strtotime((string)$body['valid_from'])) : date('Y-m-d H:i:s');
        $validUntil = date('Y-m-d H:i:s', strtotime((string)$body['valid_until']));

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO special_offers (id, code, title, description, discount_type, discount_value, min_order_amount, max_discount, applicable_category, status, valid_from, valid_until, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $id, $code, $title, $description, $discountType, $discountValue, $minOrderAmount, $maxDiscount, $category, $status, $validFrom, $validUntil
        ]);

        if ($status === 'ACTIVE') {
            NotificationService::notifyOfferCreated($pdo, $id, $code, $title, $description);
        }

        Response::success(['id' => $id, 'code' => $code], 'Special offer created successfully!', 201);
    }

    public function updateOffer(array $params, array $request): void
    {
        $id = $params['id'] ?? '';
        $body = $request['body'] ?? [];

        $pdo = Database::getConnection();
        $code = isset($body['code']) ? strtoupper(trim((string)$body['code'])) : null;
        $title = isset($body['title']) ? Validator::sanitizeString($body['title']) : null;
        $description = isset($body['description']) ? Validator::sanitizeString($body['description']) : null;
        $discountType = isset($body['discount_type']) ? strtoupper(trim((string)$body['discount_type'])) : null;
        $discountValue = isset($body['discount_value']) ? (float)$body['discount_value'] : null;
        $minOrderAmount = isset($body['min_order_amount']) ? (float)$body['min_order_amount'] : null;
        $maxDiscount = isset($body['max_discount']) && $body['max_discount'] !== '' ? (float)$body['max_discount'] : null;
        $category = isset($body['applicable_category']) ? Validator::sanitizeString($body['applicable_category']) : null;
        $status = isset($body['status']) ? strtoupper((string)$body['status']) : null;
        $validUntil = isset($body['valid_until']) ? date('Y-m-d H:i:s', strtotime((string)$body['valid_until'])) : null;

        $stmt = $pdo->prepare("
            UPDATE special_offers SET
                code = COALESCE(?, code),
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                discount_type = COALESCE(?, discount_type),
                discount_value = COALESCE(?, discount_value),
                min_order_amount = COALESCE(?, min_order_amount),
                max_discount = COALESCE(?, max_discount),
                applicable_category = COALESCE(?, applicable_category),
                status = COALESCE(?, status),
                valid_until = COALESCE(?, valid_until),
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $code, $title, $description, $discountType, $discountValue, $minOrderAmount, $maxDiscount, $category, $status, $validUntil, $id
        ]);

        Response::success(['id' => $id], 'Special offer updated successfully.');
    }

    public function deleteOffer(array $params, array $request): void
    {
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM special_offers WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(['id' => $id], 'Special offer removed.');
    }

    // =========================================================================
    // 8. PRICING & RATES (OVERRIDE)
    // =========================================================================

    public function setPriceOverride(array $params, array $request): void
    {
        $productId = $params['id'] ?? '';
        $body = $request['body'] ?? [];
        $overridePrice = isset($body['overridePrice']) ? (float)$body['overridePrice'] : null;
        $overrideMrp = isset($body['overrideMrp']) ? (float)$body['overrideMrp'] : null;

        if ($overridePrice === null || $overrideMrp === null) {
            Response::validationError('overridePrice and overrideMrp are required.');
        }

        $pdo = Database::getConnection();
        $adminId = $request['user']['id'] ?? 'ADM-HOPO-0001';

        $stmt = $pdo->prepare("
            INSERT INTO product_price_overrides (product_id, override_price, override_mrp, updated_by, updated_at)
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                override_price = VALUES(override_price),
                override_mrp = VALUES(override_mrp),
                updated_by = VALUES(updated_by),
                updated_at = NOW()
        ");
        $stmt->execute([$productId, $overridePrice, $overrideMrp, $adminId]);

        Response::success([
            'productId'     => $productId,
            'overridePrice' => $overridePrice,
            'overrideMrp'   => $overrideMrp,
        ], 'Real-time storefront price override applied successfully!');
    }

    public function clearPriceOverride(array $params, array $request): void
    {
        $productId = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("DELETE FROM product_price_overrides WHERE product_id = ?");
        $stmt->execute([$productId]);

        Response::success(null, 'Price override removed. Product restored to catalog price.');
    }

    // =========================================================================
    // 9. FESTIVE COUPONS
    // =========================================================================

    public function coupons(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("
            SELECT 
                c.*,
                (SELECT COUNT(*) FROM coupon_usage WHERE coupon_id = c.id) AS usage_count
            FROM coupons c
            ORDER BY c.created_at DESC
        ");
        $coupons = $stmt->fetchAll();

        foreach ($coupons as &$cpn) {
            $cpn['discount_value'] = (float)$cpn['discount_value'];
            $cpn['min_order_amount'] = (float)$cpn['min_order_amount'];
            $cpn['max_discount_cap'] = $cpn['max_discount_cap'] !== null ? (float)$cpn['max_discount_cap'] : null;
            $cpn['enabled'] = (bool)$cpn['enabled'];
            $cpn['usage_count'] = (int)$cpn['usage_count'];
        }

        Response::success($coupons);
    }

    public function createCoupon(array $params, array $request): void
    {
        $body = $request['body'] ?? [];
        if (!isset($body['title'])) {
            $body['title'] = $body['description'] ?? $body['code'] ?? 'Privilege Coupon';
        }
        if (!isset($body['discountType'])) {
            $body['discountType'] = $body['discount_type'] ?? $body['type'] ?? 'PERCENTAGE';
        }
        if (!isset($body['discountValue'])) {
            $body['discountValue'] = $body['discount_value'] ?? $body['value'] ?? 0;
        }
        if (!isset($body['minOrderAmount'])) {
            $body['minOrderAmount'] = $body['min_order_amount'] ?? $body['min_spend'] ?? 0;
        }
        if (!isset($body['expiryDate'])) {
            $body['expiryDate'] = $body['expiry_date'] ?? $body['valid_until'] ?? date('Y-12-31');
        }
        if (!isset($body['maxDiscountCap'])) {
            $body['maxDiscountCap'] = $body['max_discount_cap'] ?? $body['max_discount'] ?? null;
        }

        $missing = Validator::requireFields($body, ['code', 'title', 'discountType', 'discountValue', 'minOrderAmount', 'expiryDate']);
        if (!empty($missing)) {
            Response::validationError('Missing required coupon fields', ['missing' => $missing]);
        }

        $code = strtoupper(trim((string)$body['code']));
        $title = Validator::sanitizeString($body['title']);
        $description = Validator::sanitizeString($body['description'] ?? '');
        $discountType = strtoupper(trim((string)$body['discountType']));
        $discountValue = (float)$body['discountValue'];
        $minOrderAmount = (float)$body['minOrderAmount'];
        $maxDiscountCap = isset($body['maxDiscountCap']) && $body['maxDiscountCap'] !== '' ? (float)$body['maxDiscountCap'] : null;
        $categoryRestriction = !empty($body['categoryRestriction']) ? (string)$body['categoryRestriction'] : null;
        $expiryDate = date('Y-m-d H:i:s', strtotime((string)$body['expiryDate']));

        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            INSERT INTO coupons (code, title, description, discount_type, discount_value, min_order_amount, max_discount_cap, category_restriction, enabled, valid_from, expiry_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), ?, NOW())
        ");
        $stmt->execute([
            $code, $title, $description, $discountType, $discountValue, $minOrderAmount, $maxDiscountCap, $categoryRestriction, $expiryDate
        ]);

        $createdId = (int)$pdo->lastInsertId();
        Response::success(['id' => $createdId, 'code' => $code], 'Coupon created successfully!', 201);
    }

    public function updateCoupon(array $params, array $request): void
    {
        $id = (int)($params['id'] ?? 0);
        $body = $request['body'] ?? [];

        $pdo = Database::getConnection();
        $enabled = isset($body['enabled']) ? (int)(bool)$body['enabled'] : null;
        $title = isset($body['title']) ? Validator::sanitizeString($body['title']) : null;
        $description = isset($body['description']) ? Validator::sanitizeString($body['description']) : null;
        $expiryDate = isset($body['expiryDate']) ? date('Y-m-d H:i:s', strtotime((string)$body['expiryDate'])) : null;

        $stmt = $pdo->prepare("
            UPDATE coupons SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                enabled = COALESCE(?, enabled),
                expiry_date = COALESCE(?, expiry_date)
            WHERE id = ?
        ");
        $stmt->execute([$title, $description, $enabled, $expiryDate, $id]);

        Response::success(['id' => $id], 'Coupon updated successfully.');
    }

    public function deleteCoupon(array $params, array $request): void
    {
        $id = (int)($params['id'] ?? 0);
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM coupons WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(['id' => $id], 'Coupon removed.');
    }

    // =========================================================================
    // 10. EDITORIAL BANNERS
    // =========================================================================

    public function banners(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM banners ORDER BY display_order ASC, id ASC");
        $banners = $stmt->fetchAll();

        foreach ($banners as &$b) {
            $b['id'] = (int)$b['id'];
            $b['display_order'] = (int)$b['display_order'];
            $b['is_active'] = (bool)$b['is_active'];
        }

        Response::success($banners);
    }

    public function createBanner(array $params, array $request): void
    {
        $body = $request['body'] ?? [];
        $missing = Validator::requireFields($body, ['title', 'image_url']);
        if (!empty($missing)) {
            Response::validationError('Missing banner fields: ' . implode(', ', $missing));
        }

        $title = Validator::sanitizeString($body['title']);
        $subtitle = Validator::sanitizeString($body['subtitle'] ?? '');
        $slot = Validator::sanitizeString($body['slot'] ?? 'home_hero_1');
        $placement = Validator::sanitizeString($body['placement'] ?? 'Home');
        $imageUrl = trim((string)$body['image_url']);
        $linkUrl = trim((string)($body['link_url'] ?? ''));
        $ctaText = Validator::sanitizeString($body['cta_text'] ?? 'Explore Atelier');
        $displayOrder = (int)($body['display_order'] ?? 0);
        $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1;
        $scheduleText = Validator::sanitizeString($body['schedule_text'] ?? 'Active');

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO banners (title, subtitle, slot, placement, image_url, link_url, cta_text, display_order, is_active, schedule_text, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $title, $subtitle, $slot, $placement, $imageUrl, $linkUrl, $ctaText, $displayOrder, $isActive, $scheduleText
        ]);

        Response::success(['id' => (int)$pdo->lastInsertId()], 'Editorial banner created successfully!', 201);
    }

    public function updateBanner(array $params, array $request): void
    {
        $id = (int)($params['id'] ?? 0);
        $body = $request['body'] ?? [];

        $pdo = Database::getConnection();
        $title = isset($body['title']) ? Validator::sanitizeString($body['title']) : null;
        $subtitle = isset($body['subtitle']) ? Validator::sanitizeString($body['subtitle']) : null;
        $slot = isset($body['slot']) ? Validator::sanitizeString($body['slot']) : null;
        $placement = isset($body['placement']) ? Validator::sanitizeString($body['placement']) : null;
        $imageUrl = isset($body['image_url']) ? trim((string)$body['image_url']) : null;
        $linkUrl = isset($body['link_url']) ? trim((string)$body['link_url']) : null;
        $ctaText = isset($body['cta_text']) ? Validator::sanitizeString($body['cta_text']) : null;
        $displayOrder = isset($body['display_order']) ? (int)$body['display_order'] : null;
        $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : null;
        $scheduleText = isset($body['schedule_text']) ? Validator::sanitizeString($body['schedule_text']) : null;

        $stmt = $pdo->prepare("
            UPDATE banners SET
                title = COALESCE(?, title),
                subtitle = COALESCE(?, subtitle),
                slot = COALESCE(?, slot),
                placement = COALESCE(?, placement),
                image_url = COALESCE(?, image_url),
                link_url = COALESCE(?, link_url),
                cta_text = COALESCE(?, cta_text),
                display_order = COALESCE(?, display_order),
                is_active = COALESCE(?, is_active),
                schedule_text = COALESCE(?, schedule_text),
                updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $title, $subtitle, $slot, $placement, $imageUrl, $linkUrl, $ctaText, $displayOrder, $isActive, $scheduleText, $id
        ]);

        Response::success(['id' => $id], 'Banner updated successfully.');
    }

    public function deleteBanner(array $params, array $request): void
    {
        $id = (int)($params['id'] ?? 0);
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM banners WHERE id = ?");
        $stmt->execute([$id]);

        Response::success(['id' => $id], 'Banner deleted.');
    }

    // =========================================================================
    // 11. CONVERSION ANALYTICS
    // =========================================================================

    public function analytics(array $params, array $request): void
    {
        $pdo = Database::getConnection();

        // 1. Funnel counts from analytics_events + orders
        $pageViews = (int)$pdo->query("SELECT COUNT(*) FROM analytics_events WHERE event_type = 'page_view'")->fetchColumn();
        $productViews = (int)$pdo->query("SELECT COUNT(*) FROM analytics_events WHERE event_type = 'product_view'")->fetchColumn();
        $addToCart = (int)$pdo->query("SELECT COUNT(*) FROM analytics_events WHERE event_type = 'add_to_cart'")->fetchColumn();
        $checkoutStarted = (int)$pdo->query("SELECT COUNT(*) FROM analytics_events WHERE event_type = 'checkout_started'")->fetchColumn();
        
        // Purchases from orders
        $purchases = (int)$pdo->query("SELECT COUNT(*) FROM orders WHERE payment_status = 'PAID'")->fetchColumn();

        // If no page views logged yet, provide baseline
        $pageViews = max($pageViews, $productViews, 10);
        $productViews = max($productViews, $addToCart, 5);
        $addToCart = max($addToCart, $checkoutStarted, 3);
        $checkoutStarted = max($checkoutStarted, $purchases, 2);

        $funnel = [
            [
                'step'            => 'Boutique Explorations (Page Views)',
                'count'           => $pageViews,
                'conversionRate'  => 100.0,
                'dropoff'         => 0.0,
            ],
            [
                'step'            => 'Couture Inspections (Product Views)',
                'count'           => $productViews,
                'conversionRate'  => round(($productViews / $pageViews) * 100, 1),
                'dropoff'         => round((1 - ($productViews / $pageViews)) * 100, 1),
            ],
            [
                'step'            => 'Bag Additions (Add to Cart)',
                'count'           => $addToCart,
                'conversionRate'  => round(($addToCart / max(1, $productViews)) * 100, 1),
                'dropoff'         => round((1 - ($addToCart / max(1, $productViews))) * 100, 1),
            ],
            [
                'step'            => 'Couture Checkouts Initiated',
                'count'           => $checkoutStarted,
                'conversionRate'  => round(($checkoutStarted / max(1, $addToCart)) * 100, 1),
                'dropoff'         => round((1 - ($checkoutStarted / max(1, $addToCart))) * 100, 1),
            ],
            [
                'step'            => 'Acquisitions Completed (Purchases)',
                'count'           => $purchases,
                'conversionRate'  => round(($purchases / max(1, $checkoutStarted)) * 100, 1),
                'dropoff'         => round((1 - ($purchases / max(1, $checkoutStarted))) * 100, 1),
            ],
        ];

        // Overall conversion rate
        $overallConversion = round(($purchases / max(1, $pageViews)) * 100, 2);

        // Traffic sources
        $sourcesStmt = $pdo->query("
            SELECT COALESCE(channel, 'Direct VIP Concierge') as channel, COUNT(*) as count
            FROM analytics_events
            GROUP BY channel
            ORDER BY count DESC
        ");
        $channels = $sourcesStmt->fetchAll();
        $totalEvents = array_sum(array_column($channels, 'count')) ?: 1;

        $trafficShare = array_map(function ($ch) use ($totalEvents) {
            return [
                'channel'    => $ch['channel'],
                'sessions'   => (int)$ch['count'],
                'share'      => round(((int)$ch['count'] / $totalEvents) * 100, 1),
            ];
        }, $channels);

        Response::success([
            'overallConversion' => $overallConversion,
            'totalPurchases'    => $purchases,
            'funnel'            => $funnel,
            'trafficShare'      => $trafficShare,
        ]);
    }

    // =========================================================================
    // 12. FINANCIAL REPORTS
    // =========================================================================

    public function reports(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $query = $request['query'] ?? [];

        $fromDate = !empty($query['from']) ? date('Y-m-d 00:00:00', strtotime((string)$query['from'])) : date('Y-m-d 00:00:00', strtotime('-30 days'));
        $toDate = !empty($query['to']) ? date('Y-m-d 23:59:59', strtotime((string)$query['to'])) : date('Y-m-d 23:59:59');

        // Aggregated financial figures for paid orders in range
        $stmt = $pdo->prepare("
            SELECT 
                COALESCE(SUM(mrp_total), 0) AS gross_mrp_sales,
                COALESCE(SUM(subtotal), 0) AS catalog_subtotal,
                COALESCE(SUM(coupon_discount), 0) AS total_discounts,
                COALESCE(SUM(gst_amount), 0) AS total_gst,
                COALESCE(SUM(shipping_fee), 0) AS total_shipping,
                COALESCE(SUM(total_amount), 0) AS net_revenue,
                COUNT(*) AS total_orders
            FROM orders
            WHERE payment_status = 'PAID' AND created_at BETWEEN ? AND ?
        ");
        $stmt->execute([$fromDate, $toDate]);
        $summary = $stmt->fetch();

        $grossSales = (float)$summary['gross_mrp_sales'];
        $catalogSubtotal = (float)$summary['catalog_subtotal'];
        $totalDiscounts = (float)$summary['total_discounts'];
        $totalGst = (float)$summary['total_gst'];
        $netRevenue = (float)$summary['net_revenue'];
        $totalOrders = (int)$summary['total_orders'];
        $aov = $totalOrders > 0 ? round($netRevenue / $totalOrders, 2) : 0.0;

        // Daily series for report charts
        $dailyStmt = $pdo->prepare("
            SELECT 
                DATE(created_at) AS date,
                COUNT(*) AS orders_count,
                COALESCE(SUM(total_amount), 0) AS daily_revenue,
                COALESCE(SUM(coupon_discount), 0) AS daily_discounts
            FROM orders
            WHERE payment_status = 'PAID' AND created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ");
        $dailyStmt->execute([$fromDate, $toDate]);
        $dailySeries = $dailyStmt->fetchAll();

        // Payment method breakdown
        $payStmt = $pdo->prepare("
            SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS volume
            FROM orders
            WHERE payment_status = 'PAID' AND created_at BETWEEN ? AND ?
            GROUP BY payment_method
            ORDER BY volume DESC
        ");
        $payStmt->execute([$fromDate, $toDate]);
        $paymentMethods = $payStmt->fetchAll();

        // Top-selling items in period
        $topStmt = $pdo->prepare("
            SELECT 
                oi.product_id,
                oi.product_title,
                oi.brand,
                oi.image_url,
                SUM(oi.quantity) AS units_sold,
                SUM(oi.total_price) AS revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.payment_status = 'PAID' AND o.created_at BETWEEN ? AND ?
            GROUP BY oi.product_id, oi.product_title, oi.brand, oi.image_url
            ORDER BY units_sold DESC
            LIMIT 5
        ");
        $topStmt->execute([$fromDate, $toDate]);
        $topProducts = $topStmt->fetchAll();

        $financialSummary = [
            'grossSales'        => $grossSales,
            'grossRevenue'      => $grossSales,
            'catalogSubtotal'   => $catalogSubtotal,
            'totalDiscounts'    => $totalDiscounts,
            'totalGst'          => $totalGst,
            'netRevenue'        => $netRevenue,
            'netProfit'         => $netRevenue,
            'totalOrders'       => $totalOrders,
            'averageOrderValue' => $aov,
        ];

        Response::success([
            'dateRange' => [
                'from' => $fromDate,
                'to'   => $toDate,
            ],
            'financialSummary'  => $financialSummary,
            'summary'           => $financialSummary,
            'dailySeries'       => $dailySeries,
            'paymentMethods'    => $paymentMethods,
            'topProducts'       => $topProducts,
            'categoryBreakdown' => [],
        ]);
    }

    // =========================================================================
    // 13. OPERATIONAL NOTIFICATIONS (ADMIN)
    // =========================================================================

    public function adminNotifications(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $category = isset($request['query']['category']) ? strtoupper(trim((string)$request['query']['category'])) : null;
        $unreadOnly = isset($request['query']['unread']) && ($request['query']['unread'] === 'true' || $request['query']['unread'] === '1');

        $where = ["recipient_role = 'ADMIN'", "is_cleared = 0"];
        $bindings = [];

        if ($category && $category !== 'ALL') {
            $where[] = "category = ?";
            $bindings[] = $category;
        }

        if ($unreadOnly) {
            $where[] = "is_read = 0";
        }

        $whereSql = implode(' AND ', $where);

        // Get unread count
        $unreadStmt = $pdo->query("SELECT COUNT(*) FROM notifications WHERE recipient_role = 'ADMIN' AND is_cleared = 0 AND is_read = 0");
        $unreadCount = (int)$unreadStmt->fetchColumn();

        // Get records
        $sql = "
            SELECT id, user_id, category, title, body, action_url, entity_type, entity_id, image_url, is_read, created_at, updated_at
            FROM notifications
            WHERE {$whereSql}
            ORDER BY created_at DESC
            LIMIT 100
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($bindings);
        $rows = $stmt->fetchAll();

        foreach ($rows as &$r) {
            $r['is_read'] = (bool)$r['is_read'];
            $r['isRead'] = $r['is_read'];
            $r['actionUrl'] = $r['action_url'];
            $r['imageUrl'] = $r['image_url'];
            $r['entityType'] = $r['entity_type'];
            $r['entityId'] = $r['entity_id'];
            $r['createdAt'] = $r['created_at'];
            $r['updatedAt'] = $r['updated_at'];
        }

        Response::success([
            'notifications' => $rows,
            'unreadCount'   => $unreadCount,
            'total'         => count($rows),
        ]);
    }

    public function adminUnreadCount(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT COUNT(*) FROM notifications WHERE recipient_role = 'ADMIN' AND is_cleared = 0 AND is_read = 0");
        $count = (int)$stmt->fetchColumn();

        Response::success(['count' => $count]);
    }

    public function adminMarkRead(array $params, array $request): void
    {
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1, updated_at = NOW() WHERE id = ? AND recipient_role = 'ADMIN'");
        $stmt->execute([$id]);

        $unreadStmt = $pdo->query("SELECT COUNT(*) FROM notifications WHERE recipient_role = 'ADMIN' AND is_cleared = 0 AND is_read = 0");
        $unreadCount = (int)$unreadStmt->fetchColumn();

        Response::success(['id' => $id, 'unreadCount' => $unreadCount], 'Notification marked as read.');
    }

    public function adminMarkAllRead(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $pdo->query("UPDATE notifications SET is_read = 1, updated_at = NOW() WHERE recipient_role = 'ADMIN' AND is_cleared = 0");

        Response::success(['unreadCount' => 0], 'All admin notifications marked as read.');
    }

    public function adminClearAll(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $pdo->query("UPDATE notifications SET is_cleared = 1, is_read = 1, updated_at = NOW() WHERE recipient_role = 'ADMIN' AND is_cleared = 0");

        Response::success(['cleared' => true, 'unreadCount' => 0], 'All operational notifications cleared.');
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
        if (str_starts_with($url, '/images/uploads/')) {
            return '/uploads/' . substr($url, strlen('/images/uploads/'));
        }
        if (str_starts_with($url, 'uploads/')) {
            return '/' . $url;
        }
        return $url;
    }
}
