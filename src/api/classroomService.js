import client from './client';

class ClassroomService {
  /**
   * Join a class
   * @param {string} class_id - Class ID to join
   * @returns {Promise} - Join result
   */
  async joinClass(class_id) {
    const { data } = await client.post('/classroom/join', { class_id });
    return data;
  }

  /**
   * Leave a class
   * @param {string} class_id - Class ID to leave
   * @returns {Promise} - Leave result
   */
  async leaveClass(class_id) {
    const { data } = await client.post('/classroom/leave', { class_id });
    return data;
  }

  /**
   * Get class members
   * @param {string} class_id - Class ID
   * @returns {Promise} - Class members list
   */
  async getClassMembers(class_id) {
    const { data} = await client.get(`/classroom/${class_id}/members`);
    return data;
  }

  /**
   * Get all classrooms
   * @returns {Promise} - All classrooms
   */
  async getAllClassrooms() {
    const { data } = await client.get('/classroom/list-all');
    return data;
  }
}

export default new ClassroomService();
