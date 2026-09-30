import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/models.dart';
import '../../../core/providers/core_providers.dart';

/// Orders list state
class OrdersState {
  final List<Order> orders;
  final bool isLoading;
  final String? error;
  const OrdersState({this.orders = const [], this.isLoading = false, this.error});
}

class OrdersNotifier extends Notifier<OrdersState> {
  @override
  OrdersState build() => const OrdersState();

  Future<void> fetchOrders({bool refresh = false}) async {
    if (state.isLoading) return;
    state = OrdersState(orders: refresh ? [] : state.orders, isLoading: true);
    try {
      final api = ref.read(apiServiceProvider);
      final orders = await api.getOrders();
      state = OrdersState(orders: orders);
    } catch (e) {
      debugPrint('[Orders] Fetch failed: $e');
      state = OrdersState(orders: state.orders, error: e.toString());
    }
  }

  Future<void> cancelOrder(String orderId, String reason) async {
    try {
      final api = ref.read(apiServiceProvider);
      await api.cancelOrder(orderId, reason);
      await fetchOrders(refresh: true);
    } catch (e) {
      debugPrint('[Orders] Cancel failed: $e');
    }
  }
}

final ordersProvider = NotifierProvider<OrdersNotifier, OrdersState>(OrdersNotifier.new);

/// Single order detail
final orderDetailProvider = FutureProvider.family<Order, String>((ref, id) async {
  final api = ref.read(apiServiceProvider);
  return api.getOrderById(id);
});
