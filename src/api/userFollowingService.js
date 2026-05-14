import client from "../libs/HttpClients";

const UserFollowingService = {
  // User following
  async toggleFollow(payload) {
    const { data } = await client.post("/user-following/toggle-follow", payload);
    return data;
  },

  async acceptFollowRequest(payload) {
    const { data } = await client.post("/user-following/accept-request", payload);
    return data;
  },

  async rejectFollowRequest(payload) {
    const { data } = await client.post("/user-following/reject-request", payload);
    return data;
  },

  async getPendingRequests(params = {}) {
    const { data } = await client.get("/user-following/pending-requests", { params });
    return data;
  },

  async getFollowers(userId, params = {}) {
    const { data } = await client.get(`/user-following/followers/${userId}`, { params });
    return data;
  },

  async getFollowing(userId, params = {}) {
    const { data } = await client.get(`/user-following/following/${userId}`, { params });
    return data;
  },

  // Club following
  async followClub(payload) {
    const { data } = await client.post("/user-following/follow-club", payload);
    return data;
  },

  async unfollowClub(clubId) {
    const { data } = await client.delete(`/user-following/unfollow-club/${clubId}`);
    return data;
  },

  async getClubFollowers(clubId, params = {}) {
    const { data } = await client.get(`/user-following/club-followers/${clubId}`, { params });
    return data;
  },

  async getUserFollowedClubs(userId, params = {}) {
    const { data } = await client.get(`/user-following/user-followed-clubs/${userId}`, { params });
    return data;
  },

  // Check follow status
  async checkFollowStatus(params = {}) {
    const { data } = await client.get("/user-following/check-status", { params });
    return data;
  },
};

export default UserFollowingService;
