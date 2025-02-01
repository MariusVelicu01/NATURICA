import { encryptData, decryptData } from "../../utils/encryptData";

const authModule = {
  state: () => ({
    isAuthenticated: false,
    token: null,
    userId: null,
    userRole: null,
    errorState: null,
  }),
  mutations: {
    login(state, payload) {
      const { token, userId } = payload;

      state.isAuthenticated = true;
      state.token = token;
      state.userId = userId;

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("token", encryptData(token));
      localStorage.setItem("userId", encryptData(userId));
      state.errorState = null;
    },
    signup(state, payload) {
      const { role, token, userId } = payload;
      state.isAuthenticated = true;
      state.userRole = role;
      state.userId = userId;

      localStorage.setItem("isAuthenticated", true);
      localStorage.setItem("token", encryptData(token));
      localStorage.setItem("userId", encryptData(userId));
      state.errorState = null;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userRole = null;
      state.token = null;
      state.userId = null;

      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      state.errorState = null;
    },
    userID(state, userId) {
      state.userId = userId;
      localStorage.setItem("userId", encryptData(userId));
      state.errorState = null;
    },
    initializeStore(state) {
      const isAuthenticated =
        localStorage.getItem("isAuthenticated") === "true";
      const token = localStorage.getItem("token")
        ? decryptData(localStorage.getItem("token"))
        : null;
      const userId = localStorage.getItem("userId")
        ? decryptData(localStorage.getItem("userId"))
        : null;

      if (isAuthenticated && token && userId) {
        state.isAuthenticated = true;
        state.token = token;
        state.userId = userId;
      }
    },
    setUserRole(state, role) {
      state.userRole = role;
      state.errorState = null;
    },
    setError(state, error) {
      state.errorState = error;
    },
  },
  actions: {
    logout({ commit }) {
      commit("logout");
    },
    initializeStore({ commit }) {
      commit("initializeStore");
    },
    async loginAction({ commit }, payload) {
      try {
        const response = await fetch("http://localhost:3000/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: payload.email,
            password: payload.password,
            selectedRole: payload.selectedRole,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          commit("setError", {
            status: response.status,
            message: data.error,
          });

          return;
        }

        const result = {
          role: payload.selectedRole,
          token: data.token,
          userId: data.userId,
        };

        commit("login", result);
      } catch (err) {
        console.error("Login Error:", err.message);
      }
    },
    async extractUID({ commit }, payload) {
      try {
        const response = await fetch(
          "http://localhost:3000/users/extract_uid",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: payload.email,
              password: payload.password,
            }),
          }
        );
        const userData = await response.json();

        if (!response.ok) {
          commit("setError", {
            status: response.status,
            message: userData.error,
          });

          return;
        }

        commit("userID", userData.localId);

        return userData.localId;
      } catch (err) {
        console.error("Extract UID Error:", err.message);
        alert("Error during extract UID: " + err.message);
      }
    },
    async signupAction({ commit, dispatch }, payload) {
      try {
        const response = await fetch("http://localhost:3000/users/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: payload.email,
            password: payload.password,
            firstName: payload.firstName,
            lastName: payload.lastName,
            dateOfBirth: payload.dateOfBirth,
            role: payload.selectedRole,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          commit("setError", {
            status: response.status,
            message: data.error,
          });

          return;
        }

        const authPayload = {
          email: payload.email,
          password: payload.password,
        };

        const userID = await dispatch("extractUID", authPayload);

        if (userID === undefined) {
          throw new Error("Unable to extract UID");
        }

        const singupPayload = {
          role: payload.selectedRole,
          token: data.token,
          userId: userID,
        };
        commit("signup", singupPayload);

        alert("User signed up successfully!");
      } catch (err) {
        console.error("Signup Error:", err.message);
        alert("Error during signup: " + err.message);
      }
    },
    async forgotPasswordAction({ commit }, email) {
      try {
        const response = await fetch(
          "http://localhost:3000/users/forgot-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          commit("setError", {
            status: response.status,
            message: data.error,
          });

          return;
        }

        alert("Password reset email sent! Please check your inbox.");
      } catch (error) {
        console.error("Error:", error.message);
        alert("Failed to send password reset email. Try again later.");
      }
    },
    async fetchUserRole({ commit }) {
      try {
        const response = await fetch(
          "http://localhost:3000/users/getUserRole",
          {
            headers: {
              Authorization: `Bearer ${decryptData(
                localStorage.getItem("token")
              )}`,
            },
          }
        );
        const data = await response.json();

        if (!response.ok) {
          commit("setError", {
            status: response.status,
            message: response.error,
          });

          return;
        }
        commit("setUserRole", data.role);
        return data.role;
      } catch (error) {
        console.error("Error fetching user role:", error);
        return null;
      }
    },
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    userRole: (state) => state.userRole,
    token: (state) => state.token,
    userId: (state) => state.userId,
    getError: (state) => state.errorState,
  },
};

export default authModule;
