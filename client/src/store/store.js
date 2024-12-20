import { createStore } from 'vuex';

const store = createStore({
    state: {
      isAuthenticated: false,
      userRole: null,
    },
    mutations: {
      login(state, role) {
        state.isAuthenticated = true;
        state.userRole = role;
      },
      signup(state, role) {
        state.isAuthenticated = true;
        state.userRole = role;
      },
      logout(state) {
        state.isAuthenticated = false;
        state.userRole = null;
      },
    },
    actions: {
      logout({ commit }) {
        commit('logout');
      },
    },
    getters: {
      isAuthenticated: (state) => state.isAuthenticated,
      userRole: (state) => state.userRole,
    },
  });
  
  export default store;
  
