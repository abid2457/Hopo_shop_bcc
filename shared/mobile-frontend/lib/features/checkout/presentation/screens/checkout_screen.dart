import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});
  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  List<Address> _addresses = [];
  String? _selectedAddressId;
  final _couponController = TextEditingController();
  Coupon? _appliedCoupon;
  bool _isPlacing = false;
  CartSummary? _cart;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final api = ref.read(apiServiceProvider);
      final results = await Future.wait([api.getAddresses(), api.getCart()]);
      if (mounted) setState(() {
        _addresses = results[0] as List<Address>;
        _cart = results[1] as CartSummary;
        _selectedAddressId = _addresses.where((a) => a.isDefault).firstOrNull?.id ?? _addresses.firstOrNull?.id;
      });
    } catch (_) {}
  }

  @override
  void dispose() { _couponController.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: const HopoAppBar(title: 'Checkout'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(HopoDimens.pagePadding),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Address section
          _SectionCard(
            title: 'Delivery Address',
            child: _addresses.isEmpty
                ? HopoButton(label: 'Add Address', outlined: true, onPressed: () => context.push('/address-edit'))
                : Column(children: _addresses.map((a) => RadioListTile<String>(
                    value: a.id, groupValue: _selectedAddressId, activeColor: HopoColors.primary,
                    title: Text(a.label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    subtitle: Text('${a.addressLine1}, ${a.city} - ${a.pincode}', style: const TextStyle(fontSize: 12, color: HopoColors.mutedForeground)),
                    onChanged: (v) => setState(() => _selectedAddressId = v),
                  )).toList()),
          ),
          const SizedBox(height: 16),

          // Coupon section
          _SectionCard(
            title: 'Apply Coupon',
            child: Row(children: [
              Expanded(child: TextField(
                controller: _couponController,
                style: const TextStyle(fontSize: 14),
                decoration: InputDecoration(hintText: 'Enter coupon code', border: OutlineInputBorder(borderRadius: BorderRadius.circular(HopoDimens.radiusMd), borderSide: const BorderSide(color: HopoColors.border)), contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14)),
              )),
              const SizedBox(width: 12),
              HopoButton(label: 'Apply', width: 80, onPressed: () async {
                try {
                  final c = await ref.read(apiServiceProvider).validateCoupon(_couponController.text);
                  setState(() => _appliedCoupon = c);
                } catch (_) {
                  if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invalid coupon'), backgroundColor: HopoColors.destructive, behavior: SnackBarBehavior.floating));
                }
              }),
            ]),
          ),
          if (_appliedCoupon != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: HopoColors.success.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(HopoDimens.radiusSm)),
              child: Row(children: [
                const Icon(Icons.check_circle_outline, size: 16, color: HopoColors.success),
                const SizedBox(width: 8),
                Text('${_appliedCoupon!.code} applied!', style: const TextStyle(fontSize: 13, color: HopoColors.success, fontWeight: FontWeight.w600)),
              ]),
            ),
          ],
          const SizedBox(height: 16),

          // Order summary
          if (_cart != null) _SectionCard(
            title: 'Order Summary',
            child: Column(children: [
              _SummaryRow('Subtotal', '₹${_cart!.subtotal.toStringAsFixed(0)}'),
              _SummaryRow('Shipping', _cart!.shippingCharge > 0 ? '₹${_cart!.shippingCharge.toStringAsFixed(0)}' : 'FREE'),
              if (_appliedCoupon != null) _SummaryRow('Coupon Discount', '-₹${_appliedCoupon!.value.toStringAsFixed(0)}', isDiscount: true),
              const Divider(color: HopoColors.border, height: 24),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                Text('₹${_cart!.total.toStringAsFixed(0)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: HopoColors.primary)),
              ]),
            ]),
          ),
        ]),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(HopoDimens.pagePadding),
        decoration: BoxDecoration(color: HopoColors.card, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 10, offset: const Offset(0, -2))]),
        child: SafeArea(child: HopoButton(
          label: 'Place Order', isLoading: _isPlacing,
          onPressed: _selectedAddressId != null ? () async {
            setState(() => _isPlacing = true);
            try {
              final order = await ref.read(apiServiceProvider).createOrder(addressId: _selectedAddressId!, couponId: _appliedCoupon?.id);
              if (mounted) context.go('/order/${order.id}');
            } catch (_) {
              if (mounted) { setState(() => _isPlacing = false); ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order failed'), backgroundColor: HopoColors.destructive)); }
            }
          } : null,
        )),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  const _SectionCard({required this.title, required this.child});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(HopoDimens.cardPadding),
    decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6)]),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: HopoColors.foreground)),
      const SizedBox(height: 12), child,
    ]),
  );
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isDiscount;
  const _SummaryRow(this.label, this.value, {this.isDiscount = false});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: const TextStyle(fontSize: 13, color: HopoColors.mutedForeground)),
      Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isDiscount ? HopoColors.success : HopoColors.foreground)),
    ]),
  );
}
