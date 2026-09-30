<?php
declare(strict_types=1);

namespace HopoShop\Utils;

class Response
{
    public static function json(mixed $data, int $statusCode = 200, string $message = 'Success'): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => $statusCode >= 200 && $statusCode < 300,
            'message' => $message,
            'data'    => $data,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    public static function success(mixed $data = null, string $message = 'Success', int $statusCode = 200): void
    {
        self::json($data, $statusCode, $message);
    }

    public static function error(string $message = 'An error occurred', int $statusCode = 400, mixed $errors = null): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'error'   => $errors,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit(0);
    }

    public static function unauthorized(string $message = 'Unauthorized access'): void
    {
        self::error($message, 401);
    }

    public static function forbidden(string $message = 'Forbidden: insufficient privileges'): void
    {
        self::error($message, 403);
    }

    public static function notFound(string $message = 'Resource not found'): void
    {
        self::error($message, 404);
    }

    public static function validationError(string $message, array $errors = []): void
    {
        self::error($message, 422, $errors);
    }
}
