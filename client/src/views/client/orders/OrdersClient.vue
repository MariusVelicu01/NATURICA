<template>
  <div class="orders-container">
    <h1 class="title">Manage Orders</h1>

    <h2 class="subtitle">Orders List</h2>

    <div class="order-filters">
      <label>
        <input type="radio" v-model="selectedStatus" value="pending" />
        Pending
      </label>
      <label>
        <input type="radio" v-model="selectedStatus" value="confirmed" />
        Confirmed
      </label>
      <label>
        <input type="radio" v-model="selectedStatus" value="canceled" />
        Canceled
      </label>
    </div>

    <div>
      <div v-if="loading" class="loading-message">Loading orders...</div>
      <ul v-else class="order-list">
        <li v-for="order in filteredOrders" :key="order.id" class="order-item">
          <router-link :to="`/client/orders/${order.id}`" class="order-link">
            <h2>{{ order.id }} - {{ order.status }}</h2>
          </router-link>
          <div class="order-details">
            <p><strong>Created At:</strong> {{ formatDate(order.createdAt) }}</p>
            <p v-if="order.updatedAt && !order.canceledAt"><strong>Last Update:</strong> {{ formatDate(order.updatedAt) }}</p>
            <p v-if="order.canceledAt"><strong>Canceled At:</strong> {{ formatDate(order.canceledAt) }}</p>
            <strong>Products Ordered:</strong>
            <ul>
              <li v-for="productOrdered in order.productsOrdered" :key="productOrdered.productId">
                <router-link class="products-ordered-list" :to="`/client/products/${productOrdered.productId}`">
                  {{ productOrdered.name }}
                </router-link>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      loading: true,
      selectedStatus: "pending",
    };
  },
  computed: {
    ...mapGetters("orders", ["allOrders"]),
    filteredOrders() {
      return this.allOrders.filter(
        (order) => order.status === this.selectedStatus
      );
    },
  },
  methods: {
    ...mapActions("orders", ["fetchOrdersAction"]),

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
    this.fetchOrdersAction().finally(() => {
      this.loading = false;
    });
  },
};
</script>

<style scoped>
.orders-container {
  font-family: "Arial", sans-serif;
  background: #f8f8f5;
  padding: 20px;
  max-width: 1500px;
  margin: auto;
  border-radius: 10px;
  margin-top: 30px;
}

.title {
  color: #3e7042;
  font-size: 24px;
  text-align: center;
}

.subtitle {
  font-size: 18px;
  color: #3e7042;
  margin-bottom: 10px;
}

.order-filters {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 15px 0;
}

.order-filters label {
  font-size: 14px;
  cursor: pointer;
  color: #4a7c59;
}

.order-list {
  list-style: none;
  padding: 0;
}

.order-item {
  background: #ffffff;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 10px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.order-link {
  font-size: 16px;
  color: #2d5a3a;
  text-decoration: none;
}

.order-link:hover {
  text-decoration: underline;
}

.order-details {
  font-size: 14px;
  color: #555;
}

.order-details strong {
  color: #2d5a3a;
}

.products-ordered-list {
  color: #2d5a3a;
  text-decoration: none;
  padding-top: 5px;
}

.products-ordered-list:hover {
  text-decoration: underline;
}

.loading-message {
  text-align: center;
  color: #4a7c59;
  font-size: 16px;
}

@media (max-width: 500px) {
  .order-filters {
    flex-direction: column;
    align-items: center;
  }
}
</style>
