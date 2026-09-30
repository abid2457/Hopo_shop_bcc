import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _current = 0;

  static const _slides = [
    _Slide(icon: Icons.diamond_outlined, title: 'Discover Luxury', subtitle: 'Explore curated collections of premium ethnic and western wear crafted for the modern Indian woman.'),
    _Slide(icon: Icons.local_shipping_outlined, title: 'Seamless Shopping', subtitle: 'From handpicked sarees to contemporary fusion — enjoy doorstep delivery with hassle-free returns.'),
    _Slide(icon: Icons.auto_awesome_outlined, title: 'Your Style, Elevated', subtitle: 'AI-powered recommendations, exclusive offers, and a rewards program designed just for you.'),
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.all(HopoDimens.pagePadding),
                child: GestureDetector(
                  onTap: () => context.go('/home'),
                  child: const Text('Skip', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: HopoColors.mutedForeground)),
                ),
              ),
            ),
            // Page view
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _slides.length,
                onPageChanged: (i) => setState(() => _current = i),
                itemBuilder: (_, i) {
                  final slide = _slides[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 120, height: 120,
                          decoration: BoxDecoration(
                            gradient: HopoColors.gradientRoyal,
                            borderRadius: BorderRadius.circular(30),
                            boxShadow: [BoxShadow(color: HopoColors.primary.withValues(alpha: 0.2), blurRadius: 24, offset: const Offset(0, 8))],
                          ),
                          child: Icon(slide.icon, size: 48, color: HopoColors.gold),
                        ),
                        const SizedBox(height: 40),
                        Text(slide.title, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w700, color: HopoColors.foreground, letterSpacing: -0.5), textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        Text(slide.subtitle, style: const TextStyle(fontSize: 15, color: HopoColors.mutedForeground, height: 1.5), textAlign: TextAlign.center),
                      ],
                    ),
                  );
                },
              ),
            ),
            // Indicators + button
            Padding(
              padding: const EdgeInsets.all(HopoDimens.pagePadding),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_slides.length, (i) {
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: i == _current ? 24 : 8, height: 8,
                        decoration: BoxDecoration(
                          color: i == _current ? HopoColors.primary : HopoColors.border,
                          borderRadius: BorderRadius.circular(HopoDimens.radiusFull),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 32),
                  HopoButton(
                    label: _current == _slides.length - 1 ? 'Get Started' : 'Next',
                    onPressed: () {
                      if (_current < _slides.length - 1) {
                        _controller.nextPage(duration: const Duration(milliseconds: 350), curve: Curves.easeInOut);
                      } else {
                        context.go('/home');
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Slide {
  final IconData icon;
  final String title;
  final String subtitle;
  const _Slide({required this.icon, required this.title, required this.subtitle});
}
