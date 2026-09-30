import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/api_client.dart';
import '../storage/token_storage.dart';
import '../services/api_service.dart';

/// Core singleton providers shared across the entire app.
/// These are the foundational DI layer.

// ─── Token Storage (singleton) ─────────────────────────────
final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());

// ─── API Client (singleton, depends on tokenStorage) ───────
final apiClientProvider = Provider<ApiClient>((ref) {
  final tokenStorage = ref.watch(tokenStorageProvider);
  return ApiClient(tokenStorage: tokenStorage);
});

// ─── API Service (singleton, depends on apiClient) ─────────
final apiServiceProvider = Provider<ApiService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ApiService(apiClient);
});
