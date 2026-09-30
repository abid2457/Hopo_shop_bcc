import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});
  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  List<Order> _orders = [];
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final orders = await ref.read(apiServiceProvider).getOrders();
      if (mounted) setState(() { _orders = orders; _isLoading = false; });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  Color _statusColor(String s) => switch (s.toUpperCase()) {
    'DELIVERED' => HopoColors.success,
    'CANCELLED' => HopoColors.destructive,
    'SHIPPED' || 'IN_TRANSIT' => HopoColors.gold,
    _ => HopoColors.primary,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: const HopoAppBar(title: 'My Orders'),
      body: _isLoading
          ? const HopoLoadingIndicator()
          : _orders.isEmpty
              ? HopoEmptyState(icon: Icons.receipt_long_outlined, title: 'No Orders Yet', subtitle: 'Your order history will appear here.', buttonLabel: 'Start Shopping', onAction: () => context.go('/home'))
              : RefreshIndicator(
                  color: HopoColors.primary, onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(HopoDimens.pagePadding),
                    itemCount: _orders.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (_, i) {
                      final o = _orders[i];
                      return GestureDetector(
                        onTap: () => context.push('/order/${o.id}'),
                        child: Container(
                          padding: const EdgeInsets.all(HopoDimens.cardPadding),
                          decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6)]),
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              Text('#${o.orderNumber}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                              HopoBadge(label: o.status.replaceAll('_', ' '), color: _statusColor(o.status).withValues(alpha: 0.15), textColor: _statusColor(o.status)),
                            ]),
                            const SizedBox(height: 8),
                            Text('${o.items.length} item${o.items.length > 1 ? 's' : ''} · ₹${o.totalAmount.toStringAsFixed(0)}', style: const TextStyle(fontSize: 13, color: HopoColors.mutedForeground)),
                            const SizedBox(height: 4),
                            Text('Placed on ${_formatDate(o.createdAt)}', style: const TextStyle(fontSize: 12, color: HopoColors.mutedForeground)),
                          ]),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  String _formatDate(DateTime d) => '${d.day}/${d.month}/${d.year}';
}
