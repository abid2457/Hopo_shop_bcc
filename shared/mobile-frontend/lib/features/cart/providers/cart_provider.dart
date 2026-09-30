import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/models.dart';
import '../../../core/providers/core_providers.dart';

/// Cart state management
class CartState {
  final CartSummary summary;
  final bool isLoading;
  final String? error;

  const CartState({this.summary = const CartSummary(), this.isLoading = false, this.error});

  List<CartItem> get items => summary.items;
  int get itemCount => summary.itemCount;
  double get subtotal => summary.subtotal;
  double get shippingCharge => summary.shippingCharge;
  double get total => summary.total;
}

class CartNotifier extends Notifier<CartState> {
  @override
  CartState build() => const CartState();

  Future<void> fetchCart() async {
    state = CartState(summary: state.summary, isLoading: true);
    try {
      final api = ref.read(apiServiceProvider);
      final summary = await api.getCart();
      state = CartState(summary: summary);
    } catch (e) {
      debugPrint('[Cart] Fetch failed: $e');
      state = CartState(summary: state.summary, error: e.toString());
    }
  }

  Future<void> addItem(String variantId, {int quantity = 1}) async {
    try {
      final api = ref.read(apiServiceProvider);
      await api.addToCart(variantId, quantity: quantity);
      await fetchCart();
    } catch (e) {
      debugPrint('[Cart] Add failed: $e');
      state = CartState(summary: state.summary, error: e.toString());
    }
  }

  Future<void> updateQuantity(String itemId, int quantity) async {
    try {
      final api = ref.read(apiServiceProvider);
      if (quantity <= 0) {
        await api.removeFromCart(itemId);
      } else {
        await api.updateCartQuantity(itemId, quantity);
      }
      await fetchCart();
    } catch (e) {
      debugPrint('[Cart] Update failed: $e');
    }
  }

  Future<void> removeItem(String itemId) async {
    try {
      final api = ref.read(apiServiceProvider);
      await api.removeFromCart(itemId);
      await fetchCart();
    } catch (e) {
      debugPrint('[Cart] Remove failed: $e');
    }
  }

  Future<void> clearCart() async {
    try {
      final api = ref.read(apiServiceProvider);
      await api.clearCart();
      state = const CartState();
    } catch (e) {
      debugPrint('[Cart] Clear failed: $e');
    }
  }
}

final cartProvider = NotifierProvider<CartNotifier, CartState>(CartNotifier.new);
