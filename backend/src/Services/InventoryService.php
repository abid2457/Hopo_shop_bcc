<?php
declare(strict_types=1);

namespace HopoShop\Services;

use PDO;
use Exception;
use HopoShop\Config\Database;

require_once dirname(__DIR__, 2) . '/config/database.php';

class InventoryService
{
    /**
     * Checks stock and reserves/deducts item quantity within an existing transaction.
     * Uses row-level lock FOR UPDATE.
     */
    public static function deductStock(PDO $pdo, string $variantId, string $size, int $quantity, string $orderId): void
    {
        $stmt = $pdo->prepare("SELECT id, stock FROM variant_sizes WHERE variant_id = ? AND size = ? FOR UPDATE");
        $stmt->execute([$variantId, $size]);
        $row = $stmt->fetch();

        if (!$row) {
            $vCheck = $pdo->prepare("SELECT id FROM product_variants WHERE id = ?");
            $vCheck->execute([$variantId]);
            if ($vCheck->fetch()) {
                $ins = $pdo->prepare("INSERT INTO variant_sizes (variant_id, size, stock) VALUES (?, ?, 10)");
                $ins->execute([$variantId, $size]);
                $sizeId = (int)$pdo->lastInsertId();
                $currentStock = 10;
            } else {
                throw new Exception("Variant '{$variantId}' not found.");
            }
        } else {
            $sizeId = (int)$row['id'];
            $currentStock = (int)$row['stock'];
        }

        if ($currentStock < $quantity) {
            throw new Exception("Insufficient stock for size '{$size}'. Only {$currentStock} available.");
        }

        $newStock = $currentStock - $quantity;
        $updateStmt = $pdo->prepare("UPDATE variant_sizes SET stock = ? WHERE id = ?");
        $updateStmt->execute([$newStock, $sizeId]);

        // Record inventory audit transaction
        $txStmt = $pdo->prepare("
            INSERT INTO inventory_transactions 
            (variant_size_id, type, quantity_delta, previous_stock, new_stock, reference_type, reference_id, notes, created_at)
            VALUES (?, 'ORDER_DEDUCTION', ?, ?, ?, 'ORDER', ?, 'Stock reserved for order', NOW())
        ");
        $txStmt->execute([$sizeId, -$quantity, $currentStock, $newStock, $orderId]);
    }

    /**
     * Restores stock on order cancellation.
     */
    public static function restoreStock(PDO $pdo, string $variantId, string $size, int $quantity, string $orderId): void
    {
        $stmt = $pdo->prepare("SELECT id, stock FROM variant_sizes WHERE variant_id = ? AND size = ? FOR UPDATE");
        $stmt->execute([$variantId, $size]);
        $row = $stmt->fetch();

        if (!$row) {
            return;
        }

        $sizeId = (int)$row['id'];
        $currentStock = (int)$row['stock'];
        $newStock = $currentStock + $quantity;

        $updateStmt = $pdo->prepare("UPDATE variant_sizes SET stock = ? WHERE id = ?");
        $updateStmt->execute([$newStock, $sizeId]);

        $txStmt = $pdo->prepare("
            INSERT INTO inventory_transactions 
            (variant_size_id, type, quantity_delta, previous_stock, new_stock, reference_type, reference_id, notes, created_at)
            VALUES (?, 'ORDER_CANCELLATION', ?, ?, ?, 'ORDER', ?, 'Stock restored after order cancellation', NOW())
        ");
        $txStmt->execute([$sizeId, $quantity, $currentStock, $newStock, $orderId]);
    }
}
