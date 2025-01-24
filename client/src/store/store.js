import { createStore } from 'vuex';
import authModule from './modules/authModule';
import symptomsModule from './modules/symptomsModule';
import conditionsModule from './modules/conditionsModule';

const store = createStore({
  modules: {
    authModule,
    symptoms: {
      namespaced: true, 
      ...symptomsModule,
    },
    conditions: {
      namespaced: true, 
      ...conditionsModule,
    }
  },
});

export default store;
