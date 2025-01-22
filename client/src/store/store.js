import { createStore } from 'vuex';

const store = createStore({
    state: {
      isAuthenticated: false,
      userRole: null,
    },
    mutations: {
      login(state, payload) {
        state.isAuthenticated = true;
        state.userRole = payload.role;
        state.token = payload.token;
      
        localStorage.setItem("token", payload.token);
        localStorage.setItem("isAuthenticated", true);
        localStorage.setItem("userRole", payload.role);
      },
      signup(state, payload) {
        state.isAuthenticated = true;
        state.userRole = payload.role;
        state.token = payload.token;
      
        localStorage.setItem("token", payload.token);
        localStorage.setItem("isAuthenticated", true);
        localStorage.setItem("userRole", payload.role);
      },
      logout(state) {
        state.isAuthenticated = false;
        state.userRole = null;
        state.token = null;

        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('token');
      },
      initializeStore(state) {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const userRole = localStorage.getItem('userRole');
        const token = localStorage.getItem('token');
  
        if (isAuthenticated && userRole && token) {
          state.isAuthenticated = isAuthenticated;
          state.userRole = userRole;
          state.token = token;
        }
      },
    },
    actions: {
      logout({ commit }) {
        commit('logout');
      },
      initializeStore({ commit }) {
        commit('initializeStore');
      },
    },
    getters: {
      isAuthenticated: (state) => state.isAuthenticated,
      userRole: (state) => state.userRole,
      token: (state) => state.token
    },
  });
  
  export default store;
  
