/**
 * Messages Service  
 * Handles messaging and conversations API calls
 */

import { ApiConversation, ApiMessage } from '../types/api.types';
import { apiClient, ApiResponse, PaginatedResponse } from './apiClient';

class MessagesService {
  /**
   * Get conversations
   */
  async getConversations(): Promise<ApiResponse<ApiConversation[]>> {
    return await apiClient.get<ApiConversation[]>('/messages/conversations');
  }

  /**
   * Get conversation messages
   */
  async getConversation(conversationId: string, page = 1): Promise<PaginatedResponse<ApiMessage>> {
    return await apiClient.get(`/messages/conversations/${conversationId}`, {
      page: page.toString(),
      pageSize: '50',
    }) as any;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    return await apiClient.get<{ unreadCount: number }>('/messages/unread-count');
  }

  /**
   * Send message
   */
  async sendMessage(data: {
    recipient_id: string;
    message: string;
  }): Promise<ApiResponse<ApiMessage>> {
    return await apiClient.post<ApiMessage>('/messages', data);
  }

  /**
   * Update message
   */
  async updateMessage(id: string, message: string): Promise<ApiResponse<ApiMessage>> {
    return await apiClient.put<ApiMessage>(`/messages/${id}`, { message });
  }

  /**
   * Delete message
   */
  async deleteMessage(id: string): Promise<ApiResponse<void>> {
    return await apiClient.delete<void>(`/messages/${id}`);
  }

  /**
   * Mark message as read
   */
  async markAsRead(id: string): Promise<ApiResponse<void>> {
    return await apiClient.patch<void>(`/messages/${id}/read`);
  }

  /**
   * Report message
   */
  async reportMessage(id: string, reason: string): Promise<ApiResponse<void>> {
    return await apiClient.post<void>(`/messages/${id}/report`, { reason });
  }
}

export const messagesService = new MessagesService();

