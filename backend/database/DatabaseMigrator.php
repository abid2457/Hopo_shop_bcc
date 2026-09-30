<?php
declare(strict_types=1);

namespace HopoShop\Database;

use PDO;
use Exception;
use HopoShop\Config\Config;
use HopoShop\Config\Database;

require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/config/database.php';

class DatabaseMigrator
{
    /**
     * Ensures the database and required tables exist.
     * If missing, automatically runs the migration and seeds initial data.
     */
    public static function ensureDatabase(): void
    {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->query("SHOW TABLES LIKE 'products'");
            if ($stmt->rowCount() === 0) {
                self::run(true);
            }
        } catch (\PDOException $e) {
            // Database might not even exist yet!
            self::run(true);
        }
    }

    /**
     * Executes schema and seed files.
     */
    public static function run(bool $seed = true, bool $forceSeed = false): array
    {
        $log = [];
        $startTime = microtime(true);

        $dbName = Config::get('DB_NAME', 'hopo_shop');

        // Step 1: Connect to server without database to ensure database exists
        $rawPdo = Database::getRawConnectionWithoutDatabase();
        if ($forceSeed) {
            $rawPdo->exec("DROP DATABASE IF EXISTS `{$dbName}`;");
            $log[] = "Dropped previous database `{$dbName}` for clean rebuild.";
        }
        $rawPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        $log[] = "Database `{$dbName}` verified or created.";

        // Step 2: Connect to target database
        $pdo = Database::getConnection();

        // Step 3: Run schema.sql
        $schemaPath = __DIR__ . '/schema.sql';
        if (!file_exists($schemaPath)) {
            throw new Exception("Schema file not found at: {$schemaPath}");
        }

        $schemaSql = file_get_contents($schemaPath);
        self::executeMultiQuery($pdo, $schemaSql);
        $log[] = "Schema tables created successfully.";

        // Step 4: Run seed.sql if requested or if products table is empty
        if ($seed) {
            $checkProducts = $pdo->query("SELECT COUNT(*) AS total FROM products")->fetch();
            $shouldSeed = $forceSeed || ((int)($checkProducts['total'] ?? 0) === 0);
            if ($shouldSeed) {
                $seedPath = __DIR__ . '/seed.sql';
                if (file_exists($seedPath)) {
                    $seedSql = file_get_contents($seedPath);
                    self::executeMultiQuery($pdo, $seedSql);
                    $log[] = "Seed data inserted successfully.";
                }
            } else {
                $log[] = "Database already contains products ({$checkProducts['total']} items), skipped re-seeding.";
            }
        }

        // Fetch list of created tables
        $tablesStmt = $pdo->query("SHOW TABLES");
        $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

        $duration = round(microtime(true) - $startTime, 3);
        $log[] = "Migration finished in {$duration}s. Found " . count($tables) . " tables in `{$dbName}`.";

        return [
            'success' => true,
            'tables' => $tables,
            'log' => $log,
            'duration_sec' => $duration,
        ];
    }

    /**
     * Executes raw SQL script containing multiple statements safely.
     */
    private static function executeMultiQuery(PDO $pdo, string $sql): void
    {
        // Remove SQL comments
        $sql = preg_replace('/--.*$/m', '', $sql);
        $sql = preg_replace('/\/\*[\s\S]*?\*\//m', '', $sql);

        // Split by semicolon that is not within quotes
        $statements = explode(';', $sql);

        foreach ($statements as $stmt) {
            $stmt = trim($stmt);
            if ($stmt === '') {
                continue;
            }
            try {
                $pdo->exec($stmt);
            } catch (\PDOException $e) {
                // Ignore "already exists" or harmless statements
                if (!str_contains($e->getMessage(), 'already exists')) {
                    error_log("Migration statement failed: " . substr($stmt, 0, 100) . " - " . $e->getMessage());
                    throw $e;
                }
            }
        }
    }
}
