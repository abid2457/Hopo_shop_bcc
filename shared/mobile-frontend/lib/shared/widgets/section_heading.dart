import 'package:flutter/material.dart';
import '../../config/theme/colors.dart';
import '../../config/theme/text_styles.dart';

/// Section heading with optional eyebrow label and action button.
/// Matches the SectionHeading component from the web prototype.
class SectionHeading extends StatelessWidget {
  final String? eyebrow;
  final String title;
  final String? action;
  final VoidCallback? onAction;

  const SectionHeading({
    super.key,
    this.eyebrow,
    required this.title,
    this.action,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (eyebrow != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Text(
                      eyebrow!.toUpperCase(),
                      style: LuxeTextStyles.eyebrow.copyWith(color: HopoColors.gold),
                    ),
                  ),
                Text(
                  title,
                  style: LuxeTextStyles.headlineMedium.copyWith(color: HopoColors.foreground),
                ),
              ],
            ),
          ),
          if (action != null)
            GestureDetector(
              onTap: onAction,
              child: Text(
                action!.toUpperCase(),
                style: LuxeTextStyles.labelSmall.copyWith(
                  color: HopoColors.primary,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.0,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
