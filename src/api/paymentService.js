import client from "../libs/HttpClients";

const PaymentService = {
  async setupPaymentMethod() {
    const { data } = await client.post("/payment/setup");
    return data;
  },

  async savePaymentMethod(paymentMethodId) {
    const { data } = await client.post("/payment/save-method", {
      paymentMethodId,
    });
    return data;
  },

  async getPaymentMethod() {
    const { data } = await client.get("/payment/method");
    return data;
  },
};

export default PaymentService;
