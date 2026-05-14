import client from '../libs/HttpClients';

const ChatService = {
  /**
   * Get group chat history for a room
   * @param {string} roomId - Room/Group ID
   * @param {object} params - Query parameters (cursor, limit)
   * @returns {Promise} Chat history data
   */
  async getGroupChatHistory(roomId, params = {}) {
    const { data } = await client.get(`/chat/group/${roomId}`, { params });
    return data.data; // Return nested data object for consistency
  },

  /**
   * Get private chat history between current user and recipient
   * @param {string} recipientId - Recipient user ID
   * @param {object} params - Query parameters (cursor, limit)
   * @returns {Promise} Chat history data
   */
  async getPrivateChatHistory(recipientId, params = {}) {
    const { data } = await client.get(`/chat/private/${recipientId}`, { params });
    return data.data; // Return nested data object
  },

  /**
   * Get list of all conversations (private and group)
   * @param {object} params - Query parameters (message_type)
   * @returns {Promise} Conversations data
   */
  async getConversations(params = {}) {
    const { data } = await client.get('/chat/conversations', { params });
    return data;
  },

  /**
   * Get list of users that current user can chat with (based on follow relationship)
   * @param {object} params - Query parameters (search)
   * @returns {Promise} Eligible users data
   */
  async getChatEligibleUsers(params = {}) {
    const { data } = await client.get('/chat/eligible-users', { params });
    return data;
  },

  /**
   * Send a message
   * @param {object} messageData - Message data (message, to_user_id, room_id, message_type, media_type, metadata)
   * @returns {Promise} Created message data
   */
  async sendMessage(messageData) {
    const { data } = await client.post('/chat/send', messageData);
    return data;
  },

  /**
   * Mark message(s) as read
   * @param {object} readData - Read data (message_ids, recipient_id, room_id)
   * @returns {Promise} Update result
   */
  async markAsRead(readData) {
    const { data } = await client.post('/chat/mark-read', readData);
    return data;
  },

  /**
   * Get unread message count
   * @returns {Promise} Unread count data
   */
  async getUnreadCount() {
    const { data } = await client.get('/chat/unread-count');
    return data;
  },

  /**
   * Delete a message
   * @param {string} messageId - Message ID to delete
   * @returns {Promise} Delete result
   */
  async deleteMessage(messageId) {
    const { data } = await client.delete(`/chat/message/${messageId}`);
    return data;
  },
};

export default ChatService;

