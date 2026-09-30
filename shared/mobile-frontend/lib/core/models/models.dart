/// Core data models for the Hopo Shop E-Commerce app.
/// These match the NestJS/Prisma backend schema exactly.
library;

// ─── User ─────────────────────────────────────────────────
class HopoUser {
  final String id;
  final String? email;
  final String? phone;
  final String? firstName;
  final String? lastName;
  final String? avatar;
  final String role;
  final bool isVerified;

  const HopoUser({required this.id, this.email, this.phone, this.firstName, this.lastName, this.avatar, this.role = 'CUSTOMER', this.isVerified = false});

  String get displayName => [firstName, lastName].where((s) => s != null && s.isNotEmpty).join(' ');
  String get initials => displayName.isNotEmpty ? displayName.split(' ').map((w) => w[0]).take(2).join().toUpperCase() : '?';

  factory HopoUser.fromJson(Map<String, dynamic> j) => HopoUser(
    id: j['id'] as String, email: j['email'] as String?, phone: j['phone'] as String?,
    firstName: j['firstName'] as String?, lastName: j['lastName'] as String?,
    avatar: j['avatar'] as String?, role: j['role'] as String? ?? 'CUSTOMER',
    isVerified: j['isVerified'] as bool? ?? false,
  );
}

class AuthTokens {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;

  const AuthTokens({required this.accessToken, required this.refreshToken, required this.expiresIn});

  factory AuthTokens.fromJson(Map<String, dynamic> j) => AuthTokens(
    accessToken: j['accessToken'] as String, refreshToken: j['refreshToken'] as String,
    expiresIn: j['expiresIn'] as int? ?? 900,
  );
}

class AuthResponse {
  final HopoUser user;
  final AuthTokens tokens;

  const AuthResponse({required this.user, required this.tokens});

  factory AuthResponse.fromJson(Map<String, dynamic> j) => AuthResponse(
    user: HopoUser.fromJson(j['user'] as Map<String, dynamic>),
    tokens: AuthTokens(accessToken: j['accessToken'] as String, refreshToken: j['refreshToken'] as String, expiresIn: j['expiresIn'] as int? ?? 900),
  );
}

// ─── Address ──────────────────────────────────────────────
class Address {
  final String id;
  final String label;
  final String fullName;
  final String phone;
  final String addressLine1;
  final String? addressLine2;
  final String? landmark;
  final String city;
  final String state;
  final String pincode;
  final bool isDefault;

  const Address({required this.id, required this.label, required this.fullName, required this.phone,
    required this.addressLine1, this.addressLine2, this.landmark, required this.city,
    required this.state, required this.pincode, this.isDefault = false});

  factory Address.fromJson(Map<String, dynamic> j) => Address(
    id: j['id'] as String, label: j['label'] as String? ?? 'Home',
    fullName: j['fullName'] as String, phone: j['phone'] as String,
    addressLine1: j['addressLine1'] as String, addressLine2: j['addressLine2'] as String?,
    landmark: j['landmark'] as String?, city: j['city'] as String,
    state: j['state'] as String, pincode: j['pincode'] as String,
    isDefault: j['isDefault'] as bool? ?? false,
  );

  Map<String, dynamic> toJson() => {
    'label': label, 'fullName': fullName, 'phone': phone,
    'addressLine1': addressLine1, 'addressLine2': addressLine2,
    'landmark': landmark, 'city': city, 'state': state, 'pincode': pincode,
    'isDefault': isDefault,
  };
}

// ─── Product ──────────────────────────────────────────────
class Product {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String? categoryName;
  final String? brandName;
  final double basePrice;
  final double? compareAtPrice;
  final String? fabricType;
  final List<String> occasion;
  final List<String> tags;
  final bool isFeatured;
  final double avgRating;
  final int totalReviews;
  final String? primaryImage;
  final List<ProductImage> images;
  final List<ProductVariant> variants;

  const Product({required this.id, required this.name, required this.slug, required this.description,
    this.categoryName, this.brandName, required this.basePrice, this.compareAtPrice,
    this.fabricType, this.occasion = const [], this.tags = const [],
    this.isFeatured = false, this.avgRating = 0, this.totalReviews = 0,
    this.primaryImage, this.images = const [], this.variants = const []});

  int get discountPercent => compareAtPrice != null && compareAtPrice! > 0
      ? ((1 - basePrice / compareAtPrice!) * 100).round() : 0;

