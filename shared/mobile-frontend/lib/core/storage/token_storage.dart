import 'package:shared_preferences/shared_preferences.dart';

/// Persists JWT tokens and user info locally using SharedPreferences.
/// Designed to be swapped to flutter_secure_storage later.
class TokenStorage {
  static const _keyAccess = 'luxe_access_token';
  static const _keyRefresh = 'luxe_refresh_token';
  static const _keyUserId = 'luxe_user_id';

  SharedPreferences? _prefs;

  Future<SharedPreferences> get _sp async =>
      _prefs ??= await SharedPreferences.getInstance();

  Future<void> saveTokens(String accessToken, String refreshToken) async {
    final sp = await _sp;
    await sp.setString(_keyAccess, accessToken);
    await sp.setString(_keyRefresh, refreshToken);
  }

  Future<String?> get accessToken async => (await _sp).getString(_keyAccess);
  Future<String?> get refreshToken async => (await _sp).getString(_keyRefresh);

  Future<void> saveUserId(String id) async => (await _sp).setString(_keyUserId, id);
  Future<String?> get userId async => (await _sp).getString(_keyUserId);

  Future<void> clear() async {
    final sp = await _sp;
    await sp.remove(_keyAccess);
    await sp.remove(_keyRefresh);
    await sp.remove(_keyUserId);
  }

  Future<bool> get hasTokens async => (await accessToken) != null;
}
