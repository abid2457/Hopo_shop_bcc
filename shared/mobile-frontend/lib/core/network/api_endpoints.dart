/// Centralized API endpoint paths matching the NestJS backend routes.
class ApiEndpoints {
  ApiEndpoints._();

  // ─── Auth ──────────────────────────────────────────────
  static const String login = '/auth/firebase';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';

  // ─── Users ─────────────────────────────────────────────
  static const String profile = '/users/me';
  static const String updateProfile = '/users/me';
  static const String addresses = '/users/me/addresses';
  static String address(String id) => '/users/me/addresses/$id';

  // ─── Products ──────────────────────────────────────────
  static const String products = '/products';
  static String product(String id) => '/products/$id';
  static String productReviews(String id) => '/products/$id/reviews';

  // ─── Categories ────────────────────────────────────────
  static const String categories = '/categories';

  // ─── Cart ──────────────────────────────────────────────
  static const String cart = '/cart';
  static const String addToCart = '/cart/items';
  static String cartItem(String id) => '/cart/items/$id';

  // ─── Wishlist ──────────────────────────────────────────
  static const String wishlist = '/wishlist';
  static String wishlistItem(String id) => '/wishlist/$id';

  // ─── Orders ────────────────────────────────────────────
  static const String orders = '/orders';
  static String order(String id) => '/orders/$id';
  static String orderTracking(String id) => '/orders/track/$id';
  static String cancelOrder(String id) => '/orders/$id/cancel';

  // ─── Payments ──────────────────────────────────────────
  static String createPayment(String orderId) => '/payments/create/$orderId';
  static const String verifyPayment = '/payments/verify';

  // ─── Reviews ───────────────────────────────────────────
  static const String reviews = '/reviews';

  // ─── Coupons ───────────────────────────────────────────
  static const String coupons = '/coupons';
  static const String applyCoupon = '/coupons/validate';

  // ─── Rewards ───────────────────────────────────────────
  static const String rewards = '/rewards';
  static const String rewardHistory = '/rewards/history';

  // ─── Support ───────────────────────────────────────────
  static const String supportTickets = '/support/tickets';
  static String supportTicket(String id) => '/support/tickets/$id';

  // ─── Notifications ─────────────────────────────────────
  static const String notifications = '/notifications';
  static const String registerDevice = '/notifications/device';

  // ─── Returns ───────────────────────────────────────────
  static const String returns = '/returns';
  static String returnItem(String id) => '/returns/$id';

  // ─── Inventory ─────────────────────────────────────────
  static const String inventory = '/inventory';

  // ─── Analytics (Admin) ─────────────────────────────────
  static const String analytics = '/analytics';

  // ─── Banners ───────────────────────────────────────────
  static const String banners = '/banners';
}
