import axios from "../libs/HttpClients";
class UserService {
  static async login(request) {
    try {
      const data = await axios.post(`${"/auth/login"}`, request);
      console.log(data);
      return data.data;
    } catch (err) {
      return err;
    }
  }

  static async googleLogin(request) {
    try {
      const data = await axios.post("/auth/google-login", request);
      return data.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async appleLogin(request) {
    try {
      const data = await axios.post("/auth/apple-login", request);
      return data.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async register(request) {
    try {
      const data = await axios.post(`${"/auth/register"}`, request);
      return data.data;
    } catch (err) {
      return err;
    }
  }

  static async getProfile() {
    try {
      const { data } = await axios.get("/auth/get-profile");
      return data.data;
    } catch (err) {
      return err;
    }
  }

  static async getUserProfile(userId) {
    try {
      const { data } = await axios.get(`/auth/profile/${userId}`);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async editProfile(request) {
    try {
      const { data } = await axios.put("/auth/edit-profile", request, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // server wraps with { message, data }
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async otpVerify(request) {
    // request: { encodedToken, otp }
    try {
      const { data } = await axios.post("/auth/otp-verify", request);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async resendOtp(request) {
    // request: { encodedToken }
    try {
      const { data } = await axios.post("/auth/resend-otp", request);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async setPassword(request) {
    // request: { password }
    try {
      const { data } = await axios.post("/auth/set-password", request);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async forgotPassword(request) {
    // request: { email }
    try {
      const { data } = await axios.post("/auth/forgot-password", request);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async getEducationalInstitutions() {
    try {
      const { data } = await axios.get("/auth/get-educational-institutions");
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async setClassCount(request) {
    try {
      const { data } = await axios.post("/auth/set-class-count", request);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static async completeClassOnboarding(request = {}) {
    try {
      const { data } = await axios.post("/auth/complete-class-onboarding", request);
      return data;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export { UserService };
