import client from "../libs/HttpClients";

const ClubService = {
  async list(params = {}) {
    const { data } = await client.get("/club/list", { params });
    return data;
  },

  async get(id) {
    const { data } = await client.get(`/club/view/${id}`);
    return data;
  },

  async create(payload) {
    const { data } = await client.post("/club/create", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  async listCategories() {
    const { data } = await client.get("/club/categories");
    return data;
  },

  // Members
  async listMembers(params = {}) {
    const { data } = await client.get("/club/members", { params });
    return data;
  },

  async promote(payload) {
    const { data } = await client.post("/club/promote", payload);
    return data;
  },

  async removeMember(payload) {
    const { data } = await client.post("/club/remove-member", payload);
    return data;
  },

  async leave(payload) {
    const { data } = await client.post("/club/leave", payload);
    return data;
  },

  async edit(id, payload) {
    const { data } = await client.put(`/club/edit/${id}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  async delete(id) {
    const { data } = await client.delete(`/club/delete/${id}`);
    return data;
  },
};

export default ClubService;
