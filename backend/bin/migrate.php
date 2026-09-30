<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/database/DatabaseMigrator.php';

use HopoShop\Database\DatabaseMigrator;

echo "================================================================" . PHP_EOL;
echo "  HOPO SHOP — AUTOMATIC MYSQL DATABASE MIGRATION & SEED RUNNER  " . PHP_EOL;
echo "================================================================" . PHP_EOL;

$fresh = in_array('--fresh', $argv, true) || in_array('-f', $argv, true);

try {
    $result = DatabaseMigrator::run(true, $fresh);
    foreach ($result['log'] as $line) {
        echo " [+] {$line}" . PHP_EOL;
    }
    echo PHP_EOL;
    echo "Tables in database (" . count($result['tables']) . "):" . PHP_EOL;
    foreach ($result['tables'] as $i => $tbl) {
        echo "   " . str_pad((string)($i + 1) . ".", 4, " ") . "{$tbl}" . PHP_EOL;
    }
    echo PHP_EOL;
    echo "SUCCESS: All MySQL tables and seed records are now active in MySQL Workbench!" . PHP_EOL;
    exit(0);
} catch (\Throwable $e) {
    echo "[-] ERROR DURING MIGRATION: " . $e->getMessage() . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
    exit(1);
}
