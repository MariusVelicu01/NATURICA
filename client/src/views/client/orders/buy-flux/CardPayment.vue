<template>
  <div>
    <h1>Card Payment</h1>
    <form @submit.prevent="processPayment">
      <input
        v-model="cardNumber"
        maxlength="16"
        placeholder="Card Number (16 digits)"
        required
      />
      <input
        v-model="expiryMonth"
        maxlength="2"
        placeholder="MM"
        required
      />
      <input
        v-model="expiryYear"
        maxlength="2"
        placeholder="YY"
        required
      />
      <input
        v-model="cvv"
        maxlength="3"
        placeholder="CVV"
        required
      />
      <button type="submit">Pay ${{ cartTotal.toFixed(2) }}</button>
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

      console.log(this.query);

      this.$router.push({
        name: "OrderConfirmationClient",
        query: this.query
      });
    },
  },
};
</script>
