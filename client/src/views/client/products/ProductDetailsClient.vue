<template>
  <div class="product-container">
    <div v-if="product">
      <h1 class="product-title">{{ product.name }}</h1>

      <img
        v-if="product.imgSrc"
        :src="product.imgSrc"
        alt="Product Image"
        class="product-image"
      />

      <p><strong>Price:</strong> {{ product.price }} $</p>
      <p><strong>Details:</strong> {{ product.productDetails }}</p>
      <p><strong>Stock:</strong> {{ product.stock }}</p>

      <div class="conditions-section">
        <h3>Conditions Treated:</h3>
        <ul>
          <li v-for="condition in product.conditionsTreated" :key="condition.id">
            {{ condition.name }}
          </li>
        </ul>
      </div>

      <div class="symptoms-section">
        <h3>Symptoms Treated:</h3>
        <ul>
          <li v-for="symptom in product.symptomsTreated" :key="symptom.id">
            {{ symptom.name }}
          </li>
        </ul>
      </div>

      <div v-if="product.stock > 0" class="add-to-cart-section">
        <label for="quantity">Quantity:</label>
        <input
          id="quantity"
          type="number"
          v-model.number="quantity"
          :min="1"
          :max="product.stock"
          class="input-field"
        />
        <button @click="addToCart" class="btn-primary">Add to Cart</button>
      </div>
      <div v-else>
        <span class="out-of-stock">OUT OF STOCK</span>
      </div>
    </div>
    <div v-else class="loading-message">
      <p>Loading product details...</p>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      product: null,
      quantity: 1,
    };
  },
  computed: {
    ...mapGetters("products", ["productToView"]),
  },
  methods: {
    ...mapActions("products", ["fetchProductAction"]),
    ...mapActions("cart", ["addToCartAction"]),

    fetchProductDetails() {
      this.fetchProductAction(this.id).then(() => {
        this.product = this.productToView;
      });
    },

    addToCart() {
      if (this.quantity < 1 || this.quantity > this.product.stock) {
        alert(`Please select a quantity between 1 and ${this.product.stock}.`);
        return;
      }

      this.addToCartAction({ product: this.product, quantity: this.quantity });
      alert(`${this.quantity} x ${this.product.name} added to cart!`);
    },
  },
  created() {
    this.fetchProductDetails();
  },
};
</script>

<style scoped>
.product-container {
  font-family: "Arial", sans-serif;
  background: #f8f8f5;
  padding: 20px;
  max-width: 600px;
  margin: auto;
  border-radius: 10px;
  text-align: center;
  margin-top: 30px;
}

.product-title {
  color: #3e7042;
  font-size: 22px;
  margin-bottom: 15px;
}

.product-image {
  max-width: 250px;
  border-radius: 10px;
  margin: 10px 0;
}

.out-of-stock {
  color: red;
  font-weight: bold;
}

.conditions-section, .symptoms-section {
  text-align: left;
  margin: 15px 0;
}

.conditions-section h3, .symptoms-section h3 {
  color: #4a7c59;
  font-size: 18px;
}

.input-field {
  width: 60px;
  padding: 5px;
  border: 1px solid #aac29b;
  border-radius: 5px;
  margin: 5px;
}

.btn-primary {
  background: #4a7c59;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #3e7042;
}

.loading-message {
  color: #4a7c59;
  font-size: 16px;
}

@media (max-width: 500px) {
  .product-container {
    padding: 10px;
  }

  .product-image {
    max-width: 200px;
  }

  .btn-primary {
    width: 100%;
  }
}
</style>