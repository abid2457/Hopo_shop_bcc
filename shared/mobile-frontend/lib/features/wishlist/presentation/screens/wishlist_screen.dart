import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class WishlistScreen extends ConsumerStatefulWidget {
  const WishlistScreen({super.key});
  @override
  ConsumerState<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends ConsumerState<WishlistScreen> {
  List<dynamic> _items = [];
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final items = await ref.read(apiServiceProvider).getWishlist();
      if (mounted) setState(() { _items = items; _isLoading = false; });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: const HopoAppBar(title: 'Wishlist', showBack: false),
      body: _isLoading
          ? const HopoLoadingIndicator()
          : _items.isEmpty
              ? HopoEmptyState(
                  icon: Icons.favorite_border_rounded,
                  title: 'Your Wishlist is Empty',
                  subtitle: 'Save items you love to find them easily later.',
                  buttonLabel: 'Explore Products',
                  onAction: () => context.go('/home'),
                )
              : GridView.builder(
                  padding: const EdgeInsets.all(HopoDimens.pagePadding),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.58,
                  ),
                  itemCount: _items.length,
                  itemBuilder: (_, i) {
                    final item = _items[i] as Map<String, dynamic>;
                    final product = item['product'] as Map<String, dynamic>?;
                    final name = product?['name'] as String? ?? 'Product';
                    final price = (product?['basePrice'] as num?)?.toDouble() ?? 0;
                    final id = product?['id'] as String? ?? '';
                    return HopoProductCard(
                      name: name, price: price,
                      isWishlisted: true,
                      onTap: () => context.push('/product/$id'),
                      onWishlist: () async {
                        final itemId = item['id'] as String;
                        await ref.read(apiServiceProvider).removeFromWishlist(itemId);
                        _load();
                      },
                    );
                  },
                ),
    );
  }
}
