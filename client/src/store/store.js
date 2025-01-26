import { createStore } from 'vuex';
import authModule from './modules/authModule';
import symptomsModule from './modules/symptomsModule';
import conditionsModule from './modules/conditionsModule';
import productsModule from './modules/productsModule';

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
    },
    products: {
      namespaced: true, 
      ...productsModule,
    }
  },
});

export default store;
