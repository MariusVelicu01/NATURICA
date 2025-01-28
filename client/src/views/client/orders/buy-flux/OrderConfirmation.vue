<template>
  <div>
    <div v-if="isLoading">
      <h1>Processing your order...</h1>
    </div>
    <div v-else>
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <router-link to="/client/products">Back to Products</router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      isLoading: true,
    };
  },
  created() {
    this.submitOrder();
  },
  computed: {
    ...mapGetters("cart", ["cartItems", "cartTotal"]),
  },
  methods: {
    async submitOrder() {
      const orderData = {
        productsOrdered: this.cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        query: {
          name: this.$route.query.name,
          address: this.$route.query.address,
          city: this.$route.query.city,
          postalCode: this.$route.query.postalCode,
          country: this.$route.query.country,
          paymentMethod: this.$route.query.paymentMethod,
        },
      };

      try {
        const response = await fetch("http://localhost:3000/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error("Failed to place order");
        }

        const result = await response.json();
        console.log("Order placed successfully:", result);
        await this.$store.dispatch("cart/clearCartAction");
        this.isLoading = false;
      } catch (error) {
        console.error("Error placing order:", error.message);
        alert("Something went wrong while placing your order.");
      }
    },
  },
};
</script>
