<?php
declare(strict_types=1);

namespace HopoShop\Middleware;

use HopoShop\Utils\Response;

require_once dirname(__DIR__) . '/Utils/Response.php';

class RateLimiter
{
    private static string $storageDir = '';

    private static function getStorageDir(): string
    {
        if (self::$storageDir === '') {
            self::$storageDir = sys_get_temp_dir() . '/hopo_rate_limits';
            if (!is_dir(self::$storageDir)) {
                @mkdir(self::$storageDir, 0777, true);
            }
        }
        return self::$storageDir;
    }

    public static function check(string $action, int $maxAttempts = 10, int $decaySeconds = 300): void
    {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $key = md5("{$action}_{$ip}");
        $file = self::getStorageDir() . "/{$key}.json";

        $now = time();
        $data = ['attempts' => 0, 'first_attempt' => $now];

        if (file_exists($file)) {
            $content = @file_get_contents($file);
            $parsed = $content ? json_decode($content, true) : null;
            if (is_array($parsed)) {
                if ($now - ($parsed['first_attempt'] ?? 0) < $decaySeconds) {
                    $data = $parsed;
                }
            }
        }

        if ($data['attempts'] >= $maxAttempts) {
            $retryAfter = $decaySeconds - ($now - $data['first_attempt']);
            header("Retry-After: {$retryAfter}");
            Response::error("Too many requests. Please try again in {$retryAfter} seconds.", 429);
        }

        $data['attempts']++;
        @file_put_contents($file, json_encode($data));
    }
}
