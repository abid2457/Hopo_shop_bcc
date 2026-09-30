import 'package:flutter/material.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';

class RewardsScreen extends StatelessWidget {
  const RewardsScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: const HopoAppBar(title: 'Rewards'),
      body: SingleChildScrollView(padding: const EdgeInsets.all(HopoDimens.pagePadding), child: Column(children: [
        // Points card
        Container(
          width: double.infinity, padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(gradient: HopoColors.gradientRoyal, borderRadius: BorderRadius.circular(HopoDimens.radiusXl)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Your Points', style: TextStyle(fontSize: 14, color: HopoColors.goldSoft)),
            const SizedBox(height: 8),
            Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
              const Icon(Icons.diamond_outlined, size: 28, color: HopoColors.gold),
              const SizedBox(width: 8),
              const Text('0', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: HopoColors.primaryForeground)),
              const SizedBox(width: 4),
              Padding(padding: const EdgeInsets.only(bottom: 6), child: Text('points', style: TextStyle(fontSize: 14, color: HopoColors.primaryForeground.withValues(alpha: 0.7)))),
            ]),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(HopoDimens.radiusFull)),
              child: const Text('Silver Tier', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: HopoColors.goldSoft)),
            ),
          ]),
        ),
        const SizedBox(height: 24),
        // How to earn
        const Align(alignment: Alignment.centerLeft, child: Text('How to Earn', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600))),
        const SizedBox(height: 12),
        _EarnCard(icon: Icons.shopping_bag_outlined, title: 'Shop & Earn', subtitle: 'Get 2 points per ₹100 spent'),
        _EarnCard(icon: Icons.rate_review_outlined, title: 'Write Reviews', subtitle: 'Earn 50 points per review'),
        _EarnCard(icon: Icons.share_outlined, title: 'Refer Friends', subtitle: 'Get 200 points per referral'),
      ])),
    );
  }
}

class _EarnCard extends StatelessWidget {
  final IconData icon; final String title, subtitle;
  const _EarnCard({required this.icon, required this.title, required this.subtitle});
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd)),
    child: Row(children: [
      Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: HopoColors.primarySoft, borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, size: 20, color: HopoColors.primary)),
      const SizedBox(width: 14),
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
        Text(subtitle, style: const TextStyle(fontSize: 12, color: HopoColors.mutedForeground)),
      ]),
    ]),
  );
}
