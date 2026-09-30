import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class OrderDetailScreen extends ConsumerStatefulWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});
  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen> {
  Order? _order;
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final o = await ref.read(apiServiceProvider).getOrderById(widget.orderId);
      if (mounted) setState(() { _order = o; _isLoading = false; });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: HopoLoadingIndicator());
    if (_order == null) return const Scaffold(body: HopoEmptyState(icon: Icons.error_outline, title: 'Order Not Found', subtitle: 'This order may not exist.'));
    final o = _order!;

    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: HopoAppBar(title: '#${o.orderNumber}'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(HopoDimens.pagePadding),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Status card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(gradient: HopoColors.gradientRoyal, borderRadius: BorderRadius.circular(HopoDimens.radiusLg)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Order ${o.status.replaceAll('_', ' ')}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: HopoColors.primaryForeground)),
              const SizedBox(height: 4),
              Text('Placed on ${o.createdAt.day}/${o.createdAt.month}/${o.createdAt.year}', style: TextStyle(fontSize: 13, color: HopoColors.primaryForeground.withValues(alpha: 0.7))),
            ]),
          ),
          const SizedBox(height: 20),

          // Tracking timeline
          if (o.statusLogs.isNotEmpty) ...[
            const Text('Order Timeline', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            ...o.statusLogs.asMap().entries.map((e) {
              final log = e.value;
              final isLast = e.key == o.statusLogs.length - 1;
              return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Column(children: [
                  Container(width: 12, height: 12, decoration: BoxDecoration(color: isLast ? HopoColors.primary : HopoColors.border, shape: BoxShape.circle)),
                  if (!isLast) Container(width: 2, height: 40, color: HopoColors.border),
                ]),
                const SizedBox(width: 12),
                Expanded(child: Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(log.status.replaceAll('_', ' '), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: isLast ? HopoColors.primary : HopoColors.foreground)),
                    Text('${log.createdAt.day}/${log.createdAt.month}/${log.createdAt.year}', style: const TextStyle(fontSize: 12, color: HopoColors.mutedForeground)),
                    if (log.note != null) Text(log.note!, style: const TextStyle(fontSize: 12, color: HopoColors.mutedForeground)),
                  ]),
                )),
              ]);
            }),
            const SizedBox(height: 8),
          ],

          // Items
          const Text('Items', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          ...o.items.map((item) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusSm)),
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(item.productName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                if (item.variantInfo != null) Text(item.variantInfo!, style: const TextStyle(fontSize: 12, color: HopoColors.mutedForeground)),
                Text('Qty: ${item.quantity}', style: const TextStyle(fontSize: 12, color: HopoColors.mutedForeground)),
              ])),
              Text('₹${item.totalPrice.toStringAsFixed(0)}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: HopoColors.primary)),
            ]),
          )),

          const SizedBox(height: 16),
          // Price summary
          Container(
            padding: const EdgeInsets.all(HopoDimens.cardPadding),
            decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd)),
            child: Column(children: [
              _Row('Subtotal', '₹${o.subtotal.toStringAsFixed(0)}'),
              _Row('Shipping', '₹${o.shippingCharge.toStringAsFixed(0)}'),
              _Row('Tax', '₹${o.taxAmount.toStringAsFixed(0)}'),
              if (o.discount > 0) _Row('Discount', '-₹${o.discount.toStringAsFixed(0)}'),
              const Divider(color: HopoColors.border),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                Text('₹${o.totalAmount.toStringAsFixed(0)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: HopoColors.primary)),
              ]),
            ]),
          ),

          if (o.address != null) ...[
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(HopoDimens.cardPadding),
              decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd)),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Delivery Address', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Text('${o.address!.fullName}\n${o.address!.addressLine1}\n${o.address!.city}, ${o.address!.state} - ${o.address!.pincode}',
                  style: const TextStyle(fontSize: 13, color: HopoColors.mutedForeground, height: 1.5)),
              ]),
            ),
          ],
          const SizedBox(height: 40),
        ]),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String l, v;
  const _Row(this.l, this.v);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 3),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(l, style: const TextStyle(fontSize: 13, color: HopoColors.mutedForeground)),
      Text(v, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
    ]),
  );
}
