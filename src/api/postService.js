import client from "../libs/HttpClients";

const PostService = {
  async createPost(request) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await client.post("/post/create", request, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  },

  async listPosts(params = {}) {
    const { data } = await client.get("/post/list-posts", { params });
    return data;
  },

  async getPostById(id) {
    const { data } = await client.get(`/post/get/${id}`);
    return data;
  },

  async updatePost({ id, content, isPublic }) {
    const { data } = await client.put(`/post/update/${id}`, {
      content,
      isPublic,
    });
    return data;
  },

  async deletePost(id) {
    const { data } = await client.delete(`/post/delete/${id}`);
    return data;
  },

  async getPostsByUser(userId) {
    const { data } = await client.get(`/post/user/${userId}`);
    return data;
  },

  async getPostsByClub(clubId) {
    const { data } = await client.get(`/post/club/${clubId}`);
    return data;
  },
};

export default PostService;