  factory Product.fromJson(Map<String, dynamic> j) {
    final imgs = (j['images'] as List<dynamic>?)?.map((e) => ProductImage.fromJson(e as Map<String, dynamic>)).toList() ?? [];
    final variants = (j['variants'] as List<dynamic>?)?.map((e) => ProductVariant.fromJson(e as Map<String, dynamic>)).toList() ?? [];
    final primary = imgs.where((i) => i.isPrimary).firstOrNull?.url ?? (imgs.isNotEmpty ? imgs.first.url : null);

    return Product(
      id: j['id'] as String, name: j['name'] as String, slug: j['slug'] as String? ?? '',
      description: j['description'] as String? ?? '',
      categoryName: (j['category'] as Map<String, dynamic>?)?['name'] as String?,
      brandName: (j['brand'] as Map<String, dynamic>?)?['name'] as String?,
      basePrice: _toDouble(j['basePrice']), compareAtPrice: _toDoubleOrNull(j['compareAtPrice']),
      fabricType: j['fabricType'] as String?,
      occasion: (j['occasion'] as List<dynamic>?)?.cast<String>() ?? [],
      tags: (j['tags'] as List<dynamic>?)?.cast<String>() ?? [],
      isFeatured: j['isFeatured'] as bool? ?? false,
      avgRating: _toDouble(j['avgRating']), totalReviews: j['totalReviews'] as int? ?? 0,
      primaryImage: primary, images: imgs, variants: variants,
    );
  }
}

class ProductImage {
  final String id;
  final String url;
  final bool isPrimary;
  const ProductImage({required this.id, required this.url, this.isPrimary = false});
  factory ProductImage.fromJson(Map<String, dynamic> j) => ProductImage(
    id: j['id'] as String, url: j['url'] as String, isPrimary: j['isPrimary'] as bool? ?? false);
}

class ProductVariant {
  final String id;
  final String sku;
  final String? color;
  final String? size;
  final double price;
  final double? compareAt;
  final int stock;
  const ProductVariant({required this.id, required this.sku, this.color, this.size,
    required this.price, this.compareAt, this.stock = 0});
  factory ProductVariant.fromJson(Map<String, dynamic> j) => ProductVariant(
    id: j['id'] as String, sku: j['sku'] as String? ?? '',
    color: j['color'] as String?, size: j['size'] as String?,
    price: _toDouble(j['price']), compareAt: _toDoubleOrNull(j['compareAt']),
    stock: (j['inventory'] as Map<String, dynamic>?)?['quantity'] as int? ?? 0,
  );
}

// ─── Category ─────────────────────────────────────────────
class Category {
  final String id;
  final String name;
  final String slug;
  final String? image;
  final String? parentId;
  final List<Category> children;
  const Category({required this.id, required this.name, required this.slug, this.image, this.parentId, this.children = const []});
  factory Category.fromJson(Map<String, dynamic> j) => Category(
    id: j['id'] as String, name: j['name'] as String, slug: j['slug'] as String,
    image: j['image'] as String?, parentId: j['parentId'] as String?,
    children: (j['children'] as List<dynamic>?)?.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList() ?? [],
  );
}

// ─── Cart ─────────────────────────────────────────────────
class CartItem {
  final String id;
  final String variantId;
  final int quantity;
  final ProductVariant variant;
  final Product? product;
  const CartItem({required this.id, required this.variantId, required this.quantity, required this.variant, this.product});
  factory CartItem.fromJson(Map<String, dynamic> j) {
    final variantJson = j['variant'] as Map<String, dynamic>;
    Product? product;
    if (variantJson.containsKey('product')) {
      product = Product.fromJson(variantJson['product'] as Map<String, dynamic>);
    }
    return CartItem(id: j['id'] as String, variantId: j['variantId'] as String,
      quantity: j['quantity'] as int, variant: ProductVariant.fromJson(variantJson), product: product);
  }
}

class CartSummary {
  final List<CartItem> items;
  final double subtotal;
  final int itemCount;
  final double shippingCharge;
  double get total => subtotal + shippingCharge;
  const CartSummary({this.items = const [], this.subtotal = 0, this.itemCount = 0, this.shippingCharge = 0});
  factory CartSummary.fromJson(Map<String, dynamic> j) {
    final cartItems = ((j['cart'] as Map<String, dynamic>?)?['items'] as List<dynamic>?)
      ?.map((e) => CartItem.fromJson(e as Map<String, dynamic>)).toList() ?? [];
    return CartSummary(items: cartItems, subtotal: _toDouble(j['subtotal']),
      itemCount: j['itemCount'] as int? ?? 0, shippingCharge: _toDouble(j['shippingCharge']));
  }
}

