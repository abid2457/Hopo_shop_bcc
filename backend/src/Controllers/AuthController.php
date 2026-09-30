<?php
declare(strict_types=1);

namespace HopoShop\Controllers;

use HopoShop\Config\Database;
use HopoShop\Middleware\RateLimiter;
use HopoShop\Utils\JWT;
use HopoShop\Utils\Response;
use HopoShop\Utils\Validator;

require_once dirname(__DIR__, 2) . '/config/database.php';
require_once dirname(__DIR__) . '/Middleware/RateLimiter.php';
require_once dirname(__DIR__) . '/Utils/JWT.php';
require_once dirname(__DIR__) . '/Utils/Response.php';
require_once dirname(__DIR__) . '/Utils/Validator.php';

class AuthController
{
    public function register(array $params, array $request): void
    {
        RateLimiter::check('register', 10, 600);
        $body = $request['body'] ?? [];

        $missing = Validator::requireFields($body, ['name', 'email', 'password']);
        if (!empty($missing)) {
            Response::validationError('Missing required fields', ['missing' => $missing]);
        }

        $name = Validator::sanitizeString($body['name']);
        $email = strtolower(trim($body['email']));
        $phone = Validator::sanitizeString($body['phone'] ?? '');
        $password = (string)$body['password'];

        if (!Validator::isValidEmail($email)) {
            Response::validationError('Please enter a valid email address.');
        }

        if (strlen($password) < 6) {
            Response::validationError('Password must be at least 6 characters long.');
        }

        $pdo = Database::getConnection();

        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            Response::error('An account with this email address already exists. Please sign in.', 409);
        }

        $userId = 'USR-' . strtoupper(substr(uniqid(), -8));
        $hash = password_hash($password, PASSWORD_BCRYPT);

        $insertStmt = $pdo->prepare("
            INSERT INTO users (id, name, email, phone, password_hash, role, tier, points, created_at)
            VALUES (?, ?, ?, ?, ?, 'CUSTOMER', 'Silver', 100, NOW())
        ");
        $insertStmt->execute([$userId, $name, $email, $phone, $hash]);

        // Generate token
        $tokenPayload = [
            'id'    => $userId,
            'name'  => $name,
            'email' => $email,
            'role'  => 'CUSTOMER',
            'tier'  => 'Silver',
        ];
        $token = JWT::generate($tokenPayload);

        Response::success([
            'token' => $token,
            'user'  => [
                'id'         => $userId,
                'name'       => $name,
                'email'      => $email,
                'phone'      => $phone,
                'role'       => 'CUSTOMER',
                'tier'       => 'Silver',
                'points'     => 100,
                'joinedDate' => date('F Y'),
            ],
        ], 'Account created successfully!', 201);
    }

    public function login(array $params, array $request): void
    {
        RateLimiter::check('login', 8, 300);
        $body = $request['body'] ?? [];

        $missing = Validator::requireFields($body, ['email', 'password']);
        if (!empty($missing)) {
            Response::validationError('Email and password are required', ['missing' => $missing]);
        }

        $email = strtolower(trim($body['email']));
        $password = (string)$body['password'];

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, name, email, phone, password_hash, role, tier, points, avatar_url, created_at FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            Response::error('Invalid email or password. Please check your credentials.', 401);
        }

        $tokenPayload = [
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role'],
            'tier'  => $user['tier'],
        ];
        $token = JWT::generate($tokenPayload);

        // Record last login timestamp
        $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = ?")->execute([$user['id']]);

        Response::success([
            'token' => $token,
            'user'  => [
                'id'                   => $user['id'],
                'adminId'              => $user['id'],
                'name'                 => $user['name'],
                'displayName'          => $user['display_name'] ?? $user['name'],
                'email'                => $user['email'],
                'phone'                => $user['phone'] ?? '',
                'alternatePhone'       => $user['alternate_phone'] ?? '',
                'role'                 => $user['role'] === 'ADMIN' ? 'Super Administrator' : $user['role'],
                'systemRole'           => $user['role'],
                'jobTitle'             => $user['job_title'] ?? ($user['role'] === 'ADMIN' ? 'Super Administrator' : 'Customer'),
                'department'           => $user['department'] ?? 'Administration',
                'tier'                 => $user['tier'],
                'points'               => (int)$user['points'],
                'avatar'               => $user['avatar_url'],
                'accountStatus'        => 'Active',
                'accessLevel'          => $user['role'] === 'ADMIN' ? 'Full Access' : 'Standard',
                'createdAt'            => $user['created_at'],
                'lastLoginAt'          => date('c'),
                'lastPasswordChangeAt' => $user['last_password_change_at'] ?? null,
                'joinedDate'           => date('d F Y', strtotime($user['created_at'])),
            ],
        ], 'Signed in successfully!');
    }

    public function me(array $params, array $request): void
    {
        $userPayload = $request['user'] ?? null;
        if (!$userPayload || !isset($userPayload['id'])) {
            Response::unauthorized();
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, name, email, phone, role, tier, points, avatar_url, created_at, updated_at FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userPayload['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::notFound('User not found');
        }

        Response::success([
            'id'                   => $user['id'],
            'adminId'              => $user['id'],
            'name'                 => $user['name'],
            'displayName'          => $user['name'],
            'email'                => $user['email'],
            'phone'                => $user['phone'] ?? '',
            'alternatePhone'       => '',
            'role'                 => $user['role'] === 'ADMIN' ? 'Super Administrator' : $user['role'],
            'systemRole'           => $user['role'],
            'jobTitle'             => $user['role'] === 'ADMIN' ? 'Super Administrator' : 'Customer',
            'department'           => 'Administration',
            'tier'                 => $user['tier'] ?? 'Silver',
            'points'               => (int)($user['points'] ?? 0),
            'avatar'               => $user['avatar_url'] ?? null,
            'accountStatus'        => 'Active',
            'accessLevel'          => $user['role'] === 'ADMIN' ? 'Full Access' : 'Standard',
            'createdAt'            => $user['created_at'],
            'updatedAt'            => $user['updated_at'] ?? $user['created_at'],
            'lastLoginAt'          => date('c'),
            'lastPasswordChangeAt' => null,
            'joinedDate'           => date('d F Y', strtotime($user['created_at'])),
        ]);
    }

    public function logout(array $params, array $request): void
    {
        Response::success(null, 'Logged out successfully');
    }
}
