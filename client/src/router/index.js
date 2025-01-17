import { createRouter, createWebHistory } from 'vue-router';
import store from '../store/store';
import Login from '../views/auth/Login.vue';
import Signup from '../views/auth/Signup.vue';
import ForgotPassword from '../views/auth/ForgotPassword.vue';
import HeaderClient from '../views/client/HeaderClient.vue';
import HeaderAdmin from '../views/admin/HeaderAdmin.vue';
import HomeClient from '../views/client/HomeClient.vue';
import HomeAdmin from '../views/admin/HomeAdmin.vue';
import SymptomsAdmin from '../views/admin/symptoms/SymptomsAdmin.vue'
import ConditionsAdmin from '../views/admin/conditions/ConditionsAdmin.vue'
import ProductsAdmin from '../views/admin/products/ProductsAdmin.vue'
import OrdersAdmin from '../views/admin/orders/OrdersAdmin.vue'
import ProductsClient from '../views/client/products/ProductsClient.vue'
import OrdersClient from '../views/client/orders/OrdersClient.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/signup', name: 'Signup', component: Signup },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
  {
    path: '/client',
    component: HeaderClient,
    meta: { requiresAuth: true, role: 'client' },
    children: [
      { path: 'home', name: 'HomeClient', component: HomeClient },
      { path: 'products', name: 'ProductsClient', component: ProductsClient },
      { path: 'orders', name: 'OrdersClient', component: OrdersClient },
    ],
  },
  {
    path: '/admin',
    component: HeaderAdmin,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: 'home', name: 'HomeAdmin', component: HomeAdmin },
      { path: 'symptoms', name: 'SymptomsAdmin', component: SymptomsAdmin },
      { path: 'conditions', name: 'ConditionsAdmin', component: ConditionsAdmin },
      { path: 'products', name: 'ProductsAdmin', component: ProductsAdmin },
      { path: 'orders', name: 'OrdersAdmin', component: OrdersAdmin },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
      next('/');
    } else if (to.meta.role && store.getters.userRole !== to.meta.role) {
      next('/');
    } else if (store.getters.isAuthenticated) {
      const userRole = store.getters.userRole;
      if (!to.path.startsWith(`/${userRole}`)) {
        next(`/${userRole}/home`);
      } else {
        next(); 
      }
    } else {
      next();
    }
  });

export default router;