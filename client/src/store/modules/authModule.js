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
      const { role, token, userId} = payload;
      state.isAuthenticated = true;
      state.userRole = role;
      state.userId = userId;

      localStorage.setItem('isAuthenticated', true);
      localStorage.setItem('userRole', role);
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
    initializeStore(state) {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
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
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    userRole: (state) => state.userRole,
    token: (state) => state.token,
    userId: (state) => state.userId, 
  },
};

export default authModule;
