import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme/colors.dart';
import '../../config/theme/dimensions.dart';

/// Persistent bottom navigation bar scaffold for main app tabs.
class BottomNavScaffold extends StatelessWidget {
  final Widget child;
  const BottomNavScaffold({super.key, required this.child});

  static const _tabs = [
    _NavTab(label: 'Home', icon: Icons.home_outlined, activeIcon: Icons.home_rounded, path: '/home'),
    _NavTab(label: 'Discover', icon: Icons.explore_outlined, activeIcon: Icons.explore_rounded, path: '/discover'),
    _NavTab(label: 'Wishlist', icon: Icons.favorite_border_rounded, activeIcon: Icons.favorite_rounded, path: '/wishlist'),
    _NavTab(label: 'Cart', icon: Icons.shopping_bag_outlined, activeIcon: Icons.shopping_bag_rounded, path: '/cart'),
    _NavTab(label: 'Profile', icon: Icons.person_outline_rounded, activeIcon: Icons.person_rounded, path: '/profile'),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    final idx = _tabs.indexWhere((t) => location.startsWith(t.path));
    return idx >= 0 ? idx : 0;
  }

  @override
  Widget build(BuildContext context) {
    final current = _currentIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: HopoColors.card,
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, -2)),
          ],
        ),
        child: SafeArea(
          child: SizedBox(
            height: HopoDimens.bottomNavHeight,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(_tabs.length, (i) {
                final tab = _tabs[i];
                final active = i == current;
                return Expanded(
                  child: InkWell(
                    onTap: () {
                      if (!active) context.go(tab.path);
                    },
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          decoration: BoxDecoration(
                            color: active ? HopoColors.primarySoft : Colors.transparent,
                            borderRadius: BorderRadius.circular(HopoDimens.radiusFull),
                          ),
                          child: Icon(
                            active ? tab.activeIcon : tab.icon,
                            size: 22,
                            color: active ? HopoColors.primary : HopoColors.mutedForeground,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          tab.label,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                            color: active ? HopoColors.primary : HopoColors.mutedForeground,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavTab {
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String path;
  const _NavTab({required this.label, required this.icon, required this.activeIcon, required this.path});
}
