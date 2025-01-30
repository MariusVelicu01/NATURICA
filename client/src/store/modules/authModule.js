const authModule = {
  state: () => ({
    isAuthenticated: false,
    userRole: null,
    token: null,
    userId: null,
  }),
  mutations: {
    login(state, payload) {
      const { role, token, userId } = payload;

      state.isAuthenticated = true;
      state.userRole = role;
      state.token = token;
      state.userId = userId;

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", role);
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
    },
    signup(state, payload) {
      const { role, token, userId } = payload;
      state.isAuthenticated = true;
      state.userRole = role;
      state.userId = userId;

      localStorage.setItem("isAuthenticated", true);
      localStorage.setItem("userRole", role);
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userRole = null;
      state.token = null;
      state.userId = null;

      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    },
    userID(state, userId) {
      state.userId = userId;
      localStorage.setItem("userId", userId);
    },
    initializeStore(state) {
      const isAuthenticated =
        localStorage.getItem("isAuthenticated") === "true";
      const userRole = localStorage.getItem("userRole");
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (isAuthenticated && userRole && token && userId) {
        state.isAuthenticated = true;
        state.userRole = userRole;
        state.token = token;
        state.userId = userId;
      }
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
          throw new Error(data.error || "Failed to login");
        }

        const result = {
          role: payload.selectedRole,
          token: data.token,
          userId: data.userId,
        };

        commit("login", result);
        alert("Successful login!");
      } catch (err) {
        console.error("Login Error:", err.message);
        alert("Error during login: " + err.message);
      }
    },
    async extractUID({ commit }, payload) {
      try {
        const meResponse = await fetch(
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
        const userData = await meResponse.json();

        commit("userID", userData.localId);

        return userData.localId;
      } catch (err) {
        console.error("Extract UID Error:", err.message);
        alert("Error during extract UID: " + err.message);
      }
    },
    async signupAction({commit, dispatch}, payload){
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
          const error = await response.json();
          throw new Error(error.error || "Failed to sign up");
        }

        const authPayload = {
          email: payload.email,
          password: payload.password
        };
        
        const userID = await dispatch("extractUID", authPayload);

        if(userID===undefined){
          throw new Error("Unable to extract UID");
        }

        const singupPayload = {
          role: payload.selectedRole,
          token: data.token,
          userId: userID
        }
        commit("signup",singupPayload);

        alert("User signed up successfully!");
      } catch (err) {
        console.error("Signup Error:", err.message);
        alert("Error during signup: " + err.message);
      }
    },
    async forgotPasswordAction(_, email){
      try {
        const response = await fetch(
          "http://localhost:3000/users/forgot-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to send password reset email");
        }

        alert("Password reset email sent! Please check your inbox.");
      } catch (error) {
        console.error("Error:", error.message);
        alert("Failed to send password reset email. Try again later.");
      }
    }
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    userRole: (state) => state.userRole,
    token: (state) => state.token,
    userId: (state) => state.userId,
  },
};

export default authModule;
