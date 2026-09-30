<?php
declare(strict_types=1);

namespace HopoShop\Controllers;

use HopoShop\Config\Database;
use HopoShop\Utils\Response;
use HopoShop\Utils\Validator;

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/Utils/Response.php';
require_once dirname(__DIR__) . '/Utils/Validator.php';

class UserController
{
    public function getProfile(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user) {
            Response::unauthorized();
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, name, email, phone, role, tier, points, avatar_url, created_at, updated_at FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$user['id']]);
        $profile = $stmt->fetch();

        if (!$profile) {
            Response::notFound("User not found.");
        }

        Response::success([
            'id'                   => $profile['id'],
            'adminId'              => $profile['id'],
            'name'                 => $profile['name'],
            'displayName'          => $profile['name'],
            'email'                => $profile['email'],
            'phone'                => $profile['phone'] ?? '',
            'alternatePhone'       => '',
            'role'                 => $profile['role'] === 'ADMIN' ? 'Super Administrator' : $profile['role'],
            'systemRole'           => $profile['role'],
            'jobTitle'             => $profile['role'] === 'ADMIN' ? 'Super Administrator' : 'Customer',
            'department'           => 'Administration',
            'tier'                 => $profile['tier'] ?? 'Silver',
            'points'               => (int)($profile['points'] ?? 0),
            'avatar'               => $profile['avatar_url'] ?? null,
            'accountStatus'        => 'Active',
            'accessLevel'          => $profile['role'] === 'ADMIN' ? 'Full Access' : 'Standard',
            'createdAt'            => $profile['created_at'],
            'updatedAt'            => $profile['updated_at'] ?? $profile['created_at'],
            'lastLoginAt'          => date('c'),
            'lastPasswordChangeAt' => null,
            'joinedDate'           => date('d F Y', strtotime($profile['created_at'])),
        ]);
    }

    public function updateProfile(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user) {
            Response::unauthorized();
        }

        $body = $request['body'] ?? [];
        $name = isset($body['name']) ? Validator::sanitizeString($body['name']) : null;
        $displayName = isset($body['displayName']) ? Validator::sanitizeString($body['displayName']) : (isset($body['display_name']) ? Validator::sanitizeString($body['display_name']) : null);
        $phone = isset($body['phone']) ? Validator::sanitizeString($body['phone']) : null;
        $alternatePhone = isset($body['alternatePhone']) ? Validator::sanitizeString($body['alternatePhone']) : (isset($body['alternate_phone']) ? Validator::sanitizeString($body['alternate_phone']) : null);
        $jobTitle = isset($body['jobTitle']) ? Validator::sanitizeString($body['jobTitle']) : (isset($body['job_title']) ? Validator::sanitizeString($body['job_title']) : null);
        $department = isset($body['department']) ? Validator::sanitizeString($body['department']) : null;
        $avatar = isset($body['avatar']) ? Validator::sanitizeString($body['avatar']) : (isset($body['avatar_url']) ? Validator::sanitizeString($body['avatar_url']) : null);

        $email = isset($body['email']) ? Validator::sanitizeEmail($body['email']) : null;
        $newPassword = isset($body['new_password']) ? (string)$body['new_password'] : null;
        $currentPassword = isset($body['current_password']) ? (string)$body['current_password'] : null;

        $pdo = Database::getConnection();
        $fields = [];
        $bindings = [];

        if ($name !== null && trim($name) !== '') {
            $fields[] = "name = ?";
            $bindings[] = $name;
        }
        if ($displayName !== null) {
            $fields[] = "display_name = ?";
            $bindings[] = $displayName;
        }
        if ($phone !== null) {
            $fields[] = "phone = ?";
            $bindings[] = $phone;
        }
        if ($alternatePhone !== null) {
            $fields[] = "alternate_phone = ?";
            $bindings[] = $alternatePhone;
        }
        if ($jobTitle !== null) {
            $fields[] = "job_title = ?";
            $bindings[] = $jobTitle;
        }
        if ($department !== null) {
            $fields[] = "department = ?";
            $bindings[] = $department;
        }
        if ($avatar !== null) {
            $fields[] = "avatar_url = ?";
            $bindings[] = $avatar;
        }
        if ($email !== null && $email !== '') {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Response::validationError("Please provide a valid email address.");
            }
            $stmtEmail = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
            $stmtEmail->execute([$email, $user['id']]);
            if ($stmtEmail->fetch()) {
                Response::error("This email address is already in use by another account.", 409);
            }
            $fields[] = "email = ?";
            $bindings[] = $email;
        }

        if ($newPassword !== null && trim($newPassword) !== '') {
            if (strlen($newPassword) < 8) {
                Response::validationError("New password must be at least 8 characters long.");
            }
            if (!preg_match('/[A-Z]/', $newPassword)) {
                Response::validationError("New password must contain at least one uppercase letter.");
            }
            if (!preg_match('/[a-z]/', $newPassword)) {
                Response::validationError("New password must contain at least one lowercase letter.");
            }
            if (!preg_match('/[0-9]/', $newPassword)) {
                Response::validationError("New password must contain at least one number.");
            }
            if (!preg_match('/[!@#$%^&*(),.?":{}|<>_\-]/', $newPassword)) {
                Response::validationError("New password must contain at least one special character.");
            }

            if ($currentPassword !== null && $currentPassword !== '') {
                $stmtCheck = $pdo->prepare("SELECT password_hash FROM users WHERE id = ? LIMIT 1");
                $stmtCheck->execute([$user['id']]);
                $userRec = $stmtCheck->fetch();
                if ($userRec && !empty($userRec['password_hash'])) {
                    if (!password_verify($currentPassword, $userRec['password_hash'])) {
                        Response::error("The current password provided is incorrect.", 400);
                    }
                }
            }
            $fields[] = "password_hash = ?";
            $bindings[] = password_hash($newPassword, PASSWORD_BCRYPT);
            $fields[] = "last_password_change_at = NOW()";
        }

        if (!empty($fields)) {
            $bindings[] = $user['id'];
            $sql = "UPDATE users SET " . implode(", ", $fields) . ", updated_at = NOW() WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($bindings);
        }

        $this->getProfile($params, $request);
    }

    public function getAddresses(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user) {
            Response::unauthorized();
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT 
                id, full_name AS fullName, phone, address_line1 AS addressLine1,
                address_line2 AS addressLine2, landmark, city, state, pincode,
                type, is_default AS isDefault
            FROM user_addresses
            WHERE user_id = ?
            ORDER BY is_default DESC, created_at DESC
        ");
        $stmt->execute([$user['id']]);
        $addresses = $stmt->fetchAll();

        foreach ($addresses as &$addr) {
            $addr['isDefault'] = (bool)$addr['isDefault'];
        }

        Response::success($addresses);
    }

    public function addAddress(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user) {
            Response::unauthorized();
        }

        $body = $request['body'] ?? [];
        $missing = Validator::requireFields($body, ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode']);
        if (!empty($missing)) {
            Response::validationError('Missing required address fields', ['missing' => $missing]);
        }

        $pdo = Database::getConnection();
        $isDefault = !empty($body['isDefault']) ? 1 : 0;

        // If default, unset previous defaults
        if ($isDefault) {
            $uStmt = $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?");
            $uStmt->execute([$user['id']]);
        }

        $addressId = 'ADDR-' . strtoupper(substr(uniqid(), -6));
        $stmt = $pdo->prepare("
            INSERT INTO user_addresses (
                id, user_id, full_name, phone, address_line1, address_line2,
                landmark, city, state, pincode, type, is_default, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $addressId,
            $user['id'],
            Validator::sanitizeString($body['fullName']),
            Validator::sanitizeString($body['phone']),
            Validator::sanitizeString($body['addressLine1']),
            Validator::sanitizeString($body['addressLine2'] ?? null),
            Validator::sanitizeString($body['landmark'] ?? null),
            Validator::sanitizeString($body['city']),
            Validator::sanitizeString($body['state']),
            Validator::sanitizeString($body['pincode']),
            $body['type'] ?? 'Home',
            $isDefault,
        ]);

        $this->getAddresses($params, $request);
    }

    public function updateAddress(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user) {
            Response::unauthorized();
        }

        $addressId = $params['id'] ?? '';
        $body = $request['body'] ?? [];

        $pdo = Database::getConnection();
        $isDefault = !empty($body['isDefault']) ? 1 : 0;

        if ($isDefault) {
            $uStmt = $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?");
            $uStmt->execute([$user['id']]);
        }

        $stmt = $pdo->prepare("
            UPDATE user_addresses SET
                full_name = COALESCE(?, full_name),
                phone = COALESCE(?, phone),
                address_line1 = COALESCE(?, address_line1),
                address_line2 = COALESCE(?, address_line2),
                landmark = COALESCE(?, landmark),
                city = COALESCE(?, city),
                state = COALESCE(?, state),
                pincode = COALESCE(?, pincode),
                type = COALESCE(?, type),
                is_default = ?,
                updated_at = NOW()
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([
            $body['fullName'] ?? null,
            $body['phone'] ?? null,
            $body['addressLine1'] ?? null,
            $body['addressLine2'] ?? null,
            $body['landmark'] ?? null,
            $body['city'] ?? null,
            $body['state'] ?? null,
            $body['pincode'] ?? null,
            $body['type'] ?? null,
            $isDefault,
            $addressId,
            $user['id'],
        ]);

        $this->getAddresses($params, $request);
    }

    public function deleteAddress(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user) {
            Response::unauthorized();
        }

        $addressId = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("DELETE FROM user_addresses WHERE id = ? AND user_id = ?");
        $stmt->execute([$addressId, $user['id']]);

        $this->getAddresses($params, $request);
    }

    public function setDefaultAddress(array $params, array $request): void
    {
        $user = $request['user'] ?? null;
        if (!$user) {
            Response::unauthorized();
        }

        $addressId = $params['id'] ?? '';
        $pdo = Database::getConnection();

        $uStmt = $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?");
        $uStmt->execute([$user['id']]);

        $stmt = $pdo->prepare("UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?");
        $stmt->execute([$addressId, $user['id']]);

        $this->getAddresses($params, $request);
    }
}
