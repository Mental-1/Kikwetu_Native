import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React, { useState} from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationBadgeProps {
    onPress?: () => void;
    notifications?: {
        id: string;
        title: string;
        message: string;
        timestamp: string;
        isRead: boolean;
    }[];
    onMarkAllAsRead?: () => void;
}

interface NotificationDropdownProps {
    visible: boolean;
    onClose: () => void;
    onMarkAllAsRead: () => void;
    notifications?: {
        id: string;
        title: string;
        message: string;
        timestamp: string;
        isRead: boolean;
    }[];
}

const NotificationDropdown = ({ 
    visible, 
    onClose, 
    onMarkAllAsRead, 
    notifications = [] 
}: NotificationDropdownProps) => {
    if (!visible) return null;

    const mockNotifications = notifications;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} activeOpacity={1}>
                <View style={styles.dropdownContainer}>
                    <View style={styles.dropdown}>
                <View style={styles.dropdownHeader}>
                    <Text style={styles.dropdownTitle}>Notifications</Text>
                    <TouchableOpacity onPress={onMarkAllAsRead} style={styles.markAllButton}>
                        <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.notificationsList} nestedScrollEnabled={true}>
                    {mockNotifications.map((notification) => (
                        <View 
                            key={notification.id} 
                            style={[
                                styles.notificationItem,
                                !notification.isRead && styles.unreadNotification
                            ]}
                        >
                            <View style={styles.notificationContent}>
                                <Text style={styles.notificationTitle}>{notification.title}</Text>
                                <Text style={styles.notificationMessage}>{notification.message}</Text>
                                <Text style={styles.notificationTimestamp}>{notification.timestamp}</Text>
                            </View>
                            {!notification.isRead && <View style={styles.unreadDot} />}
                        </View>
                    ))}
                </ScrollView>
                
                {mockNotifications.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-outline" size={48} color={Colors.grey} />
                        <Text style={styles.emptyStateText}>No notifications yet</Text>
                    </View>
                )}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const NotificationBadge = ({
    notifications = [], 
    onPress, 
    onMarkAllAsRead 
}: NotificationBadgeProps) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handlePress = () => {
        setShowDropdown(!showDropdown);
        onPress?.();
    };

    const handleMarkAllAsRead = () => {
        onMarkAllAsRead?.();
        setShowDropdown(false);
    };

    const handleCloseDropdown = () => {
        setShowDropdown(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.iconButton} 
                onPress={handlePress}
                activeOpacity={1}
            >
                <Ionicons name="notifications-outline" size={24} color={Colors.white} />
                {unreadCount > 0 && <View style={styles.badge} />}
            </TouchableOpacity>
            
            <NotificationDropdown
                visible={showDropdown}
                onClose={handleCloseDropdown}
                onMarkAllAsRead={handleMarkAllAsRead}
                notifications={notifications}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        position: 'relative',
    },
    iconButtonPressed: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Keep same opacity when pressed
    },
    badge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.badgeRed,
        borderWidth: 1,
        borderColor: Colors.white,
    },
    // Dropdown Styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 100, // Position below the header
        paddingRight: 16,
    },
    dropdownContainer: {
        alignItems: 'flex-end',
    },
    dropdown: {
        width: 320,
        backgroundColor: Colors.white,
        borderRadius: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        maxHeight: 400,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightgrey,
    },
    dropdownTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
    },
    markAllButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    markAllText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    notificationsList: {
        maxHeight: 300,
    },
    notificationItem: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightgrey,
        backgroundColor: Colors.white,
    },
    unreadNotification: {
        backgroundColor: '#f8f9ff',
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.black,
        marginBottom: 2,
    },
    notificationMessage: {
        fontSize: 13,
        color: Colors.grey,
        marginBottom: 4,
    },
    notificationTimestamp: {
        fontSize: 11,
        color: Colors.lightgrey,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginLeft: 8,
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 14,
        color: Colors.grey,
        marginTop: 8,
    },
});

export default NotificationBadge;
