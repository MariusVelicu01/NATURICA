const cartModule = {
  namespaced: true,
  state: () => ({
    cart: [], 
  }),
  mutations: {
    setCart(state, cart) {
      state.cart = cart;
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
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
    addToCartAction({ commit, dispatch }, payload) {
      commit("addToCart", payload);
      dispatch("saveCartToLocalStorage");
    },
    updateCartQuantityAction({ commit, dispatch }, { item, quantity }) {
      commit("updateCartQuantity", { id: item.id, quantity });
      dispatch("saveCartToLocalStorage");
    },
    removeFromCartAction({ commit, dispatch }, id) {
      commit("removeFromCart", id);
      dispatch("saveCartToLocalStorage");
    },
    clearCartAction({ commit, dispatch }) {
      commit("clearCart");
      dispatch("saveCartToLocalStorage");
    },

    saveCartToLocalStorage({ state }) {
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    loadCartFromLocalStorage({ commit }) {
      const cartData = localStorage.getItem("cart");
        commit("setCart", JSON.parse(cartData));
    },
    async saveCartToDatabase({ state }, userId) {
      if (!userId) return; 
      try {
        const response = await fetch(`http://localhost:3000/saved_cart/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          method: 'POST',
          body: JSON.stringify({ cart: state.cart }),
        });
        if (!response.ok) {
          console.error('Error saving cart:', await response.text());
        }
      } catch (error) {
        console.error('Error saving cart:', error.message);
      }
    },
    async loadCartFromDatabase({ commit }, userId) {
      console.log(userId);
      if (!userId) return; 
  
      try {
        const token = localStorage.getItem('token'); 
        const response = await fetch(`http://localhost:3000/saved_cart/${userId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
  
        if (response.ok) {
          const data = await response.json(); 
          commit('setCart', data.cart);
        } else {
          console.warn('Could not load cart from DB:', await response.text());
          commit('setCart', []); 
        }
      } catch (error) {
        console.error('Error loading cart from DB:', error.message);
        commit('setCart', []);
      }
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
