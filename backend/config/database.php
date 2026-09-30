<?php
declare(strict_types=1);

namespace HopoShop\Config;

use PDO;
use PDOException;

require_once __DIR__ . '/config.php';

class Database
{
    private static ?PDO $connection = null;

    public static function getConnection(): PDO
    {
        if (self::$connection !== null) {
            return self::$connection;
        }

        $host = Config::get('DB_HOST', 'localhost');
        $port = Config::get('DB_PORT', '3306');
        $database = Config::get('DB_NAME', 'hopo_shop');
        $username = Config::get('DB_USER', 'root');
        $password = Config::get('DB_PASSWORD', '');
        $charset = Config::get('DB_CHARSET', 'utf8mb4');

        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset={$charset}";

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 5,
        ];

        try {
            self::$connection = new PDO($dsn, $username, $password, $options);
            self::$connection->exec("SET NAMES {$charset} COLLATE utf8mb4_unicode_ci");
            return self::$connection;
        } catch (PDOException $e) {
            error_log("Database connection failure: " . $e->getMessage());
            throw $e;
        }
    }

    public static function getRawConnectionWithoutDatabase(): PDO
    {
        $host = Config::get('DB_HOST', 'localhost');
        $port = Config::get('DB_PORT', '3306');
        $username = Config::get('DB_USER', 'root');
        $password = Config::get('DB_PASSWORD', '');
        $charset = Config::get('DB_CHARSET', 'utf8mb4');

        $dsn = "mysql:host={$host};port={$port};charset={$charset}";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_TIMEOUT            => 5,
        ];

        return new PDO($dsn, $username, $password, $options);
    }
}
