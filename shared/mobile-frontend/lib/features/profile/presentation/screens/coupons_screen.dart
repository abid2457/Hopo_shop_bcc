import 'package:flutter/material.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';

class CouponsScreen extends StatelessWidget {
  const CouponsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: const HopoAppBar(title: 'Coupons'),
      body: ListView(padding: const EdgeInsets.all(HopoDimens.pagePadding), children: [
        _CouponCard(code: 'WELCOME20', title: '20% off your first order', description: 'Min order ₹999. Max discount ₹500.', expiresIn: '7 days'),
        _CouponCard(code: 'FESTIVE15', title: '15% off on ethnic wear', description: 'Min order ₹1,499.', expiresIn: '30 days'),
        _CouponCard(code: 'FREESHIP', title: 'Free shipping on all orders', description: 'No minimum order value.', expiresIn: '15 days'),
      ]),
    );
  }
}

class _CouponCard extends StatelessWidget {
  final String code, title, description, expiresIn;
  const _CouponCard({required this.code, required this.title, required this.description, required this.expiresIn});
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 12), 
    decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd), border: Border.all(color: HopoColors.border)),
    child: Column(children: [
      Container(
        width: double.infinity, padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: HopoColors.primarySoft.withValues(alpha: 0.5), borderRadius: const BorderRadius.vertical(top: Radius.circular(HopoDimens.radiusMd))),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(code, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: HopoColors.primary, letterSpacing: 2)),
          Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: HopoColors.primary, borderRadius: BorderRadius.circular(HopoDimens.radiusFull)),
            child: const Text('COPY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white))),
        ]),
      ),
      Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        const SizedBox(height: 4),
        Text(description, style: const TextStyle(fontSize: 12, color: HopoColors.mutedForeground)),
        const SizedBox(height: 8),
        Text('Expires in $expiresIn', style: const TextStyle(fontSize: 11, color: HopoColors.gold, fontWeight: FontWeight.w500)),
      ])),
    ]),
  );
}
