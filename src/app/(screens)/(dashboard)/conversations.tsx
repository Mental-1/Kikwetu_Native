import ContextMenu, { ContextMenuItem } from '@/components/ui/ContextMenu';
import CustomDialog from '@/components/ui/CustomDialog';
import { Colors } from '@/src/constants/constant';
import { useConversations, useUnreadCount } from '@/src/hooks/useApiMessages';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { copyToClipboard } from '@/utils/clipboardUtils';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  GestureResponderEvent
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Conversation {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  // Note: unreadCount is expected to be calculated by the backend/API
  unreadCount: number;
  listingTitle: string;
}

const Conversations = () => {
  const router = useRouter();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [errorDismissed, setErrorDismissed] = useState(false);

  const { showAlert, AlertComponent } = useCustomAlert();
  const { copy: showCopyAlert, error: showErrorAlert } = createAlertHelpers(showAlert);

  const { data: conversations, isLoading, error: fetchError, refetch } = useConversations();
  const { data: unreadCount } = useUnreadCount();

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleConversationPress = useCallback((conversationId: string) => {
    router.push(`/(screens)/(dashboard)/chat/${conversationId}`);
  }, [router]);

  const handleConversationLongPress = useCallback((conversation: Conversation, event: GestureResponderEvent) => {
    setSelectedConversation(conversation);
    setContextMenuPosition({ x: event.nativeEvent.pageX - 100, y: event.nativeEvent.pageY - 50 });
    setShowContextMenu(true);
  }, []);

  const handleContextMenuItemPress = useCallback(async (item: ContextMenuItem) => {
    switch (item.id) {
      case 'delete':
        setShowDeleteDialog(true);
        break;
      case 'mark_read':
        console.log('Mark as read:', selectedConversation?.id);
        break;
      case 'mute':
        console.log('Mute conversation:', selectedConversation?.id);
        break;
      case 'copy_details':
        if (selectedConversation) {
          const details = `${selectedConversation.sellerName}\n${selectedConversation.listingTitle}\n${selectedConversation.lastMessage}`;
          const success = await copyToClipboard(details);
          if (success) {
            showCopyAlert();
          } else {
            showErrorAlert('Copy Failed', 'Unable to copy text to clipboard');
          }
        }
        break;
      default:
        break;
    }
  }, [selectedConversation, showCopyAlert, showErrorAlert]);

  const handleDeleteConfirm = useCallback(() => {
    setShowDeleteDialog(false);
    console.log('Deleting conversation:', selectedConversation?.id);
    setSelectedConversation(null);
  }, [selectedConversation]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'copy_details',
      title: 'Copy Details',
      icon: 'copy-outline',
      color: Colors.black,
    },
    {
      id: 'mark_read',
      title: 'Mark as Read',
      icon: 'checkmark-circle-outline',
      color: Colors.primary,
    },
    {
      id: 'mute',
      title: 'Mute Notifications',
      icon: 'notifications-off-outline',
      color: Colors.grey,
    },
    {
      id: 'delete',
      title: 'Delete Conversation',
      icon: 'trash-outline',
      destructive: true,
    },
  ];

  const renderConversationItem = useCallback(({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item.id)}
      onLongPress={(event) => handleConversationLongPress(item, event)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.sellerAvatar }} style={styles.avatar} />
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.sellerName} numberOfLines={1}>
            {item.sellerName}
          </Text>
          <Text style={styles.messageTime}>
            {item.lastMessageTime}
          </Text>
        </View>

        <Text style={styles.listingTitle} numberOfLines={1}>
          {item.listingTitle}
        </Text>

        <Text style={[
          styles.lastMessage,
          item.unreadCount > 0 && styles.unreadMessage
        ]} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  ), [handleConversationPress, handleConversationLongPress]);

  const sortedConversations = useMemo(() => {
    if (!conversations) return [];
    return [...conversations].sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return 0;
    });
  }, [conversations]);

  const EmptyState = () => (
    <View style={styles.fallbackContainer}>
      <Ionicons name="chatbubbles-outline" size={60} color={Colors.grey} />
      <Text style={styles.fallbackText}>No conversations.</Text>
      <Text style={styles.fallbackSubText}>Text sellers to start one.</Text>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.fallbackContainer}>
      <Ionicons name="cloud-offline-outline" size={60} color={Colors.grey} />
      <Text style={styles.fallbackText}>Failed to fetch conversations.</Text>
      <Text style={styles.fallbackSubText}>Please try again later.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => { setErrorDismissed(false); refetch(); }}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (isLoading && !conversations) {
      return <ActivityIndicator style={{ marginTop: 50 }} size="large" color={Colors.primary} />;
    }

    if (fetchError && errorDismissed) {
      return <ErrorState />;
    }

    if (!isLoading && sortedConversations.length === 0) {
      return <EmptyState />;
    }

    return (
      <FlashList
        data={sortedConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[Colors.primary]}
          />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
      </SafeAreaView>

      {renderContent()}

      <ContextMenu
        visible={showContextMenu}
        items={contextMenuItems}
        onItemPress={handleContextMenuItemPress}
        onClose={() => setShowContextMenu(false)}
        position={contextMenuPosition}
      />

      <CustomDialog
        visible={showDeleteDialog}
        title="Delete Conversation"
        message={`Are you sure you want to delete your conversation with ${selectedConversation?.sellerName}? This action cannot be undone.`}
        confirmText="Delete"
        denyText="Cancel"
        onConfirm={handleDeleteConfirm}
        onDeny={handleDeleteCancel}
        icon="trash-outline"
        iconColor={Colors.red}
        confirmColor={Colors.red}
        denyColor={Colors.grey}
        confirmWeight="600"
        denyWeight="400"
      />

      {fetchError && !errorDismissed && (
        <CustomDialog
          visible={true}
          title="Error Loading Conversations"
          message={fetchError.message || "Failed to load conversations. Please try again."}
          confirmText="Retry"
          onConfirm={() => { setErrorDismissed(false); refetch(); }}
          denyText="Close"
          onDeny={() => setErrorDismissed(true)}
          icon="warning-outline"
          iconColor={Colors.red}
        />
      )}

      <AlertComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightgrey,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  searchButton: {
    padding: 4,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.2,
    borderBottomColor: Colors.lightgrey,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightgrey,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  unreadCount: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: Colors.grey,
    marginLeft: 8,
  },
  listingTitle: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 18,
  },
  unreadMessage: {
    fontWeight: '500',
    color: Colors.black,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    marginTop: 16,
  },
  fallbackSubText: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Conversations;
