import { createStore } from 'vuex';
import authModule from './modules/authModule';
import symptomsModule from './modules/symptomsModule';
import conditionsModule from './modules/conditionsModule';
import productsModule from './modules/productsModule';
import cartModule from './modules/cartModule';
import ordersModule from './modules/ordersModule';

const store = createStore({
  modules: {
    auth:{
      namespaced: true,
      ...authModule
    },
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
    },
    cart: {
      namespaced: true,
      ...cartModule
    },
    orders:{
      namespaced: true,
      ...ordersModule
    }
  },
});

export default store;
