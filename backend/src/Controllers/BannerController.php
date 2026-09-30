<?php
declare(strict_types=1);

namespace HopoShop\Controllers;

use HopoShop\Config\Database;
use HopoShop\Utils\Response;

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/Utils/Response.php';

class BannerController
{
    public function index(array $params, array $request): void
    {
        $pdo = Database::getConnection();
        $slot = $request['query']['slot'] ?? null;

        if ($slot) {
            $stmt = $pdo->prepare("SELECT * FROM banners WHERE is_active = 1 AND slot = ? ORDER BY display_order ASC, id ASC");
            $stmt->execute([$slot]);
        } else {
            $stmt = $pdo->query("SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
        }

        $banners = $stmt->fetchAll();
        foreach ($banners as &$b) {
            $b['id'] = (int)$b['id'];
            $b['display_order'] = (int)$b['display_order'];
            $b['is_active'] = (bool)$b['is_active'];
        }

        Response::success($banners);
    }
}
