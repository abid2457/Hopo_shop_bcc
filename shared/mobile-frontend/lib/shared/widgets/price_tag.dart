import 'package:flutter/material.dart';
import '../../config/theme/colors.dart';
import '../../config/theme/text_styles.dart';

/// Price display with current price, MRP strikethrough, and discount percentage.
/// Matches the PriceTag component from the web prototype.
class PriceTag extends StatelessWidget {
  final double price;
  final double? mrp;
  final TextStyle? priceStyle;

  const PriceTag({
    super.key,
    required this.price,
    this.mrp,
    this.priceStyle,
  });

  @override
  Widget build(BuildContext context) {
    final discount = mrp != null && mrp! > price
        ? ((mrp! - price) / mrp! * 100).round()
        : 0;

    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 6,
      children: [
        Text(
          '₹${_formatPrice(price)}',
          style: priceStyle ??
              LuxeTextStyles.titleSmall.copyWith(
                color: HopoColors.foreground,
                fontWeight: FontWeight.w700,
              ),
        ),
        if (mrp != null && mrp! > price) ...[
          Text(
            '₹${_formatPrice(mrp!)}',
            style: LuxeTextStyles.bodySmall.copyWith(
              color: HopoColors.mutedForeground,
              decoration: TextDecoration.lineThrough,
            ),
          ),
          Text(
            '($discount% off)',
            style: LuxeTextStyles.bodySmall.copyWith(
              color: HopoColors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ],
    );
  }

  String _formatPrice(double value) {
    if (value >= 100000) {
      return '${(value / 100000).toStringAsFixed(1)}L';
    }
    // Indian number format
    final str = value.toInt().toString();
    if (str.length <= 3) return str;
    final last3 = str.substring(str.length - 3);
    final remaining = str.substring(0, str.length - 3);
    final formatted = remaining.replaceAllMapped(
      RegExp(r'(\d)(?=(\d{2})+$)'),
      (match) => '${match[1]},',
    );
    return '$formatted,$last3';
  }
}
