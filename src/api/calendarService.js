import client from "../libs/HttpClients";

const CalendarService = {
  /**
   * Get calendar data (events + class schedules)
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   */
  async getCalendarData(startDate, endDate) {
    const { data } = await client.get("/calendar/data", {
      params: { startDate, endDate },
    });
    return data;
  },
  /**
   * Get calendar items for a date range
   * @param {Object} params - { startDate, endDate }
   */
  async getItems(params = {}) {
    const { data } = await client.get("/calendar/items", { params });
    return data;
  },

  /**
   * Get calendar items for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   */
  async getItemsForDate(date) {
    const { data } = await client.get(`/calendar/items/${date}`);
    return data;
  },
};

export default CalendarService;
