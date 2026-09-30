import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  bool _showOtp = false;
  final _otpController = TextEditingController();

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: const HopoAppBar(title: 'Sign In', showBack: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(HopoDimens.pagePadding),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              // Welcome text
              const Text('Welcome to', style: TextStyle(fontSize: 16, color: HopoColors.mutedForeground)),
              const SizedBox(height: 4),
              const Text('HOPO SHOP', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: HopoColors.primary, letterSpacing: 4)),
              const SizedBox(height: 8),
              const Text('Sign in to access your cart, wishlist, and orders.', style: TextStyle(fontSize: 14, color: HopoColors.mutedForeground, height: 1.4)),
              const SizedBox(height: 40),

              // Phone input
              if (!_showOtp) ...[
                const Text('Phone Number', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: HopoColors.foreground)),
                const SizedBox(height: 8),
                Container(
                  height: HopoDimens.inputHeight,
                  decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd), border: Border.all(color: HopoColors.border)),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: const Text('+91', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: HopoColors.foreground)),
                      ),
                      Container(width: 1, height: 28, color: HopoColors.border),
                      Expanded(
                        child: TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          maxLength: 10,
                          style: const TextStyle(fontSize: 15, color: HopoColors.foreground, letterSpacing: 1),
                          decoration: const InputDecoration(hintText: 'Enter mobile number', border: InputBorder.none, counterText: '', contentPadding: EdgeInsets.symmetric(horizontal: 16)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                HopoButton(
                  label: 'Send OTP',
                  isLoading: auth.isLoading,
                  onPressed: _phoneController.text.length >= 10 ? () => setState(() => _showOtp = true) : null,
                ),
              ],

              // OTP input
              if (_showOtp) ...[
                const Text('Enter OTP', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: HopoColors.foreground)),
                const SizedBox(height: 4),
                Text('Sent to +91 ${_phoneController.text}', style: const TextStyle(fontSize: 13, color: HopoColors.mutedForeground)),
                const SizedBox(height: 16),
                Container(
                  height: HopoDimens.inputHeight,
                  decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd), border: Border.all(color: HopoColors.border)),
                  child: TextField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w600, letterSpacing: 12, color: HopoColors.foreground),
                    decoration: const InputDecoration(hintText: '• • • • • •', border: InputBorder.none, counterText: ''),
                  ),
                ),
                const SizedBox(height: 20),
                HopoButton(
                  label: 'Verify & Sign In',
                  isLoading: auth.isLoading,
                  onPressed: () async {
                    // In production, verify Firebase OTP. For now, use dev bypass.
                    final success = await ref.read(authProvider.notifier).login('dev-token-${_phoneController.text}');
                    if (success && mounted) context.go('/home');
                  },
                ),
                const SizedBox(height: 16),
                Center(
                  child: GestureDetector(
                    onTap: () => setState(() { _showOtp = false; _otpController.clear(); }),
                    child: const Text('Change number', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: HopoColors.primary)),
                  ),
                ),
              ],

              const SizedBox(height: 32),
              // Divider
              Row(
                children: [
                  const Expanded(child: Divider(color: HopoColors.border)),
                  Padding(padding: const EdgeInsets.symmetric(horizontal: 16), child: Text('or continue with', style: TextStyle(fontSize: 12, color: HopoColors.mutedForeground))),
                  const Expanded(child: Divider(color: HopoColors.border)),
                ],
              ),
              const SizedBox(height: 24),
              // Social login buttons
              _SocialButton(icon: Icons.g_mobiledata_rounded, label: 'Google', onTap: () {}),
              const SizedBox(height: 12),
              _SocialButton(icon: Icons.apple_rounded, label: 'Apple', onTap: () {}),

              if (auth.error != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: HopoColors.destructive.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(HopoDimens.radiusSm)),
                  child: Text(auth.error!, style: const TextStyle(fontSize: 13, color: HopoColors.destructive)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _SocialButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _SocialButton({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(HopoDimens.radiusMd),
      child: Container(
        height: HopoDimens.buttonHeight,
        decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd), border: Border.all(color: HopoColors.border)),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 22, color: HopoColors.foreground),
            const SizedBox(width: 12),
            Text(label, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: HopoColors.foreground)),
          ],
        ),
      ),
    );
  }
}
