-- ============================================================================
-- HOPO SHOP E-COMMERCE DATABASE SCHEMA (MySQL 8.0+ / 9.0+)
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Compatible with: MilesWeb Shared Hosting, cPanel, phpMyAdmin
-- ============================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    tier ENUM('Silver', 'Gold', 'Diamond') NOT NULL DEFAULT 'Silver',
    points INT UNSIGNED NOT NULL DEFAULT 0,
    avatar_url VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USER ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS user_addresses (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255) DEFAULT NULL,
    landmark VARCHAR(120) DEFAULT NULL,
    city VARCHAR(80) NOT NULL,
    state VARCHAR(80) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    type ENUM('Home', 'Work', 'Other') NOT NULL DEFAULT 'Home',
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_addresses_user (user_id),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(80) NOT NULL,
    parent_id INT DEFAULT NULL,
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255) DEFAULT NULL,
    eyebrow VARCHAR(100) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    subcategories JSON DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_name (name),
    UNIQUE KEY uq_categories_slug (slug),
    KEY idx_categories_parent (parent_id),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) NOT NULL,
    brand VARCHAR(80) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category_id INT DEFAULT NULL,
    subcategory VARCHAR(100) DEFAULT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    rating DECIMAL(2,1) NOT NULL DEFAULT 5.0,
    reviews_count INT UNSIGNED NOT NULL DEFAULT 0,
    tag VARCHAR(50) DEFAULT NULL,
    fabric VARCHAR(80) DEFAULT NULL,
    occasion VARCHAR(80) DEFAULT NULL,
    neckline VARCHAR(80) DEFAULT NULL,
    sleeve VARCHAR(80) DEFAULT NULL,
    work_type VARCHAR(150) DEFAULT NULL,
    padding VARCHAR(80) DEFAULT NULL,
    closure VARCHAR(80) DEFAULT NULL,
    margin VARCHAR(80) DEFAULT NULL,
    primary_image VARCHAR(255) NOT NULL,
    is_archived TINYINT(1) NOT NULL DEFAULT 0,
    status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_products_category (category_id),
    KEY idx_products_brand (brand),
    KEY idx_products_status (status, is_archived),
    KEY idx_products_price (base_price),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_images_product (product_id),
    CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PRODUCT VARIANTS (COLORWAYS) TABLE
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(60) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    color_name VARCHAR(60) NOT NULL,
    color_hex VARCHAR(20) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    price_override DECIMAL(10,2) DEFAULT NULL,
    mrp_override DECIMAL(10,2) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_variants_product (product_id),
    CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. VARIANT SIZES (INVENTORY) TABLE