// ─── Order ────────────────────────────────────────────────
class Order {
  final String id;
  final String orderNumber;
  final String status;
  final double subtotal;
  final double shippingCharge;
  final double taxAmount;
  final double discount;
  final double totalAmount;
  final DateTime createdAt;
  final DateTime? deliveredAt;
  final List<OrderItem> items;
  final List<OrderStatusLog> statusLogs;
  final Address? address;

  const Order({required this.id, required this.orderNumber, required this.status,
    required this.subtotal, required this.shippingCharge, required this.taxAmount,
    required this.discount, required this.totalAmount, required this.createdAt,
    this.deliveredAt, this.items = const [], this.statusLogs = const [], this.address});

  factory Order.fromJson(Map<String, dynamic> j) => Order(
    id: j['id'] as String, orderNumber: j['orderNumber'] as String,
    status: j['status'] as String, subtotal: _toDouble(j['subtotal']),
    shippingCharge: _toDouble(j['shippingCharge']), taxAmount: _toDouble(j['taxAmount']),
    discount: _toDouble(j['discount']), totalAmount: _toDouble(j['totalAmount']),
    createdAt: DateTime.parse(j['createdAt'] as String),
    deliveredAt: j['deliveredAt'] != null ? DateTime.parse(j['deliveredAt'] as String) : null,
    items: (j['items'] as List<dynamic>?)?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>)).toList() ?? [],
    statusLogs: (j['statusLogs'] as List<dynamic>?)?.map((e) => OrderStatusLog.fromJson(e as Map<String, dynamic>)).toList() ?? [],
    address: j['address'] != null ? Address.fromJson(j['address'] as Map<String, dynamic>) : null,
  );
}

class OrderItem {
  final String id;
  final String productName;
  final String? variantInfo;
  final String sku;
  final int quantity;
  final double unitPrice;
  final double totalPrice;
  const OrderItem({required this.id, required this.productName, this.variantInfo, required this.sku,
    required this.quantity, required this.unitPrice, required this.totalPrice});
  factory OrderItem.fromJson(Map<String, dynamic> j) => OrderItem(
    id: j['id'] as String, productName: j['productName'] as String,
    variantInfo: j['variantInfo'] as String?, sku: j['sku'] as String? ?? '',
    quantity: j['quantity'] as int, unitPrice: _toDouble(j['unitPrice']),
    totalPrice: _toDouble(j['totalPrice']),
  );
}

class OrderStatusLog {
  final String status;
  final String? note;
  final DateTime createdAt;
  const OrderStatusLog({required this.status, this.note, required this.createdAt});
  factory OrderStatusLog.fromJson(Map<String, dynamic> j) => OrderStatusLog(
    status: j['status'] as String, note: j['note'] as String?,
    createdAt: DateTime.parse(j['createdAt'] as String),
  );
}

// ─── Notification ─────────────────────────────────────────
class AppNotification {
  final String id;
  final String type;
  final String title;
  final String body;
  final bool isRead;
  final DateTime createdAt;
  const AppNotification({required this.id, required this.type, required this.title,
    required this.body, this.isRead = false, required this.createdAt});
  factory AppNotification.fromJson(Map<String, dynamic> j) => AppNotification(
    id: j['id'] as String, type: j['type'] as String, title: j['title'] as String,
    body: j['body'] as String, isRead: j['isRead'] as bool? ?? false,
    createdAt: DateTime.parse(j['createdAt'] as String),
  );
}

// ─── Coupon ───────────────────────────────────────────────
class Coupon {
  final String id;
  final String code;
  final String title;
  final String? description;
  final String type;
  final double value;
  final double? minOrderAmount;
  final double? maxDiscount;
  const Coupon({required this.id, required this.code, required this.title, this.description,
    required this.type, required this.value, this.minOrderAmount, this.maxDiscount});
  factory Coupon.fromJson(Map<String, dynamic> j) => Coupon(
    id: j['id'] as String, code: j['code'] as String, title: j['title'] as String,
    description: j['description'] as String?, type: j['type'] as String,
    value: _toDouble(j['value']), minOrderAmount: _toDoubleOrNull(j['minOrderAmount']),
    maxDiscount: _toDoubleOrNull(j['maxDiscount']),
  );
}

// ─── Helpers ──────────────────────────────────────────────
double _toDouble(dynamic v) => v is num ? v.toDouble() : double.tryParse(v?.toString() ?? '0') ?? 0;
double? _toDoubleOrNull(dynamic v) => v == null ? null : _toDouble(v);
