<template>
  <div class="orders-container">
    <h1 class="title">Manage Orders</h1>

    <button class="btn-statistics" @click="showStatisticsModal = true">Statistics</button>

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
          <router-link :to="`/admin/orders/${order.id}`" class="order-link">
            <h2>{{ order.id }} - {{ order.status }}</h2>
          </router-link>
          <div class="order-details">
            <p><strong>Created At:</strong> {{ formatDate(order.createdAt) }}</p>
            <p v-if="order.updatedAt && !order.canceledAt && !order.confirmedAt"><strong>Last Update:</strong> {{ formatDate(order.updatedAt) }}</p>
            <p v-if="order.canceledAt"><strong>Canceled At:</strong> {{ formatDate(order.canceledAt) }}</p>
            <p v-if="order.confirmedAt"><strong>Confirmed At:</strong> {{ formatDate(order.confirmedAt) }}</p>
            <strong>Products Ordered</strong>
            <ul>
              <li v-for="productOrdered in order.productsOrdered" :key="productOrdered.productId">
                <router-link class="products-ordered-list" :to="`/admin/products/${productOrdered.productId}`">
                  {{ productOrdered.name }}
                </router-link>
              </li>
            </ul>
          </div>
          <div class="order-actions">
            <button v-if="order.status === 'pending'" @click="cancelOrder(order.id)" class="btn-cancel">
              Cancel Order
            </button>
            <button v-if="order.status === 'pending'" @click="confirmOrder(order.id)" class="btn-confirm">
              Confirm Order
            </button>
          </div>
        </li>
      </ul>
    </div>

    <transition name="fade">
      <div v-if="showStatisticsModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <h2>Order Statistics</h2>
          <p><strong>Total Revenue:</strong> ${{ totalRevenue }}</p>

          <h3>Top 5 Best-Selling Products</h3>
          <ul>
            <li v-for="(product, index) in this.topSellingProducts" :key="index">
              <router-link class="top-five-products" :to="`/admin/products/${product.id}`">{{ product.name }}</router-link>
              - Sold: {{ product.sales }}
            </li>
          </ul>

          <button class="btn-close" @click="closeModal">Close</button>
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
    ...mapActions("orders", [
      "fetchOrdersAction",
      "cancelOrderAction",
      "confirmOrderAction",
    ]),
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

    async cancelOrder(id) {
      const confirmed = confirm("Are you sure you want to cancel this order?");
      if (confirmed) {
        await this.cancelOrderAction(id);
        if (this.getError) {
          alert(`Error: ${this.getError.message}`);
        } else {
          alert("Order canceled succesfully");
          this.fetchOrdersAction();
        }
      }
    },
    async confirmOrder(id) {
      const confirmed = confirm("Are you sure you want to confirm this order?");
      if (confirmed) {
        await this.confirmOrderAction(id);
        if (this.getError) {
          alert(`Error: ${this.getError.message}`);
        } else {
          alert("Order confirmed successfully");
          this.fetchOrdersAction();
        }
      }
    },
  },
  created() {
    this.fetchData();
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

.order-actions {
  margin-top: 10px;
}

.products-ordered-list{
  color: #2d5a3a;
  text-decoration: none;
  padding-top: 5px;
}

.products-ordered-list:hover{
  text-decoration: underline;
}

.top-five-products{
  color: #2d5a3a;
  text-decoration: none;
  padding-top: 5px;
}

.top-five-products:hover{
  text-decoration: underline;
}

.btn-cancel, .btn-confirm, .btn-statistics, .btn-close {
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  margin: 3px;
}

.btn-statistics {
  background: #4a7c59;
  color: white;
}

.btn-statistics:hover {
  background: #3e7042;
}

.btn-cancel {
  background: #e74c3c;
  color: white;
}

.btn-cancel:hover {
  background: #c0392b;
}

.btn-confirm {
  background: #27ae60;
  color: white;
}

.btn-confirm:hover {
  background: #1e8449;
}

.btn-close {
  background: #e4b363;
  color: white;
}

.btn-close:hover {
  background: #d9a14a;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  max-height: 80vh;
  overflow-y: auto;
  width: 500px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 500px) {
  .order-filters {
    flex-direction: column;
    align-items: center;
  }

  .btn-cancel, .btn-confirm, .btn-statistics {
    width: 100%;
  }
}
</style>
