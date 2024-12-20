import { createRouter, createWebHistory } from 'vue-router';
import store from '../store/store';
import Login from '../views/auth/Login.vue';
import Signup from '../views/auth/Signup.vue';
import ForgotPassword from '../views/auth/ForgotPassword.vue';
import HomeClient from '../views/client/HomeClient.vue';
import HomeAdmin from '../views/admin/HomeAdmin.vue';

const routes = [
    { path: '/login', name: 'Login', component: Login },
    { path: '/signup', name: 'Signup', component: Signup },
    { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
    { path: '/client/home', name: 'HomeClient', component: HomeClient, meta: { requiresAuth: true, role: 'client' }},
    { path: '/admin/home', name: 'HomeAdmin', component: HomeAdmin, meta: { requiresAuth: true, role: 'admin' } },
  ];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
      next('/login');
    } else if (to.meta.role && store.getters.userRole !== to.meta.role) {
      next('/login');
    } else {
      next();
    }
  });

export default router;