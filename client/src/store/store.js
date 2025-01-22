import { createStore } from 'vuex';
import authModule from './modules/authModule';
import symptomsModule from './modules/symptomsModule';

const store = createStore({
  modules: {
    authModule,
    symptoms: {
      namespaced: true, 
      ...symptomsModule,
    },
  },
});

export default store;
