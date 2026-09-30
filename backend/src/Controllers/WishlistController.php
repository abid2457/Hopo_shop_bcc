<?php
declare(strict_types=1);

namespace HopoShop\Controllers;

use HopoShop\Config\Database;
use HopoShop\Utils\Response;

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/Utils/Response.php';

class WishlistController
{
    private function getWishlistId(string $userId): string
    {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id FROM wishlists WHERE user_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $id = $stmt->fetchColumn();

        if ($id) {
            return (string)$id;
        }

        $wishlistId = 'WSH-' . strtoupper(substr(uniqid(), -8));
        $insert = $pdo->prepare("INSERT INTO wishlists (id, user_id, created_at) VALUES (?, ?, NOW())");
        $insert->execute([$wishlistId, $userId]);
        return $wishlistId;
    }

    public function index(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user) {
            Response::unauthorized();
        }

        $pdo = Database::getConnection();
        $wishlistId = $this->getWishlistId($user['id']);

        $stmt = $pdo->prepare("
            SELECT 
                p.id,
                p.brand,
                p.title,
                COALESCE(ppo.override_price, p.base_price) AS price,
                COALESCE(ppo.override_mrp, p.mrp) AS mrp,
                p.rating,
                p.reviews_count AS reviews,
                p.primary_image AS image,
                p.tag,
                c.name AS category,
                wi.created_at AS added_at
            FROM wishlist_items wi
            JOIN products p ON p.id = wi.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN product_price_overrides ppo ON ppo.product_id = p.id
            WHERE wi.wishlist_id = ?
            ORDER BY wi.created_at DESC
        ");
        $stmt->execute([$wishlistId]);
        $items = $stmt->fetchAll();

        foreach ($items as &$item) {
            $item['price'] = (float)$item['price'];
            $item['mrp'] = (float)$item['mrp'];
            $item['rating'] = (float)$item['rating'];
            $item['reviews'] = (int)$item['reviews'];
        }

        Response::success([
            'items'      => $items,
            'productIds' => array_column($items, 'id'),
            'count'      => count($items),
        ]);
    }

    public function toggle(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user) {
            Response::unauthorized();
        }

        $productId = trim((string)($request['body']['productId'] ?? ''));
        if ($productId === '') {
            Response::validationError('Product ID is required');
        }

        $pdo = Database::getConnection();
        $wishlistId = $this->getWishlistId($user['id']);

        // Check if exists
        $stmt = $pdo->prepare("SELECT id FROM wishlist_items WHERE wishlist_id = ? AND product_id = ? LIMIT 1");
        $stmt->execute([$wishlistId, $productId]);
        $exists = $stmt->fetch();

        if ($exists) {
            $del = $pdo->prepare("DELETE FROM wishlist_items WHERE id = ?");
            $del->execute([$exists['id']]);
            Response::success(['inWishlist' => false, 'productId' => $productId], 'Removed from wishlist');
        } else {
            $ins = $pdo->prepare("INSERT INTO wishlist_items (wishlist_id, product_id, created_at) VALUES (?, ?, NOW())");
            $ins->execute([$wishlistId, $productId]);
            Response::success(['inWishlist' => true, 'productId' => $productId], 'Added to wishlist');
        }
    }

    public function remove(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user) {
            Response::unauthorized();
        }

        $productId = $params['id'] ?? '';
        $pdo = Database::getConnection();
        $wishlistId = $this->getWishlistId($user['id']);

        $del = $pdo->prepare("DELETE FROM wishlist_items WHERE wishlist_id = ? AND product_id = ?");
        $del->execute([$wishlistId, $productId]);

        Response::success(['inWishlist' => false, 'productId' => $productId], 'Removed from wishlist');
    }
}
