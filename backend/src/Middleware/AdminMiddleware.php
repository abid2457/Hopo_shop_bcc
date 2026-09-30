<?php
declare(strict_types=1);

namespace HopoShop\Middleware;

use HopoShop\Utils\Response;

require_once __DIR__ . '/AuthMiddleware.php';
require_once dirname(__DIR__) . '/Utils/Response.php';

class AdminMiddleware
{
    public static function handle(array $request): array
    {
        $request = AuthMiddleware::handle($request);
        $user = $request['user'];

        if (($user['role'] ?? '') !== 'ADMIN') {
            Response::forbidden('Access restricted to administrators only.');
        }

        return $request;
    }
}
