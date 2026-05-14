import client from "../libs/HttpClients";

const GoogleCalendarService = {
    /**
     * Initiate OAuth flow - get authorization URL
     */
    async initiateAuth() {
        const { data } = await client.get("/google-calendar/auth/initiate");
        return data;
    },

    /**
     * Get sync status
     */
    async getSyncStatus() {
        const { data } = await client.get("/google-calendar/status");
        return data;
    },

    /**
     * Sync all events and class schedules
     */
    async syncAll() {
        const { data } = await client.post("/google-calendar/sync");
        return data;
    },

    /**
     * Sync a specific event
     * @param {number} eventId - Event ID to sync
     */
    async syncEvent(eventId) {
        const { data } = await client.post(`/google-calendar/sync/event/${eventId}`);
        return data;
    },

    /**
     * Update sync settings
     * @param {Object} settings - { sync_enabled, sync_events, sync_classes }
     */
    async updateSettings(settings) {
        const { data } = await client.put("/google-calendar/settings", settings);
        return data;
    },

    /**
     * Disconnect Google Calendar
     */
    async disconnect() {
        const { data } = await client.delete("/google-calendar/disconnect");
        return data;
    },
};

export default GoogleCalendarService;
