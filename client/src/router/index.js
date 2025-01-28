import { createRouter, createWebHistory } from 'vue-router';
import { combinedOrderGuards, requireCartItems } from '@/validators/orderWrappers';
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
import ProductDetailsAdmin from '../views/admin/products/ProductDetailsAdmin.vue'
import ProductDetailsClient from '../views/client/products/ProductDetailsClient.vue'
import CartClient from '../views/client/orders/buy-flux/CartComponent.vue'
import CheckoutComponentClient from '../views/client/orders/buy-flux/CheckoutComponent.vue'
import CardPaymentClient from '../views/client/orders/buy-flux/CardPayment.vue'
import OrderConfirmationClient from '../views/client/orders/buy-flux/OrderConfirmation.vue'
import OrderValidationFailed from '../views/client/orders/buy-flux/OrderValidationFailed.vue'

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
      { path: 'products/:id', name: 'ProductDetailsClient', component: ProductDetailsClient, props: true, },
      { path: 'orders', name: 'OrdersClient', component: OrdersClient },
      { path: 'cart', name: 'CartClient', component: CartClient },
      { path: 'checkout', name: 'CheckoutClient', component: CheckoutComponentClient, beforeEnter: requireCartItems },
      { path: 'card_payment', name: 'CardPaymentClient', component: CardPaymentClient, beforeEnter: combinedOrderGuards },
      { path: 'order_confirmation', name: 'OrderConfirmationClient', component: OrderConfirmationClient, beforeEnter: combinedOrderGuards },
      { path: 'order_failed', name: 'OrderFailed', component: OrderValidationFailed },
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
      { path: 'products/:id', name: 'ProductDetailsAdmin', component: ProductDetailsAdmin, props: true, },
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