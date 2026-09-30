<?php
declare(strict_types=1);

if (php_sapi_name() === 'cli-server') {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
        return false;
    }
}

// HOPO SHOP LUXURY ATELIER — Central Front Controller & REST API Router
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/cors.php';
require_once dirname(__DIR__) . '/database/DatabaseMigrator.php';
require_once dirname(__DIR__) . '/src/Router.php';
require_once dirname(__DIR__) . '/src/Utils/Response.php';
require_once dirname(__DIR__) . '/src/Middleware/AuthMiddleware.php';
require_once dirname(__DIR__) . '/src/Middleware/AdminMiddleware.php';
require_once dirname(__DIR__) . '/src/Controllers/AuthController.php';
require_once dirname(__DIR__) . '/src/Controllers/CategoryController.php';
require_once dirname(__DIR__) . '/src/Controllers/ProductController.php';
require_once dirname(__DIR__) . '/src/Controllers/CartController.php';
require_once dirname(__DIR__) . '/src/Controllers/WishlistController.php';
require_once dirname(__DIR__) . '/src/Controllers/OrderController.php';
require_once dirname(__DIR__) . '/src/Controllers/CouponController.php';
require_once dirname(__DIR__) . '/src/Controllers/BannerController.php';
require_once dirname(__DIR__) . '/src/Controllers/AnalyticsController.php';
require_once dirname(__DIR__) . '/src/Controllers/UserController.php';
require_once dirname(__DIR__) . '/src/Controllers/AdminController.php';
require_once dirname(__DIR__) . '/src/Controllers/NotificationController.php';
require_once dirname(__DIR__) . '/src/Services/NotificationService.php';

use HopoShop\Config\Config;
use HopoShop\Config\Cors;
use HopoShop\Database\DatabaseMigrator;
use HopoShop\Middleware\AdminMiddleware;
use HopoShop\Middleware\AuthMiddleware;
use HopoShop\Router;
use HopoShop\Utils\Response;
use HopoShop\Controllers\AdminController;
use HopoShop\Controllers\NotificationController;
use HopoShop\Services\NotificationService;
use HopoShop\Controllers\AnalyticsController;
use HopoShop\Controllers\AuthController;
use HopoShop\Controllers\BannerController;
use HopoShop\Controllers\CartController;
use HopoShop\Controllers\CategoryController;
use HopoShop\Controllers\CouponController;
use HopoShop\Controllers\OrderController;
use HopoShop\Controllers\ProductController;
use HopoShop\Controllers\UserController;
use HopoShop\Controllers\WishlistController;

// Handle CORS Pre-flight and headers
Cors::handle();

// Migrations are managed via cPanel phpMyAdmin (schema_production.sql) or CLI
if (Config::get('AUTO_MIGRATE', false) === 'true') {
    try {
        DatabaseMigrator::ensureDatabase();
    } catch (\Throwable $e) {
        error_log("Database initialization check warning: " . $e->getMessage());
    }
}

$router = new Router();

// --- Health Check & Info ---
$router->get('/api/health', function () {
    Response::success([
        'status'    => 'healthy',
        'service'   => 'HOPO SHOP Atelier API',
        'timestamp' => date('c'),
        'database'  => 'connected',
    ]);
});

$router->get('/', function () {
    Response::success([
        'service' => 'HOPO SHOP REST API (PHP 8.5 + MySQL 9.7)',
        'status'  => 'online',
        'version' => '1.0.0',
    ]);
});

// --- Auth Endpoints ---
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->get('/api/auth/me', [AuthController::class, 'me'], [[AuthMiddleware::class, 'handle']]);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);

// --- Categories (Public) ---
$router->get('/api/categories', [CategoryController::class, 'index']);

// --- Products (Public) ---
$router->get('/api/products', [ProductController::class, 'index']);
$router->get('/api/products/{id}', [ProductController::class, 'show']);

// --- Editorial Banners (Public) ---
$router->get('/api/banners', [BannerController::class, 'index']);

// --- Analytics Tracking (Public) ---
$router->post('/api/analytics/track', [AnalyticsController::class, 'track']);

// --- Cart Endpoints ---
$router->get('/api/cart', [CartController::class, 'get'], [[AuthMiddleware::class, 'optional']]);
$router->post('/api/cart/items', [CartController::class, 'addItem'], [[AuthMiddleware::class, 'optional']]);
$router->put('/api/cart/items/{id}', [CartController::class, 'updateItem'], [[AuthMiddleware::class, 'optional']]);
$router->delete('/api/cart/items/{id}', [CartController::class, 'removeItem'], [[AuthMiddleware::class, 'optional']]);
$router->delete('/api/cart', [CartController::class, 'clear'], [[AuthMiddleware::class, 'optional']]);
$router->post('/api/cart/coupon', [CartController::class, 'applyCoupon'], [[AuthMiddleware::class, 'optional']]);
$router->delete('/api/cart/coupon', [CartController::class, 'removeCoupon'], [[AuthMiddleware::class, 'optional']]);

