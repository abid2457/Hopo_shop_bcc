import 'package:flutter/material.dart';

/// HOPO SHOP typography system — Playfair Display for display/headings, Inter for body/UI.
/// Uses Google Fonts as fallback; bundled fonts take priority when available.
class LuxeTextStyles {
  LuxeTextStyles._();

  static const String _displayFamily = 'PlayfairDisplay';
  static const String _bodyFamily = 'Inter';

  // ─── Display / Headings (Playfair Display) ─────────────
  static const TextStyle displayLarge = TextStyle(
    fontFamily: _displayFamily,
    fontSize: 32,
    fontWeight: FontWeight.w700,
    height: 1.1,
    letterSpacing: -0.3,
  );

  static const TextStyle displayMedium = TextStyle(
    fontFamily: _displayFamily,
    fontSize: 28,
    fontWeight: FontWeight.w600,
    height: 1.15,
    letterSpacing: -0.2,
  );

  static const TextStyle displaySmall = TextStyle(
    fontFamily: _displayFamily,
    fontSize: 24,
    fontWeight: FontWeight.w600,
    height: 1.2,
    letterSpacing: -0.1,
  );

  static const TextStyle headlineLarge = TextStyle(
    fontFamily: _displayFamily,
    fontSize: 22,
    fontWeight: FontWeight.w600,
    height: 1.2,
  );

  static const TextStyle headlineMedium = TextStyle(
    fontFamily: _displayFamily,
    fontSize: 20,
    fontWeight: FontWeight.w600,
    height: 1.25,
  );

  static const TextStyle headlineSmall = TextStyle(
    fontFamily: _displayFamily,
    fontSize: 18,
    fontWeight: FontWeight.w500,
    height: 1.3,
  );

  // ─── Body / UI (Inter) ─────────────────────────────────
  static const TextStyle titleLarge = TextStyle(
    fontFamily: _bodyFamily,
    fontSize: 18,
    fontWeight: FontWeight.w600,
    height: 1.3,
  );

  static const TextStyle titleMedium = TextStyle(
    fontFamily: _bodyFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );

  static const TextStyle titleSmall = TextStyle(
    fontFamily: _bodyFamily,
    fontSize: 14,
    fontWeight: FontWeight.w600,
    height: 1.4,
  );

  static const TextStyle bodyLarge = TextStyle(
    fontFamily: _bodyFamily,
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );

  static const TextStyle bodyMedium = TextStyle(
    fontFamily: _bodyFamily,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );

  static const TextStyle bodySmall = TextStyle(
    fontFamily: _bodyFamily,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.5,
  );

  static const TextStyle labelLarge = TextStyle(
    fontFamily: _bodyFamily,
    fontSize: 14,
    fontWeight: FontWeight.w500,
    height: 1.4,
  );

  static const TextStyle labelMedium = TextStyle(
    fontFamily: _bodyFamily,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    height: 1.4,
  );

  static const TextStyle labelSmall = TextStyle(
    fontFamily: _bodyFamily,
    fontSize: 11,
    fontWeight: FontWeight.w500,
    height: 1.4,
    letterSpacing: 0.3,
  );

  /// Eyebrow text — used for section labels like "Curated", "Loved by you".
  static const TextStyle eyebrow = TextStyle(
    fontFamily: _bodyFamily,
    fontSize: 10,
    fontWeight: FontWeight.w500,
    height: 1.4,
    letterSpacing: 2.5,
  );
}
