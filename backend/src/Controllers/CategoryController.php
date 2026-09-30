<?php
declare(strict_types=1);

namespace HopoShop\Controllers;

use HopoShop\Config\Database;
use HopoShop\Utils\Response;

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/Utils/Response.php';

class CategoryController
{
    public function index(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("
            SELECT 
                c.id, 
                c.name, 
                c.slug, 
                c.title, 
                c.subtitle, 
                c.eyebrow, 
                c.description, 
                c.image_url, 
                c.display_order,
                c.status,
                c.subcategories,
                COUNT(p.id) AS product_count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active' AND p.is_archived = 0
            WHERE c.status = 'active'
            GROUP BY c.id
            ORDER BY c.display_order ASC
        ");

        $categories = $stmt->fetchAll();

        $result = array_map(function ($cat) {
            $subs = !empty($cat['subcategories']) ? json_decode((string)$cat['subcategories'], true) : [];
            if (!is_array($subs)) {
                $subs = [];
            }
            return [
                'id'           => (int)$cat['id'],
                'name'         => $cat['name'],
                'slug'         => $cat['slug'],
                'title'        => $cat['title'],
                'subtitle'     => $cat['subtitle'],
                'eyebrow'      => $cat['eyebrow'],
                'description'  => $cat['description'],
                'image'        => $cat['image_url'],
                'count'        => (int)$cat['product_count'],
                'subs'         => $subs,
                'status'       => $cat['status'],
            ];
        }, $categories);

        Response::success($result);
    }
}