// --- Wishlist Endpoints ---
$router->get('/api/wishlist', [WishlistController::class, 'index'], [[AuthMiddleware::class, 'handle']]);
$router->post('/api/wishlist/toggle', [WishlistController::class, 'toggle'], [[AuthMiddleware::class, 'handle']]);
$router->delete('/api/wishlist/{id}', [WishlistController::class, 'remove'], [[AuthMiddleware::class, 'handle']]);

// --- Orders & Checkout ---
$router->post('/api/orders/checkout', [OrderController::class, 'checkout'], [[AuthMiddleware::class, 'optional']]);
$router->get('/api/orders', [OrderController::class, 'index'], [[AuthMiddleware::class, 'handle']]);
$router->get('/api/orders/{id}', [OrderController::class, 'show'], [[AuthMiddleware::class, 'optional']]);
$router->post('/api/orders/{id}/cancel', [OrderController::class, 'cancel'], [[AuthMiddleware::class, 'handle']]);
$router->post('/api/orders/{id}/return', [OrderController::class, 'returnOrder'], [[AuthMiddleware::class, 'handle']]);

// --- Coupons ---
$router->get('/api/coupons', [CouponController::class, 'index']);
$router->post('/api/coupons/validate', [CouponController::class, 'validate'], [[AuthMiddleware::class, 'optional']]);


// --- Customer Notifications ---
$router->get('/api/notifications', [NotificationController::class, 'index'], [[AuthMiddleware::class, 'handle']]);
$router->get('/api/notifications/unread-count', [NotificationController::class, 'unreadCount'], [[AuthMiddleware::class, 'optional']]);
$router->put('/api/notifications/read-all', [NotificationController::class, 'markAllRead'], [[AuthMiddleware::class, 'handle']]);
$router->put('/api/notifications/{id}/read', [NotificationController::class, 'markRead'], [[AuthMiddleware::class, 'handle']]);
$router->delete('/api/notifications/clear-all', [NotificationController::class, 'clearAll'], [[AuthMiddleware::class, 'handle']]);
$router->delete('/api/notifications/{id}', [NotificationController::class, 'delete'], [[AuthMiddleware::class, 'handle']]);

// --- User Profile & Addresses ---
$router->get('/api/user/profile', [UserController::class, 'getProfile'], [[AuthMiddleware::class, 'handle']]);
$router->put('/api/user/profile', [UserController::class, 'updateProfile'], [[AuthMiddleware::class, 'handle']]);
$router->get('/api/user/addresses', [UserController::class, 'getAddresses'], [[AuthMiddleware::class, 'handle']]);
$router->post('/api/user/addresses', [UserController::class, 'addAddress'], [[AuthMiddleware::class, 'handle']]);
$router->put('/api/user/addresses/{id}', [UserController::class, 'updateAddress'], [[AuthMiddleware::class, 'handle']]);
$router->delete('/api/user/addresses/{id}', [UserController::class, 'deleteAddress'], [[AuthMiddleware::class, 'handle']]);
$router->put('/api/user/addresses/{id}/default', [UserController::class, 'setDefaultAddress'], [[AuthMiddleware::class, 'handle']]);

// =========================================================================
// --- Admin Endpoints (Restricted to ADMIN role via AdminMiddleware) ---
// =========================================================================

// File Uploads
$router->post('/api/admin/upload', [AdminController::class, 'upload'], [[AdminMiddleware::class, 'handle']]);
$router->post('/api/admin/upload/delete', [AdminController::class, 'deleteUpload'], [[AdminMiddleware::class, 'handle']]);

// 1. Executive Overview
$router->get('/api/admin/overview', [AdminController::class, 'overview'], [[AdminMiddleware::class, 'handle']]);

// 2. Couture Products
$router->get('/api/admin/products', [AdminController::class, 'products'], [[AdminMiddleware::class, 'handle']]);
$router->post('/api/admin/products', [AdminController::class, 'createProduct'], [[AdminMiddleware::class, 'handle']]);
$router->put('/api/admin/products/{id}', [AdminController::class, 'updateProduct'], [[AdminMiddleware::class, 'handle']]);
$router->delete('/api/admin/products/{id}', [AdminController::class, 'deleteProduct'], [[AdminMiddleware::class, 'handle']]);
$router->post('/api/admin/products/{id}/price-override', [AdminController::class, 'setPriceOverride'], [[AdminMiddleware::class, 'handle']]);
$router->delete('/api/admin/products/{id}/price-override', [AdminController::class, 'clearPriceOverride'], [[AdminMiddleware::class, 'handle']]);

