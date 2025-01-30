const ordersModule = {
  state: () => ({
    orders: [],
    order: null,
  }),
  mutations: {
    setOrders(state, orders) {
      state.orders = orders;
    },
    setOrder(state, order) {
      state.order = order;
    },
    updadeOrders(state, updatedOrder) {
      const index = state.orders.findIndex((p) => p.id === updatedOrder.id);
      if (index !== -1) {
        state.orders.splice(index, 1, updatedOrder);
      }
    },
  },
  actions: {
    async fetchOrdersAction({ commit }) {
      try {
        const response = await fetch("http://localhost:3000/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        commit("setOrders", data);
      } catch (error) {
        console.error("Fetch Products Error:", error.message);
      }
    },
    async fetchOrderAction({ commit }, id) {
      try {
        const response = await fetch(`http://localhost:3000/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch order");
        const data = await response.json();
        commit("setOrder", data);
      } catch (error) {
        console.error("Fetch Order Error:", error.message);
      }
    },
    async deleteOrderedProductAction({ commit }, { id, productId }) {
      try {
        const response = await fetch(
          `http://localhost:3000/orders/${id}/product/${productId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok)
          throw new Error("Failed to delete product from order");
        const updatedOrder = await response.json();
        commit("updadeOrders", updatedOrder);
      } catch (error) {
        console.error("Delete Product from Order Error:", error.message);
        throw error;
      }
    },
    async cancelOrderAction({ commit }, id) {
      try {
        const response = await fetch(
          `http://localhost:3000/orders/${id}/cancel`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to cancel order");
        commit("updadeOrders", id);
      } catch (error) {
        console.error("Cancel Order Error:", error.message);
      }
    },
    async confirmOrderAction({ commit }, id) {
        try {
          const response = await fetch(
            `http://localhost:3000/orders/${id}/confirm`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to confirm order");
          commit("updadeOrders", id);
        } catch (error) {
          console.error("Confirm Order Error:", error.message);
        }
      },
  },
  getters: {
    allOrders: (state) => state.orders,
    orderToView: (state) => state.order,
    orderTotal: (state) =>
      state.order.productsOrdered.reduce(
        (total, product) => total + product.price * product.quantity,
        0
      ),
  },
};

export default ordersModule;
