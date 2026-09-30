import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/theme/colors.dart';
import '../../../../config/theme/dimensions.dart';
import '../../../../shared/widgets/hopo_widgets.dart';
import '../../../../core/providers/core_providers.dart';
import '../../../../core/models/models.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});
  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  List<AppNotification> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    try {
      final data = await ref.read(apiServiceProvider).getNotifications();
      final list = (data['notifications'] as List?)?.map((e) => AppNotification.fromJson(e as Map<String, dynamic>)).toList() ?? [];
      if (mounted) setState(() { _notifications = list; _isLoading = false; });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  IconData _iconFor(String type) => switch (type) {
    'ORDER' => Icons.receipt_long_outlined,
    'PROMOTION' => Icons.local_offer_outlined,
    'DELIVERY' => Icons.local_shipping_outlined,
    _ => Icons.notifications_outlined,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: HopoColors.background,
      appBar: HopoAppBar(title: 'Notifications', actions: [
        if (_notifications.isNotEmpty)
          TextButton(
            onPressed: () async { await ref.read(apiServiceProvider).markAllNotificationsRead(); _load(); },
            child: const Text('Mark all read', style: TextStyle(fontSize: 12, color: HopoColors.primary)),
          ),
      ]),
      body: _isLoading
          ? const HopoLoadingIndicator()
          : _notifications.isEmpty
              ? const HopoEmptyState(icon: Icons.notifications_off_outlined, title: 'No Notifications', subtitle: 'You\'re all caught up!')
              : ListView.separated(
                  padding: const EdgeInsets.all(HopoDimens.pagePadding),
                  itemCount: _notifications.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) {
                    final n = _notifications[i];
                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: n.isRead ? HopoColors.card : HopoColors.primarySoft.withValues(alpha: 0.3),
                        borderRadius: BorderRadius.circular(HopoDimens.radiusMd),
                        border: n.isRead ? null : Border.all(color: HopoColors.primary.withValues(alpha: 0.15)),
                      ),
                      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: HopoColors.primarySoft, borderRadius: BorderRadius.circular(10)),
                          child: Icon(_iconFor(n.type), size: 18, color: HopoColors.primary),
                        ),
                        const SizedBox(width: 12),
                        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(n.title, style: TextStyle(fontSize: 14, fontWeight: n.isRead ? FontWeight.w500 : FontWeight.w600, color: HopoColors.foreground)),
                          const SizedBox(height: 4),
                          Text(n.body, style: const TextStyle(fontSize: 13, color: HopoColors.mutedForeground, height: 1.4)),
                          const SizedBox(height: 4),
                          Text(_timeAgo(n.createdAt), style: const TextStyle(fontSize: 11, color: HopoColors.mutedForeground)),
                        ])),
                        if (!n.isRead)
                          Container(width: 8, height: 8, decoration: const BoxDecoration(color: HopoColors.primary, shape: BoxShape.circle)),
                      ]),
                    );
                  },
                ),
    );
  }

  String _timeAgo(DateTime d) {
    final diff = DateTime.now().difference(d);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}
