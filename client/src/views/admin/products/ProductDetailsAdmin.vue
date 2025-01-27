<template>
  <div>
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
      <li v-for="symptom in symptomsTreated" :key="symptom.id">
        {{ symptom.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

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
    };
  },
  computed: {
    ...mapGetters("products", ["allProducts", "symptomsTreated"]),
    productDetails() {
      return this.allProducts.find((product) => product.id === this.id);
    },
    symptomsTreated() {
      if (this.product) {
        return this.$store.getters["conditions/symptomsTreated"](
          this.product.conditionsTreated
        );
      }
      return [];
    },
  },
  methods: {
    fetchProductDetails() {
      this.product = this.productDetails;
    },
  },
  created() {
    this.fetchProductDetails();
  },
};
</script>
