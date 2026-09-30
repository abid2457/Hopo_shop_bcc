<?php
declare(strict_types=1);

namespace HopoShop\Config;

class Config
{
    private static array $settings = [];
    private static bool $loaded = false;

    public static function load(): void
    {
        if (self::$loaded) {
            return;
        }

        $envFile = dirname(__DIR__) . '/.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || str_starts_with($line, '#')) {
                    continue;
                }
                if (str_contains($line, '=')) {
                    [$key, $value] = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);
                    $value = trim($value, "\"'");
                    self::$settings[$key] = $value;
                    if (!isset($_ENV[$key])) {
                        $_ENV[$key] = $value;
                        putenv("{$key}={$value}");
                    }
                }
            }
        }

        self::$loaded = true;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        self::load();
        if (array_key_exists($key, self::$settings)) {
            return self::$settings[$key];
        }
        if (array_key_exists($key, $_ENV)) {
            return $_ENV[$key];
        }
        $env = getenv($key);
        if ($env !== false) {
            return $env;
        }
        return $default;
    }
}
