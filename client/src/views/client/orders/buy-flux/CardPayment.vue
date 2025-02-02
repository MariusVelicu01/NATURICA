<template>
  <div class="card-payment-container">
    <h1 class="title">Card Payment</h1>
    <form @submit.prevent="processPayment" class="payment-form">
      <input
        v-model="cardNumber"
        maxlength="16"
        placeholder="Card Number (16 digits)"
        required
        class="input-field"
      />
      <div class="expiry-fields">
        <input
          v-model="expiryMonth"
          maxlength="2"
          placeholder="MM"
          required
          class="input-field expiry-input"
        />
        <input
          v-model="expiryYear"
          maxlength="2"
          placeholder="YY"
          required
          class="input-field expiry-input"
        />
      </div>
      <input
        v-model="cvv"
        maxlength="3"
        placeholder="CVV"
        required
        class="input-field"
      />
      <button type="submit" class="btn-pay">
        Pay ${{ cartTotal.toFixed(2) }}
      </button>
    </form>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      query: {
        name: this.$route.query.name,
        address: this.$route.query.address,
        city: this.$route.query.city,
        postalCode: this.$route.query.postalCode,
        country: this.$route.query.country,
        paymentMethod: "card" 
      }
    };
  },
  computed: {
    ...mapGetters("cart", ["cartTotal"]),
  },
  methods: {
    processPayment() {
      if (
        this.cardNumber.length !== 16 ||
        this.expiryMonth < 1 ||
        this.expiryMonth > 12 ||
        this.expiryYear < 25 ||
        this.cvv.length !== 3
      ) {
        alert("Invalid card details. Please try again.");
        return;
      }

      this.$router.push({
        name: "OrderConfirmationClient",
        query: this.query
      });
    },
  },
};
</script>

<style scoped>
.card-payment-container {
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
  margin-bottom: 15px;
}

.payment-form {
  background: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.input-field {
  width: 95%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #aac29b;
  border-radius: 5px;
  font-size: 14px;
}

.expiry-fields {
  display: flex;
  justify-content: space-between;
}

.expiry-input {
  width: 48%;
}

.btn-pay {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
}

.btn-pay:hover {
  background: #1e8449;
}
</style>