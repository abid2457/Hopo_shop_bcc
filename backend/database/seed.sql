-- ============================================================================
-- HOPO SHOP SEED DATA
-- Fully authentic product catalog, variants, inventory, coupons, and accounts.
-- ============================================================================

USE hopo_shop;

-- Disable foreign key checks for clean seed
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE analytics_events;
TRUNCATE TABLE special_offers;
TRUNCATE TABLE banners;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE inventory_transactions;
TRUNCATE TABLE notifications;
TRUNCATE TABLE reviews;
TRUNCATE TABLE shipments;
TRUNCATE TABLE payments;
TRUNCATE TABLE order_timeline;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE coupon_usage;
TRUNCATE TABLE coupons;
TRUNCATE TABLE wishlist_items;
TRUNCATE TABLE wishlists;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE product_price_overrides;
TRUNCATE TABLE variant_sizes;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE product_images;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE user_addresses;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS
-- Admin: admin@hoposhop.in / hopo-admin-2026 ($2y$10$y5PZ7k9oV8m5a5mYJvA.SeM7WbW9hU71WJ2x9K6V3M7xWvUqQ02C.)
-- Customer: customer@hoposhop.in / customer123 ($2y$10$y6m4B6zN7F9s9rTqY.V6reM7WbW9hU71WJ2x9K6V3M7xWvUqQ02C.)
INSERT INTO users (id, name, email, phone, password_hash, role, tier, points, avatar_url, created_at) VALUES
('ADM-HOPO-0001', 'Master Store Administrator', 'admin@hoposhop.in', '+91 99999 00000', '$2y$12$YEQYZCVFWc6wsTs.EjfsEO4WB15CL6jDT6724J437pNisLlVf6Rj6', 'ADMIN', 'Diamond', 9999, '/images/brand_logo.png', NOW()),
('USR-HOPO-0001', 'Riya Sharma', 'customer@hoposhop.in', '+91 98765 43210', '$2y$12$zPT3vZpEEv81cp35BXxdHOJw2u6RIoj0j9MV/fL0LBZ6zP3MayiS.', 'CUSTOMER', 'Gold', 1250, NULL, NOW()),
('USR-HOPO-0002', 'Priya Patel', 'priya@example.com', '+91 91234 56789', '$2y$12$zPT3vZpEEv81cp35BXxdHOJw2u6RIoj0j9MV/fL0LBZ6zP3MayiS.', 'CUSTOMER', 'Silver', 450, NULL, NOW());

-- 2. USER ADDRESSES
INSERT INTO user_addresses (id, user_id, full_name, phone, address_line1, address_line2, landmark, city, state, pincode, type, is_default) VALUES
('ADDR-001', 'USR-HOPO-0001', 'Riya Sharma', '+91 98765 43210', 'Flat 402, Sea Green Apartments', 'Pali Hill Road, Bandra West', 'Near Candies Cafe', 'Mumbai', 'Maharashtra', '400050', 'Home', 1),
('ADDR-002', 'USR-HOPO-0001', 'Riya Sharma (Office)', '+91 98765 43210', 'Unit 12, Floor 4, One BKC', 'G Block, Bandra Kurla Complex', 'Opposite Bank of Baroda', 'Mumbai', 'Maharashtra', '400051', 'Work', 0);

-- 3. CATEGORIES
INSERT INTO categories (id, name, slug, parent_id, title, subtitle, eyebrow, description, image_url, display_order, status, subcategories) VALUES
(1, 'Bridal Blouses', 'bridal-blouses', NULL, 'Handcrafted Bridal Blouses', 'Pure raw silk, zardozi gold bullion, Banarasi brocades & velvet aari embellishments.', 'COUTURE BLOUSE ATELIER', 'Exquisite couture bridal blouses tailored to perfection with 2-inch alterations margin and built-in luxury cups.', '/images/bridal_blouse_crimson_peacock.png', 1, 'active', '["Zardozi Bridal Blouses", "Velvet Bridal Blouses", "Backless Designer Blouses", "Hand-Embroidered Blouses", "Brocade Blouses", "Zari Woven Blouses", "Temple Border Blouses", "Custom Fit Blouses"]'),
(2, 'Lehengas', 'lehengas', NULL, 'Royal Heritage Lehengas', 'Intricate zardozi and silk embroideries designed for contemporary Indian brides.', 'ROYAL WEDDING COLLECTION', 'Heirloom bridal and festive lehengas featuring traditional artistry and regal silhouettes.', '/images/lehenga_crimson_royal_bridal.png', 2, 'active', '["Bridal Lehengas", "Wedding Lehengas"]'),
(3, 'Salwar Suits', 'salwar-suits', NULL, 'Regal Salwar Suits & Anarkalis', 'Pure silk, delicate resham embroidery, and flowing georgette dupattas.', 'TIMELESS ETHNIC SUITS', 'Versatile and elegant salwar suit sets crafted from luxurious silk and breathable fabrics.', '/images/salwar_suit_beige_pink_printed.png', 3, 'active', '["Straight-Cut Suits", "Designer Salwar Suits"]'),
(4, 'Night Suits', 'night-suits', NULL, 'Luxury Night Suits & Loungewear', 'Handcrafted premium satin, modal silk, and lace-trim loungewear sets.', 'LOUNGEWEAR ATELIER', 'Indulge in night-time elegance with buttery soft satin and breathable luxury fabrics.', '/images/night_suit_1.jpg', 4, 'active', '["Luxury Silk Pajamas", "Cotton Lounge Sets", "Satin Nightwear Sets"]');

-- 4. COUPONS
INSERT INTO coupons (code, title, description, discount_type, discount_value, min_order_amount, max_discount_cap, category_restriction, enabled, valid_from, expiry_date) VALUES
('FESTIVE40', 'Festive Grand Sale', 'Flat ₹2,400 off on bridal & wedding orders above ₹4,999', 'FLAT', 2400.00, 4999.00, NULL, NULL, 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('HOPO10', 'Atelier Welcome Offer', '10% instant discount on your first order up to ₹1,500', 'PERCENTAGE', 10.00, 1999.00, 1500.00, NULL, 1, NOW(), DATE_ADD(NOW(), INTERVAL 180 DAY)),
('BRIDAL20', 'Bridal Suite Special', '20% off on all Bridal & Wedding Blouses above ₹6,000', 'PERCENTAGE', 20.00, 6000.00, 3000.00, 'Bridal Blouses', 1, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY));