// 3. Heirloom Categories
$router->get('/api/admin/categories', [AdminController::class, 'categories'], [[AdminMiddleware::class, 'handle']]);
$router->post('/api/admin/categories', [AdminController::class, 'createCategory'], [[AdminMiddleware::class, 'handle']]);
$router->put('/api/admin/categories/{id}', [AdminController::class, 'updateCategory'], [[AdminMiddleware::class, 'handle']]);
$router->delete('/api/admin/categories/{id}', [AdminController::class, 'deleteCategory'], [[AdminMiddleware::class, 'handle']]);

// 4. Silk Stock & Inventory
$router->get('/api/admin/inventory', [AdminController::class, 'inventory'], [[AdminMiddleware::class, 'handle']]);
$router->put('/api/admin/inventory/{id}', [AdminController::class, 'updateInventory'], [[AdminMiddleware::class, 'handle']]);

// 5. Orders
$router->get('/api/admin/orders', [AdminController::class, 'orders'], [[AdminMiddleware::class, 'handle']]);
$router->get('/api/admin/orders/{id}', [AdminController::class, 'orderDetails'], [[AdminMiddleware::class, 'handle']]);
$router->put('/api/admin/orders/{id}/status', [AdminController::class, 'updateOrderStatus'], [[AdminMiddleware::class, 'handle']]);
$router->post('/api/admin/orders/{id}/timeline', [AdminController::class, 'addOrderTimeline'], [[AdminMiddleware::class, 'handle']]);

// 6. Customers
$router->get('/api/admin/customers', [AdminController::class, 'customers'], [[AdminMiddleware::class, 'handle']]);
$router->put('/api/admin/customers/{id}/tier', [AdminController::class, 'updateCustomerTier'], [[AdminMiddleware::class, 'handle']]);

// 7. Special Offers
$router->get('/api/admin/offers', [AdminController::class, 'offers'], [[AdminMiddleware::class, 'handle']]);
$router->post('/api/admin/offers', [AdminController::class, 'createOffer'], [[AdminMiddleware::class, 'handle']]);
$router->put('/api/admin/offers/{id}', [AdminController::class, 'updateOffer'], [[AdminMiddleware::class, 'handle']]);
$router->delete('/api/admin/offers/{id}', [AdminController::class, 'deleteOffer'], [[AdminMiddleware::class, 'handle']]);

// 8. Festive Coupons
$router->get('/api/admin/coupons', [AdminController::class, 'coupons'], [[AdminMiddleware::class, 'handle']]);
$router->post('/api/admin/coupons', [AdminController::class, 'createCoupon'], [[AdminMiddleware::class, 'handle']]);
$router->put('/api/admin/coupons/{id}', [AdminController::class, 'updateCoupon'], [[AdminMiddleware::class, 'handle']]);
$router->delete('/api/admin/coupons/{id}', [AdminController::class, 'deleteCoupon'], [[AdminMiddleware::class, 'handle']]);

// 9. Editorial Banners
$router->get('/api/admin/banners', [AdminController::class, 'banners'], [[AdminMiddleware::class, 'handle']]);
$router->post('/api/admin/banners', [AdminController::class, 'createBanner'], [[AdminMiddleware::class, 'handle']]);
$router->put('/api/admin/banners/{id}', [AdminController::class, 'updateBanner'], [[AdminMiddleware::class, 'handle']]);
$router->delete('/api/admin/banners/{id}', [AdminController::class, 'deleteBanner'], [[AdminMiddleware::class, 'handle']]);

// 10. Conversion Analytics
$router->get('/api/admin/analytics', [AdminController::class, 'analytics'], [[AdminMiddleware::class, 'handle']]);

// 11. Financial Reports
$router->get('/api/admin/reports', [AdminController::class, 'reports'], [[AdminMiddleware::class, 'handle']]);


// 12. Operational Notifications
$router->get('/api/admin/notifications', [AdminController::class, 'adminNotifications'], [[AdminMiddleware::class, 'handle']]);
$router->get('/api/admin/notifications/unread-count', [AdminController::class, 'adminUnreadCount'], [[AdminMiddleware::class, 'handle']]);
$router->put('/api/admin/notifications/read-all', [AdminController::class, 'adminMarkAllRead'], [[AdminMiddleware::class, 'handle']]);
$router->put('/api/admin/notifications/{id}/read', [AdminController::class, 'adminMarkRead'], [[AdminMiddleware::class, 'handle']]);
$router->delete('/api/admin/notifications/clear-all', [AdminController::class, 'adminClearAll'], [[AdminMiddleware::class, 'handle']]);

// Dispatch incoming request
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';

$router->dispatch($method, $uri);
