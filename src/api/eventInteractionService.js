import client from "../libs/HttpClients";

/**
 * Event Interaction Service
 * Handles all like and comment operations for events
 */

/**
 * Toggle like on an event (like/unlike)
 * @param {number} event_id - The event ID
 * @returns {Promise<Object>} Response data
 */
export const toggleLike = async (event_id) => {
  const { data } = await client.post('/events/like', { event_id });
  return data;
};

/**
 * Get all likes for an event
 * @param {number} event_id - The event ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} Response data with likes list
 */
export const getEventLikes = async (event_id, params = {}) => {
  const { page = 1, limit = 20 } = params;
  const { data } = await client.get(`/events/${event_id}/likes`, {
    params: { page, limit },
  });
  return data;
};

/**
 * Add a comment to an event
 * @param {number} event_id - The event ID
 * @param {string} comment - The comment text
 * @returns {Promise<Object>} Response data with new comment
 */
export const addComment = async (event_id, comment) => {
  const { data } = await client.post('/events/comment', {
    event_id,
    comment,
  });
  return data;
};

/**
 * Get all comments for an event
 * @param {number} event_id - The event ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} Response data with comments list
 */
export const getEventComments = async (event_id, params = {}) => {
  const { page = 1, limit = 20 } = params;
  const { data } = await client.get(`/events/${event_id}/comments`, {
    params: { page, limit },
  });
  return data;
};

/**
 * Update a comment
 * @param {number} comment_id - The comment ID
 * @param {string} comment - The updated comment text
 * @returns {Promise<Object>} Response data with updated comment
 */
export const updateComment = async (comment_id, comment) => {
  const { data} = await client.put(`/events/comment/${comment_id}`, {
    comment,
  });
  return data;
};

/**
 * Delete a comment
 * @param {number} comment_id - The comment ID
 * @returns {Promise<Object>} Response data
 */
export const deleteComment = async (comment_id) => {
  const { data } = await client.delete(`/events/comment/${comment_id}`);
  return data;
};

export default {
  toggleLike,
  getEventLikes,
  addComment,
  getEventComments,
  updateComment,
  deleteComment,
};
