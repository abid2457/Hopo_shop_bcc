import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeIn;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    _fadeIn = CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.6, curve: Curves.easeOut));
    _scale = Tween<double>(begin: 0.8, end: 1.0).animate(CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.6, curve: Curves.easeOutBack)));
    _controller.forward();

    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) context.go('/onboarding');
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: HopoColors.gradientRoyal),
        child: Center(
          child: FadeTransition(
            opacity: _fadeIn,
            child: ScaleTransition(
              scale: _scale,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 80, height: 80,
                    decoration: BoxDecoration(
                      color: HopoColors.gold,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [BoxShadow(color: HopoColors.gold.withValues(alpha: 0.3), blurRadius: 30, spreadRadius: 5)],
                    ),
                    child: const Center(child: Text('L', style: TextStyle(fontSize: 40, fontWeight: FontWeight.w300, color: Colors.white, fontFamily: 'serif'))),
                  ),
                  const SizedBox(height: 24),
                  const Text('HOPO SHOP', style: TextStyle(fontSize: 36, fontWeight: FontWeight.w300, color: HopoColors.primaryForeground, letterSpacing: 12, fontFamily: 'serif')),
                  const SizedBox(height: 8),
                  Text("Premium Fashion Store", style: TextStyle(fontSize: 13, color: HopoColors.primaryForeground.withValues(alpha: 0.7), letterSpacing: 2)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
