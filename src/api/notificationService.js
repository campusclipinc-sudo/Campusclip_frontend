import axios from '../libs/HttpClients';

class NotificationService {
  /**
   * Get all notifications for the authenticated user
   */
  static async getUserNotifications() {
    try {
      const { data } = await axios.get('/user-notification/list');
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Delete a specific notification by ID
   */
  static async deleteNotification(notificationId) {
    try {
      const { data } = await axios.delete(`/user-notification/delete/${notificationId}`);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Delete all notifications for the authenticated user
   */
  static async deleteAllNotifications() {
    try {
      const { data } = await axios.delete('/user-notification/delete-all');
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Get all follow and club join requests for the authenticated user
   */
  static async getAllRequests(params = {}) {
    try {
      const { data } = await axios.get('/user-notification/requests', { params });
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export { NotificationService };
