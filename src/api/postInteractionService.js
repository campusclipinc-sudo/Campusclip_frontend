import client from "../libs/HttpClients";

/**
 * Post Interaction Service
 * Handles all like and comment operations for posts
 */

/**
 * Toggle like on a post (like/unlike)
 * @param {number} post_id - The post ID
 * @returns {Promise<Object>} Response data
 */
export const toggleLike = async (post_id) => {
  const { data } = await client.post('/posts/like', { post_id });
  return data;
};

/**
 * Get all likes for a post
 * @param {number} post_id - The post ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} Response data with likes list
 */
export const getPostLikes = async (post_id, params = {}) => {
  const { page = 1, limit = 20 } = params;
  const { data } = await client.get(`/posts/${post_id}/likes`, {
    params: { page, limit },
  });
  return data;
};

/**
 * Add a comment to a post
 * @param {number} post_id - The post ID
 * @param {string} comment - The comment text
 * @returns {Promise<Object>} Response data with new comment
 */
export const addComment = async (post_id, comment) => {
  const { data } = await client.post('/posts/comment', {
    post_id,
    comment,
  });
  return data;
};

/**
 * Get all comments for a post
 * @param {number} post_id - The post ID
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise<Object>} Response data with comments list
 */
export const getPostComments = async (post_id, params = {}) => {
  const { page = 1, limit = 20 } = params;
  const { data } = await client.get(`/posts/${post_id}/comments`, {
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
  const { data } = await client.put(`/posts/comment/${comment_id}`, {
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
  const { data } = await client.delete(`/posts/comment/${comment_id}`);
  return data;
};

export default {
  toggleLike,
  getPostLikes,
  addComment,
  getPostComments,
  updateComment,
  deleteComment,
};
