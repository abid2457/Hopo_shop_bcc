import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/models.dart';
import '../../../core/providers/core_providers.dart';

/// Auth state: null = not logged in, HopoUser = logged in
class AuthState {
  final HopoUser? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isLoggedIn => user != null;

  AuthState copyWith({HopoUser? user, bool? isLoading, String? error, bool clearUser = false}) =>
    AuthState(user: clearUser ? null : (user ?? this.user), isLoading: isLoading ?? this.isLoading, error: error);
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() => const AuthState();

  /// Login with Firebase token (or phone number in dev mode)
  Future<bool> login(String idToken) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final api = ref.read(apiServiceProvider);
      final response = await api.loginWithFirebase(idToken);

      // Store tokens
      final storage = ref.read(tokenStorageProvider);
      await storage.saveTokens(response.tokens.accessToken, response.tokens.refreshToken);
      await storage.saveUserId(response.user.id);

      // Set token in interceptor
      ref.read(apiClientProvider).authInterceptor.setToken(response.tokens.accessToken);

      state = AuthState(user: response.user);
      return true;
    } catch (e) {
      debugPrint('[Auth] Login failed: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Restore session from stored tokens
  Future<bool> restoreSession() async {
    final storage = ref.read(tokenStorageProvider);
    final hasTokens = await storage.hasTokens;
    if (!hasTokens) return false;

    try {
      final token = await storage.accessToken;
      if (token != null) {
        ref.read(apiClientProvider).authInterceptor.setToken(token);
      }
      final api = ref.read(apiServiceProvider);
      final user = await api.getProfile();
      state = AuthState(user: user);
      return true;
    } catch (e) {
      debugPrint('[Auth] Session restore failed: $e');
      await storage.clear();
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    final storage = ref.read(tokenStorageProvider);
    try {
      final refreshToken = await storage.refreshToken;
      if (refreshToken != null) {
        final api = ref.read(apiServiceProvider);
        await api.logout(refreshToken);
      }
    } catch (_) {}
    await storage.clear();
    ref.read(apiClientProvider).authInterceptor.clearToken();
    state = const AuthState();
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