CREATE TABLE IF NOT EXISTS variant_sizes (
    id INT AUTO_INCREMENT NOT NULL,
    variant_id VARCHAR(60) NOT NULL,
    size VARCHAR(10) NOT NULL,
    stock INT UNSIGNED NOT NULL DEFAULT 10,
    PRIMARY KEY (id),
    UNIQUE KEY uq_variant_size (variant_id, size),
    KEY idx_variant_sizes_variant (variant_id),
    CONSTRAINT fk_sizes_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. PRODUCT PRICE OVERRIDES TABLE (Admin Real-Time Storefront Pricing)
CREATE TABLE IF NOT EXISTS product_price_overrides (
    product_id VARCHAR(36) NOT NULL,
    override_price DECIMAL(10,2) NOT NULL,
    override_mrp DECIMAL(10,2) NOT NULL,
    updated_by VARCHAR(36) DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id),
    CONSTRAINT fk_overrides_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. CARTS TABLE
CREATE TABLE IF NOT EXISTS carts (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) DEFAULT NULL,
    session_id VARCHAR(64) DEFAULT NULL,
    applied_coupon VARCHAR(30) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_carts_user (user_id),
    KEY idx_carts_session (session_id),
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT NOT NULL,
    cart_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    variant_id VARCHAR(60) DEFAULT NULL,
    size VARCHAR(10) NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_cart_item (cart_id, product_id, variant_id, size),
    KEY idx_cart_items_cart (cart_id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS wishlists (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_wishlists_user (user_id),
    CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. WISHLIST ITEMS TABLE
CREATE TABLE IF NOT EXISTS wishlist_items (
    id INT AUTO_INCREMENT NOT NULL,
    wishlist_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_wishlist_product (wishlist_id, product_id),
    KEY idx_wishlist_items_list (wishlist_id),
    CONSTRAINT fk_wishlist_items_list FOREIGN KEY (wishlist_id) REFERENCES wishlists (id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT NOT NULL,
    code VARCHAR(30) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    discount_type ENUM('PERCENTAGE', 'FLAT') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_discount_cap DECIMAL(10,2) DEFAULT NULL,
    category_restriction VARCHAR(80) DEFAULT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    valid_from DATETIME NOT NULL,
    expiry_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_coupons_code (code),
    KEY idx_coupons_active (enabled, expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    mrp_total DECIMAL(10,2) NOT NULL,
    coupon_code VARCHAR(30) DEFAULT NULL,
    coupon_discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    gst_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('UPI', 'CARD', 'NET_BANKING', 'COD') NOT NULL,
    payment_status ENUM('PENDING', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    order_status ENUM('CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED') NOT NULL DEFAULT 'CONFIRMED',
    tracking_number VARCHAR(60) DEFAULT NULL,
    courier_partner VARCHAR(80) NOT NULL DEFAULT 'BlueDart Express Luxe',
    estimated_delivery DATE NOT NULL,
    shipping_address JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_orders_user (user_id),
    KEY idx_orders_status (order_status),
    KEY idx_orders_created (created_at),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14b. COUPON USAGE TABLE
CREATE TABLE IF NOT EXISTS coupon_usage (
    id INT AUTO_INCREMENT NOT NULL,
    coupon_id INT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) DEFAULT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_coupon_usage_user (user_id),
    KEY idx_coupon_usage_coupon (coupon_id),
    CONSTRAINT fk_usage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE CASCADE,
    CONSTRAINT fk_usage_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    product_title VARCHAR(255) NOT NULL,
    brand VARCHAR(80) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    size VARCHAR(10) NOT NULL,
    color VARCHAR(60) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_order_items_order (order_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. ORDER TIMELINE EVENTS TABLE
CREATE TABLE IF NOT EXISTS order_timeline (
    id INT AUTO_INCREMENT NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    status VARCHAR(40) NOT NULL,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(255) NOT NULL,
    completed TINYINT(1) NOT NULL DEFAULT 0,
    event_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_timeline_order (order_id),
    CONSTRAINT fk_timeline_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    transaction_id VARCHAR(80) DEFAULT NULL,
    payment_method ENUM('UPI', 'CARD', 'NET_BANKING', 'COD') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    gateway_response JSON DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_payments_order (order_id),
    KEY idx_payments_tx (transaction_id),
    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. SHIPMENTS TABLE
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    tracking_number VARCHAR(60) NOT NULL,
    courier VARCHAR(80) NOT NULL DEFAULT 'BlueDart Express Luxe',
    status ENUM('MANIFESTED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED') NOT NULL DEFAULT 'MANIFESTED',
    estimated_delivery DATE NOT NULL,
    shipped_at DATETIME DEFAULT NULL,
    delivered_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_shipments_order (order_id),
    KEY idx_shipments_tracking (tracking_number),
    CONSTRAINT fk_shipments_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) DEFAULT NULL,
    author_name VARCHAR(100) NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT NOT NULL,
    verified_purchase TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_reviews_product (product_id),
    KEY idx_reviews_rating (rating),
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. NOTIFICATIONS TABLE (CUSTOMER & ADMIN DYNAMIC CMS)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) DEFAULT NULL,
    recipient_role ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    event_key VARCHAR(120) DEFAULT NULL,
    category VARCHAR(40) NOT NULL DEFAULT 'ORDERS',
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    action_url VARCHAR(255) DEFAULT NULL,
    entity_type VARCHAR(40) DEFAULT NULL,
    entity_id VARCHAR(60) DEFAULT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    is_cleared TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_notifications_event_key (event_key),
    KEY idx_notif_recipient (user_id, recipient_role, is_cleared, created_at),
    KEY idx_notif_unread (user_id, recipient_role, is_read, is_cleared),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. INVENTORY TRANSACTIONS AUDIT TABLE
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT AUTO_INCREMENT NOT NULL,
    variant_size_id INT NOT NULL,
    type ENUM('INITIAL_STOCK', 'ORDER_DEDUCTION', 'ORDER_CANCELLATION', 'RESTOCK', 'MANUAL_ADJUSTMENT') NOT NULL,
    quantity_delta INT NOT NULL,
    previous_stock INT UNSIGNED NOT NULL,
    new_stock INT UNSIGNED NOT NULL,
    reference_type VARCHAR(40) DEFAULT NULL,
    reference_id VARCHAR(60) DEFAULT NULL,
    notes VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_inventory_tx_size (variant_size_id),
    CONSTRAINT fk_inventory_tx_size FOREIGN KEY (variant_size_id) REFERENCES variant_sizes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT NOT NULL,
    user_id VARCHAR(36) DEFAULT NULL,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(60) NOT NULL,
    entity_id VARCHAR(60) DEFAULT NULL,
    old_values JSON DEFAULT NULL,
    new_values JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_user (user_id),
    KEY idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. EDITORIAL BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT NOT NULL,
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255) DEFAULT NULL,
    slot VARCHAR(60) NOT NULL DEFAULT 'home_hero_1',
    placement VARCHAR(60) NOT NULL DEFAULT 'Home',
    image_url VARCHAR(255) NOT NULL,
    link_url VARCHAR(255) DEFAULT NULL,
    cta_text VARCHAR(80) DEFAULT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    schedule_text VARCHAR(100) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_banners_slot (slot, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. SPECIAL OFFERS TABLE
CREATE TABLE IF NOT EXISTS special_offers (
    id VARCHAR(36) NOT NULL,
    code VARCHAR(40) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT DEFAULT NULL,
    discount_type ENUM('PERCENTAGE', 'FLAT') NOT NULL DEFAULT 'PERCENTAGE',
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_discount DECIMAL(10,2) DEFAULT NULL,
    applicable_category VARCHAR(80) DEFAULT 'All',
    status ENUM('ACTIVE', 'PAUSED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_special_offers_code (code),
    KEY idx_offers_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. CONVERSION ANALYTICS EVENTS TABLE
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGINT AUTO_INCREMENT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    session_id VARCHAR(64) DEFAULT NULL,
    user_id VARCHAR(36) DEFAULT NULL,
    entity_type VARCHAR(40) DEFAULT NULL,
    entity_id VARCHAR(60) DEFAULT NULL,
    referrer VARCHAR(255) DEFAULT NULL,
    channel VARCHAR(60) DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_analytics_event (event_type, created_at),
    KEY idx_analytics_channel (channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
