import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final user = auth.user;

    return Scaffold(
      backgroundColor: HopoColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(HopoDimens.pagePadding),
          child: Column(children: [
            const SizedBox(height: 12),
            // User header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(gradient: HopoColors.gradientRoyal, borderRadius: BorderRadius.circular(HopoDimens.radiusXl)),
              child: Row(children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: HopoColors.gold,
                  child: user?.avatar != null
                      ? ClipOval(child: Image.network(user!.avatar!, fit: BoxFit.cover, width: 60, height: 60))
                      : Text(user?.initials ?? '?', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white)),
                ),
                const SizedBox(width: 16),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(user?.displayName ?? 'Guest', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: HopoColors.primaryForeground)),
                  const SizedBox(height: 2),
                  Text(user?.email ?? user?.phone ?? 'Sign in to continue', style: TextStyle(fontSize: 13, color: HopoColors.primaryForeground.withValues(alpha: 0.7))),
                ])),
              ]),
            ),
            const SizedBox(height: 24),

            // Menu items
            _MenuSection(title: 'My Account', items: [
              _MenuItem(icon: Icons.receipt_long_outlined, label: 'My Orders', onTap: () => context.push('/orders')),
              _MenuItem(icon: Icons.location_on_outlined, label: 'Addresses', onTap: () => context.push('/addresses')),
              _MenuItem(icon: Icons.favorite_border_rounded, label: 'Wishlist', onTap: () => context.go('/wishlist')),
              _MenuItem(icon: Icons.star_outline_rounded, label: 'Rewards', onTap: () => context.push('/rewards')),
              _MenuItem(icon: Icons.confirmation_num_outlined, label: 'Coupons', onTap: () => context.push('/coupons')),
            ]),
            const SizedBox(height: 16),

            _MenuSection(title: 'Settings', items: [
              _MenuItem(icon: Icons.notifications_none_rounded, label: 'Notifications', onTap: () => context.push('/notification-preferences')),
              _MenuItem(icon: Icons.help_outline_rounded, label: 'Help & Support', onTap: () => context.push('/support')),
              _MenuItem(icon: Icons.info_outline_rounded, label: 'About HOPO SHOP', onTap: () => context.push('/about-brand')),
              _MenuItem(icon: Icons.description_outlined, label: 'FAQ', onTap: () => context.push('/faq')),
            ]),
            const SizedBox(height: 16),

            if (auth.isLoggedIn) ...[
              HopoButton(label: 'Sign Out', outlined: true, icon: Icons.logout_rounded, onPressed: () async {
                await ref.read(authProvider.notifier).logout();
                if (context.mounted) context.go('/login');
              }),
            ] else
              HopoButton(label: 'Sign In', onPressed: () => context.go('/login')),

            const SizedBox(height: 24),
            Text('HOPO SHOP v1.0.0', style: TextStyle(fontSize: 11, color: HopoColors.mutedForeground)),
            const SizedBox(height: 16),
          ]),
        ),
      ),
    );
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;
  const _MenuSection({required this.title, required this.items});
  @override
  Widget build(BuildContext context) => Container(
    decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6)]),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Padding(padding: const EdgeInsets.fromLTRB(16, 16, 16, 8), child: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: HopoColors.mutedForeground))),
      ...items,
    ]),
  );
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    child: Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(children: [
        Icon(icon, size: 20, color: HopoColors.primary),
        const SizedBox(width: 14),
        Expanded(child: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: HopoColors.foreground))),
        const Icon(Icons.chevron_right_rounded, size: 18, color: HopoColors.mutedForeground),
      ]),
    ),
  );
}
