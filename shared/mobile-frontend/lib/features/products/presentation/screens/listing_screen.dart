import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class ListingScreen extends ConsumerStatefulWidget {
  const ListingScreen({super.key});
  @override
  ConsumerState<ListingScreen> createState() => _ListingScreenState();
}

class _ListingScreenState extends ConsumerState<ListingScreen> {
  List<Product> _products = [];
  bool _isLoading = true;
  int _page = 1;
  bool _hasMore = true;
  final _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _load();
    _scroll.addListener(() {
      if (_scroll.position.pixels >= _scroll.position.maxScrollExtent - 200 && !_isLoading && _hasMore) {
        _page++;
        _load(append: true);
      }
    });
  }

  @override
  void dispose() { _scroll.dispose(); super.dispose(); }

  Future<void> _load({bool append = false}) async {
    if (!append) setState(() => _isLoading = true);
    try {
      final list = await ref.read(apiServiceProvider).getProducts(page: _page);
      if (mounted) setState(() {
        if (append) _products.addAll(list); else _products = list;
        _hasMore = list.length >= 20;
        _isLoading = false;
      });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: HopoAppBar(title: 'Products', actions: [
        IconButton(icon: const Icon(Icons.tune_rounded, size: 20), onPressed: () {}),
      ]),
      body: _isLoading && _products.isEmpty
          ? const HopoLoadingIndicator()
          : _products.isEmpty
              ? const HopoEmptyState(icon: Icons.shopping_bag_outlined, title: 'No Products', subtitle: 'Try adjusting your filters.')
              : GridView.builder(
                  controller: _scroll,
                  padding: const EdgeInsets.all(HopoDimens.pagePadding),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.58),
                  itemCount: _products.length,
                  itemBuilder: (_, i) {
                    final p = _products[i];
                    return HopoProductCard(
                      imageUrl: p.primaryImage, name: p.name, price: p.basePrice,
                      compareAtPrice: p.compareAtPrice, rating: p.avgRating, reviewCount: p.totalReviews,
                      onTap: () => context.push('/product/${p.id}'), onWishlist: () {},
                    );
                  },
                ),
    );
  }
}
