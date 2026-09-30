import 'package:flutter/material.dart';

/// HOPO SHOP brand colors — translated from the oklch design tokens in styles.css.
/// Single premium light theme (no dark mode per client decision).
class HopoColors {
  HopoColors._();

  // ─── Primary: Deep Maroon ──────────────────────────────
  static const Color primary = Color(0xFF5A1827);
  static const Color primaryForeground = Color(0xFFF7F0E8);
  static const Color primarySoft = Color(0xFFF2DDE0);

  // ─── Gold: Champagne ──────────────────────────────────
  static const Color gold = Color(0xFFC9A24A);
  static const Color goldForeground = Color(0xFF2A1A10);
  static const Color goldSoft = Color(0xFFF0E6C8);

  // ─── Backgrounds ───────────────────────────────────────
  static const Color background = Color(0xFFF9F5F0);
  static const Color foreground = Color(0xFF1F1410);
  static const Color card = Color(0xFFFFFFFF);
  static const Color cardForeground = Color(0xFF1F1410);

  // ─── Muted / Secondary ────────────────────────────────
  static const Color muted = Color(0xFFF0EAE2);
  static const Color mutedForeground = Color(0xFF7A6B5D);
  static const Color secondary = Color(0xFFF2EDE5);
  static const Color secondaryForeground = Color(0xFF2F2018);
  static const Color accent = Color(0xFFEDE4D4);
  static const Color accentForeground = Color(0xFF2F2018);

  // ─── Semantic ──────────────────────────────────────────
  static const Color destructive = Color(0xFFBF3B30);
  static const Color destructiveForeground = Color(0xFFF7F0E8);
  static const Color success = Color(0xFF2E8B57);
  static const Color successForeground = Color(0xFFF7F0E8);

  // ─── Border / Input ────────────────────────────────────
  static const Color border = Color(0xFFDFD5C8);
  static const Color input = Color(0xFFE8E0D5);
  static const Color ring = Color(0xFF5A1827);

  // ─── Gradients ─────────────────────────────────────────
  static const LinearGradient gradientRoyal = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF5A1827), Color(0xFF3A0E18)],
  );

  static const LinearGradient gradientGold = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFD4AD50), Color(0xFFB8902A)],
  );

  static const LinearGradient gradientPage = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFF9F5F0), Color(0xFFF2EDE5)],
  );
}
