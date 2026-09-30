import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'colors.dart';
import 'text_styles.dart';
import 'dimensions.dart';

export 'colors.dart';
export 'text_styles.dart';
export 'dimensions.dart';

/// The unified HOPO SHOP Material theme — Premium Fashion Store aesthetic.
class HopoTheme {
  HopoTheme._();

  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: HopoColors.background,
      colorScheme: const ColorScheme.light(
        primary: HopoColors.primary,
        onPrimary: HopoColors.primaryForeground,
        secondary: HopoColors.gold,
        onSecondary: HopoColors.goldForeground,
        surface: HopoColors.card,
        onSurface: HopoColors.foreground,
        error: HopoColors.destructive,
        onError: HopoColors.destructiveForeground,
        outline: HopoColors.border,
      ),

      // ─── Typography ────────────────────────────────────
      textTheme: const TextTheme(
        displayLarge: LuxeTextStyles.displayLarge,
        displayMedium: LuxeTextStyles.displayMedium,
        displaySmall: LuxeTextStyles.displaySmall,
        headlineLarge: LuxeTextStyles.headlineLarge,
        headlineMedium: LuxeTextStyles.headlineMedium,
        headlineSmall: LuxeTextStyles.headlineSmall,
        titleLarge: LuxeTextStyles.titleLarge,
        titleMedium: LuxeTextStyles.titleMedium,
        titleSmall: LuxeTextStyles.titleSmall,
        bodyLarge: LuxeTextStyles.bodyLarge,
        bodyMedium: LuxeTextStyles.bodyMedium,
        bodySmall: LuxeTextStyles.bodySmall,
        labelLarge: LuxeTextStyles.labelLarge,
        labelMedium: LuxeTextStyles.labelMedium,
        labelSmall: LuxeTextStyles.labelSmall,
      ),

      // ─── AppBar ────────────────────────────────────────
      appBarTheme: const AppBarTheme(
        backgroundColor: HopoColors.background,
        foregroundColor: HopoColors.foreground,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        titleTextStyle: LuxeTextStyles.headlineSmall,
      ),

      // ─── Bottom Navigation ─────────────────────────────
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: HopoColors.card,
        selectedItemColor: HopoColors.primary,
        unselectedItemColor: HopoColors.mutedForeground,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: TextStyle(fontSize: 10, fontWeight: FontWeight.w600),
        unselectedLabelStyle: TextStyle(fontSize: 10, fontWeight: FontWeight.w400),
        elevation: 8,
      ),

      // ─── Elevated Button ───────────────────────────────
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: HopoColors.primary,
          foregroundColor: HopoColors.primaryForeground,
          elevation: 0,
          minimumSize: const Size(double.infinity, HopoDimens.buttonHeight),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(HopoDimens.radiusFull),
          ),
          textStyle: LuxeTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w600),
        ),
      ),

      // ─── Outlined Button ───────────────────────────────
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: HopoColors.foreground,
          minimumSize: const Size(double.infinity, HopoDimens.buttonHeight),
          side: const BorderSide(color: HopoColors.border),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(HopoDimens.radiusFull),
          ),
          textStyle: LuxeTextStyles.labelLarge.copyWith(fontWeight: FontWeight.w600),
        ),
      ),

      // ─── Text Button ───────────────────────────────────
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: HopoColors.primary,
          textStyle: LuxeTextStyles.labelMedium,
        ),
      ),

      // ─── Card ──────────────────────────────────────────
      cardTheme: CardThemeData(
        color: HopoColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(HopoDimens.radiusXl),
          side: const BorderSide(color: HopoColors.border, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),

      // ─── Input ─────────────────────────────────────────
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: HopoColors.card,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HopoDimens.radiusXl),
          borderSide: const BorderSide(color: HopoColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HopoDimens.radiusXl),
          borderSide: const BorderSide(color: HopoColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(HopoDimens.radiusXl),
          borderSide: const BorderSide(color: HopoColors.primary, width: 1.5),
        ),
        hintStyle: LuxeTextStyles.bodyMedium.copyWith(color: HopoColors.mutedForeground),
      ),

      // ─── Divider ───────────────────────────────────────
      dividerTheme: const DividerThemeData(
        color: HopoColors.border,
        thickness: 1,
        space: 0,
      ),

      // ─── Chip ──────────────────────────────────────────
      chipTheme: ChipThemeData(
        backgroundColor: HopoColors.card,
        selectedColor: HopoColors.primarySoft,
        side: const BorderSide(color: HopoColors.border),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(HopoDimens.radiusFull),
        ),
        labelStyle: LuxeTextStyles.labelMedium,
      ),

      // ─── SnackBar ──────────────────────────────────────
      snackBarTheme: SnackBarThemeData(
        backgroundColor: HopoColors.foreground,
        contentTextStyle: LuxeTextStyles.bodyMedium.copyWith(color: HopoColors.background),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(HopoDimens.radiusMd),
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
