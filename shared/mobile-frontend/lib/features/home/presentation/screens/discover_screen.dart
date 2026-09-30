import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

/// Discover tab — curated collections, trending, and occasion-based browsing.
class DiscoverScreen extends ConsumerStatefulWidget {
  const DiscoverScreen({super.key});
  @override
  ConsumerState<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends ConsumerState<DiscoverScreen> {
  List<Product> _trending = [];
  List<Category> _categories = [];
  bool _isLoading = true;

  static const _occasions = ['Wedding', 'Festival', 'Party', 'Daily Wear', 'Office'];

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final api = ref.read(apiServiceProvider);
      final results = await Future.wait([api.getProducts(limit: 8), api.getCategories()]);
      if (mounted) setState(() { _trending = results[0] as List<Product>; _categories = results[1] as List<Category>; _isLoading = false; });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      body: SafeArea(
        child: CustomScrollView(slivers: [
          SliverToBoxAdapter(child: Padding(
            padding: const EdgeInsets.fromLTRB(HopoDimens.pagePadding, 16, HopoDimens.pagePadding, 0),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Discover', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: HopoColors.foreground)),
              const SizedBox(height: 4),
              const Text('Find your perfect style', style: TextStyle(fontSize: 14, color: HopoColors.mutedForeground)),
            ]),
          )),
          SliverToBoxAdapter(child: Padding(
            padding: const EdgeInsets.all(HopoDimens.pagePadding),
            child: HopoSearchBar(readOnly: true, onTap: () => context.push('/search')),
          )),

          // Shop by Occasion
          const SliverToBoxAdapter(child: HopoSectionHeader(title: 'Shop by Occasion')),
          SliverToBoxAdapter(child: SizedBox(
            height: 48, 
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(HopoDimens.pagePadding, 12, HopoDimens.pagePadding, 0),
              scrollDirection: Axis.horizontal, itemCount: _occasions.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) => GestureDetector(
                onTap: () => context.push('/listing?occasion=${_occasions[i]}'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  decoration: BoxDecoration(gradient: HopoColors.gradientRoyal, borderRadius: BorderRadius.circular(HopoDimens.radiusFull)),
                  child: Text(_occasions[i], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: HopoColors.primaryForeground)),
                ),
              ),
            ),
          )),
          const SliverToBoxAdapter(child: SizedBox(height: HopoDimens.sectionSpacing)),

          // Trending Now
          SliverToBoxAdapter(child: HopoSectionHeader(title: 'Trending Now', actionLabel: 'View All', onAction: () => context.push('/listing'))),
          const SliverToBoxAdapter(child: SizedBox(height: 12)),
          if (_isLoading)
            const SliverToBoxAdapter(child: SizedBox(height: 200, child: HopoLoadingIndicator()))
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: HopoDimens.pagePadding),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.58),
                delegate: SliverChildBuilderDelegate(
                  (_, i) { final p = _trending[i]; return HopoProductCard(imageUrl: p.primaryImage, name: p.name, price: p.basePrice, compareAtPrice: p.compareAtPrice, onTap: () => context.push('/product/${p.id}'), onWishlist: () {}); },
                  childCount: _trending.length,
                ),
              ),
            ),
          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ]),
      ),
    );
  }
}
