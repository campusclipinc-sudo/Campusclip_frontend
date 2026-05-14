import client from '../libs/HttpClients';

const ChannelNotificationService = {
  async getSummary() {
    const { data } = await client.get('/channel-notifications/summary');
    return data;
  },

  async clear(payload) {
    const { data } = await client.post('/channel-notifications/clear', payload);
    return data;
  },
};

export default ChannelNotificationService;
