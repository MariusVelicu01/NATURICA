<template>
  <div>
    <div v-if="isLoading">
      <h1>Processing your order...</h1>
    </div>
    <div v-else>
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <router-link to="/client/orders">View Orders</router-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

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
    ...mapGetters("cart", ["cartItems"]),
  },
  methods: {
    ...mapActions("orders", ["addOrderAction"]),
    ...mapActions("cart",["clearCartAction"]),
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

      await this.addOrderAction(orderData);
      await this.clearCartAction();
      this.isLoading = false;
    },
  },
};
</script>
