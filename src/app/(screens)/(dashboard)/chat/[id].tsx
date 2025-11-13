import ContextMenu, { ContextMenuItem } from '@/components/ui/ContextMenu';
import CustomDialog from '@/components/ui/CustomDialog';
import { Colors } from '@/src/constants/constant';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { copyToClipboard } from '@/utils/clipboardUtils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import {
  Image,
  KeyboardAvoidingView,
  GestureResponderEvent,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock message data
const mockMessages = {
  '1': [
    {
      id: '1',
      text: 'Hi! Is this iPhone still available?',
      senderId: 'user',
      timestamp: '10:30 AM',
      isRead: true,
    },
    {
      id: '2',
      text: 'Yes, it\'s still available! Are you interested?',
      senderId: 'seller1',
      timestamp: '10:32 AM',
      isRead: true,
    },
    {
      id: '3',
      text: 'Great! What\'s the best price you can offer?',
      senderId: 'user',
      timestamp: '10:35 AM',
      isRead: true,
    },
    {
      id: '4',
      text: 'I can offer Kes 15,000 for it. The phone is in excellent condition.',
      senderId: 'seller1',
      timestamp: '10:37 AM',
      isRead: true,
    },
    {
      id: '5',
      text: 'That sounds fair. When can I come and see it?',
      senderId: 'user',
      timestamp: '10:40 AM',
      isRead: false,
    },
    {
      id: '6',
      text: 'I\'m free tomorrow afternoon. Would 2 PM work for you?',
      senderId: 'seller1',
      timestamp: '10:42 AM',
      isRead: false,
    },
  ],
  '2': [
    {
      id: '1',
      text: 'Hello! I saw your handbag listing. Is it authentic?',
      senderId: 'user',
      timestamp: '2:15 PM',
      isRead: true,
    },
    {
      id: '2',
      text: 'Yes, it\'s 100% authentic with original receipt.',
      senderId: 'seller2',
      timestamp: '2:18 PM',
      isRead: true,
    },
  ],
};

// Mock seller info
const mockSellerInfo = {
  '1': {
    id: 'seller1',
    name: 'John Electronics',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    online: true,
  },
  '2': {
    id: 'seller2',
    name: 'Sarah Fashion',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    online: false,
  },
};

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isRead: boolean;
}

