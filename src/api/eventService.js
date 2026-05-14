import client from "../libs/HttpClients";

const EventService = {
    async create(payload) {
        const { data } = await client.post("/events/create", payload);
        return data;
    },

    async list(params = {}) {
        const { data } = await client.get("/events/list", { params });
        return data;
    },

    async get(id) {
        const { data } = await client.get(`/events/${id}`);
        return data;
    },

    async update(payload) {
        const { id, ...updateData } = payload;
        const { data } = await client.put(`/events/update/${id}`, updateData);
        return data;
    },

    async remove(id) {
        const { data } = await client.delete(`/events/delete/${id}`);
        return data;
    },

    // Attendance methods
    async attend(eventId) {
        const { data } = await client.post(`/events/attend/${eventId}`);
        return data;
    },

    async getAttendees(eventId) {
        const { data } = await client.get(`/events/${eventId}/attendees`);
        return data;
    },

    async checkAttendance(eventId) {
        const { data } = await client.get(`/events/${eventId}/check-attendance`);
        return data;
    },
};

export default EventService;