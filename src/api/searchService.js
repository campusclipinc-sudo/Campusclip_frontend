import client from "../libs/HttpClients";

class SearchService {
  /**
   * Universal search for users, clubs, and classes
   * @param {Object} params - { query, type } where type is optional (users|clubs|classes)
   * @returns {Promise} - Search results
   */
  async universalSearch(params = {}) {
    const { data } = await client.get('/search', { params });
    return data;
  }

  /**
   * Get trending students
   * @param {Object} params - { limit }
   * @returns {Promise} - Trending students
   */
  async getTrendingStudents(params = {}) {
    const { data } = await client.get('/search/trending-students', { params });
    return data;
  }

  /**
   * Get popular clubs
   * @param {Object} params - { limit }
   * @returns {Promise} - Popular clubs
   */
  async getPopularClubs(params = {}) {
    const { data } = await client.get('/search/popular-clubs', { params });
    return data;
  }

  /**
   * Get popular classes
   * @param {Object} params - { limit }
   * @returns {Promise} - Popular classes
   */
  async getPopularClasses(params = {}) {
    const { data } = await client.get('/search/popular-classes', { params });
    return data;
  }
}

export default new SearchService();
