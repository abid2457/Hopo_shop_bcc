import 'package:flutter/foundation.dart' hide Category;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/models.dart';
import '../../../core/providers/core_providers.dart';

/// Products state with pagination support
class ProductsState {
  final List<Product> products;
  final bool isLoading;
  final bool hasMore;
  final int page;
  final String? error;
  const ProductsState({this.products = const [], this.isLoading = false, this.hasMore = true, this.page = 1, this.error});
}

class ProductsNotifier extends Notifier<ProductsState> {
  String? _categoryId;
  String? _search;

  @override
  ProductsState build() => const ProductsState();

  Future<void> loadProducts({String? categoryId, String? search, bool refresh = false}) async {
    if (state.isLoading) return;
    _categoryId = categoryId;
    _search = search;
    final page = refresh ? 1 : state.page;
    state = ProductsState(products: refresh ? [] : state.products, isLoading: true, page: page);
    try {
      final api = ref.read(apiServiceProvider);
      final products = await api.getProducts(page: page, categoryId: _categoryId, search: _search);
      state = ProductsState(
        products: refresh ? products : [...state.products, ...products],
        isLoading: false, hasMore: products.length >= 20, page: page + 1);
    } catch (e) {
      debugPrint('[Products] Load failed: $e');
      state = ProductsState(products: state.products, isLoading: false, error: e.toString(), page: page);
    }
  }

  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoading) return;
    await loadProducts(categoryId: _categoryId, search: _search);
  }
}

final productsProvider = NotifierProvider<ProductsNotifier, ProductsState>(ProductsNotifier.new);

/// Single product detail
final productDetailProvider = FutureProvider.family<Product, String>((ref, id) async {
  final api = ref.read(apiServiceProvider);
  return api.getProductById(id);
});

/// Featured products for home screen
final featuredProductsProvider = FutureProvider<List<Product>>((ref) async {
  final api = ref.read(apiServiceProvider);
  return api.getFeaturedProducts();
});

/// Categories
final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final api = ref.read(apiServiceProvider);
  return api.getCategories();
});
