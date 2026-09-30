import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/presentation/screens/splash_screen.dart';
import '../features/auth/presentation/screens/onboarding_screen.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/home/presentation/screens/home_screen.dart';
import '../features/home/presentation/screens/discover_screen.dart';
import '../features/products/presentation/screens/categories_screen.dart';
import '../features/products/presentation/screens/listing_screen.dart';
import '../features/products/presentation/screens/product_detail_screen.dart';
import '../features/search/presentation/screens/search_screen.dart';
import '../features/cart/presentation/screens/cart_screen.dart';
import '../features/wishlist/presentation/screens/wishlist_screen.dart';
import '../features/checkout/presentation/screens/checkout_screen.dart';
import '../features/orders/presentation/screens/orders_screen.dart';
import '../features/orders/presentation/screens/order_detail_screen.dart';
import '../features/profile/presentation/screens/profile_screen.dart';
import '../features/profile/presentation/screens/addresses_screen.dart';
import '../features/profile/presentation/screens/rewards_screen.dart';
import '../features/profile/presentation/screens/coupons_screen.dart';
import '../features/profile/presentation/screens/support_screen.dart';
import '../features/profile/presentation/screens/faq_screen.dart';
import '../features/notifications/presentation/screens/notifications_screen.dart';
import '../shared/widgets/bottom_nav_scaffold.dart';

/// HOPO SHOP GoRouter configuration.
/// Bottom nav pages use ShellRoute for persistent navigation bar.
final GoRouter appRouter = GoRouter(
  initialLocation: '/splash',
  routes: [
    // ─── Pre-Auth ────────────────────────────────────────
    GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/onboarding', builder: (_, __) => const OnboardingScreen()),
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),

    // ─── Main App (with Bottom Nav) ──────────────────────
    ShellRoute(
      builder: (_, __, child) => BottomNavScaffold(child: child),
      routes: [
        GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
        GoRoute(path: '/discover', builder: (_, __) => const DiscoverScreen()),
        GoRoute(path: '/wishlist', builder: (_, __) => const WishlistScreen()),
        GoRoute(path: '/cart', builder: (_, __) => const CartScreen()),
        GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      ],
    ),

    // ─── Product & Category ──────────────────────────────
    GoRoute(path: '/categories', builder: (_, __) => const CategoriesScreen()),
    GoRoute(path: '/listing', builder: (_, __) => const ListingScreen()),
    GoRoute(path: '/product/:id', builder: (_, state) => ProductDetailScreen(productId: state.pathParameters['id'] ?? '')),
    GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),

    // ─── Checkout & Orders ───────────────────────────────
    GoRoute(path: '/checkout', builder: (_, __) => const CheckoutScreen()),
    GoRoute(path: '/orders', builder: (_, __) => const OrdersScreen()),
    GoRoute(path: '/order/:id', builder: (_, state) => OrderDetailScreen(orderId: state.pathParameters['id'] ?? '')),

    // ─── Profile Sub-pages ───────────────────────────────
    GoRoute(path: '/addresses', builder: (_, __) => const AddressesScreen()),
    GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
    GoRoute(path: '/rewards', builder: (_, __) => const RewardsScreen()),
    GoRoute(path: '/coupons', builder: (_, __) => const CouponsScreen()),

    // ─── Content Pages ───────────────────────────────────
    GoRoute(path: '/support', builder: (_, __) => const SupportScreen()),
    GoRoute(path: '/faq', builder: (_, __) => const FaqScreen()),
  ],
);