-- 5. PRODUCTS
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p3', 'Sabyasachi', 'Crimson Peacock & Elephant Zardozi Bridal Blouse', 1, 'Zardozi Bridal Blouses', 6999, 11999, 4.9, 1420, 'BRIDAL COUTURE', 'Heritage Raw Silk', 'Wedding', 'Broad Sweetheart', 'Elbow Sleeve', 'Peacock & Elephant Bullion Zardozi with Pearl Fringe', 'Built-in Luxury Cups', 'Back Hook & Tie-up Latkans', '2 inches on both sides', '/images/bridal_blouse_crimson_peacock.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p3', '/images/bridal_blouse_crimson_peacock.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p3', '/images/bridal_blouse_emerald_back.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p3', '/images/bridal_blouse_maroon_velvet.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p5', 'Tarun Tahiliani', 'Crimson Zardozi Plunging V-Neck Bridal Blouse', 1, 'Brocade Blouses', 5499, 8999, 4.8, 980, 'BRIDAL', 'Silk Velvet & Raw Silk', 'Wedding', 'Plunging V-Neck', 'Short Sleeve with Bead Tassels', 'Intricate Antique Gold Zardozi & Hanging Red Bead Fringe', 'Built-in Luxury Cups', 'Concealed Side Zipper', '2 inches on both sides', '/images/wedding_blouse_crimson_deep_v.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p5', '/images/wedding_blouse_crimson_deep_v.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p5', '/images/wedding_blouse_crimson_floral.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p5', '/images/wedding_blouse_pink_lattice.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p8', 'Raw Mango', 'Royal Velvet Maroon Mango Zari Bridal Blouse', 1, 'Velvet Bridal Blouses', 5999, 9499, 4.9, 640, 'RECEPTION', 'Royal Micro Velvet', 'Reception', 'Sweetheart', 'Elbow Sleeve', 'Intricate Paisley Sleeve Motifs & Floral Zari Borders', 'Built-in Luxury Cups', 'Back Hook & Eye', '2 inches on both sides', '/images/bridal_blouse_maroon_velvet.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p8', '/images/bridal_blouse_maroon_velvet.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p8', '/images/bridal_blouse_crimson_peacock.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p8', '/images/bridal_blouse_purple_banarasi.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p9', 'Manish Malhotra', 'Ruby Rose Geometric Lattice Zardozi Bridal Blouse', 1, 'Hand-Embroidered Blouses', 4899, 7999, 4.8, 512, 'BRIDAL', 'Pure Silk', 'Wedding', 'Scalloped Sweetheart', 'Elbow Sleeve with Diamond Zardozi Lattice', 'Geometric Jali Gridwork, Pearl Accents & Zari Embroidery', 'Built-in Luxury Cups', 'Back Hook & Eye', '2 inches on both sides', '/images/wedding_blouse_pink_lattice.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p9', '/images/wedding_blouse_pink_lattice.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p9', '/images/wedding_blouse_crimson_deep_v.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p9', '/images/wedding_blouse_burgundy_sheer.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p10', 'Anita Dongre', 'Crimson Floral Resham Embroidered Bridal Blouse', 1, 'Zari Woven Blouses', 4299, 6999, 4.7, 430, 'BRIDAL', 'Raw Silk', 'Wedding', 'Sweetheart V-Neck', 'Elbow Sleeve', 'All-Over Floral Resham Threadwork & Delicate Gold Foil', 'Built-in Luxury Cups', 'Side Concealed Zipper', '2 inches on both sides', '/images/wedding_blouse_crimson_floral.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p10', '/images/wedding_blouse_crimson_floral.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p10', '/images/wedding_blouse_crimson_zardozi.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p10', '/images/wedding_blouse_pink_lattice.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p11', 'Ritu Kumar', 'Royal Crimson Heritage Zardozi Bridal Blouse', 1, 'Temple Border Blouses', 4799, 7499, 4.8, 380, 'HERITAGE BRIDAL', 'Heritage Raw Silk', 'Wedding', 'Deep V-Neck', 'Elbow Sleeve', 'Heritage Aari & Zardozi Boota with Contrast Embroidered Cuff', 'Built-in Luxury Cups', 'Back Hook & Eye', '2 inches on both sides', '/images/wedding_blouse_crimson_zardozi.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p11', '/images/wedding_blouse_crimson_zardozi.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p11', '/images/wedding_blouse_burgundy_sheer.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p11', '/images/wedding_blouse_crimson_deep_v.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p20', 'Torani', 'Torani Burgundy Sheer Sleeve Velvet Bridal Blouse', 1, 'Custom Fit Blouses', 5899, 9499, 4.9, 310, 'BRIDAL COUTURE', 'Royal Velvet & Sheer Organza', 'Wedding', 'Sweetheart Illusion', 'Full Sheer Embroidered Sleeve', 'Velvet Bustier with Sheer Organza Resham & Aari Sleeve Embroidery', 'Built-in Luxury Cups', 'Back Concealed Hook & Eye', '2 inches on both sides', '/images/wedding_blouse_burgundy_sheer.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p20', '/images/wedding_blouse_burgundy_sheer.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p20', '/images/wedding_blouse_crimson_zardozi.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p20', '/images/wedding_blouse_crimson_floral.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p12', 'Tarun Tahiliani', 'Emerald Velvet Inverted V-Back Bridal Blouse', 1, 'Backless Designer Blouses', 5799, 9299, 4.9, 410, 'DESIGNER STATEMENT', 'Royal Velvet', 'Reception', 'Deep Inverted V-Back', 'Elbow Sleeve', 'Floral Zardozi Lattice & Emerald Bead Latkans', 'Built-in Luxury Cups', 'Concealed Side Zipper & Back Dori', '2 inches on both sides', '/images/bridal_blouse_emerald_back.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p12', '/images/bridal_blouse_emerald_back.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p12', '/images/bridal_blouse_pastel_couture.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p12', '/images/bridal_blouse_maroon_velvet.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p18', 'Anita Dongre', 'Pastel Illusion Back Zardozi Bridal Couture Blouse', 1, 'Hand-Embroidered Blouses', 6499, 10499, 4.9, 320, 'COUTURE ILLUSION', 'Silk & Sheer Illusion Net', 'Wedding', 'Cutwork Illusion Back', 'Elbow Sleeve with Pearl Tassels', '3D Bullion Zardozi, Tree of Life & Pearl Cluster Tassels', 'Built-in Luxury Cups', 'Back Concealed Hook & Eye', '2 inches on both sides', '/images/bridal_blouse_pastel_couture.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p18', '/images/bridal_blouse_pastel_couture.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p18', '/images/bridal_blouse_emerald_back.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p18', '/images/bridal_blouse_purple_banarasi.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p19', 'Manish Malhotra', 'Royal Purple Banarasi Gemstone Tassel Bridal Blouse', 1, 'Custom Fit Blouses', 6799, 10999, 4.8, 290, 'ROYAL BANARASI', 'Banarasi Brocade Silk', 'Wedding', 'Temple U-Neck', 'Geometric Cutwork Sleeve with Amethyst Tassels', 'Fine Zari Bootis, Crystal Beading & Cascading Gemstone Chains', 'Built-in Luxury Cups', 'Back Hook & Tie-up Latkans', '2 inches on both sides', '/images/bridal_blouse_purple_banarasi.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p19', '/images/bridal_blouse_purple_banarasi.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p19', '/images/bridal_blouse_pastel_couture.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p19', '/images/bridal_blouse_crimson_peacock.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p2', 'Sabyasachi', 'Royal Crimson Zardozi Heritage Bridal Lehenga', 2, 'Bridal Lehengas', 29999, 45999, 4.9, 842, 'BRIDAL COUTURE', 'Heritage Raw Silk & Velvet', 'Wedding', NULL, NULL, NULL, NULL, NULL, NULL, '/images/lehenga_crimson_royal_bridal.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p2', '/images/lehenga_crimson_royal_bridal.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p2', '/images/lehenga_ruby_rose_embroidered.png', 1);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p24', 'Manish Malhotra', 'Ruby Rose Sequin Embroidered Wedding Lehenga', 2, 'Wedding Lehengas', 26999, 39999, 4.8, 620, 'WEDDING', 'Silk Georgette & Organza', 'Wedding', NULL, NULL, NULL, NULL, NULL, NULL, '/images/lehenga_ruby_rose_embroidered.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p24', '/images/lehenga_ruby_rose_embroidered.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p24', '/images/lehenga_crimson_royal_bridal.png', 1);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p13', 'Ritu Kumar', 'Beige & Dusty Pink Printed Straight-Cut Salwar Suit', 3, 'Straight-Cut Suits', 5499, 8999, 4.8, 310, 'SIGNATURE', 'Pure Chanderi Silk', 'Festive Wear', NULL, NULL, NULL, NULL, NULL, NULL, '/images/salwar_suit_beige_pink_printed.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p13', '/images/salwar_suit_beige_pink_printed.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p13', '/images/salwar_suit_rose_patiala_embroidered.png', 1);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p14', 'Anita Dongre', 'Dusty Rose Embellished Patiala Salwar Suit Set', 3, 'Designer Salwar Suits', 6999, 10999, 4.9, 240, 'FESTIVE COUTURE', 'Silk Georgette & Organza', 'Festive Wear', NULL, NULL, NULL, NULL, NULL, NULL, '/images/salwar_suit_rose_patiala_embroidered.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p14', '/images/salwar_suit_rose_patiala_embroidered.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p14', '/images/salwar_suit_beige_pink_printed.png', 1);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p15', 'Tarun Tahiliani', 'Terracotta Belted Peplum & Tailored Trouser Ensemble', NULL, 'Fusion Outfits', 12999, 18999, 4.9, 180, 'RUNWAY', 'Textured Raw Silk & Khadi', 'Reception', NULL, NULL, NULL, NULL, NULL, NULL, '/images/indo_western_rust_peplum_set.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p15', '/images/indo_western_rust_peplum_set.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p15', '/images/indo_western_ivory_jacket_set.png', 1);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p16', 'Manish Malhotra', 'Ivory Crop Jacket & Flare Pant Indo-Western Set', NULL, 'Pre-Draped Ensembles', 14999, 21999, 4.8, 145, 'DESIGNER STATEMENT', 'Handloom Linen & Silk', 'Sangeet', NULL, NULL, NULL, NULL, NULL, NULL, '/images/indo_western_ivory_jacket_set.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p16', '/images/indo_western_ivory_jacket_set.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p16', '/images/indo_western_rust_peplum_set.png', 1);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p17', 'Raw Mango', 'Royal Plum Zari Embroidered Silk Festive Ensemble', NULL, 'Celebration Ensembles', 14999, 21999, 4.9, 420, 'FESTIVE SPECIAL', 'Raw Silk & Banarasi Tissue', 'Festive Wear', NULL, NULL, NULL, NULL, NULL, NULL, '/images/festive_wear_plum_zari_silk.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p17', '/images/festive_wear_plum_zari_silk.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p17', '/images/festive_wear_teal_velvet_shawl.png', 1);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p4', 'Ritu Kumar', 'Peacock Teal Silk Kurta Set with Embroidered Velvet Shawl', NULL, 'Diwali Special', 16999, 24999, 4.9, 612, 'FESTIVE LUXURY', 'Pure Silk & Micro Velvet', 'Festive Wear', NULL, NULL, NULL, NULL, NULL, NULL, '/images/festive_wear_teal_velvet_shawl.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p4', '/images/festive_wear_teal_velvet_shawl.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p4', '/images/festive_wear_plum_zari_silk.png', 1);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p25', 'HOPO Lounge', 'Lace Trim Satin Night Suit', 4, 'Satin Nightwear Sets', 3499, 5999, 4.9, 320, 'LOUNGEWEAR', 'Pure Satin Silk', 'Lounge & Sleepwear', 'V-Neck with Scalloped Lace', 'Full Sleeve with Lace Trim', NULL, NULL, 'Button-Front & Elastic Waistband', 'Relaxed Comfort Fit', '/images/night_suit_1.jpg', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p25', '/images/night_suit_1.jpg', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p26', 'HOPO Lounge', 'Satin Wrap Night Suit', 4, 'Luxury Silk Pajamas', 3899, 6499, 4.8, 210, 'LUXURY LOUNGE', 'Silky Smooth Satin', 'Lounge & Sleepwear', 'Wrap Kimono Collar with Dark Piping', 'Full Sleeve with Contrast Trim', NULL, NULL, 'Wrap Belt Tie', 'Relaxed Comfort Fit', '/images/night_suit_2.jpg', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p26', '/images/night_suit_2.jpg', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p27', 'HOPO Lounge', 'Classic Navy Night Suit', 4, 'Satin Nightwear Sets', 3299, 5499, 4.9, 450, 'BESTSELLER', 'Premium Navy Satin Silk', 'Lounge & Sleepwear', 'Notched Collar with White Piping', 'Full Sleeve with Piped Cuffs', NULL, NULL, 'Button-Up Front & Drawstring Waist', 'Relaxed Comfort Fit', '/images/night_suit_3.jpg', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p27', '/images/night_suit_3.jpg', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p28', 'HOPO Lounge', 'Striped Cotton Night Suit', 4, 'Cotton Lounge Sets', 2499, 3999, 4.7, 180, 'BREATHABLE COTTON', '100% Breathable Striped Cotton', 'Lounge & Sleepwear', 'Spread Collar with Ruffled Trim', 'Full Sleeve with Ruffled Flounce Cuffs', NULL, NULL, 'Front Button Placket', 'Relaxed Breathable Fit', '/images/night_suit_4.jpg', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p28', '/images/night_suit_4.jpg', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p29', 'HOPO Lounge', 'Satin Night Suit', 4, 'Satin Nightwear Sets', 3699, 5999, 4.8, 290, 'ROYAL LOUNGE', 'Deep Lustrous Satin', 'Lounge & Sleepwear', 'Classic Notch Lapel', 'Full Sleeve with Deep Hem', NULL, NULL, 'Single-Breasted Button Placket', 'Relaxed Comfort Fit', '/images/night_suit_5.jpg', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p29', '/images/night_suit_5.jpg', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p31', 'HOPO Lounge', 'Premium Korean Berry Cotton Night Suit', 4, 'Cotton Lounge Sets', 2999, 4999, 4.9, 210, 'KOREAN EDIT', 'Premium Cotton Berry Crush', 'Lounge & Sleepwear', 'Notch Lapel with Piping', 'Short Sleeve with Piped Hem', NULL, NULL, 'Button Placket & Elastic Waist', 'Relaxed Comfort Fit', '/images/night_suit_6.jpg', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p31', '/images/night_suit_6.jpg', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p32', 'HOPO Lounge', 'Fancy Korean Sky Blue Floral Night Suit', 4, 'Cotton Lounge Sets', 3299, 5499, 4.8, 195, 'NEW LAUNCH', 'Breathable Soft Cotton', 'Lounge & Sleepwear', 'Square Lace Neck with Ribbon Bow', 'Short Sleeve', NULL, NULL, 'Pull-On Top & Elastic Waist Pants', 'Relaxed Comfort Fit', '/images/night_suit_7.jpg', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p32', '/images/night_suit_7.jpg', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p33', 'HOPO Lounge', 'Fancy Korean Soft Peach Floral Night Suit', 4, 'Cotton Lounge Sets', 3299, 5499, 4.9, 160, 'TRENDING', 'Breathable Soft Cotton', 'Lounge & Sleepwear', 'Square Lace Neck with Ribbon Bow', 'Short Sleeve', NULL, NULL, 'Pull-On Top & Elastic Waist Pants', 'Relaxed Comfort Fit', '/images/night_suit_8.jpg', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p33', '/images/night_suit_8.jpg', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p34', 'HOPO Lounge', 'Premium Korean Striped Floral Night Suit', 4, 'Cotton Lounge Sets', 2999, 4999, 4.8, 145, 'KOREAN EDIT', 'Premium Cotton Crush', 'Lounge & Sleepwear', 'Spread Collar with Pink Piping', 'Short Sleeve', NULL, NULL, 'Front Button Placket & Elastic Shorts', 'Relaxed Comfort Fit', '/images/night_suit_9.jpg', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p34', '/images/night_suit_9.jpg', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p35', 'HOPO Lounge', 'Korean Peach Ruffle Cotton Night Suit', 4, 'Cotton Lounge Sets', 3599, 5999, 4.9, 230, 'BESTSELLER', '100% Breathable Cotton', 'Lounge & Sleepwear', 'Ruffled Collar with Lapel', 'Full Sleeve with Ruffled Cuffs', NULL, NULL, 'Button Placket & Elastic Waist Pyjamas', 'Relaxed Comfort Fit', '/images/night_suit_10.jpg', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p35', '/images/night_suit_10.jpg', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p1', 'Anita Dongre', 'Royal Wine Maroon Zari Banarasi Silk Saree', NULL, 'Banarasi Sarees', 8499, 14999, 4.8, 1264, 'ARCHIVED', 'Pure Silk', 'Wedding', NULL, NULL, NULL, NULL, NULL, NULL, '/images/saree_wine_maroon_silk.png', 1, 'archived');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p1', '/images/saree_wine_maroon_silk.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p1', '/images/saree_rust_orange_banarasi.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p1', '/images/saree_black_silver_zari.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p6', 'Manish Malhotra', 'Royal Rust Gold Banarasi Katan Silk Saree', NULL, 'Banarasi Sarees', 18999, 28999, 4.9, 618, 'ARCHIVED', 'Katan Silk', 'Wedding', NULL, NULL, NULL, NULL, NULL, NULL, '/images/saree_rust_orange_banarasi.png', 1, 'archived');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p6', '/images/saree_rust_orange_banarasi.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p6', '/images/saree_metallic_copper_tissue.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p6', '/images/saree_ivory_embroidered_organza.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p21', 'Sabyasachi', 'Midnight Black Silver Zari Chanderi Saree', NULL, 'Handloom Sarees', 14999, 22999, 4.9, 480, 'ARCHIVED', 'Chanderi Silk', 'Party Wear', NULL, NULL, NULL, NULL, NULL, NULL, '/images/saree_black_silver_zari.png', 1, 'archived');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p21', '/images/saree_black_silver_zari.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p21', '/images/saree_metallic_copper_tissue.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p21', '/images/saree_wine_maroon_silk.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p22', 'Tarun Tahiliani', 'Metallic Copper Crushed Tissue Silk Saree', NULL, 'Party Wear Sarees', 16499, 24999, 4.8, 390, 'ARCHIVED', 'Tissue Silk', 'Reception', NULL, NULL, NULL, NULL, NULL, NULL, '/images/saree_metallic_copper_tissue.png', 1, 'archived');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p22', '/images/saree_metallic_copper_tissue.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p22', '/images/saree_black_silver_zari.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p22', '/images/saree_rust_orange_banarasi.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('p23', 'Raw Mango', 'Handcrafted Ivory Embroidered Organza Saree', NULL, 'Organza Sarees', 21999, 32999, 4.9, 275, 'ARCHIVED', 'Organza Silk', 'Wedding', NULL, NULL, NULL, NULL, NULL, NULL, '/images/saree_ivory_embroidered_organza.png', 1, 'archived');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p23', '/images/saree_ivory_embroidered_organza.png', 0);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p23', '/images/saree_rust_orange_banarasi.png', 1);
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('p23', '/images/saree_wine_maroon_silk.png', 2);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('a1', 'Amrapali', 'Gold polki jhumka earrings', NULL, NULL, 3499, 4999, 4.7, 220, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/images/gold_polki_jhumkas.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('a1', '/images/gold_polki_jhumkas.png', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('a2', 'Hidesign', 'Maroon embroidered potli', NULL, NULL, 1899, 2799, 4.5, 142, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/images/maroon_potli.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('a2', '/images/maroon_potli.png', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('a3', 'Inc.5', 'Gold block heel juttis', NULL, NULL, 2299, 3299, 4.4, 311, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/images/gold_block_heel_juttis.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('a3', '/images/gold_block_heel_juttis.png', 0);
INSERT INTO products (id, brand, title, category_id, subcategory, base_price, mrp, rating, reviews_count, tag, fabric, occasion, neckline, sleeve, work_type, padding, closure, margin, primary_image, is_archived, status) VALUES ('a4', 'Tribe Amrapali', 'Temple necklace set', NULL, NULL, 4499, 6499, 4.6, 98, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/images/temple_necklace_set.png', 0, 'active');
INSERT INTO product_images (product_id, image_url, display_order) VALUES ('a4', '/images/temple_necklace_set.png', 0);

-- 6. PRODUCT VARIANTS & SIZES
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url, price_override, mrp_override) VALUES ('a1-gold', 'a1', 'Antique Gold', '#D4AF37', '/images/gold_polki_jhumkas.png', 3499, 4999);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a1-gold', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a1-gold', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a1-gold', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a1-gold', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a1-gold', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a1-gold', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url, price_override, mrp_override) VALUES ('a2-maroon', 'a2', 'Royal Maroon', '#58111A', '/images/maroon_potli.png', 2199, 3299);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a2-maroon', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a2-maroon', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a2-maroon', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a2-maroon', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a2-maroon', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a2-maroon', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url, price_override, mrp_override) VALUES ('a3-gold', 'a3', 'Antique Gold', '#D4AF37', '/images/gold_block_heel_juttis.png', 2899, 3999);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a3-gold', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a3-gold', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a3-gold', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a3-gold', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a3-gold', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a3-gold', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url, price_override, mrp_override) VALUES ('a4-gold', 'a4', 'Temple Gold', '#C59B27', '/images/temple_necklace_set.png', 4999, 7499);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a4-gold', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a4-gold', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a4-gold', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a4-gold', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a4-gold', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('a4-gold', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p3-default', 'p3', 'Classic', '#8B1E3F', '/images/bridal_blouse_crimson_peacock.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p3-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p3-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p3-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p3-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p3-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p3-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p5-default', 'p5', 'Classic', '#8B1E3F', '/images/wedding_blouse_crimson_deep_v.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p5-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p5-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p5-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p5-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p5-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p5-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p8-default', 'p8', 'Classic', '#8B1E3F', '/images/bridal_blouse_maroon_velvet.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p8-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p8-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p8-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p8-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p8-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p8-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p9-default', 'p9', 'Classic', '#8B1E3F', '/images/wedding_blouse_pink_lattice.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p9-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p9-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p9-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p9-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p9-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p9-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p10-default', 'p10', 'Classic', '#8B1E3F', '/images/wedding_blouse_crimson_floral.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p10-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p10-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p10-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p10-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p10-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p10-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p11-default', 'p11', 'Classic', '#8B1E3F', '/images/wedding_blouse_crimson_zardozi.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p11-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p11-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p11-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p11-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p11-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p11-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p20-default', 'p20', 'Classic', '#8B1E3F', '/images/wedding_blouse_burgundy_sheer.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p20-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p20-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p20-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p20-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p20-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p20-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p12-default', 'p12', 'Classic', '#8B1E3F', '/images/bridal_blouse_emerald_back.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p12-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p12-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p12-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p12-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p12-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p12-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p18-default', 'p18', 'Classic', '#8B1E3F', '/images/bridal_blouse_pastel_couture.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p18-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p18-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p18-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p18-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p18-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p18-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p19-default', 'p19', 'Classic', '#8B1E3F', '/images/bridal_blouse_purple_banarasi.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p19-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p19-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p19-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p19-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p19-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p19-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p2-default', 'p2', 'Classic', '#8B1E3F', '/images/lehenga_crimson_royal_bridal.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p2-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p2-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p2-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p2-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p2-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p2-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p24-default', 'p24', 'Classic', '#8B1E3F', '/images/lehenga_ruby_rose_embroidered.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p24-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p24-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p24-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p24-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p24-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p24-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p13-default', 'p13', 'Classic', '#8B1E3F', '/images/salwar_suit_beige_pink_printed.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p13-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p13-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p13-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p13-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p13-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p13-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p14-default', 'p14', 'Classic', '#8B1E3F', '/images/salwar_suit_rose_patiala_embroidered.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p14-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p14-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p14-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p14-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p14-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p14-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p15-default', 'p15', 'Classic', '#8B1E3F', '/images/indo_western_rust_peplum_set.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p15-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p15-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p15-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p15-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p15-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p15-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p16-default', 'p16', 'Classic', '#8B1E3F', '/images/indo_western_ivory_jacket_set.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p16-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p16-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p16-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p16-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p16-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p16-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p17-default', 'p17', 'Classic', '#8B1E3F', '/images/festive_wear_plum_zari_silk.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p17-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p17-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p17-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p17-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p17-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p17-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p4-default', 'p4', 'Classic', '#8B1E3F', '/images/festive_wear_teal_velvet_shawl.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p4-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p4-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p4-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p4-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p4-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p4-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p25-default', 'p25', 'Classic', '#8B1E3F', '/images/night_suit_1.jpg');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p25-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p25-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p25-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p25-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p25-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p25-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p26-default', 'p26', 'Classic', '#8B1E3F', '/images/night_suit_2.jpg');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p26-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p26-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p26-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p26-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p26-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p26-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p27-default', 'p27', 'Classic', '#8B1E3F', '/images/night_suit_3.jpg');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p27-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p27-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p27-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p27-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p27-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p27-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p28-default', 'p28', 'Classic', '#8B1E3F', '/images/night_suit_4.jpg');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p28-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p28-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p28-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p28-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p28-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p28-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p29-default', 'p29', 'Classic', '#8B1E3F', '/images/night_suit_5.jpg');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p29-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p29-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p29-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p29-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p29-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p29-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p31-default', 'p31', 'Berry Cream', '#F5EBE1', '/images/night_suit_6.jpg');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p31-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p31-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p31-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p31-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p31-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p31-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p32-default', 'p32', 'Sky Blue Floral', '#A3D1E4', '/images/night_suit_7.jpg');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p32-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p32-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p32-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p32-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p32-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p32-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p33-default', 'p33', 'Soft Peach Floral', '#EAD7CD', '/images/night_suit_8.jpg');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p33-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p33-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p33-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p33-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p33-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p33-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p34-default', 'p34', 'Mint & White Stripe', '#D1E8DF', '/images/night_suit_9.jpg');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p34-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p34-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p34-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p34-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p34-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p34-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p35-default', 'p35', 'Peach Orange', '#F8BBA4', '/images/night_suit_10.jpg');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p35-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p35-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p35-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p35-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p35-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p35-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p1-default', 'p1', 'Classic', '#8B1E3F', '/images/saree_wine_maroon_silk.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p1-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p1-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p1-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p1-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p1-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p1-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p6-default', 'p6', 'Classic', '#8B1E3F', '/images/saree_rust_orange_banarasi.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p6-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p6-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p6-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p6-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p6-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p6-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p21-default', 'p21', 'Classic', '#8B1E3F', '/images/saree_black_silver_zari.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p21-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p21-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p21-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p21-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p21-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p21-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p22-default', 'p22', 'Classic', '#8B1E3F', '/images/saree_metallic_copper_tissue.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p22-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p22-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p22-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p22-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p22-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p22-default', 'XXL', 1);
INSERT INTO product_variants (id, product_id, color_name, color_hex, image_url) VALUES ('p23-default', 'p23', 'Classic', '#8B1E3F', '/images/saree_ivory_embroidered_organza.png');
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p23-default', 'XS', 4);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p23-default', 'S', 6);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p23-default', 'M', 5);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p23-default', 'L', 3);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p23-default', 'XL', 2);
INSERT INTO variant_sizes (variant_id, size, stock) VALUES ('p23-default', 'XXL', 1);

