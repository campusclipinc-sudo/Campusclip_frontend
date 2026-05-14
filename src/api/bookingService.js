import axios from "../libs/HttpClients";
class BookingService {
  static addBooking(request) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await axios.post(`/booking/add`, request);
        resolve(data.data);
      } catch (err) {
        reject(err);
      }
    });
  }

  static async getBooking(params) {
    const { data } = await axios.get(`/booking/get?booking_id=${params}`);
    return data;
  }

  static async getSlots() {
    const { data } = await axios.get(`/booking/get-slots`);
    return data;
  }

  static editBooking(request) {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.put(`/booking/update`, request);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }

  static async listBooking(params) {
    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.get("/booking/list", {
          params,
        });
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }

  static deleteBooking(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await axios.delete(
          `/booking/delete?booking_id=${id}` // Append the ID to the URL
        );
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export { BookingService };
