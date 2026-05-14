import client from "../libs/HttpClients";

const FeedService = {
  /**
   * Get user's personalized feed
   * Includes posts and events from:
   * - User's own posts
   * - Clubs the user is a member of
   * - Public posts and events
   */
  async getUserFeed(params = {}) {
    const { data } = await client.get('/feed', { params });
    return data;
  },
};

export default FeedService;
