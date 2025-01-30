<template>
  <div>
    <h1>Manage Orders</h1>

    <h2>Orders List</h2>

    <div>
      <div v-if="loading">Loading orders...</div>
      <ul v-else>
        <li v-for="order in allOrders" :key="order.id">
          <router-link :to="`/client/orders/${order.id}`">
            <h2>{{ order.id }} - {{order.status}}</h2>
          </router-link>
          <div>
            <p><strong>Created At:</strong> {{ formatDate(order.createdAt) }}</p>
            <p v-if="order.updatedAt && !order.canceledAt">
              <strong>Last Update:</strong> {{ formatDate(order.updatedAt) }}
            </p>
             <p v-if="order.canceledAt">
              <strong>Canceled At:</strong> {{ formatDate(order.canceledAt) }}
            </p>
            <strong>Products Ordered</strong>
            <li
              v-for="productOrdered in order.productsOrdered"
              :key="productOrdered.productId"
            >
              <router-link :to="`/client/products/${productOrdered.productId}`">
                {{ productOrdered.name }}
              </router-link>
            </li>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "OrdersClient",
  data() {
    return {
      loading: true,
    };
  },
  computed: {
    ...mapGetters("orders", ["allOrders"]),
  },
  methods: {
    ...mapActions("orders", ["fetchOrdersAction"]),
    async fetchData() {
      try {
        await Promise.all([this.fetchOrdersAction()]);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        this.loading = false;
      }
    },
    formatDate(timestamp) {
      timestamp = new Date(
        timestamp._seconds * 1000 + timestamp._nanoseconds / 1e6
      );

      const day = String(timestamp.getDate()).padStart(2, "0");
      const month = String(timestamp.getMonth() + 1).padStart(2, "0");
      const year = timestamp.getFullYear();
      const hours = String(timestamp.getHours()).padStart(2, "0");
      const minutes = String(timestamp.getMinutes()).padStart(2, "0");

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    },
  },
  created() {
    this.fetchData();
  },
};
</script>
