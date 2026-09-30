<?php
declare(strict_types=1);

namespace HopoShop\Middleware;

use HopoShop\Utils\JWT;
use HopoShop\Utils\Response;

require_once dirname(__DIR__) . '/Utils/JWT.php';
require_once dirname(__DIR__) . '/Utils/Response.php';

class AuthMiddleware
{
    public static function handle(array $request): array
    {
        $token = self::extractToken($request);
        if (!$token) {
            Response::unauthorized('Authentication token is missing. Please log in.');
        }

        $payload = JWT::verify($token);
        if (!$payload) {
            Response::unauthorized('Invalid or expired authentication session. Please log in again.');
        }

        $request['user'] = $payload;
        return $request;
    }

    public static function optional(array $request): array
    {
        $token = self::extractToken($request);
        if ($token) {
            $payload = JWT::verify($token);
            if ($payload) {
                $request['user'] = $payload;
            }
        }
        return $request;
    }

    private static function extractToken(array $request): ?string
    {
        $headers = $request['headers'] ?? [];
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

        if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }

        if ($authHeader && preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
