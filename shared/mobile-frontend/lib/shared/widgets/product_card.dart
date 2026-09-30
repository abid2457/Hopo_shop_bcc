import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../config/theme/colors.dart';
import '../../config/theme/text_styles.dart';
import '../../config/theme/dimensions.dart';
import 'price_tag.dart';

/// Product card matching the web prototype's ProductCard component.
/// Displays image, brand, title, price, rating, and optional tag.
class ProductCard extends StatelessWidget {
  final String id;
  final String brand;
  final String title;
  final double price;
  final double mrp;
  final double rating;
  final int reviews;
  final String imageUrl;
  final String? tag;
  final double? width;

  const ProductCard({
    super.key,
    required this.id,
    required this.brand,
    required this.title,
    required this.price,
    required this.mrp,
    required this.rating,
    required this.reviews,
    required this.imageUrl,
    this.tag,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/product/$id'),
      child: SizedBox(
        width: width,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ─── Image ─────────────────────────────────────
            AspectRatio(
              aspectRatio: 3 / 4,
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(HopoDimens.productCardRadius),
                    child: CachedNetworkImage(
                      imageUrl: imageUrl,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                      placeholder: (_, _) => Container(color: HopoColors.muted),
                      errorWidget: (_, _, _) => Container(
                        color: HopoColors.muted,
                        child: const Icon(LucideIcons.image, color: HopoColors.mutedForeground),
                      ),
                    ),
                  ),
                  // Tag badge
                  if (tag != null)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: HopoColors.primary,
                          borderRadius: BorderRadius.circular(HopoDimens.radiusFull),
                        ),
                        child: Text(
                          tag!,
                          style: LuxeTextStyles.labelSmall.copyWith(
                            color: HopoColors.primaryForeground,
                            fontSize: 9,
                          ),
                        ),
                      ),
                    ),
                  // Wishlist button
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: HopoColors.card.withValues(alpha: 0.9),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        LucideIcons.heart,
                        size: 16,
                        color: HopoColors.foreground,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // ─── Brand ─────────────────────────────────────
            Text(
              brand.toUpperCase(),
              style: LuxeTextStyles.labelSmall.copyWith(
                color: HopoColors.primary,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),

            // ─── Title ─────────────────────────────────────
            Text(
              title,
              style: LuxeTextStyles.bodySmall.copyWith(
                color: HopoColors.foreground,
                height: 1.3,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),

            // ─── Price ─────────────────────────────────────
            PriceTag(price: price, mrp: mrp),
            const SizedBox(height: 4),

            // ─── Rating ────────────────────────────────────
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: HopoColors.success.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.star, size: 10, color: HopoColors.success),
                      const SizedBox(width: 2),
                      Text(
                        rating.toString(),
                        style: LuxeTextStyles.labelSmall.copyWith(
                          color: HopoColors.success,
                          fontWeight: FontWeight.w700,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  '($reviews)',
                  style: LuxeTextStyles.labelSmall.copyWith(
                    color: HopoColors.mutedForeground,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
