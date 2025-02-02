<template>
  <div class="order-confirmation-container">
    <div v-if="isLoading" class="loading-message">
      <h1 class="title">Processing your order...</h1>
    </div>
    <div v-else class="confirmation-message">
      <h1 class="title">Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <router-link to="/client/orders" class="btn-view-orders">View Orders</router-link>
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
    ...mapGetters("orders",["getError"])
  },
  methods: {
    ...mapActions("orders", ["addOrderAction"]),
    ...mapActions("cart", ["clearCartAction"]),
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

      if (this.getError) {
        alert(`Error: ${this.getError.message}`);
        await this.clearCartAction();
        this.isLoading = false;
        this.$router.push("/client/home");
      } else {
        alert("Order placed successfully!");
        await this.clearCartAction();
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.order-confirmation-container {
  font-family: "Arial", sans-serif;
  background: #f8f8f5;
  padding: 20px;
  max-width: 600px;
  margin: auto;
  border-radius: 10px;
  margin-top: 30px;
  text-align: center;
}

.title {
  color: #3e7042;
  font-size: 24px;
  margin-bottom: 20px;
}

.loading-message {
  background: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.confirmation-message {
  background: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.btn-view-orders {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  background: #4a7c59;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 16px;
}

.btn-view-orders:hover {
  background: #3e7042;
}
</style>