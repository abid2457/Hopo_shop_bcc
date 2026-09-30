import 'package:flutter/material.dart';
import '../../config/theme/colors.dart';
import '../../config/theme/dimensions.dart';

// ═══════════════════════════════════════════════════════════════
// HOPO SHOP BUTTON
// ═══════════════════════════════════════════════════════════════
class HopoButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool outlined;
  final IconData? icon;
  final double? width;

  const HopoButton({super.key, required this.label, this.onPressed, this.isLoading = false, this.outlined = false, this.icon, this.width});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width ?? double.infinity,
      height: HopoDimens.buttonHeight,
      child: outlined
          ? OutlinedButton(
              onPressed: isLoading ? null : onPressed,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: HopoColors.primary, width: 1.5),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(HopoDimens.radiusMd)),
              ),
              child: _buildChild(HopoColors.primary),
            )
          : ElevatedButton(
              onPressed: isLoading ? null : onPressed,
              style: ElevatedButton.styleFrom(
                backgroundColor: HopoColors.primary,
                foregroundColor: HopoColors.primaryForeground,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(HopoDimens.radiusMd)),
              ),
              child: _buildChild(HopoColors.primaryForeground),
            ),
    );
  }

  Widget _buildChild(Color color) {
    if (isLoading) {
      return SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: color));
    }
    if (icon != null) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [Icon(icon, size: 18), const SizedBox(width: 8), Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15))],
      );
    }
    return Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15));
  }
}

