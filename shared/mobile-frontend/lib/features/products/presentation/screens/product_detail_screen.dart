import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  final String productId;
  const ProductDetailScreen({super.key, required this.productId});
  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  Product? _product;
  bool _isLoading = true;
  String? _selectedColor;
  String? _selectedSize;
  int _imageIndex = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final p = await ref.read(apiServiceProvider).getProductById(widget.productId);
      if (mounted) setState(() { _product = p; _isLoading = false; });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  List<String> get _colors => _product?.variants.map((v) => v.color).whereType<String>().toSet().toList() ?? [];
  List<String> get _sizes => _product?.variants.map((v) => v.size).whereType<String>().toSet().toList() ?? [];

  ProductVariant? get _selectedVariant {
    if (_product == null) return null;
    return _product!.variants.where((v) =>
      (_selectedColor == null || v.color == _selectedColor) &&
      (_selectedSize == null || v.size == _selectedSize)
    ).firstOrNull;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: HopoLoadingIndicator());
    if (_product == null) return Scaffold(appBar: const HopoAppBar(), body: const HopoEmptyState(icon: Icons.error_outline, title: 'Product Not Found', subtitle: 'This product may have been removed.'));

    final p = _product!;
    final variant = _selectedVariant;
    final price = variant?.price ?? p.basePrice;
    final compareAt = variant?.compareAt ?? p.compareAtPrice;

    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: HopoAppBar(actions: [
        IconButton(icon: const Icon(Icons.share_outlined, size: 20), onPressed: () {}),
        IconButton(icon: const Icon(Icons.favorite_border_rounded, size: 20), onPressed: () {}),
      ]),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image carousel
            SizedBox(
              height: 400,
              child: PageView.builder(
                itemCount: p.images.isEmpty ? 1 : p.images.length,
                onPageChanged: (i) => setState(() => _imageIndex = i),
                itemBuilder: (_, i) => Container(
                  color: HopoColors.muted,
                  child: p.images.isNotEmpty
                      ? Image.network(p.images[i].url, fit: BoxFit.cover, width: double.infinity,
                          errorBuilder: (_, __, ___) => const Center(child: Icon(Icons.image_outlined, size: 48, color: HopoColors.mutedForeground)))
                      : const Center(child: Icon(Icons.image_outlined, size: 48, color: HopoColors.mutedForeground)),
                ),
              ),
            ),
            if (p.images.length > 1)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(p.images.length, (i) => AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: i == _imageIndex ? 20 : 6, height: 6,
                    decoration: BoxDecoration(color: i == _imageIndex ? HopoColors.primary : HopoColors.border, borderRadius: BorderRadius.circular(3)),
                  )),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(HopoDimens.pagePadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (p.categoryName != null) HopoBadge(label: p.categoryName!),
                  const SizedBox(height: 8),
                  Text(p.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: HopoColors.foreground, height: 1.3)),
                  const SizedBox(height: 8),
                  if (p.avgRating > 0) ...[HopoRatingStars(rating: p.avgRating, reviewCount: p.totalReviews), const SizedBox(height: 12)],
                  HopoPriceTag(price: price, compareAtPrice: compareAt, fontSize: 22),
                  const SizedBox(height: 20),

                  // Color selector
                  if (_colors.isNotEmpty) ...[
                    const Text('Color', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Wrap(spacing: 8, children: _colors.map((c) => GestureDetector(
                      onTap: () => setState(() => _selectedColor = c),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: _selectedColor == c ? HopoColors.primary : HopoColors.card,
                          borderRadius: BorderRadius.circular(HopoDimens.radiusMd),
                          border: Border.all(color: _selectedColor == c ? HopoColors.primary : HopoColors.border),
                        ),
                        child: Text(c, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: _selectedColor == c ? Colors.white : HopoColors.foreground)),
                      ),
                    )).toList()),
                    const SizedBox(height: 16),
                  ],

                  // Size selector
                  if (_sizes.isNotEmpty) ...[
                    const Text('Size', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Wrap(spacing: 8, children: _sizes.map((s) => GestureDetector(
                      onTap: () => setState(() => _selectedSize = s),
                      child: Container(
                        width: 48, height: 48,
                        decoration: BoxDecoration(
                          color: _selectedSize == s ? HopoColors.primary : HopoColors.card,
                          borderRadius: BorderRadius.circular(HopoDimens.radiusMd),
                          border: Border.all(color: _selectedSize == s ? HopoColors.primary : HopoColors.border),
                        ),
                        child: Center(child: Text(s, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: _selectedSize == s ? Colors.white : HopoColors.foreground))),
                      ),
                    )).toList()),
                    const SizedBox(height: 16),
                  ],

                  if (variant != null && variant.stock > 0)
                    Text('${variant.stock} in stock', style: const TextStyle(fontSize: 12, color: HopoColors.success, fontWeight: FontWeight.w500)),
                  if (variant != null && variant.stock == 0)
                    const Text('Out of Stock', style: TextStyle(fontSize: 12, color: HopoColors.destructive, fontWeight: FontWeight.w600)),

                  const SizedBox(height: 20),
                  const Divider(color: HopoColors.border),
                  const SizedBox(height: 16),
                  const Text('Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Text(p.description, style: const TextStyle(fontSize: 14, color: HopoColors.mutedForeground, height: 1.6)),
                  if (p.fabricType != null) ...[
                    const SizedBox(height: 12),
                    Text('Fabric: ${p.fabricType}', style: const TextStyle(fontSize: 13, color: HopoColors.mutedForeground)),
                  ],
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(HopoDimens.pagePadding),
        decoration: BoxDecoration(color: HopoColors.card, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 10, offset: const Offset(0, -2))]),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(child: HopoButton(label: 'Add to Cart', icon: Icons.shopping_bag_outlined, onPressed: variant != null && variant.stock > 0 ? () async {
                try {
                  await ref.read(apiServiceProvider).addToCart(variant.id);
                  if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: const Text('Added to cart'), backgroundColor: HopoColors.success, behavior: SnackBarBehavior.floating));
                } catch (_) {}
              } : null)),
              const SizedBox(width: 12),
              HopoButton(label: 'Buy Now', outlined: true, width: 120, onPressed: variant != null && variant.stock > 0 ? () async {
                await ref.read(apiServiceProvider).addToCart(variant.id);
                if (mounted) context.push('/checkout');
              } : null),
            ],
          ),
        ),
      ),
    );
  }
}
