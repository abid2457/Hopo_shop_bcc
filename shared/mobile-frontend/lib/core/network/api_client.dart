import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../config/app_config.dart';
import '../storage/token_storage.dart';

/// Configured Dio instance for all Hopo Shop API calls.
/// Includes auth token injection, error handling, and logging.
class ApiClient {
  late final Dio dio;
  final AuthInterceptor authInterceptor;

  ApiClient({required TokenStorage tokenStorage})
      : authInterceptor = AuthInterceptor(tokenStorage: tokenStorage) {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Logging in debug mode
    if (kDebugMode) {
      dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => debugPrint(obj.toString()),
      ));
    }

    // Auth interceptor — injects JWT token into every request
    dio.interceptors.add(authInterceptor);
  }
}

/// Injects the stored JWT access token into request headers.
/// On 401, attempts to refresh the token and retry the request.
class AuthInterceptor extends Interceptor {
  final TokenStorage tokenStorage;
  String? _cachedToken;

  AuthInterceptor({required this.tokenStorage});

  void setToken(String token) => _cachedToken = token;
  void clearToken() => _cachedToken = null;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    _cachedToken ??= await tokenStorage.accessToken;
    if (_cachedToken != null) {
      options.headers['Authorization'] = 'Bearer $_cachedToken';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Attempt token refresh
      try {
        final refreshToken = await tokenStorage.refreshToken;
        if (refreshToken != null) {
          final refreshDio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));
          final res = await refreshDio.post('/auth/refresh', data: {'refreshToken': refreshToken});
          final newAccess = res.data['accessToken'] as String;
          final newRefresh = res.data['refreshToken'] as String;
          await tokenStorage.saveTokens(newAccess, newRefresh);
          _cachedToken = newAccess;

          // Retry original request with new token
          final opts = err.requestOptions;
          opts.headers['Authorization'] = 'Bearer $newAccess';
          final retryResponse = await Dio().fetch(opts);
          return handler.resolve(retryResponse);
        }
      } catch (_) {
        // Refresh failed — force logout
        await tokenStorage.clear();
        _cachedToken = null;
      }
    }
    handler.next(err);
  }
}
