import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class CategoriesScreen extends ConsumerStatefulWidget {
  const CategoriesScreen({super.key});

  @override
  ConsumerState<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends ConsumerState<CategoriesScreen> {
  List<Category> _categories = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final cats = await ref.read(apiServiceProvider).getCategories();
      if (mounted) setState(() { _categories = cats; _isLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: const HopoAppBar(title: 'Categories'),
      body: _isLoading
          ? const HopoLoadingIndicator()
          : _categories.isEmpty
              ? const HopoEmptyState(icon: Icons.category_outlined, title: 'No Categories', subtitle: 'Categories will appear here once added.')
              : GridView.builder(
                  padding: const EdgeInsets.all(HopoDimens.pagePadding),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 1.1),
                  itemCount: _categories.length,
                  itemBuilder: (_, i) {
                    final cat = _categories[i];
                    return GestureDetector(
                      onTap: () => context.push('/listing?categoryId=${cat.id}'),
                      child: Container(
                        decoration: BoxDecoration(
                          color: HopoColors.card,
                          borderRadius: BorderRadius.circular(HopoDimens.radiusLg),
                          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8)],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 56, height: 56,
                              decoration: BoxDecoration(gradient: HopoColors.gradientRoyal, borderRadius: BorderRadius.circular(16)),
                              child: const Icon(Icons.category_outlined, color: HopoColors.gold, size: 24),
                            ),
                            const SizedBox(height: 12),
                            Text(cat.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: HopoColors.foreground), textAlign: TextAlign.center),
                            if (cat.children.isNotEmpty)
                              Text('${cat.children.length} subcategories', style: const TextStyle(fontSize: 11, color: HopoColors.mutedForeground)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
