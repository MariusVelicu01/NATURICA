const cartModule = {
    state: () => ({
      cart: [], 
    }),
    mutations: {
        addToCart(state, { product, quantity }) {
            const existingProduct = state.cart.find((item) => item.id === product.id);
            if (existingProduct) {
              const totalQuantity = existingProduct.quantity + quantity;
              existingProduct.quantity = Math.min(totalQuantity, product.stock);
            } else {
              state.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                imgSrc: product.imgSrc,
                quantity: Math.min(quantity, product.stock),
              });
            }
          },
      updateCartQuantity(state, { id, quantity }) {
        const product = state.cart.find((item) => item.id === id);
        if (product) {
          product.quantity = Math.max(1, Math.min(quantity, product.stock));
        }
      },
      removeFromCart(state, id) {
        state.cart = state.cart.filter((item) => item.id !== id);
      },
      clearCart(state) {
        state.cart = [];
      },
    },
    actions: {
      addToCartAction({ commit }, product) {
        commit("addToCart", product);
      },
      updateCartQuantityAction({ commit }, { item, quantity }) {
        commit("updateCartQuantity", { id: item.id, quantity });
      },
      removeFromCartAction({ commit }, id) {
        commit("removeFromCart", id);
      },
      clearCartAction({ commit }) {
        commit("clearCart");
      },
    },
    getters: {
      cartItems: (state) => state.cart,
      cartTotal: (state) =>
        state.cart.reduce((total, item) => total + item.price * item.quantity, 0),
      cartCount: (state) =>
        state.cart.reduce((total, item) => total + item.quantity, 0),
    },
  };
  
  export default cartModule;
  