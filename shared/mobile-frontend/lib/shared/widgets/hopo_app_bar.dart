import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme/colors.dart';
import '../../config/theme/text_styles.dart';

/// Reusable app header that matches the HOPO SHOP header from the web prototype.
/// Shows logo on main pages, back button on sub-pages.
class HopoAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final bool showBack;
  final bool showSearch;
  final bool showNotification;
  final List<Widget>? actions;

  const HopoAppBar({
    super.key,
    this.title,
    this.showBack = false,
    this.showSearch = true,
    this.showNotification = true,
    this.actions,
  });

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: showBack
          ? IconButton(
              onPressed: () => context.pop(),
              icon: const Icon(LucideIcons.chevronLeft, size: 22),
            )
          : null,
      automaticallyImplyLeading: false,
      title: showBack && title != null
          ? Text(title!, style: LuxeTextStyles.headlineSmall)
          : showBack
              ? null
              : _buildLogo(),
      actions: actions ??
          [
            if (showSearch)
              IconButton(
                onPressed: () => context.push('/search'),
                icon: const Icon(LucideIcons.search, size: 22),
              ),
            if (showNotification)
              Stack(
                children: [
                  IconButton(
                    onPressed: () => context.push('/notifications'),
                    icon: const Icon(LucideIcons.bell, size: 22),
                  ),
                  Positioned(
                    right: 10,
                    top: 10,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: HopoColors.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ),
          ],
    );
  }

  Widget _buildLogo() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(
          'HOPO SHOP',
          style: LuxeTextStyles.headlineLarge.copyWith(color: HopoColors.primary),
        ),
        const SizedBox(width: 6),
        Text(
          'INDIA',
          style: LuxeTextStyles.eyebrow.copyWith(color: HopoColors.gold),
        ),
      ],
    );
  }
}
