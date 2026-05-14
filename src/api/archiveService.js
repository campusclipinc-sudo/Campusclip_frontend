import axios from "../libs/HttpClients";

class ArchiveService {
  /**
   * Get all archives for the authenticated user
   */
  static async getUserArchives() {
    try {
      const { data } = await axios.get("/archive/list");
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Get a specific archive by ID with its classes
   */
  static async getArchiveDetailById(archiveId) {
    try {
      const { data } = await axios.get(`/archive/detail/${archiveId}`);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Create a new archive with classes
   * @param {Object} archiveData - { name, description, classIds }
   */
  static async createArchive(archiveData) {
    try {
      const { data } = await axios.post("/archive/create", archiveData);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Add classes to an existing archive
   */
  static async addClassesToArchive(archiveId, classIds) {
    try {
      const { data } = await axios.post(`/archive/add/${archiveId}/classes`, {
        classIds,
      });
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Remove classes from an archive
   */
  static async removeClassesFromArchive(archiveId, classIds) {
    try {
      const { data } = await axios.delete(
        `/archive/remove/${archiveId}/classes`,
        {
          data: { classIds },
        }
      );
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Update archive details
   */
  static async updateArchive(archiveId, updates) {
    try {
      const { data } = await axios.put(`/archive/update/${archiveId}`, updates);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Delete an archive
   */
  static async deleteArchive(archiveId) {
    try {
      const { data } = await axios.delete(`/archive/delete/${archiveId}`);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export { ArchiveService };
