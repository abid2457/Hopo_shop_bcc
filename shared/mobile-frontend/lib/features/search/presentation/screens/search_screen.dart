import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});
  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();
  List<Product> _results = [];
  bool _isSearching = false;
  final _recent = <String>['Silk Saree', 'Anarkali', 'Lehenga', 'Gold Jhumkas'];

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  Future<void> _search(String query) async {
    if (query.trim().isEmpty) { setState(() => _results = []); return; }
    setState(() => _isSearching = true);
    try {
      final results = await ref.read(apiServiceProvider).getProducts(search: query);
      if (mounted) setState(() { _results = results; _isSearching = false; });
    } catch (_) { if (mounted) setState(() => _isSearching = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: const HopoAppBar(title: 'Search'),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: HopoDimens.pagePadding),
          child: HopoSearchBar(controller: _controller, autofocus: true, onChanged: (q) {
            if (q.length >= 2) _search(q);
          }),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: _controller.text.isEmpty
              ? _buildRecent()
              : _isSearching
                  ? const HopoLoadingIndicator()
                  : _results.isEmpty
                      ? const HopoEmptyState(icon: Icons.search_off_rounded, title: 'No Results', subtitle: 'Try a different search term.')
                      : GridView.builder(
                          padding: const EdgeInsets.all(HopoDimens.pagePadding),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.58),
                          itemCount: _results.length,
                          itemBuilder: (_, i) {
                            final p = _results[i];
                            return HopoProductCard(imageUrl: p.primaryImage, name: p.name, price: p.basePrice, compareAtPrice: p.compareAtPrice,
                              onTap: () => context.push('/product/${p.id}'), onWishlist: () {});
                          },
                        ),
        ),
      ]),
    );
  }

  Widget _buildRecent() {
    return Padding(
      padding: const EdgeInsets.all(HopoDimens.pagePadding),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Recent Searches', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Wrap(spacing: 8, runSpacing: 8, children: _recent.map((r) => GestureDetector(
          onTap: () { _controller.text = r; _search(r); },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusFull), border: Border.all(color: HopoColors.border)),
            child: Text(r, style: const TextStyle(fontSize: 13, color: HopoColors.foreground)),
          ),
        )).toList()),
        const SizedBox(height: 32),
        const Text('Popular Categories', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Wrap(spacing: 8, runSpacing: 8, children: ['Sarees', 'Lehengas', 'Kurtis', 'Jewelry', 'Western Wear'].map((c) => HopoBadge(label: c)).toList()),
      ]),
    );
  }
}
