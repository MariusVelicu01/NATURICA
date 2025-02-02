<template>
  <div>
    <h1>Manage Orders</h1>

    <button @click="showStatisticsModal = true">Statistics</button>

    <h2>Orders List</h2>

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
      <div v-if="loading">Loading orders...</div>
      <ul v-else>
        <li v-for="order in filteredOrders" :key="order.id">
          <router-link :to="`/admin/orders/${order.id}`">
            <h2>{{ order.id }} - {{ order.status }}</h2>
          </router-link>
          <div>
            <p>
              <strong>Created At:</strong> {{ formatDate(order.createdAt) }}
            </p>
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
              <router-link :to="`/admin/products/${productOrdered.productId}`">
                {{ productOrdered.name }}
              </router-link>
            </li>
          </div>
        </li>
      </ul>
    </div>

    <transition name="fade">
      <div
        v-if="showStatisticsModal"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div class="modal-content">
          <h2>Order Statistics</h2>

          <p><strong>Total Revenue:</strong> ${{ totalRevenue }}</p>

          <h3>Top 5 Best-Selling Products</h3>
          <ul>
            <li
              v-for="(product, index) in this.topSellingProducts"
              :key="index"
            >
              <router-link :to="`/admin/products/${product.id}`">{{
                product.name
              }}</router-link>
              - Sold: {{ product.sales }}
            </li>
          </ul>

          <button @click="closeModal">Close</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "OrdersAdmin",
  data() {
    return {
      loading: true,
      showStatisticsModal: false,
      totalRevenue: 0,
      topSellingProducts: [],
      selectedStatus: "pending",
    };
  },
  computed: {
    ...mapGetters("orders", ["allOrders"]),
    ...mapGetters("products", ["allProducts"]),
    filteredOrders() {
      return this.allOrders.filter(
        (order) => order.status === this.selectedStatus
      );
    },
  },
  methods: {
    ...mapActions("orders", ["fetchOrdersAction"]),
    ...mapActions("products", ["fetchProductsAction"]),
    async fetchData() {
      try {
        await Promise.all([
          this.fetchOrdersAction(),
          this.fetchProductsAction(),
        ]);
        this.calculateStatistics();
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        this.loading = false;
      }
    },

    calculateStatistics() {
      if (!this.allOrders || !Array.isArray(this.allOrders)) {
        this.totalRevenue = 0;
        return;
      }

      this.totalRevenue = this.allOrders
        .filter(
          (order) => order.status === "confirmed" || order.status === "pending"
        )
        .reduce((sum, order) => sum + (order.totalValue || 0), 0);

      if (!this.allProducts || !Array.isArray(this.allProducts)) {
        this.topSellingProducts = [];
        return;
      }

      const sortedProducts = [...this.allProducts]
        .sort((a, b) => b.productStatistics - a.productStatistics)
        .slice(0, 5);

      this.topSellingProducts = sortedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        sales: product.productStatistics,
      }));
    },

    closeModal() {
      this.showStatisticsModal = false;
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
