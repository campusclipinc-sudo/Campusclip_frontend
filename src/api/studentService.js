import client from "../libs/HttpClients";

const StudentService = {
  async listAll(params = {}) {
    const { data } = await client.get("/student/list-all", { params });
    return data;
  },
  async getStudentProfile(user_id) {
    const { data } = await client.post("/student/get-profile", { user_id });
    return data;
  },
  async getUserClasses(user_id) {
    const { data } = await client.get(`/student/${user_id}/classes`);
    return data;
  },
  async getUserClubs(user_id) {
    const { data } = await client.get(`/student/${user_id}/clubs`);
    return data;
  },
};

export default StudentService;
