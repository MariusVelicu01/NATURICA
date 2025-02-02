<template>
  <div class="checkout-container">
    <h1 class="title">Checkout</h1>

    <div class="order-summary">
      <h2 class="subtitle">Order Summary</h2>
      <ul class="summary-list">
        <li v-for="item in cartItems" :key="item.id" class="summary-item">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-quantity">Quantity: {{ item.quantity }}</p>
          <p class="item-price">Price: ${{ (item.price * item.quantity).toFixed(2) }}</p>
        </li>
      </ul>
      <h3 class="total">Total: ${{ cartTotal.toFixed(2) }}</h3>
    </div>

    <form @submit.prevent="proceedToPayment" class="shipping-form">
      <h2 class="subtitle">Shipping Information</h2>
      <input v-model="form.name" placeholder="Full Name" required class="input-field" />
      <input v-model="form.address" placeholder="Address" required class="input-field" />
      <input v-model="form.city" placeholder="City" required class="input-field" />
      <input v-model="form.postalCode" placeholder="Postal Code" required class="input-field" />
      <input v-model="form.country" placeholder="Country" required class="input-field" />

      <h2 class="subtitle">Payment Method</h2>
      <div class="payment-methods">
        <label class="payment-option">
          <input type="radio" value="cash" v-model="form.paymentMethod" />
          Cash on Delivery
        </label>
        <label class="payment-option">
          <input type="radio" value="card" v-model="form.paymentMethod" />
          Credit/Debit Card
        </label>
      </div>

      <button type="submit" class="btn-proceed">
        Proceed to {{ form.paymentMethod === 'card' ? 'Card Payment' : 'Confirmation' }}
      </button>
    </form>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      form: {
        name: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        paymentMethod: "cash", 
      },
    };
  },
  computed: {
    ...mapGetters("cart", ["cartItems", "cartTotal"]),
  },
  methods: {
    proceedToPayment() {
      if (this.form.paymentMethod === "card") {
        this.$router.push({
          name: "CardPaymentClient",
          query: { ...this.form },
        });
      } else {
        this.$router.push({
          name: "OrderConfirmationClient",
          query: { ...this.form },
        });
      }
    },
  },
};
</script>

<style scoped>
.checkout-container {
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

.subtitle {
  font-size: 18px;
  color: #3e7042;
  margin-bottom: 10px;
}

.order-summary {
  background: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.summary-list {
  list-style: none;
  padding: 0;
}

.summary-item {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.item-name {
  font-size: 16px;
  color: #2d5a3a;
}

.item-quantity,
.item-price {
  font-size: 14px;
  color: #4a7c59;
}

.total {
  font-size: 18px;
  font-weight: bold;
  color: #3e7042;
  margin-top: 10px;
}

.shipping-form {
  background: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.input-field {
  width: 95%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #aac29b;
  border-radius: 5px;
  font-size: 14px;
}

.payment-methods {
  margin-bottom: 15px;
}

.payment-option {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #4a7c59;
}

.btn-proceed {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.btn-proceed:hover {
  background: #1e8449;
}
</style>