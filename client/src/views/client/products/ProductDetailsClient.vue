<template>
  <div>
    <div v-if="product">
      <h1>{{ product.name }}</h1>
      <img
        v-if="product.imgSrc"
        :src="product.imgSrc"
        alt="Product Image"
        style="max-width: 300px; display: block; margin-bottom: 20px"
      />
      <p><strong>Price:</strong> ${{ product.price }}</p>
      <p><strong>Details:</strong> {{ product.productDetails }}</p>
      <p><strong>Stock:</strong> {{ product.stock }}</p>
      <p><strong>Conditions Treated:</strong></p>
      <ul>
        <li v-for="condition in product.conditionsTreated" :key="condition.id">
          {{ condition.name }}
        </li>
      </ul>
      <p><strong>Symptoms Treated:</strong></p>
      <ul>
        <li v-for="symptom in currentSymptomsTreated" :key="symptom.id">
          {{ symptom.name }}
        </li>
      </ul>

      <div v-if="product.stock > 0">
        <label for="quantity">Quantity:</label>
        <input
          id="quantity"
          type="number"
          v-model.number="quantity"
          :min="1"
          :max="product.stock"
          placeholder="Select quantity"
        />
        <button @click="addToCart">Add to Cart</button>
      </div>
      <div v-else>
        <span style="color: red; font-weight: bold;">OUT OF STOCK</span>
      </div>
    </div>
    <div v-else>
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
    ...mapGetters("products", ["allProducts", "productToView"]),
    ...mapGetters("conditions", ["allConditions", "symptomsTreated"]),
    ...mapGetters("cart", ["cartItems"]),

    currentSymptomsTreated() {
      return this.symptomsTreated(this.product.conditionsTreated);
    },
  },
  methods: {
    ...mapActions("products", ["fetchProductAction"]),
    ...mapActions("conditions", ["fetchConditionsAction"]),
    ...mapActions("symptoms", ["fetchSymptomsAction"]),
    ...mapActions("cart", ["addToCartAction"]),

    fetchProductDetails() {
      this.fetchProductAction(this.id).then(() => {
        this.product = this.productToView;
      });
    },

    async fetchData() {
      await this.fetchConditionsAction();
      await this.fetchSymptomsAction();
    },

addToCart() {
  if (this.quantity < 1 || this.quantity > this.product.stock) {
    alert(
      `Please select a quantity between 1 and ${this.product.stock}.`
    );
    return;
  }

  this.addToCartAction({ product: this.product, quantity: this.quantity });
  alert(`${this.quantity} x ${this.product.name} added to cart!`);
},
  },
  created() {
    this.fetchProductDetails();
    this.fetchData();
  },
};
</script>
