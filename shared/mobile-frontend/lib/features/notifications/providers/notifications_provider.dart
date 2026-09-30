import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/models/models.dart';
import '../../../core/providers/core_providers.dart';

class NotificationsState {
  final List<AppNotification> notifications;
  final int unreadCount;
  final bool isLoading;
  const NotificationsState({this.notifications = const [], this.unreadCount = 0, this.isLoading = false});
}

class NotificationsNotifier extends Notifier<NotificationsState> {
  @override
  NotificationsState build() => const NotificationsState();

  Future<void> fetchNotifications() async {
    state = NotificationsState(notifications: state.notifications, isLoading: true);
    try {
      final api = ref.read(apiServiceProvider);
      final data = await api.getNotifications();
      final list = (data['notifications'] as List<dynamic>?)
          ?.map((e) => AppNotification.fromJson(e as Map<String, dynamic>)).toList() ?? [];
      final unread = data['unreadCount'] as int? ?? 0;
      state = NotificationsState(notifications: list, unreadCount: unread);
    } catch (e) {
      debugPrint('[Notifications] Fetch failed: $e');
      state = NotificationsState(notifications: state.notifications);
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      final api = ref.read(apiServiceProvider);
      await api.markNotificationRead(id);
      final updated = state.notifications.map((n) =>
        n.id == id ? AppNotification(id: n.id, type: n.type, title: n.title, body: n.body, isRead: true, createdAt: n.createdAt) : n
      ).toList();
      state = NotificationsState(notifications: updated, unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0);
    } catch (_) {}
  }

  Future<void> markAllRead() async {
    try {
      final api = ref.read(apiServiceProvider);
      await api.markAllNotificationsRead();
      final updated = state.notifications.map((n) =>
        AppNotification(id: n.id, type: n.type, title: n.title, body: n.body, isRead: true, createdAt: n.createdAt)
      ).toList();
      state = NotificationsState(notifications: updated, unreadCount: 0);
    } catch (_) {}
  }
}

final notificationsProvider = NotifierProvider<NotificationsNotifier, NotificationsState>(NotificationsNotifier.new);
