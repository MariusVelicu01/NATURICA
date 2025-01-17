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

        localStorage.setItem('isAuthenticated', true);
        localStorage.setItem('userRole', role);
      },
      signup(state, role) {
        state.isAuthenticated = true;
        state.userRole = role;

        localStorage.setItem('isAuthenticated', true);
        localStorage.setItem('userRole', role);
      },
      logout(state) {
        state.isAuthenticated = false;
        state.userRole = null;

        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
      },
      initializeStore(state) {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const userRole = localStorage.getItem('userRole');
  
        if (isAuthenticated && userRole) {
          state.isAuthenticated = isAuthenticated;
          state.userRole = userRole;
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
    },
  });
  
  export default store;
  
