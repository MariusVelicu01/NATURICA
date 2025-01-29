import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/store'

store.dispatch('auth/initializeStore');
store.dispatch('cart/loadCartFromLocalStorage'); 

createApp(App).use(router).use(store).mount('#app');
