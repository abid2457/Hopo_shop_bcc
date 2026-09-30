import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});
  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  CartSummary? _cart;
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final cart = await ref.read(apiServiceProvider).getCart();
      if (mounted) setState(() { _cart = cart; _isLoading = false; });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(backgroundColor: HopoColors.background, body: HopoLoadingIndicator());
    if (_cart == null || _cart!.items.isEmpty) {
      return Scaffold(
        backgroundColor: HopoColors.background,
        appBar: const HopoAppBar(title: 'Cart', showBack: false),
        body: HopoEmptyState(icon: Icons.shopping_bag_outlined, title: 'Your Cart is Empty', subtitle: 'Add items to get started.', buttonLabel: 'Browse Products', onAction: () => context.go('/home')),
      );
    }
    final cart = _cart!;
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: HopoAppBar(title: 'Cart (${cart.itemCount})', showBack: false),
      body: ListView.separated(
        padding: const EdgeInsets.all(HopoDimens.pagePadding),
        itemCount: cart.items.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (_, i) {
          final item = cart.items[i];
          return Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6)]),
            child: Row(
              children: [
                // Thumbnail
                Container(
                  width: 80, height: 100,
                  decoration: BoxDecoration(color: HopoColors.muted, borderRadius: BorderRadius.circular(HopoDimens.radiusSm)),
                  child: const Icon(Icons.image_outlined, color: HopoColors.mutedForeground),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item.product?.name ?? 'Product', maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                      const SizedBox(height: 4),
                      if (item.variant.color != null || item.variant.size != null)
                        Text([if (item.variant.color != null) item.variant.color!, if (item.variant.size != null) item.variant.size!].join(' · '),
                          style: const TextStyle(fontSize: 12, color: HopoColors.mutedForeground)),
                      const SizedBox(height: 8),
                      Text('₹${item.variant.price.toStringAsFixed(0)}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: HopoColors.primary)),
                    ],
                  ),
                ),
                // Quantity controls
                Column(
                  children: [
                    IconButton(icon: const Icon(Icons.delete_outline_rounded, size: 18, color: HopoColors.destructive), onPressed: () async {
                      await ref.read(apiServiceProvider).removeFromCart(item.id);
                      _load();
                    }),
                    Container(
                      decoration: BoxDecoration(border: Border.all(color: HopoColors.border), borderRadius: BorderRadius.circular(8)),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          InkWell(onTap: item.quantity > 1 ? () async { await ref.read(apiServiceProvider).updateCartQuantity(item.id, item.quantity - 1); _load(); } : null,
                            child: Padding(padding: const EdgeInsets.all(6), child: Icon(Icons.remove, size: 16, color: item.quantity > 1 ? HopoColors.foreground : HopoColors.border))),
                          Padding(padding: const EdgeInsets.symmetric(horizontal: 8), child: Text('${item.quantity}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600))),
                          InkWell(onTap: () async { await ref.read(apiServiceProvider).updateCartQuantity(item.id, item.quantity + 1); _load(); },
                            child: const Padding(padding: EdgeInsets.all(6), child: Icon(Icons.add, size: 16, color: HopoColors.foreground))),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(HopoDimens.pagePadding),
        decoration: BoxDecoration(color: HopoColors.card, boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 10, offset: const Offset(0, -2))]),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                const Text('Subtotal', style: TextStyle(fontSize: 14, color: HopoColors.mutedForeground)),
                Text('₹${cart.subtotal.toStringAsFixed(0)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: HopoColors.primary)),
              ]),
              const SizedBox(height: 12),
              HopoButton(label: 'Proceed to Checkout', onPressed: () => context.push('/checkout')),
            ],
          ),
        ),
      ),
    );
  }
}
