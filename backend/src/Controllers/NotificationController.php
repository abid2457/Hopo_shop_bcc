<?php
declare(strict_types=1);

namespace HopoShop\Controllers;

use HopoShop\Config\Database;
use HopoShop\Utils\Response;
use PDO;

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/Utils/Response.php';

class NotificationController
{
    /**
     * Customer: Get paginated notifications for authenticated user
     * GET /api/notifications
     */
    public function index(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user || empty($user['id'])) {
            Response::unauthorized('Authentication required to view notifications.');
        }

        $userId = (string)$user['id'];
        $pdo = Database::getConnection();

        $page = max(1, (int)($request['query']['page'] ?? 1));
        $limit = min(50, max(1, (int)($request['query']['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        // Total count
        $countStmt = $pdo->prepare("
            SELECT COUNT(*) FROM notifications 
            WHERE user_id = ? AND recipient_role = 'CUSTOMER' AND is_cleared = 0
        ");
        $countStmt->execute([$userId]);
        $total = (int)$countStmt->fetchColumn();

        // Unread count
        $unreadStmt = $pdo->prepare("
            SELECT COUNT(*) FROM notifications 
            WHERE user_id = ? AND recipient_role = 'CUSTOMER' AND is_cleared = 0 AND is_read = 0
        ");
        $unreadStmt->execute([$userId]);
        $unreadCount = (int)$unreadStmt->fetchColumn();

        // Records
        $stmt = $pdo->prepare("
            SELECT 
                id,
                user_id,
                category,
                title,
                body,
                action_url,
                entity_type,
                entity_id,
                image_url,
                is_read,
                created_at
            FROM notifications
            WHERE user_id = ? AND recipient_role = 'CUSTOMER' AND is_cleared = 0
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $userId, PDO::PARAM_STR);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['is_read'] = (bool)$r['is_read'];
            $r['isRead'] = $r['is_read'];
            $r['actionUrl'] = $r['action_url'];
            $r['imageUrl'] = $r['image_url'];
            $r['entityType'] = $r['entity_type'];
            $r['entityId'] = $r['entity_id'];
            $r['createdAt'] = $r['created_at'];
        }

        Response::success([
            'notifications' => $rows,
            'unreadCount'   => $unreadCount,
            'pagination'    => [
                'page'  => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => $total > 0 ? (int)ceil($total / $limit) : 1,
            ],
        ]);
    }

    /**
     * Customer: Get unread count
     * GET /api/notifications/unread-count
     */
    public function unreadCount(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user || empty($user['id'])) {
            Response::success(['count' => 0]);
        }

        $userId = (string)$user['id'];
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM notifications 
            WHERE user_id = ? AND recipient_role = 'CUSTOMER' AND is_cleared = 0 AND is_read = 0
        ");
        $stmt->execute([$userId]);
        $count = (int)$stmt->fetchColumn();

        Response::success(['count' => $count]);
    }

    /**
     * Customer: Mark single notification as read
     * PUT /api/notifications/{id}/read
     */
    public function markRead(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user || empty($user['id'])) {
            Response::unauthorized();
        }

        $userId = (string)$user['id'];
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            UPDATE notifications 
            SET is_read = 1, updated_at = NOW() 
            WHERE id = ? AND user_id = ? AND recipient_role = 'CUSTOMER'
        ");
        $stmt->execute([$id, $userId]);

        if ($stmt->rowCount() === 0) {
            // Check if notification exists but belongs to someone else
            $check = $pdo->prepare("SELECT id FROM notifications WHERE id = ?");
            $check->execute([$id]);
            if ($check->fetch()) {
                Response::forbidden('Access denied to this notification.');
            } else {
                Response::notFound('Notification not found.');
            }
        }

        // Get new unread count
        $unreadStmt = $pdo->prepare("
            SELECT COUNT(*) FROM notifications 
            WHERE user_id = ? AND recipient_role = 'CUSTOMER' AND is_cleared = 0 AND is_read = 0
        ");
        $unreadStmt->execute([$userId]);
        $unreadCount = (int)$unreadStmt->fetchColumn();

        Response::success(['id' => $id, 'unreadCount' => $unreadCount], 'Notification marked as read.');
    }

    /**
     * Customer: Mark all notifications as read
     * PUT /api/notifications/read-all
     */
    public function markAllRead(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user || empty($user['id'])) {
            Response::unauthorized();
        }

        $userId = (string)$user['id'];
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            UPDATE notifications 
            SET is_read = 1, updated_at = NOW() 
            WHERE user_id = ? AND recipient_role = 'CUSTOMER' AND is_cleared = 0
        ");
        $stmt->execute([$userId]);

        Response::success(['unreadCount' => 0], 'All notifications marked as read.');
    }

    /**
     * Customer: Clear all notifications for user
     * DELETE /api/notifications/clear-all
     */
    public function clearAll(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user || empty($user['id'])) {
            Response::unauthorized();
        }

        $userId = (string)$user['id'];
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            UPDATE notifications 
            SET is_cleared = 1, is_read = 1, updated_at = NOW() 
            WHERE user_id = ? AND recipient_role = 'CUSTOMER' AND is_cleared = 0
        ");
        $stmt->execute([$userId]);

        Response::success(['cleared' => true, 'unreadCount' => 0], 'All notifications cleared successfully.');
    }

    /**
     * Customer: Delete single notification
     * DELETE /api/notifications/{id}
     */
    public function delete(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user || empty($user['id'])) {
            Response::unauthorized();
        }

        $userId = (string)$user['id'];
        $id = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            UPDATE notifications 
            SET is_cleared = 1, updated_at = NOW() 
            WHERE id = ? AND user_id = ? AND recipient_role = 'CUSTOMER'
        ");
        $stmt->execute([$id, $userId]);

        if ($stmt->rowCount() === 0) {
            $check = $pdo->prepare("SELECT id FROM notifications WHERE id = ?");
            $check->execute([$id]);
            if ($check->fetch()) {
                Response::forbidden('Access denied to this notification.');
            } else {
                Response::notFound('Notification not found.');
            }
        }

        Response::success(['id' => $id, 'deleted' => true], 'Notification deleted.');
    }
}
