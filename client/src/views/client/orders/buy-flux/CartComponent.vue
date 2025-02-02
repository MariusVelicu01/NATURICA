<template>
  <div class="cart-container">
    <h1 class="title">Your Cart</h1>

    <div v-if="cartItems.length === 0" class="empty-cart">
      <p>Your cart is empty.</p>
      <router-link to="/client/products" class="btn-continue">Continue Shopping</router-link>
    </div>

    <div v-else>
      <ul class="cart-items">
        <li v-for="item in cartItems" :key="item.id" class="cart-item">
          <h2 class="item-name">{{ item.name }}</h2>
          <p class="item-price">Price: ${{ item.price }}</p>
          <img v-if="item.imgSrc" :src="item.imgSrc" alt="Product Image" class="item-image" />
          <div class="quantity-controls">
            <button @click="decreaseQuantity(item)" class="btn-decrease">-</button>
            <span class="item-quantity">{{ item.quantity }}</span>
            <button @click="increaseQuantity(item)" class="btn-increase">+</button>
          </div>
          <p class="item-subtotal">Subtotal: ${{ (item.price * item.quantity).toFixed(2) }}</p>
          <button @click="removeFromCart(item)" class="btn-remove">Remove</button>
        </li>
      </ul>

      <div class="cart-summary">
        <h3 class="cart-total">Total: ${{ cartTotal.toFixed(2) }}</h3>
        <button @click="checkout" class="btn-checkout">Checkout</button>
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

<style scoped>
.cart-container {
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

.empty-cart {
  text-align: center;
}

.btn-continue {
  display: inline-block;
  background: #4a7c59;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  text-decoration: none;
}

.btn-continue:hover {
  background: #3e7042;
}

.cart-items {
  list-style: none;
  padding: 0;
}

.cart-item {
  background: white;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 10px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.item-name {
  font-size: 18px;
  color: #2d5a3a;
}

.item-price,
.item-subtotal {
  font-size: 14px;
  color: #4a7c59;
}

.item-image {
  max-width: 100px;
  border-radius: 5px;
  margin: 10px 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.item-quantity {
  font-size: 16px;
  font-weight: bold;
}

.btn-decrease,
.btn-increase,
.btn-remove,
.btn-checkout {
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
}

.btn-decrease,
.btn-increase {
  background: #4a7c59;
  color: white;
}

.btn-decrease:hover,
.btn-increase:hover {
  background: #3e7042;
}

.btn-remove {
  background: #e74c3c;
  color: white;
}

.btn-remove:hover {
  background: #c0392b;
}

.cart-summary {
  margin-top: 20px;
  text-align: right;
}

.cart-total {
  font-size: 18px;
  font-weight: bold;
  color: #3e7042;
  margin-bottom: 10px;
}

.btn-checkout {
  background: #27ae60;
  color: white;
}

.btn-checkout:hover {
  background: #1e8449;
}
</style>