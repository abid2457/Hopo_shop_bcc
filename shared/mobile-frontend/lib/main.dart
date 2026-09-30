import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/theme/app_theme.dart';
import 'config/routes.dart';
import 'features/auth/providers/auth_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: HopoApp()));
}

/// Root application widget.
class HopoApp extends ConsumerStatefulWidget {
  const HopoApp({super.key});

  @override
  ConsumerState<HopoApp> createState() => _HopoAppState();
}

class _HopoAppState extends ConsumerState<HopoApp> {
  @override
  void initState() {
    super.initState();
    // Attempt to restore session from stored tokens
    Future.microtask(() => ref.read(authProvider.notifier).restoreSession());
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'HOPO SHOP — Premium Women\'s Fashion',
      debugShowCheckedModeBanner: false,
      theme: HopoTheme.light,
      routerConfig: appRouter,
    );
  }
}