const Chat = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messageText, setMessageText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMessageContextMenu, setShowMessageContextMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const flatListRef = useRef<React.ComponentRef<typeof FlashList<Message>>>(null);
  
  const { showAlert, AlertComponent } = useCustomAlert();
  const { copy: showCopyAlert, error: showErrorAlert } = createAlertHelpers(showAlert);

  const messages = mockMessages[id as keyof typeof mockMessages] || [];
  const sellerInfo = mockSellerInfo[id as keyof typeof mockSellerInfo] || mockSellerInfo['1'];

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  const handleSendMessage = useCallback(() => {
    if (messageText.trim()) {
      // In a real app, this would send the message to the backend
      console.log('Sending message:', messageText);
      setMessageText('');
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messageText]);

  const handleMorePress = useCallback(() => {
    setShowDropdown(!showDropdown);
  }, [showDropdown]);

  const handleDeleteConversation = useCallback(() => {
    setShowDropdown(false);
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    setShowDeleteDialog(false);
    // In a real app, this would delete the conversation from the backend
    console.log('Deleting conversation:', id);
    router.back();
  }, [id, router]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const handleMessageLongPress = useCallback((message: Message, event: GestureResponderEvent) => {
    setSelectedMessage(message);
    const { width, height } = Dimensions.get('window');
    const menuWidth = 200;
    const menuHeight = 150;

    const x = Math.max(0, Math.min(event.nativeEvent.pageX - (menuWidth / 2), width - menuWidth));
    const y = Math.max(0, Math.min(event.nativeEvent.pageY - (menuHeight / 2), height - menuHeight));
    
    setContextMenuPosition({ x, y });
    setShowMessageContextMenu(true);
  }, []);

  const handleMessageContextMenuItemPress = useCallback(async (item: ContextMenuItem) => {
    switch (item.id) {
      case 'copy':
        if (selectedMessage?.text) {
          const success = await copyToClipboard(selectedMessage.text);
          if (success) {
            showCopyAlert();
          } else {
            showErrorAlert('Copy Failed', 'Unable to copy text to clipboard');
          }
        }
        break;
      case 'reply':
        // Handle reply to message
        console.log('Reply to message:', selectedMessage?.text);
        break;
      case 'delete':
        // Handle delete message
        console.log('Delete message:', selectedMessage?.id);
        break;
      default:
        break;
    }
  }, [selectedMessage, showCopyAlert, showErrorAlert]);

  const messageContextMenuItems: ContextMenuItem[] = [
    {
      id: 'copy',
      title: 'Copy',
      icon: 'copy-outline',
      color: Colors.black,
    },
    {
      id: 'reply',
      title: 'Reply',
      icon: 'arrow-undo-outline',
      color: Colors.primary,
    },
    {
      id: 'delete',
      title: 'Delete',
      icon: 'trash-outline',
      destructive: true,
    },
  ];

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isUser = item.senderId === 'user';
    
    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.sellerMessageContainer
        ]}
        onLongPress={(event) => handleMessageLongPress(item, event)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.messageBubble,
          isUser ? styles.userMessageBubble : styles.sellerMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.sellerMessageText
          ]}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isUser ? styles.userMessageTime : styles.sellerMessageTime
            ]}>
              {item.timestamp}
            </Text>
            {isUser && (
              <Ionicons
                name={item.isRead ? "checkmark-done" : "checkmark"}
                size={16}
                color={item.isRead ? Colors.primary : Colors.grey}
                style={styles.readIcon}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleMessageLongPress]);

  const renderHeader = useCallback(() => (
    <View style={styles.chatHeader}>
      <Text style={styles.listingTitle}>iPhone 13 Pro Max - Excellent Condition</Text>
      <Text style={styles.priceText}>Kes 18,000</Text>
    </View>
  ), []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <StatusBar style="dark" />
          
          {/* Header */}
          <SafeAreaView style={styles.header} edges={['top']}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="chevron-back" size={24} color={Colors.black} />
            </TouchableOpacity>
            
            <View style={styles.sellerInfo}>
              <Image source={{ uri: sellerInfo.avatar }} style={styles.sellerAvatar} />
              <View style={styles.sellerDetails}>
                <Text style={styles.sellerName}>{sellerInfo.name}</Text>
                <View style={styles.onlineStatus}>
                  <View style={[
                    styles.onlineDot,
                    { backgroundColor: sellerInfo.online ? Colors.green : Colors.grey }
                  ]} />
                  <Text style={styles.onlineText}>
                    {sellerInfo.online ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
              <Ionicons name="ellipsis-vertical" size={20} color={Colors.black} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Dropdown Menu */}
          {showDropdown && (
            <View style={styles.dropdownContainer}>
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={handleDeleteConversation}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color={Colors.red} />
                <Text style={styles.dropdownText}>Delete Conversation</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Listing Info Header */}
          {renderHeader()}

          {/* Messages List */}
          <FlashList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Message Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                placeholderTextColor={Colors.grey}
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={messageText.trim() ? Colors.white : Colors.grey} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Delete Dialog */}
          <CustomDialog
            visible={showDeleteDialog}
            title="Delete Conversation"
            message="Are you sure you want to delete this conversation? This action cannot be undone."
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

          {/* Message Context Menu */}
          <ContextMenu
            visible={showMessageContextMenu}
            items={messageContextMenuItems}
            onItemPress={handleMessageContextMenuItemPress}
            onClose={() => setShowMessageContextMenu(false)}
            position={contextMenuPosition}
          />

          {/* Custom Alert */}
          <AlertComponent />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightgrey,
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  sellerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightgrey,
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 2,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: Colors.grey,
  },
  moreButton: {
    padding: 4,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    minWidth: 180,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightgrey,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.black,
    marginLeft: 12,
    fontWeight: '500',
  },
  chatHeader: {
    backgroundColor: Colors.black,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightgrey,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  sellerMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  sellerMessageBubble: {
    backgroundColor: '#F1F1F2',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.white,
  },
  sellerMessageText: {
    color: Colors.black,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sellerMessageTime: {
    color: Colors.grey,
  },
  readIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 0.5,
    borderTopColor: Colors.lightgrey,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F1F1F2',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  sendButtonInactive: {
    backgroundColor: 'transparent',
  },
});

export default Chat;
