<?php
declare(strict_types=1);

namespace HopoShop\Utils;

use HopoShop\Config\Config;

require_once dirname(__DIR__, 2) . '/config/config.php';

class JWT
{
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public static function generate(array $payload, ?int $ttl = null): string
    {
        $secret = Config::get('JWT_SECRET', 'hopo_shop_atelier_ultra_secure_jwt_secret_key_2026_luxury_brand');
        $ttl = $ttl ?? (int)Config::get('JWT_TTL', 2592000); // 30 days session validity

        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256',
        ];

        $now = time();
        $payload['iat'] = $now;
        $payload['exp'] = $now + $ttl;

        $encodedHeader = self::base64UrlEncode((string)json_encode($header));
        $encodedPayload = self::base64UrlEncode((string)json_encode($payload));

        $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
        $encodedSignature = self::base64UrlEncode($signature);

        return "{$encodedHeader}.{$encodedPayload}.{$encodedSignature}";
    }

    public static function verify(string $token): ?array
    {
        $secret = Config::get('JWT_SECRET', 'hopo_shop_atelier_ultra_secure_jwt_secret_key_2026_luxury_brand');
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $expectedSig = self::base64UrlEncode(
            hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true)
        );

        if (!hash_equals($expectedSig, $encodedSignature)) {
            return null; // Invalid signature
        }

        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);
        if (!$payload || !is_array($payload)) {
            return null;
        }

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // Token expired
        }

        return $payload;
    }
}
