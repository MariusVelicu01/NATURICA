<template>
  <div>
    <h1>Your Cart</h1>
    <div v-if="cartItems.length === 0">
      <p>Your cart is empty.</p>
      <router-link to="/client/products">Continue Shopping</router-link>
    </div>
    <div v-else>
      <ul>
        <li v-for="item in cartItems" :key="item.id">
          <h2>{{ item.name }}</h2>
          <p>Price: ${{ item.price }}</p>
          <img
            v-if="item.imgSrc"
            :src="item.imgSrc"
            alt="Product Image"
            style="max-width: 100px; margin-bottom: 10px"
          />
          <p>
            Quantity:
            <button @click="decreaseQuantity(item)">-</button>
            {{ item.quantity }}
            <button @click="increaseQuantity(item)">+</button>
          </p>
          <p>Subtotal: ${{ (item.price * item.quantity).toFixed(2) }}</p>
          <button @click="removeFromCart(item)">Remove</button>
        </li>
      </ul>
      <div>
        <h3>Total: ${{ cartTotal.toFixed(2) }}</h3>
        <button @click="checkout">Checkout</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters("cart", ["cartItems", "cartTotal"]),
  },
  methods: {
    ...mapActions("cart", ["removeFromCartAction", "updateCartQuantityAction"]),

    increaseQuantity(item) {
      if (item.quantity < item.stock) {
        console.log(item);
        this.updateCartQuantityAction({ item, quantity: item.quantity + 1 });
      } else {
        alert(`You cannot add more than ${item.stock} units of this product.`);
      }
    },

    decreaseQuantity(item) {
      if (item.quantity > 1) {
        console.log(item);
        this.updateCartQuantityAction({ item, quantity: item.quantity - 1 });
      } else {
        alert("Quantity cannot be less than 1.");
      }
    },

    removeFromCart(item) {
      this.removeFromCartAction(item.id);
    },

    checkout() {
      this.$router.push("checkout");
    },
  },
};
</script>

<style>
ul {
  list-style-type: none;
  padding: 0;
}
li {
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
  padding-bottom: 10px;
}
</style>
