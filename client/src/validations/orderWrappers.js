import store from "../store/store";

export const requireCartItems = (to, from, next) => {
  const cartItems = store.getters["cart/cartItems"];
  if (cartItems.length === 0) {
    next({ name: "OrderFailed" });
  } else {
    next();
  }
};

export const requireCheckoutDetails = (to, from, next) => {
  const { name, address, city, postalCode, country, paymentMethod } = to.query;

  if (!name || !address || !city || !postalCode || !country || !paymentMethod) {
    next({ name: "CheckoutClient" });
  } else {
    next();
  }
};

export const combinedOrderGuards = (to, from, next) => {
    requireCartItems(to, from, (result) => {
      if (result === false) return;
      requireCheckoutDetails(to, from, next);
    });
  }