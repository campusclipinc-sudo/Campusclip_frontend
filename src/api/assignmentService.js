import client from "../libs/HttpClients";

const AssignmentService = {
  async create(payload) {
    const { data } = await client.post("/assignment/create", payload);
    return data;
  },

  async list(params = {}) {
    const { data } = await client.get("/assignment", { params });
    return data;
  },

  async get(id) {
    const { data } = await client.get(`/assignment/${id}`);
    return data;
  },

  async update(payload) {
    const { data } = await client.put("/assignment/update", payload);
    return data;
  },

  async remove(id) {
    const { data } = await client.delete(`/assignment/${id}`);
    return data;
  },

  async restore(id) {
    const { data } = await client.post(`/assignment/${id}/restore`);
    return data;
  },
};

export default AssignmentService;
