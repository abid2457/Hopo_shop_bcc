<?php
declare(strict_types=1);

namespace HopoShop\Controllers;

use HopoShop\Config\Database;
use HopoShop\Utils\Response;

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/Utils/Response.php';

class AnalyticsController
{
    public function track(array $params, array $request): void
    {
        $body = $request['body'] ?? [];
        $eventType = trim((string)($body['eventType'] ?? $body['event_type'] ?? ''));
        if ($eventType === '') {
            Response::validationError('eventType is required.');
        }

        $sessionId = $body['sessionId'] ?? $body['session_id'] ?? null;
        $userId = $request['user']['id'] ?? $body['userId'] ?? null;
        $entityType = $body['entityType'] ?? $body['entity_type'] ?? null;
        $entityId = $body['entityId'] ?? $body['entity_id'] ?? null;
        $referrer = $body['referrer'] ?? ($_SERVER['HTTP_REFERER'] ?? null);
        $channel = $body['channel'] ?? 'Direct VIP Concierge';
        $metadata = isset($body['metadata']) ? json_encode($body['metadata']) : null;
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            INSERT INTO analytics_events (event_type, session_id, user_id, entity_type, entity_id, referrer, channel, metadata, ip_address, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $eventType, $sessionId, $userId, $entityType, $entityId, $referrer, $channel, $metadata, $ip, $ua
        ]);

        Response::success(['recorded' => true], 'Event tracked successfully.');
    }
}
