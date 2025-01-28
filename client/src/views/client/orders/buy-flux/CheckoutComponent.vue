<template>
  <div>
    <h1>Checkout</h1>
    <div>
      <h2>Order Summary</h2>
      <ul>
        <li v-for="item in cartItems" :key="item.id">
          <h3>{{ item.name }}</h3>
          <p>Quantity: {{ item.quantity }}</p>
          <p>Price: ${{ (item.price * item.quantity).toFixed(2) }}</p>
        </li>
      </ul>
      <h3>Total: ${{ cartTotal.toFixed(2) }}</h3>
    </div>
    <form @submit.prevent="proceedToPayment">
      <h2>Shipping Information</h2>
      <input v-model="form.name" placeholder="Full Name" required />
      <input v-model="form.address" placeholder="Address" required />
      <input v-model="form.city" placeholder="City" required />
      <input v-model="form.postalCode" placeholder="Postal Code" required />
      <input v-model="form.country" placeholder="Country" required />
      <h2>Payment Method</h2>
      <label>
        <input type="radio" value="cash" v-model="form.paymentMethod" />
        Cash on Delivery
      </label>
      <label>
        <input type="radio" value="card" v-model="form.paymentMethod" />
        Credit/Debit Card
      </label>
      <button type="submit">Proceed to {{ form.paymentMethod === 'card' ? 'Card Payment' : 'Confirmation' }}</button>
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
