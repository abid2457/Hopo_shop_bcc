import 'package:flutter/material.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';

class SupportScreen extends StatelessWidget {
  const SupportScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: const HopoAppBar(title: 'Help & Support'),
      body: SingleChildScrollView(padding: const EdgeInsets.all(HopoDimens.pagePadding), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: double.infinity, padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(gradient: HopoColors.gradientRoyal, borderRadius: BorderRadius.circular(HopoDimens.radiusXl)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('How can we help?', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: HopoColors.primaryForeground)),
            const SizedBox(height: 8),
            Text('Our team is here to assist you.', style: TextStyle(fontSize: 14, color: HopoColors.primaryForeground.withValues(alpha: 0.7))),
          ]),
        ),
        const SizedBox(height: 24),
        _SupportCard(icon: Icons.chat_outlined, title: 'Live Chat', subtitle: 'Chat with our support team', onTap: () {}),
        _SupportCard(icon: Icons.email_outlined, title: 'Email Us', subtitle: 'support@HOPO SHOP.com', onTap: () {}),
        _SupportCard(icon: Icons.phone_outlined, title: 'Call Us', subtitle: '+91 1800-HOPO SHOP-HELP', onTap: () {}),
        _SupportCard(icon: Icons.help_outline_rounded, title: 'FAQ', subtitle: 'Browse common questions', onTap: () {}),
        const SizedBox(height: 24),
        const Text('Common Topics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Wrap(spacing: 8, runSpacing: 8, children: ['Order Issues', 'Returns', 'Payment', 'Delivery', 'Account', 'Size Guide'].map((t) =>
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusFull), border: Border.all(color: HopoColors.border)),
            child: Text(t, style: const TextStyle(fontSize: 13)),
          ),
        ).toList()),
      ])),
    );
  }
}

class _SupportCard extends StatelessWidget {
  final IconData icon; final String title, subtitle; final VoidCallback onTap;
  const _SupportCard({required this.icon, required this.title, required this.subtitle, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(onTap: onTap, child: Container(
    margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd)),
    child: Row(children: [
      Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: HopoColors.primarySoft, borderRadius: BorderRadius.circular(10)), child: Icon(icon, size: 20, color: HopoColors.primary)),
      const SizedBox(width: 14),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        Text(subtitle, style: const TextStyle(fontSize: 12, color: HopoColors.mutedForeground)),
      ])),
      const Icon(Icons.chevron_right_rounded, size: 18, color: HopoColors.mutedForeground),
    ]),
  ));
}
