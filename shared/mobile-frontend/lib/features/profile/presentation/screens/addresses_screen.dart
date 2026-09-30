import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class AddressesScreen extends ConsumerStatefulWidget {
  const AddressesScreen({super.key});
  @override
  ConsumerState<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends ConsumerState<AddressesScreen> {
  List<Address> _addresses = [];
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final list = await ref.read(apiServiceProvider).getAddresses();
      if (mounted) setState(() { _addresses = list; _isLoading = false; });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: const HopoAppBar(title: 'My Addresses'),
      floatingActionButton: FloatingActionButton(
        backgroundColor: HopoColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
        onPressed: () {},
      ),
      body: _isLoading ? const HopoLoadingIndicator()
          : _addresses.isEmpty ? const HopoEmptyState(icon: Icons.location_on_outlined, title: 'No Addresses', subtitle: 'Add a delivery address to get started.')
          : ListView.separated(
              padding: const EdgeInsets.all(HopoDimens.pagePadding), itemCount: _addresses.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) {
                final a = _addresses[i];
                return Container(
                  padding: const EdgeInsets.all(HopoDimens.cardPadding),
                  decoration: BoxDecoration(color: HopoColors.card, borderRadius: BorderRadius.circular(HopoDimens.radiusMd), border: a.isDefault ? Border.all(color: HopoColors.primary, width: 1.5) : null),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      HopoBadge(label: a.label),
                      if (a.isDefault) ...[const SizedBox(width: 8), const HopoBadge(label: 'Default', color: HopoColors.goldSoft, textColor: HopoColors.gold)],
                      const Spacer(),
                      IconButton(icon: const Icon(Icons.edit_outlined, size: 18, color: HopoColors.mutedForeground), onPressed: () {}),
                      IconButton(icon: const Icon(Icons.delete_outline, size: 18, color: HopoColors.destructive), onPressed: () async {
                        await ref.read(apiServiceProvider).deleteAddress(a.id); _load();
                      }),
                    ]),
                    const SizedBox(height: 8),
                    Text(a.fullName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    Text('${a.addressLine1}${a.addressLine2 != null ? ', ${a.addressLine2}' : ''}', style: const TextStyle(fontSize: 13, color: HopoColors.mutedForeground)),
                    Text('${a.city}, ${a.state} - ${a.pincode}', style: const TextStyle(fontSize: 13, color: HopoColors.mutedForeground)),
                    Text(a.phone, style: const TextStyle(fontSize: 13, color: HopoColors.mutedForeground)),
                  ]),
                );
              },
            ),
    );
  }
}
