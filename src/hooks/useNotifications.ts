import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/authContext';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, title, message, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        const mappedNotifications: Notification[] = data.map(dbNotif => ({
            id: dbNotif.id,
            user_id: dbNotif.user_id,
            title: dbNotif.title,
            message: dbNotif.message,
            isRead: dbNotif.is_read,
            timestamp: dbNotif.created_at,
        }));
        setNotifications(mappedNotifications);
        setUnreadCount(mappedNotifications.filter(n => !n.isRead).length);
      }
    };

    fetchNotifications();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const dbNewNotification = payload.new;
          const newNotification: Notification = {
              id: dbNewNotification.id,
              user_id: dbNewNotification.user_id,
              title: dbNewNotification.title,
              message: dbNewNotification.message,
              isRead: dbNewNotification.is_read,
              timestamp: dbNewNotification.created_at,
          };
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
    else {
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
      }
    } catch (error) {
      console.error('Unexpected error marking all notifications as read:', error);
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};