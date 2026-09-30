<?php
declare(strict_types=1);

namespace HopoShop\Config;

require_once __DIR__ . '/config.php';

class Cors
{
    public static function handle(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // Configure allowed origins from environment
        $configuredFrontendUrls = Config::get('FRONTEND_URL', '');
        $allowedOrigins = [];
        if (!empty($configuredFrontendUrls)) {
            $parsed = array_map('trim', explode(',', $configuredFrontendUrls));
            $allowedOrigins = array_filter($parsed);
        }

        // Standard local development origins
        $localOrigins = [
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ];
        $allAllowedOrigins = array_unique(array_merge($allowedOrigins, $localOrigins));

        $isAllowed = false;
        $matchedOrigin = '';

        if (!empty($origin)) {
            if (in_array($origin, $allAllowedOrigins, true)) {
                $isAllowed = true;
                $matchedOrigin = $origin;
            } elseif (preg_match('/^https:\/\/([a-z0-9-]+)\.vercel\.app$/i', $origin)) {
                // Allow official Vercel preview and production deployment domains
                $isAllowed = true;
                $matchedOrigin = $origin;
            }
        }

        if ($isAllowed) {
            header("Access-Control-Allow-Origin: {$matchedOrigin}");
            header("Access-Control-Allow-Credentials: true");
        } elseif (!empty($allowedOrigins)) {
            header("Access-Control-Allow-Origin: {$allowedOrigins[0]}");
            header("Access-Control-Allow-Credentials: true");
        } else {
            // Safe fallback when no origin is provided
            header("Access-Control-Allow-Origin: *");
        }

        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Session-ID");
        header("Access-Control-Max-Age: 86400");

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit(0);
        }
    }
}
