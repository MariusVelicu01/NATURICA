<template>
  <div class="order-details-container">
    <h1 class="title">Order Details</h1>

    <div v-if="loading" class="loading-message">Loading order details...</div>
    <div v-else class="order-content">
      <div class="order-actions">
        <button v-if="order.status === 'pending'" @click="cancelOrder(order.id)" class="btn-cancel">
          Cancel Order
        </button>
        <button v-if="order.status === 'pending'" @click="confirmOrder(order.id)" class="btn-confirm">
          Confirm Order
        </button>
      </div>

      <p class="order-status"><strong>Status:</strong> {{ order.status }}</p>
      
      <p v-if="order.createdAt"><strong>Created At:</strong> {{ formatDate(order.createdAt) }}</p>
      <p v-if="order.updatedAt && !order.canceledAt && !order.confirmedAt"><strong>Last Update:</strong> {{ formatDate(order.updatedAt) }}</p>
      <p v-if="order.canceledAt && !order.confirmedAt"><strong>Canceled At:</strong> {{ formatDate(order.canceledAt) }}</p>
      <p v-if="order.confirmedAt"><strong>Confirmed At:</strong> {{ formatDate(order.confirmedAt) }}</p>

      <div class="order-section">
        <h4>Delivery Details</h4>
        <p><strong>Name:</strong> {{ order.fullName }}</p>
        <p><strong>Address:</strong> {{ order.address }}</p>
        <p><strong>City:</strong> {{ order.city }}</p>
        <p><strong>Country:</strong> {{ order.country }}</p>
        <p><strong>Postal Code:</strong> {{ order.postalCode }}</p>
      </div>

      <div class="order-section">
        <h4>Products Ordered</h4>
        <ul class="product-list">
          <li v-for="product in order.productsOrdered" :key="product.productId" class="product-item">
            <router-link class="product-name-link" :to="`/admin/products/${product.productId}`">
              <h2>{{ product.name }}</h2>
            </router-link>
            <img v-if="product.imgSrc" :src="product.imgSrc" alt="Product Image" class="product-image" />
            <p><strong>Price:</strong> ${{ product.price }}</p>
            <p><strong>Quantity Ordered:</strong> {{ product.quantity }}</p>
          </li>
        </ul>
      </div>

      <p class="order-total"><strong>Total:</strong> ${{ orderTotal }}</p>
      <p class="payment-method"><strong>Payment Method:</strong> {{ order.paymentMethod }}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "OrderDetailsAdmin",
  data() {
    return {
      loading: true,
      order: null,
      id: this.$route.params.id,
    };
  },
  computed: {
    ...mapGetters("orders", ["orderToView", "orderTotal", "getError"]),
  },
  methods: {
    ...mapActions("orders", [
      "fetchOrderAction",
      "cancelOrderAction",
      "confirmOrderAction",
    ]),
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
        if (this.getError) {
          alert(`Error: ${this.getError.message}`);
        } else {
          alert("Order canceled succesfully");
          this.fetchOrderDetails();
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
          alert("order confirmed successfully");
          this.fetchOrderDetails();
        }
      }
    },
  },
  created() {
    this.fetchOrderDetails();
  },
};
</script>

<style scoped>
.order-details-container {
  font-family: "Arial", sans-serif;
  background: #f8f8f5;
  padding: 20px;
  max-width: 800px;
  margin: auto;
  border-radius: 10px;
    margin-top: 30px;
}

.title {
  color: #3e7042;
  font-size: 24px;
  text-align: center;
  margin-bottom: 15px;
}

h4 {
  color: #2d5a3a;
  margin-bottom: 5px;
}

.order-content {
  background: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.order-status {
  font-size: 16px;
  font-weight: bold;
  color: #4a7c59;
}

.order-section {
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
  background: #f4f4f4;
}

.product-list {
  list-style: none;
  padding: 0;
}

.product-item {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.product-image {
  max-width: 150px;
  border-radius: 5px;
  margin-top: 5px;
}

.product-name-link{
  color: #2d5a3a;
  text-decoration: none;
  padding-top: 5px;
}

.product-name-link:hover{
  text-decoration: underline;
}

.order-total, .payment-method {
  font-size: 16px;
  font-weight: bold;
  margin-top: 10px;
  color: #3e7042;
}

.order-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.btn-cancel, .btn-confirm {
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
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

@media (max-width: 500px) {
  .order-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-cancel, .btn-confirm {
    width: 100%;
  }
}
</style>
