import client from "../libs/HttpClients";

const ClubRequestService = {
  // POST /api/club-request/request
  async request(payload) {
    const { data } = await client.post("/club-request/request", payload);
    return data;
  },

  // GET /api/club-request/list-requests
  async list(params = {}) {
    const { data } = await client.get("/club-request/list-requests", {
      params,
    });
    return data;
  },

  // POST /api/club-request/action-request
  async action(payload) {
    const { data } = await client.post("/club-request/action-request", payload);
    return data;
  },

  // GET /api/club-request/get-club-requests
  async getClubRequests(params = {}) {
    const { data } = await client.get("/club-request/get-club-requests", {
      params,
    });
    return data;
  },

  async follow(payload) { 
    const { data } = await client.post("/user-following/follow-club", payload);
    return data;
  },
};

export default ClubRequestService;
