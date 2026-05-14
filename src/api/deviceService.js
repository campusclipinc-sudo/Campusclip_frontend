import client from "../libs/HttpClients";

/**
 * Device Service
 * Handles FCM token registration and device management
 */

/**
 * Save or update FCM token
 * @param {string} fcm_token - The Firebase Cloud Messaging token
 * @param {string} device_type - Type of device (web, ios, android)
 * @param {Object} device_info - Optional device information
 * @returns {Promise<Object>} Response data
 */
export const saveFcmToken = async (fcm_token, device_type = 'web', device_info = {}) => {
  const { data } = await client.post('/devices/fcm-token', {
    fcm_token,
    device_type,
    device_info,
  });
  return data;
};

/**
 * Remove FCM token (on logout)
 * @param {string} fcm_token - The Firebase Cloud Messaging token to remove
 * @returns {Promise<Object>} Response data
 */
export const removeFcmToken = async (fcm_token) => {
  const { data } = await client.delete('/devices/fcm-token', {
    data: { fcm_token },
  });
  return data;
};

/**
 * Get all user devices
 * @returns {Promise<Object>} Response data with devices list
 */
export const getUserDevices = async () => {
  const { data } = await client.get('/devices');
  return data;
};

export default {
  saveFcmToken,
  removeFcmToken,
  getUserDevices,
};
