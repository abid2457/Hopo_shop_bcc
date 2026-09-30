import 'package:flutter/material.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';

class FaqScreen extends StatelessWidget {
  const FaqScreen({super.key});

  static const _faqs = [
    ('How do I track my order?', 'Go to My Orders and tap on the order to see real-time tracking updates.'),
    ('What is your return policy?', 'We offer 7-day easy returns on all products. Items must be unused with original tags attached.'),
    ('How do I apply a coupon?', 'Enter your coupon code at checkout in the "Apply Coupon" section.'),
    ('What payment methods do you accept?', 'We accept UPI, credit/debit cards, net banking, and Razorpay wallet.'),
    ('How long does delivery take?', 'Standard delivery takes 5-7 business days. Express delivery is available for select pincodes.'),
    ('How do I contact support?', 'You can reach us via live chat, email at support@HOPO SHOP.com, or call 1800-HOPO SHOP-HELP.'),
    ('Can I change my delivery address?', 'You can change the address before the order is shipped from the order details page.'),
    ('How do reward points work?', 'Earn 2 points per ₹100 spent. Points can be redeemed for discounts on future orders.'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: const HopoAppBar(title: 'FAQ'),
      body: ListView.separated(
        padding: const EdgeInsets.all(HopoDimens.pagePadding),
        itemCount: _faqs.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final (q, a) = _faqs[i];
          return Container(
            decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd)),
            child: ExpansionTile(
              tilePadding: const EdgeInsets.symmetric(horizontal: 16),
              childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              shape: const RoundedRectangleBorder(),
              title: Text(q, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: HopoColors.foreground)),
              iconColor: HopoColors.primary,
              children: [Text(a, style: const TextStyle(fontSize: 13, color: HopoColors.mutedForeground, height: 1.5))],
            ),
          );
        },
      ),
    );
  }
}
