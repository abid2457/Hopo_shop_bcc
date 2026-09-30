<?php
declare(strict_types=1);

namespace HopoShop\Utils;

class Validator
{
    public static function sanitizeString(?string $val): ?string
    {
        if ($val === null) return null;
        $val = trim($val);
        return htmlspecialchars($val, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public static function isValidEmail(string $email): bool
    {
        return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    public static function isValidPhone(string $phone): bool
    {
        $cleaned = preg_replace('/[^0-9+]/', '', $phone);
        return strlen($cleaned) >= 10 && strlen($cleaned) <= 15;
    }

    public static function isValidPincode(string $pincode): bool
    {
        return (bool)preg_match('/^[1-9][0-9]{5}$/', trim($pincode));
    }

    public static function requireFields(array $input, array $required): array
    {
        $missing = [];
        foreach ($required as $field) {
            if (!isset($input[$field]) || trim((string)$input[$field]) === '') {
                $missing[] = $field;
            }
        }
        return $missing;
    }
}
