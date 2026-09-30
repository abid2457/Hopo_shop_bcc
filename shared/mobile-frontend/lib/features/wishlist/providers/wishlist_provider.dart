import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';

/// Wishlist managed as a Set of variant IDs for quick lookup.
class WishlistState {
  final Set<String> variantIds;
  final bool isLoading;
  const WishlistState({this.variantIds = const {}, this.isLoading = false});
  bool isWishlisted(String variantId) => variantIds.contains(variantId);
}

class WishlistNotifier extends Notifier<WishlistState> {
  @override
  WishlistState build() => const WishlistState();

  Future<void> fetchWishlist() async {
    state = WishlistState(variantIds: state.variantIds, isLoading: true);
    try {
      final api = ref.read(apiServiceProvider);
      final items = await api.getWishlist();
      final ids = items.map((e) => (e as Map<String, dynamic>)['variantId'] as String).toSet();
      state = WishlistState(variantIds: ids);
    } catch (e) {
      debugPrint('[Wishlist] Fetch failed: $e');
      state = WishlistState(variantIds: state.variantIds);
    }
  }

  Future<void> toggle(String variantId) async {
    final isCurrently = state.variantIds.contains(variantId);
    // Optimistic update
    final newIds = Set<String>.from(state.variantIds);
    isCurrently ? newIds.remove(variantId) : newIds.add(variantId);
    state = WishlistState(variantIds: newIds);

    try {
      final api = ref.read(apiServiceProvider);
      isCurrently ? await api.removeFromWishlist(variantId) : await api.addToWishlist(variantId);
    } catch (e) {
      debugPrint('[Wishlist] Toggle failed: $e');
      // Revert
      final revertIds = Set<String>.from(state.variantIds);
      isCurrently ? revertIds.add(variantId) : revertIds.remove(variantId);
      state = WishlistState(variantIds: revertIds);
    }
  }
}

final wishlistProvider = NotifierProvider<WishlistNotifier, WishlistState>(WishlistNotifier.new);
