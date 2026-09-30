import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/models.dart';
import '../../../core/providers/core_providers.dart';

/// Profile state — user data + addresses
class ProfileState {
  final HopoUser? user;
  final List<Address> addresses;
  final bool isLoading;
  const ProfileState({this.user, this.addresses = const [], this.isLoading = false});
}

class ProfileNotifier extends Notifier<ProfileState> {
  @override
  ProfileState build() => const ProfileState();

  Future<void> fetchProfile() async {
    state = ProfileState(user: state.user, addresses: state.addresses, isLoading: true);
    try {
      final api = ref.read(apiServiceProvider);
      final user = await api.getProfile();
      final addresses = await api.getAddresses();
      state = ProfileState(user: user, addresses: addresses);
    } catch (e) {
      debugPrint('[Profile] Fetch failed: $e');
      state = ProfileState(user: state.user, addresses: state.addresses);
    }
  }

  Future<void> updateProfile(Map<String, dynamic> data) async {
    try {
      final api = ref.read(apiServiceProvider);
      final user = await api.updateProfile(data);
      state = ProfileState(user: user, addresses: state.addresses);
    } catch (e) {
      debugPrint('[Profile] Update failed: $e');
    }
  }

  Future<void> addAddress(Address address) async {
    try {
      final api = ref.read(apiServiceProvider);
      final newAddr = await api.createAddress(address);
      state = ProfileState(user: state.user, addresses: [...state.addresses, newAddr]);
    } catch (e) {
      debugPrint('[Profile] Add address failed: $e');
    }
  }

  Future<void> deleteAddress(String id) async {
    try {
      final api = ref.read(apiServiceProvider);
      await api.deleteAddress(id);
      state = ProfileState(user: state.user, addresses: state.addresses.where((a) => a.id != id).toList());
    } catch (e) {
      debugPrint('[Profile] Delete address failed: $e');
    }
  }
}

final profileProvider = NotifierProvider<ProfileNotifier, ProfileState>(ProfileNotifier.new);
