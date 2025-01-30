<template>
  <div>
    <h1>Order Details</h1>

    <div v-if="loading">Loading order details...</div>
    <ul v-else>
      <button v-if="order.status === 'pending'" @click="cancelOrder(this.id)">
        Cancel Order
      </button>
      <p><strong>Status: </strong> {{ order.status }}</p>
      <p v-if="order.createdAt">
        <strong>Created At: </strong> {{ formatDate(order.createdAt) }}
      </p>
      <p v-if="order.updatedAt && !order.canceledAt">
        <strong>Last Update: </strong> {{ formatDate(order.updatedAt) }}
      </p>
      <p v-if="order.canceledAt">
        <strong>Canceled At: </strong> {{ formatDate(order.canceledAt) }}
      </p>
      <p></p>
      <div>
        <h4>Delevery Details</h4>
        <p>Name: {{ order.fullName }}</p>
        <p>Address: {{ order.address }}</p>
        <p>City: {{ order.city }}</p>
        <p>Country: {{ order.country }}</p>
        <p>Postal Code: {{ order.postalCode }}</p>
      </div>
      <div>
        <h4>Products Ordered</h4>
        <li v-for="product in order.productsOrdered" :key="product.productId">
          <router-link :to="`/client/products/${product.productId}`">
            <h2>{{ product.name }}</h2>
          </router-link>
          <img
            v-if="product.imgSrc"
            :src="product.imgSrc"
            alt="Product Image"
            style="max-width: 200px; display: block; margin-bottom: 10px"
          />
          <p>Price: ${{ product.price }}</p>
          <p>Quantity Ordered: {{ product.quantity }}</p>
          <button
            v-if="
              order.status === 'pending' || order.productsOrdered.length !== 1
            "
            @click="deleteProductFromOrder(this.id, product.productId)"
          >
            Delete Product From Order
          </button>
        </li>
      </div>
      <p>Total: ${{ orderTotal }}</p>
      <p>Payment Method: {{ order.paymentMethod }}</p>
    </ul>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "OrderDetailsClient",
  data() {
    return {
      loading: true,
      order: null,
      id: this.$route.params.id,
    };
  },
  computed: {
    ...mapGetters("orders", ["orderToView"]),
    ...mapGetters("orders", ["orderTotal"]),
  },
  methods: {
    ...mapActions("orders", [
      "fetchOrderAction",
      "cancelOrderAction",
      "deleteOrderedProductAction",
    ]),
    formatDate(timestamp) {
      timestamp = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1e6);

      const day = String(timestamp.getDate()).padStart(2, "0");
      const month = String(timestamp.getMonth() + 1).padStart(2, "0");
      const year = timestamp.getFullYear();
      const hours = String(timestamp.getHours()).padStart(2, "0");
      const minutes = String(timestamp.getMinutes()).padStart(2, "0");

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    },
    async fetchOrderDetails() {
      console.log(this.id);
      await this.fetchOrderAction(this.id).then(() => {
        this.loading = false;
        this.order = this.orderToView;
        console.log(this.order);
      });
    },
    async cancelOrder(id) {
      const confirmed = confirm("Are you sure you want to cancel this order?");
      if (confirmed) {
        await this.cancelOrderAction(id);
        alert("Order canceled succesfully");
        this.fetchOrderDetails();
      }
    },
    async deleteProductFromOrder(id, productId) {
      const confirmed = confirm(
        "Are you sure you want to delete this product from order?"
      );
      if (confirmed) {
        await this.deleteOrderedProductAction({ id, productId });
        alert("Product deleted succesfully");
        this.fetchOrderDetails();
      }
    },
  },
  created() {
    this.fetchOrderDetails();
  },
};
</script>