// ═══════════════════════════════════════════════════════════════
// HOPO SHOP APP BAR
// ═══════════════════════════════════════════════════════════════
class HopoAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final bool showBack;
  final List<Widget>? actions;
  final Widget? titleWidget;

  const HopoAppBar({super.key, this.title, this.showBack = true, this.actions, this.titleWidget});

  @override
  Size get preferredSize => const Size.fromHeight(HopoDimens.appBarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: HopoColors.background,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      leading: showBack
          ? IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: HopoColors.foreground),
              onPressed: () => Navigator.of(context).maybePop(),
            )
          : null,
      automaticallyImplyLeading: showBack,
      centerTitle: true,
      title: titleWidget ??
          (title != null
              ? Text(title!, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600, color: HopoColors.foreground, letterSpacing: 0.5))
              : null),
      actions: actions,
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// HOPO SHOP PRODUCT CARD
// ═══════════════════════════════════════════════════════════════
class HopoProductCard extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final double price;
  final double? compareAtPrice;
  final double rating;
  final int reviewCount;
  final VoidCallback? onTap;
  final VoidCallback? onWishlist;
  final bool isWishlisted;

  const HopoProductCard({
    super.key, this.imageUrl, required this.name, required this.price,
    this.compareAtPrice, this.rating = 0, this.reviewCount = 0,
    this.onTap, this.onWishlist, this.isWishlisted = false,
  });

  int get _discountPercent => compareAtPrice != null && compareAtPrice! > 0 ? ((1 - price / compareAtPrice!) * 100).round() : 0;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: HopoColors.card,
          borderRadius: BorderRadius.circular(HopoDimens.productCardRadius),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            AspectRatio(
              aspectRatio: 3 / 4,
              child: Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: HopoColors.muted,
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(HopoDimens.productCardRadius)),
                    ),
                    child: imageUrl != null
                        ? ClipRRect(
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(HopoDimens.productCardRadius)),
                            child: Image.network(imageUrl!, fit: BoxFit.cover, width: double.infinity, height: double.infinity,
                              errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.image_outlined, color: HopoColors.mutedForeground, size: 32))),
                          )
                        : const Center(child: Icon(Icons.image_outlined, color: HopoColors.mutedForeground, size: 32)),
                  ),
                  // Discount badge
                  if (_discountPercent > 0)
                    Positioned(
                      top: 8, left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: HopoColors.destructive, borderRadius: BorderRadius.circular(HopoDimens.radiusSm)),
                        child: Text('$_discountPercent% OFF', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  // Wishlist button
                  if (onWishlist != null)
                    Positioned(
                      top: 8, right: 8,
                      child: GestureDetector(
                        onTap: onWishlist,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.9), shape: BoxShape.circle),
                          child: Icon(isWishlisted ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                            size: 18, color: isWishlisted ? HopoColors.destructive : HopoColors.mutedForeground),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, maxLines: 2, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: HopoColors.foreground, height: 1.3)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text('₹${price.toStringAsFixed(0)}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: HopoColors.primary)),
                      if (compareAtPrice != null) ...[
                        const SizedBox(width: 6),
                        Text('₹${compareAtPrice!.toStringAsFixed(0)}',
                          style: const TextStyle(fontSize: 12, color: HopoColors.mutedForeground, decoration: TextDecoration.lineThrough)),
                      ],
                    ],
                  ),
                  if (rating > 0) ...[
                    const SizedBox(height: 4),
                    HopoRatingStars(rating: rating, reviewCount: reviewCount, size: 12),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// HOPO SHOP RATING STARS
// ═══════════════════════════════════════════════════════════════
class HopoRatingStars extends StatelessWidget {
  final double rating;
  final int reviewCount;
  final double size;

  const HopoRatingStars({super.key, required this.rating, this.reviewCount = 0, this.size = 14});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(5, (i) {
          final starValue = i + 1;
          return Icon(
            starValue <= rating ? Icons.star_rounded : (starValue - 0.5 <= rating ? Icons.star_half_rounded : Icons.star_border_rounded),
            size: size, color: HopoColors.gold,
          );
        }),
        if (reviewCount > 0) ...[
          const SizedBox(width: 4),
          Text('($reviewCount)', style: TextStyle(fontSize: size - 2, color: HopoColors.mutedForeground)),
        ],
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// HOPO SHOP PRICE TAG
// ═══════════════════════════════════════════════════════════════
class HopoPriceTag extends StatelessWidget {
  final double price;
  final double? compareAtPrice;
  final double fontSize;

  const HopoPriceTag({super.key, required this.price, this.compareAtPrice, this.fontSize = 16});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text('₹${price.toStringAsFixed(0)}', style: TextStyle(fontSize: fontSize, fontWeight: FontWeight.w700, color: HopoColors.primary)),
        if (compareAtPrice != null && compareAtPrice! > price) ...[
          const SizedBox(width: 8),
          Text('₹${compareAtPrice!.toStringAsFixed(0)}',
            style: TextStyle(fontSize: fontSize - 3, color: HopoColors.mutedForeground, decoration: TextDecoration.lineThrough)),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(color: HopoColors.success.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
            child: Text('${((1 - price / compareAtPrice!) * 100).round()}% off',
              style: TextStyle(fontSize: fontSize - 5, fontWeight: FontWeight.w600, color: HopoColors.success)),
          ),
        ],
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// HOPO SHOP EMPTY STATE
// ═══════════════════════════════════════════════════════════════
class HopoEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String? buttonLabel;
  final VoidCallback? onAction;

  const HopoEmptyState({super.key, required this.icon, required this.title, required this.subtitle, this.buttonLabel, this.onAction});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: HopoColors.primarySoft, shape: BoxShape.circle),
              child: Icon(icon, size: 40, color: HopoColors.primary),
            ),
            const SizedBox(height: 20),
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: HopoColors.foreground), textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(subtitle, style: const TextStyle(fontSize: 14, color: HopoColors.mutedForeground, height: 1.4), textAlign: TextAlign.center),
            if (buttonLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              HopoButton(label: buttonLabel!, onPressed: onAction, width: 200),
            ],
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// HOPO SHOP LOADING
// ═══════════════════════════════════════════════════════════════
class HopoLoadingIndicator extends StatelessWidget {
  final String? message;
  const HopoLoadingIndicator({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(width: 28, height: 28, child: CircularProgressIndicator(strokeWidth: 2.5, color: HopoColors.primary)),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(message!, style: const TextStyle(fontSize: 14, color: HopoColors.mutedForeground)),
          ],
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// HOPO SHOP BADGE
// ═══════════════════════════════════════════════════════════════
class HopoBadge extends StatelessWidget {
  final String label;
  final Color? color;
  final Color? textColor;

  const HopoBadge({super.key, required this.label, this.color, this.textColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color ?? HopoColors.primarySoft, borderRadius: BorderRadius.circular(HopoDimens.radiusFull)),
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: textColor ?? HopoColors.primary)),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// HOPO SHOP SEARCH BAR
// ═══════════════════════════════════════════════════════════════
class HopoSearchBar extends StatelessWidget {
  final String hint;
  final VoidCallback? onTap;
  final ValueChanged<String>? onChanged;
  final TextEditingController? controller;
  final bool readOnly;
  final bool autofocus;

  const HopoSearchBar({super.key, this.hint = 'Search for products...', this.onTap, this.onChanged, this.controller, this.readOnly = false, this.autofocus = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: readOnly ? onTap : null,
      child: Container(
        height: HopoDimens.inputHeight,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: HopoColors.muted,
          borderRadius: BorderRadius.circular(HopoDimens.radiusLg),
        ),
        child: Row(
          children: [
            const Icon(Icons.search_rounded, size: 20, color: HopoColors.mutedForeground),
            const SizedBox(width: 12),
            Expanded(
              child: readOnly
                  ? Text(hint, style: const TextStyle(fontSize: 14, color: HopoColors.mutedForeground))
                  : TextField(
                      controller: controller,
                      onChanged: onChanged,
                      autofocus: autofocus,
                      style: const TextStyle(fontSize: 14, color: HopoColors.foreground),
                      decoration: InputDecoration(hintText: hint, border: InputBorder.none, hintStyle: const TextStyle(color: HopoColors.mutedForeground)),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// HOPO SHOP SECTION HEADER
// ═══════════════════════════════════════════════════════════════
class HopoSectionHeader extends StatelessWidget {
  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  const HopoSectionHeader({super.key, required this.title, this.actionLabel, this.onAction});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: HopoDimens.pagePadding),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: HopoColors.foreground, letterSpacing: -0.3)),
          if (actionLabel != null)
            GestureDetector(
              onTap: onAction,
              child: Text(actionLabel!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: HopoColors.primary)),
            ),
        ],
      ),
    );
  }
}
