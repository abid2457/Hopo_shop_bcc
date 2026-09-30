import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  List<Product> _featured = [];
  List<Category> _categories = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final api = ref.read(apiServiceProvider);
      final results = await Future.wait([api.getFeaturedProducts(limit: 10), api.getCategories()]);
      if (mounted) {
        setState(() {
          _featured = results[0] as List<Product>;
          _categories = results[1] as List<Category>;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: HopoColors.primary,
          onRefresh: _loadData,
          child: CustomScrollView(
            slivers: [
              // ── App Bar ──
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(HopoDimens.pagePadding, 12, HopoDimens.pagePadding, 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('HOPO SHOP', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: HopoColors.primary, letterSpacing: 4)),
                          Text("Premium Fashion Store", style: TextStyle(fontSize: 11, color: HopoColors.mutedForeground, letterSpacing: 1)),
                        ],
                      ),
                      Row(
                        children: [
                          IconButton(icon: const Icon(Icons.notifications_none_rounded, color: HopoColors.foreground), onPressed: () => context.push('/notifications')),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // ── Search Bar ──
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(HopoDimens.pagePadding),
                  child: HopoSearchBar(readOnly: true, onTap: () => context.push('/search')),
                ),
              ),

              // ── Hero Banner ──
              SliverToBoxAdapter(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: HopoDimens.pagePadding),
                  height: 180,
                  decoration: BoxDecoration(
                    gradient: HopoColors.gradientRoyal,
                    borderRadius: BorderRadius.circular(HopoDimens.radiusXl),
                    boxShadow: [BoxShadow(color: HopoColors.primary.withValues(alpha: 0.2), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: Stack(
                    children: [
                      Positioned(right: -20, bottom: -20, child: Icon(Icons.diamond_outlined, size: 160, color: Colors.white.withValues(alpha: 0.05))),
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(color: HopoColors.gold, borderRadius: BorderRadius.circular(HopoDimens.radiusFull)),
                              child: const Text('NEW COLLECTION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: 1)),
                            ),
                            const SizedBox(height: 12),
                            const Text('Summer\nEthnic Edit', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: HopoColors.primaryForeground, height: 1.2)),
                            const SizedBox(height: 8),
                            Text('Up to 40% off', style: TextStyle(fontSize: 14, color: HopoColors.primaryForeground.withValues(alpha: 0.8))),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: HopoDimens.sectionSpacing)),

              // ── Categories ──
              if (_categories.isNotEmpty) ...[
                const SliverToBoxAdapter(child: HopoSectionHeader(title: 'Shop by Category')),
                const SliverToBoxAdapter(child: SizedBox(height: 12)),
                SliverToBoxAdapter(
                  child: SizedBox(
                    height: 100,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: HopoDimens.pagePadding),
                      scrollDirection: Axis.horizontal,
                      itemCount: _categories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (_, i) {
                        final cat = _categories[i];
                        return GestureDetector(
                          onTap: () => context.push('/listing?categoryId=${cat.id}'),
                          child: Column(
                            children: [
                              Container(
                                width: 60, height: 60,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [HopoColors.primarySoft, HopoColors.goldSoft],
                                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(HopoDimens.radiusLg),
                                ),
                                child: const Icon(Icons.category_outlined, color: HopoColors.primary, size: 24),
                              ),
                              const SizedBox(height: 8),
                              SizedBox(
                                width: 70,
                                child: Text(cat.name, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: HopoColors.foreground)),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: HopoDimens.sectionSpacing)),
              ],

              // ── Featured Products ──
              SliverToBoxAdapter(
                child: HopoSectionHeader(title: 'Featured', actionLabel: 'View All', onAction: () => context.push('/listing?featured=true')),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 12)),

              if (_isLoading)
                const SliverToBoxAdapter(child: SizedBox(height: 200, child: HopoLoadingIndicator()))
              else if (_featured.isEmpty)
                const SliverToBoxAdapter(child: SizedBox(height: 200, child: Center(child: Text('No products yet', style: TextStyle(color: HopoColors.mutedForeground)))))
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: HopoDimens.pagePadding),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.58,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (_, i) {
                        final p = _featured[i];
                        return HopoProductCard(
                          imageUrl: p.primaryImage,
                          name: p.name,
                          price: p.basePrice,
                          compareAtPrice: p.compareAtPrice,
                          rating: p.avgRating,
                          reviewCount: p.totalReviews,
                          onTap: () => context.push('/product/${p.id}'),
                          onWishlist: () {},
                        );
                      },
                      childCount: _featured.length,
                    ),
                  ),
                ),

              const SliverToBoxAdapter(child: SizedBox(height: 40)),
            ],
          ),
        ),
      ),
    );
  }
}
