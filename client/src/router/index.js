import { createRouter, createWebHistory } from "vue-router";
import {
  combinedOrderGuards,
  requireCartItems,
} from "../validations/orderWrappers";
import store from "../store/store";
import Login from "../views/auth/Login.vue";
import Signup from "../views/auth/Signup.vue";
import ForgotPassword from "../views/auth/ForgotPassword.vue";
import HeaderClient from "../views/client/HeaderClient.vue";
import HeaderAdmin from "../views/admin/HeaderAdmin.vue";
import HomeClient from "../views/client/HomeClient.vue";
import HomeAdmin from "../views/admin/HomeAdmin.vue";
import SymptomsAdmin from "../views/admin/symptoms/SymptomsAdmin.vue";
import ConditionsAdmin from "../views/admin/conditions/ConditionsAdmin.vue";
import ProductsAdmin from "../views/admin/products/ProductsAdmin.vue";
import OrdersAdmin from "../views/admin/orders/OrdersAdmin.vue";
import ProductsClient from "../views/client/products/ProductsClient.vue";
import OrdersClient from "../views/client/orders/OrdersClient.vue";
import ProductDetailsAdmin from "../views/admin/products/ProductDetailsAdmin.vue";
import ProductDetailsClient from "../views/client/products/ProductDetailsClient.vue";
import CartClient from "../views/client/orders/buy-flux/CartComponent.vue";
import CheckoutComponentClient from "../views/client/orders/buy-flux/CheckoutComponent.vue";
import CardPaymentClient from "../views/client/orders/buy-flux/CardPayment.vue";
import OrderConfirmationClient from "../views/client/orders/buy-flux/OrderConfirmation.vue";
import OrderValidationFailed from "../views/client/orders/buy-flux/OrderValidationFailed.vue";
import OrderDetailsClient from "../views/client/orders/OrderDetailsClient.vue";
import OrderDetailsAdmin from "../views/admin/orders/OrdersDetailsAdmin.vue";

const routes = [
  { path: "/", name: "Login", component: Login },
  { path: "/signup", name: "Signup", component: Signup },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
  },
  {
    path: "/client",
    component: HeaderClient,
    meta: { requiresAuth: true, role: "client" },
    children: [
      { path: "home", name: "HomeClient", component: HomeClient },
      { path: "products", name: "ProductsClient", component: ProductsClient },
      {
        path: "products/:id",
        name: "ProductDetailsClient",
        component: ProductDetailsClient,
        props: true,
      },
      { path: "orders", name: "OrdersClient", component: OrdersClient },
      {
        path: "orders/:id",
        name: "OrderDetailsClient",
        component: OrderDetailsClient,
      },
      { path: "cart", name: "CartClient", component: CartClient },
      {
        path: "checkout",
        name: "CheckoutClient",
        component: CheckoutComponentClient,
        beforeEnter: requireCartItems,
      },
      {
        path: "card_payment",
        name: "CardPaymentClient",
        component: CardPaymentClient,
        beforeEnter: combinedOrderGuards,
      },
      {
        path: "order_confirmation",
        name: "OrderConfirmationClient",
        component: OrderConfirmationClient,
        beforeEnter: combinedOrderGuards,
      },
      {
        path: "order_failed",
        name: "OrderFailed",
        component: OrderValidationFailed,
      },
    ],
  },
  {
    path: "/admin",
    component: HeaderAdmin,
    meta: { requiresAuth: true, role: "admin" },
    children: [
      { path: "home", name: "HomeAdmin", component: HomeAdmin },
      { path: "symptoms", name: "SymptomsAdmin", component: SymptomsAdmin },
      {
        path: "conditions",
        name: "ConditionsAdmin",
        component: ConditionsAdmin,
      },
      { path: "products", name: "ProductsAdmin", component: ProductsAdmin },
      {
        path: "products/:id",
        name: "ProductDetailsAdmin",
        component: ProductDetailsAdmin,
        props: true,
      },
      { path: "orders", name: "OrdersAdmin", component: OrdersAdmin },
      {
        path: "orders/:id",
        name: "OrderDetailsAdmin",
        component: OrderDetailsAdmin,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const isAuth = store.getters["auth/isAuthenticated"];
  let userRole = store.getters["auth/userRole"];

  if (isAuth && !userRole) {
    userRole = await store.dispatch("auth/fetchUserRole");

    if (!userRole) {
      console.warn("Session expired. Logging out...");
      await store.dispatch("auth/logout");
      return next("/");
    }
  }

  const publicRoutes = ["/", "/signup", "/forgot-password"];

  if (to.meta.requiresAuth && !isAuth) {
    if (!publicRoutes.includes(to.path)) {
      return next("/");
    }
  } else if (to.meta.role && userRole !== to.meta.role) {
    return next("/");
  } else if (isAuth) {
    if (userRole) {
      if (!to.path.startsWith(`/${userRole}`)) {
        return next(`/${userRole}/home`);
      }
    }
  }

  next();
});

export default router;
