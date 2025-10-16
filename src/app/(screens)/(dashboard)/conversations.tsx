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
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Will be replaced with API data
const mockConversations = [
  {
    id: '1',
    sellerId: 'seller1',
    sellerName: 'John Electronics',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Hi! Is this item still available? I can offer Kes 15,000',
    lastMessageTime: '2 min ago',
    unreadCount: 2,
    listingTitle: 'iPhone 13 Pro Max - Excellent Condition',
  },
  {
    id: '2',
    sellerId: 'seller2',
    sellerName: 'Sarah Fashion',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Thank you for your interest! Yes, it\'s still available.',
    lastMessageTime: '1 hour ago',
    unreadCount: 0,
    listingTitle: 'Designer Handbag - Brand New',
  },
  {
    id: '3',
    sellerId: 'seller3',
    sellerName: 'Mike Sports',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'Perfect! When can you pick it up?',
    lastMessageTime: '3 hours ago',
    unreadCount: 1,
    listingTitle: 'Nike Air Max 270 - Size 10',
  },
  {
    id: '4',
    sellerId: 'seller4',
    sellerName: 'Lisa Home',
    sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'I can meet you at Westgate Mall tomorrow at 2 PM',
    lastMessageTime: '1 day ago',
    unreadCount: 0,
    listingTitle: 'Sofa Set - 3 Seater + 2 Seater',
  },
  {
    id: '5',
    sellerId: 'seller5',
    sellerName: 'David Tech',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    lastMessage: 'The laptop is in perfect condition, barely used',
    lastMessageTime: '2 days ago',
    unreadCount: 3,
    listingTitle: 'MacBook Pro 13" - 2021 Model',
  },
];

interface Conversation {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  listingTitle: string;
}

const Conversations = () => {
  const router = useRouter();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  const { showAlert, AlertComponent } = useCustomAlert();
  const { copy: showCopyAlert, error: showErrorAlert } = createAlertHelpers(showAlert);

  // Fetch conversations from API
  const { data: conversationsData, isLoading, error: fetchError, refetch } = useConversations();
  const { data: unreadCount } = useUnreadCount();

  // Transform API data or use mock data for now
  const conversations = conversationsData || mockConversations;

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleConversationPress = useCallback((conversationId: string) => {
    router.push(`/(screens)/(dashboard)/chat/${conversationId}`);
  }, [router]);

  const handleConversationLongPress = useCallback((conversation: Conversation, event: any) => {
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
        // Handle mark as read
        console.log('Mark as read:', selectedConversation?.id);
        break;
      case 'mute':
        // Handle mute conversation
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
    // In a real app, this would delete the conversation from the backend
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
  ), [handleConversationPress]);

  const sortedConversations = useMemo(() => {
    return [...mockConversations].sort((a, b) => {
      // Simple sorting by unread count first, then by time
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return 0; // Keep original order for demo
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Conversations List */}
      <FlatList
        data={sortedConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        style={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
      />

      {/* Context Menu */}
      <ContextMenu
        visible={showContextMenu}
        items={contextMenuItems}
        onItemPress={handleContextMenuItemPress}
        onClose={() => setShowContextMenu(false)}
        position={contextMenuPosition}
      />

      {/* Delete Dialog */}
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

      {/* Custom Alert */}
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
});

export default Conversations;