-- 7. REVIEWS
INSERT INTO reviews (product_id, author_name, rating, comment, verified_purchase) VALUES
('p3', 'Neha R.', 5, 'The Crimson Zardozi Bridal Blouse fitting was absolute perfection! The embroidery detail and padding feel like luxury couture.', 1),
('p5', 'Priya S.', 5, 'Ordered for my sister''s wedding. Real woven zari and prompt delivery.', 1),
('p8', 'Aanya M.', 5, 'The velvet reception blouse received endless compliments. Exceptional finish and packaging!', 1),
('p9', 'Kavya T.', 5, 'Fast delivery, authentic pure silk and generous 2-inch alteration margins included.', 1),
('p15', 'Sunita G.', 5, 'The satin night suit is incredibly soft and luxurious. Feels divine to wear!', 1);

-- 8. ORDERS & REVENUE DATA
INSERT INTO orders (id, user_id, subtotal, mrp_total, coupon_code, coupon_discount, shipping_fee, gst_amount, total_amount, payment_method, payment_status, order_status, tracking_number, courier_partner, estimated_delivery, shipping_address, created_at) VALUES
('ORD-2026-9041', 'USR-HOPO-0001', 12898.00, 20998.00, 'FESTIVE40', 2400.00, 0.00, 629.90, 11127.90, 'UPI', 'PAID', 'DELIVERED', 'BD-LUXE-8821901', 'BlueDart Express Luxe', '2026-03-12', '{"full_name": "Riya Sharma", "phone": "+91 98765 43210", "address_line1": "Flat 402, Sea Green Apartments", "address_line2": "Pali Hill Road, Bandra West", "city": "Mumbai", "state": "Maharashtra", "pincode": "400050"}', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('ORD-2026-9042', 'USR-HOPO-0002', 5499.00, 8999.00, 'HOPO10', 549.90, 0.00, 296.95, 5246.05, 'CARD', 'PAID', 'SHIPPED', 'BD-LUXE-8821902', 'BlueDart Express Luxe', '2026-03-18', '{"full_name": "Priya Patel", "phone": "+91 91234 56789", "address_line1": "14 Lotus Villa", "address_line2": "Koregaon Park", "city": "Pune", "state": "Maharashtra", "pincode": "411001"}', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('ORD-2026-9043', 'USR-HOPO-0001', 6999.00, 11999.00, NULL, 0.00, 0.00, 419.94, 7418.94, 'UPI', 'PAID', 'CONFIRMED', 'BD-LUXE-8821903', 'BlueDart Express Luxe', '2026-03-20', '{"full_name": "Riya Sharma", "phone": "+91 98765 43210", "address_line1": "Flat 402, Sea Green Apartments", "address_line2": "Pali Hill Road, Bandra West", "city": "Mumbai", "state": "Maharashtra", "pincode": "400050"}', NOW());

INSERT INTO order_items (order_id, product_id, product_title, brand, image_url, size, color, unit_price, quantity, total_price) VALUES
('ORD-2026-9041', 'p3', 'Crimson Peacock & Elephant Zardozi Bridal Blouse', 'Sabyasachi', '/images/bridal_blouse_crimson_peacock.png', 'M', 'Classic', 6999.00, 1, 6999.00),
('ORD-2026-9041', 'p8', 'Royal Velvet Maroon Mango Zari Bridal Blouse', 'Raw Mango', '/images/bridal_blouse_maroon_velvet.png', 'M', 'Classic', 5899.00, 1, 5899.00),
('ORD-2026-9042', 'p5', 'Crimson Zardozi Plunging V-Neck Bridal Blouse', 'Tarun Tahiliani', '/images/wedding_blouse_crimson_deep_v.png', 'S', 'Classic', 5499.00, 1, 5499.00),
('ORD-2026-9043', 'p3', 'Crimson Peacock & Elephant Zardozi Bridal Blouse', 'Sabyasachi', '/images/bridal_blouse_crimson_peacock.png', 'L', 'Classic', 6999.00, 1, 6999.00);

INSERT INTO payments (id, order_id, transaction_id, payment_method, amount, status, gateway_response, created_at) VALUES
('PAY-9041', 'ORD-2026-9041', 'TXN_UPI_9041_OK', 'UPI', 11127.90, 'SUCCESS', '{"status": "captured", "rrn": "602910482019"}', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('PAY-9042', 'ORD-2026-9042', 'TXN_CARD_9042_OK', 'CARD', 5246.05, 'SUCCESS', '{"status": "captured", "last4": "4242"}', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('PAY-9043', 'ORD-2026-9043', 'TXN_UPI_9043_OK', 'UPI', 7418.94, 'SUCCESS', '{"status": "captured", "rrn": "602910489912"}', NOW());

INSERT INTO order_timeline (order_id, status, title, description, completed, event_time) VALUES
('ORD-2026-9041', 'CONFIRMED', 'Order Confirmed', 'Order verified and couture tailoring initiated.', 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('ORD-2026-9041', 'PACKED', 'Ensemble Packed', 'Garments inspected, custom padded and boxed in silk heirloom crate.', 1, DATE_SUB(NOW(), INTERVAL 4 DAY)),
('ORD-2026-9041', 'SHIPPED', 'Courier Dispatched', 'Handed over to BlueDart Express Luxe courier.', 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('ORD-2026-9041', 'DELIVERED', 'Delivered to Customer', 'Customer received package with signature verification.', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('ORD-2026-9042', 'CONFIRMED', 'Payment Received', 'Payment received via Visa Platinum.', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('ORD-2026-9042', 'SHIPPED', 'In Transit', 'Dispatched from South Mumbai Atelier Hub.', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('ORD-2026-9043', 'CONFIRMED', 'Order Placed', 'Order received and awaiting couture cutting.', 1, NOW());

-- 9. EDITORIAL BANNERS
INSERT INTO banners (id, title, subtitle, slot, placement, image_url, link_url, cta_text, display_order, is_active, schedule_text) VALUES
(1, 'Handcrafted Bridal Blouse Atelier', 'Zardozi Gold Bullion, Banarasi Brocades & Velvet Aari Embellishments', 'home_hero_1', 'Home', '/images/bridal_blouse_crimson_peacock.png', '/category/bridal-blouses', 'Explore Bridal Blouses', 1, 1, 'Active All Season'),
(2, 'Royal Heritage Lehengas', 'Heirloom bridal creations embroidered with zari, pearls, and resham threads', 'home_hero_2', 'Home', '/images/lehenga_crimson_royal_bridal.png', '/category/lehengas', 'Discover Lehengas', 2, 1, 'Spring Couture 2026'),
(3, 'Luxury Night Suits & Loungewear', 'Pure silk, modal and delicate lace-trimmed evening comfort', 'home_hero_3', 'Home', '/images/night_suit_1.jpg', '/category/night-suits', 'Shop Loungewear', 3, 1, 'Perpetual Collection');

-- 10. SPECIAL OFFERS
INSERT INTO special_offers (id, code, title, description, discount_type, discount_value, min_order_amount, max_discount, applicable_category, status, valid_from, valid_until) VALUES
('OFF-001', 'FESTIVE40', 'Festive Grand Sale', 'Flat ₹2,400 off on bridal & wedding orders above ₹4,999', 'FLAT', 2400.00, 4999.00, 2400.00, 'Bridal Blouses', 'ACTIVE', NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY)),
('OFF-002', 'HOPO10', 'Atelier Welcome Privilege', '10% instant discount on your premier acquisition up to ₹1,500', 'PERCENTAGE', 10.00, 1999.00, 1500.00, 'All', 'ACTIVE', NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY)),
('OFF-003', 'BRIDAL20', 'Heirloom Bridal Suite Special', '20% off on complete wedding ensembles exceeding ₹10,000', 'PERCENTAGE', 20.00, 10000.00, 4000.00, 'Bridal Blouses', 'ACTIVE', NOW(), DATE_ADD(NOW(), INTERVAL 120 DAY));

-- 11. BASELINE CONVERSION ANALYTICS EVENTS
INSERT INTO analytics_events (event_type, session_id, user_id, entity_type, entity_id, referrer, channel, metadata, ip_address, created_at) VALUES
('page_view', 'sess_001', 'USR-HOPO-0001', 'page', 'home', 'google.com', 'Organic Atelier', '{"path": "/"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('page_view', 'sess_001', 'USR-HOPO-0001', 'category', 'bridal-blouses', 'google.com', 'Organic Atelier', '{"slug": "bridal-blouses"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('product_view', 'sess_001', 'USR-HOPO-0001', 'product', 'p3', 'internal', 'Organic Atelier', '{"product_id": "p3", "title": "Crimson Peacock Blouse"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('add_to_cart', 'sess_001', 'USR-HOPO-0001', 'product', 'p3', 'internal', 'Organic Atelier', '{"product_id": "p3", "size": "M"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('checkout_started', 'sess_001', 'USR-HOPO-0001', 'cart', 'cart_01', 'internal', 'Organic Atelier', '{"subtotal": 12898.00}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('purchase', 'sess_001', 'USR-HOPO-0001', 'order', 'ORD-2026-9041', 'internal', 'Organic Atelier', '{"order_id": "ORD-2026-9041", "total": 11127.90}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('page_view', 'sess_002', 'USR-HOPO-0002', 'page', 'home', 'instagram.com', 'Instagram Couture', '{"path": "/"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('product_view', 'sess_002', 'USR-HOPO-0002', 'product', 'p5', 'instagram.com', 'Instagram Couture', '{"product_id": "p5"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('add_to_cart', 'sess_002', 'USR-HOPO-0002', 'product', 'p5', 'internal', 'Instagram Couture', '{"product_id": "p5"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('checkout_started', 'sess_002', 'USR-HOPO-0002', 'cart', 'cart_02', 'internal', 'Instagram Couture', '{"subtotal": 5499.00}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('purchase', 'sess_002', 'USR-HOPO-0002', 'order', 'ORD-2026-9042', 'internal', 'Instagram Couture', '{"order_id": "ORD-2026-9042", "total": 5246.05}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('page_view', 'sess_003', NULL, 'page', 'home', 'direct', 'Direct VIP Concierge', '{"path": "/"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('product_view', 'sess_003', NULL, 'product', 'p8', 'direct', 'Direct VIP Concierge', '{"product_id": "p8"}', '127.0.0.1', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('page_view', 'sess_004', NULL, 'page', 'home', 'vogue.in', 'Editorial Referral', '{"path": "/"}', '127.0.0.1', NOW());

-- 12. NOTIFICATIONS (CUSTOMER & ADMIN DYNAMIC CMS)
INSERT INTO notifications (id, user_id, recipient_role, event_key, category, title, body, action_url, entity_type, entity_id, image_url, is_read, is_cleared, created_at) VALUES
('ntf_riya_001', 'USR-HOPO-0001', 'CUSTOMER', 'ORDER_ORD-2026-9043_CONFIRMED', 'ORDERS', 'Order Confirmed & Tailoring Initiated', 'Crimson Peacock & Elephant Zardozi Bridal Blouse • Atelier tailoring verified. Order #ORD-2026-9043', '/order/ORD-2026-9043', 'order', 'ORD-2026-9043', '/images/bridal_blouse_crimson_peacock.png', 0, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('ntf_riya_002', 'USR-HOPO-0001', 'CUSTOMER', 'ORDER_ORD-2026-9041_DELIVERED', 'ORDERS', 'Order Delivered to Customer', 'Royal Velvet Maroon Mango Zari Bridal Blouse • Safely delivered via BlueDart Luxe. Order #ORD-2026-9041', '/order/ORD-2026-9041', 'order', 'ORD-2026-9041', '/images/bridal_blouse_maroon_velvet.png', 1, 0, DATE_SUB(NOW(), INTERVAL 5 DAY)),
('ntf_riya_003', 'USR-HOPO-0001', 'CUSTOMER', 'OFFER_FESTIVE40_LIVE', 'OFFERS', 'Festive Grand Sale is Live', 'Flat ₹2,400 off on bridal & wedding orders above ₹4,999. Use code FESTIVE40 at checkout.', '/offers', 'offer', 'OFF-001', '/images/category_festive_wear.png', 0, 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('ntf_priya_001', 'USR-HOPO-0002', 'CUSTOMER', 'ORDER_ORD-2026-9042_SHIPPED', 'ORDERS', 'Dispatched via BlueDart Luxe', 'Crimson Zardozi Plunging V-Neck Bridal Blouse • Dispatched in heirloom crate. Order #ORD-2026-9042', '/order/ORD-2026-9042', 'order', 'ORD-2026-9042', '/images/wedding_blouse_crimson_deep_v.png', 0, 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('ntf_adm_001', NULL, 'ADMIN', 'ADMIN_NEW_ORDER_ORD-2026-9043', 'ORDERS', 'New Customer Order Received', 'Order #ORD-2026-9043 (₹7,418.94) placed by Riya Sharma via UPI.', '/admin/orders', 'order', 'ORD-2026-9043', '/images/bridal_blouse_crimson_peacock.png', 0, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('ntf_adm_002', NULL, 'ADMIN', 'ADMIN_LOW_STOCK_p3_S', 'INVENTORY', 'Low Stock Alert', 'Crimson Peacock & Elephant Zardozi Blouse (Size S) has reached 2 units.', '/admin/inventory', 'inventory', 'p3', '/images/bridal_blouse_crimson_peacock.png', 0, 0, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
('ntf_adm_003', NULL, 'ADMIN', 'ADMIN_VIP_REG_USR-0002', 'CUSTOMERS', 'New VIP Customer Registered', 'Priya Patel (priya@example.com) joined HOPO Atelier. Assigned Silver Tier.', '/admin/customers', 'customer', 'USR-HOPO-0002', NULL, 1, 0, DATE_SUB(NOW(), INTERVAL 2 DAY));


