import '../../core/network/api_client.dart';
import '../../core/models/models.dart';

/// API service for all HOPO SHOP backend endpoints.
/// Each method returns parsed model objects.
/// All calls go through the authenticated Dio client.
class ApiService {
  final ApiClient _client;

  ApiService(this._client);

  // ─── Auth ─────────────────────────────────────────────────
  Future<AuthResponse> loginWithFirebase(String idToken) async {
    final res = await _client.dio.post('/auth/firebase', data: {'idToken': idToken});
    return AuthResponse.fromJson(res.data as Map<String, dynamic>);
  }

  Future<AuthTokens> refreshToken(String refreshToken) async {
    final res = await _client.dio.post('/auth/refresh', data: {'refreshToken': refreshToken});
    return AuthTokens.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> logout(String refreshToken) async {
    await _client.dio.post('/auth/logout', data: {'refreshToken': refreshToken});
  }

  // ─── Products ─────────────────────────────────────────────
  Future<List<Product>> getProducts({int page = 1, int limit = 20, String? categoryId,
      String? search, String? occasion, double? minPrice, double? maxPrice}) async {
    final res = await _client.dio.get('/products', queryParameters: <String, dynamic>{
      'page': page, 'limit': limit,
      if (categoryId != null) 'categoryId': categoryId,
      if (search != null) 'search': search,
      if (occasion != null) 'occasion': occasion,
      if (minPrice != null) 'minPrice': minPrice,
      if (maxPrice != null) 'maxPrice': maxPrice,
    });
    final data = res.data;
    final list = data is Map ? data['products'] as List : data as List;
    return list.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Product> getProductById(String id) async {
    final res = await _client.dio.get('/products/$id');
    return Product.fromJson(res.data as Map<String, dynamic>);
  }

  Future<Product> getProductBySlug(String slug) async {
    final res = await _client.dio.get('/products/slug/$slug');
    return Product.fromJson(res.data as Map<String, dynamic>);
  }

  Future<List<Product>> getFeaturedProducts({int limit = 10}) async {
    final res = await _client.dio.get('/products/featured', queryParameters: {'limit': limit});
    final list = res.data is List ? res.data as List : (res.data['products'] as List?) ?? [];
    return list.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ─── Categories ───────────────────────────────────────────
  Future<List<Category>> getCategories() async {
    final res = await _client.dio.get('/categories');
    final list = res.data is List ? res.data as List : (res.data['categories'] as List?) ?? [];
    return list.map((e) => Category.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ─── Cart ─────────────────────────────────────────────────
  Future<CartSummary> getCart() async {
    final res = await _client.dio.get('/cart');
    return CartSummary.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> addToCart(String variantId, {int quantity = 1}) async {
    await _client.dio.post('/cart/items', data: {'variantId': variantId, 'quantity': quantity});
  }

  Future<void> updateCartQuantity(String itemId, int quantity) async {
    await _client.dio.put('/cart/items/$itemId', data: {'quantity': quantity});
  }

  Future<void> removeFromCart(String itemId) async {
    await _client.dio.delete('/cart/items/$itemId');
  }

  Future<void> clearCart() async {
    await _client.dio.delete('/cart');
  }

  // ─── Wishlist ─────────────────────────────────────────────
  Future<List<dynamic>> getWishlist() async {
    final res = await _client.dio.get('/wishlist');
    return res.data is List ? res.data as List : (res.data['items'] as List?) ?? [];
  }

  Future<void> addToWishlist(String variantId) async {
    await _client.dio.post('/wishlist', data: {'variantId': variantId});
  }

  Future<void> removeFromWishlist(String itemId) async {
    await _client.dio.delete('/wishlist/$itemId');
  }

  // ─── Orders ───────────────────────────────────────────────
  Future<Order> createOrder({required String addressId, String? couponId, bool giftWrap = false, String? giftMessage}) async {
    final res = await _client.dio.post('/orders', data: <String, dynamic>{
      'addressId': addressId,
      if (couponId != null) 'couponId': couponId,
      'giftWrap': giftWrap,
      if (giftMessage != null) 'giftMessage': giftMessage,
    });
    return Order.fromJson(res.data as Map<String, dynamic>);
  }

  Future<List<Order>> getOrders({int page = 1, int limit = 10}) async {
    final res = await _client.dio.get('/orders', queryParameters: {'page': page, 'limit': limit});
    final data = res.data;
    final list = data is Map ? data['orders'] as List : data as List;
    return list.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Order> getOrderById(String id) async {
    final res = await _client.dio.get('/orders/$id');
    return Order.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> cancelOrder(String orderId, String reason) async {
    await _client.dio.post('/orders/$orderId/cancel', data: {'reason': reason});
  }

  // ─── Payments ─────────────────────────────────────────────
  Future<Map<String, dynamic>> createPaymentOrder(String orderId) async {
    final res = await _client.dio.post('/payments/create/$orderId');
    return res.data as Map<String, dynamic>;
  }

  Future<void> verifyPayment({required String razorpayOrderId, required String razorpayPaymentId, required String razorpaySignature}) async {
    await _client.dio.post('/payments/verify', data: {
      'razorpayOrderId': razorpayOrderId,
      'razorpayPaymentId': razorpayPaymentId,
      'razorpaySignature': razorpaySignature,
    });
  }

  // ─── Notifications ────────────────────────────────────────
  Future<Map<String, dynamic>> getNotifications({int page = 1, int limit = 20}) async {
    final res = await _client.dio.get('/notifications', queryParameters: {'page': page, 'limit': limit});
    return res.data as Map<String, dynamic>;
  }

  Future<void> markNotificationRead(String id) async {
    await _client.dio.put('/notifications/$id/read');
  }

  Future<void> markAllNotificationsRead() async {
    await _client.dio.put('/notifications/read-all');
  }

  // ─── User / Profile ───────────────────────────────────────
  Future<HopoUser> getProfile() async {
    final res = await _client.dio.get('/users/me');
    return HopoUser.fromJson(res.data as Map<String, dynamic>);
  }

  Future<HopoUser> updateProfile(Map<String, dynamic> data) async {
    final res = await _client.dio.put('/users/me', data: data);
    return HopoUser.fromJson(res.data as Map<String, dynamic>);
  }

  Future<List<Address>> getAddresses() async {
    final res = await _client.dio.get('/users/me/addresses');
    final list = res.data is List ? res.data as List : (res.data['addresses'] as List?) ?? [];
    return list.map((e) => Address.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Address> createAddress(Address address) async {
    final res = await _client.dio.post('/users/me/addresses', data: address.toJson());
    return Address.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> deleteAddress(String id) async {
    await _client.dio.delete('/users/me/addresses/$id');
  }

  // ─── Coupons ──────────────────────────────────────────────
  Future<Coupon> validateCoupon(String code) async {
    final res = await _client.dio.post('/coupons/validate', data: {'code': code});
    return Coupon.fromJson(res.data as Map<String, dynamic>);
  }
}
