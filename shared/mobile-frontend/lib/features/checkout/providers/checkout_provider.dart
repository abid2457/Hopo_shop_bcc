import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/models.dart';
import '../../../core/providers/core_providers.dart';
import '../../cart/providers/cart_provider.dart';

/// Checkout state machine: Address → Payment → Confirm
enum CheckoutStep { address, payment, review }

class CheckoutState {
  final CheckoutStep step;
  final Address? selectedAddress;
  final String? paymentMethod;
  final Coupon? appliedCoupon;
  final Order? placedOrder;
  final bool isProcessing;
  final String? error;

  const CheckoutState({this.step = CheckoutStep.address, this.selectedAddress,
    this.paymentMethod, this.appliedCoupon, this.placedOrder, this.isProcessing = false, this.error});

  CheckoutState copyWith({CheckoutStep? step, Address? selectedAddress, String? paymentMethod,
    Coupon? appliedCoupon, Order? placedOrder, bool? isProcessing, String? error,
    bool clearCoupon = false, bool clearOrder = false}) => CheckoutState(
    step: step ?? this.step, selectedAddress: selectedAddress ?? this.selectedAddress,
    paymentMethod: paymentMethod ?? this.paymentMethod,
    appliedCoupon: clearCoupon ? null : (appliedCoupon ?? this.appliedCoupon),
    placedOrder: clearOrder ? null : (placedOrder ?? this.placedOrder),
    isProcessing: isProcessing ?? this.isProcessing, error: error);
}

class CheckoutNotifier extends Notifier<CheckoutState> {
  @override
  CheckoutState build() => const CheckoutState();

  void selectAddress(Address address) => state = state.copyWith(selectedAddress: address, step: CheckoutStep.payment);
  void selectPaymentMethod(String method) => state = state.copyWith(paymentMethod: method, step: CheckoutStep.review);
  void goToStep(CheckoutStep step) => state = state.copyWith(step: step);

  Future<void> applyCoupon(String code) async {
    try {
      final api = ref.read(apiServiceProvider);
      final coupon = await api.validateCoupon(code);
      state = state.copyWith(appliedCoupon: coupon);
    } catch (e) {
      state = state.copyWith(error: 'Invalid coupon code');
    }
  }

  void removeCoupon() => state = state.copyWith(clearCoupon: true);

  Future<bool> placeOrder() async {
    if (state.selectedAddress == null) return false;
    state = state.copyWith(isProcessing: true, error: null);
    try {
      final api = ref.read(apiServiceProvider);
      final order = await api.createOrder(addressId: state.selectedAddress!.id, couponId: state.appliedCoupon?.id);
      state = state.copyWith(placedOrder: order, isProcessing: false);
      ref.read(cartProvider.notifier).clearCart();
      return true;
    } catch (e) {
      debugPrint('[Checkout] Order failed: $e');
      state = state.copyWith(isProcessing: false, error: e.toString());
      return false;
    }
  }

  void reset() => state = const CheckoutState();
}

final checkoutProvider = NotifierProvider<CheckoutNotifier, CheckoutState>(CheckoutNotifier.new);
