<template>
  <div class="products-container">
    <h1 class="title">Products</h1>

    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search products..."
      class="input-search"
    />

    <div class="filters">
      <label for="symptoms-select" class="filter-label"
        >Filter by Symptoms:</label
      >
      <multiselect
        id="symptoms-select"
        v-model="selectedSymptoms"
        :options="symptomsOptions"
        :multiple="true"
        :searchable="true"
        placeholder="Select symptoms"
        label="label"
        track-by="value"
        class="multiselect"
      />

      <label for="conditions-select" class="filter-label"
        >Filter by Conditions:</label
      >
      <multiselect
        id="conditions-select"
        v-model="selectedConditions"
        :options="filteredConditionsOptions"
        :multiple="true"
        :searchable="true"
        placeholder="Select conditions"
        label="label"
        track-by="value"
        class="multiselect"
      />
    </div>

    <div v-if="loading" class="loading-message">Loading products...</div>
    <div v-else-if="filteredProducts.length === 0" class="no-results">
      No products match your criteria.
    </div>

    <ul v-else class="products-list">
      <li
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-item"
      >
        <router-link
          :to="`/client/products/${product.id}`"
          class="product-title"
        >
          <h2>{{ product.name }}</h2>
        </router-link>
        <img
          v-if="product.imgSrc"
          :src="product.imgSrc"
          alt="Product Image"
          class="product-image"
        />
        <p class="product-price">Price: {{ product.price }} $</p>
        <p v-if="product.stock === 0" class="out-of-stock">OUT OF STOCK</p>
        <button
          v-if="product.stock > 0"
          @click="addToCart(product)"
          class="btn-primary"
        >
          Add to Cart
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import { mapActions, mapGetters } from "vuex";

export default {
  components: { Multiselect },
  data() {
    return {
      loading: true,
      selectedSymptoms: [],
      selectedConditions: [],
      searchQuery: "",
    };
  },
  computed: {
    ...mapGetters("products", ["allProducts"]),
    ...mapGetters("conditions", ["allConditions", "symptomsTreated"]),
    ...mapGetters("symptoms", ["allSymptoms"]),
    ...mapGetters("cart", ["cartItems"]),

    symptomsOptions() {
      return this.allSymptoms.map((symptom) => ({
        value: symptom.id,
        label: symptom.name,
      }));
    },

    filteredConditionsOptions() {
      if (!Array.isArray(this.conditionsWithSymptoms)) return [];
      if (this.selectedSymptoms.length === 0) {
        return this.conditionsWithSymptoms.map((condition) => ({
          value: condition.id,
          label: condition.name,
        }));
      }

      return this.conditionsWithSymptoms
        .filter(
          (condition) =>
            Array.isArray(condition.symptoms) &&
            condition.symptoms.some((symptom) =>
              this.selectedSymptoms.some(
                (selectedSymptom) => selectedSymptom.value === symptom.id
              )
            )
        )
        .map((condition) => ({
          value: condition.id,
          label: condition.name,
        }));
    },

    conditionsWithSymptoms() {
      if (!this.allConditions || !Array.isArray(this.allConditions)) return [];
      return this.allConditions.filter(
        (condition) =>
          Array.isArray(condition.symptoms) && condition.symptoms.length > 0
      );
    },

    filteredProducts() {
      let productsBySymptoms = this.filterBySymptoms();
      let productsByConditions = this.filterByConditions();

      if (
        productsBySymptoms.length === 0 &&
        productsByConditions.length === 0
      ) {
        return this.allProducts.filter(
          (product) =>
            product &&
            product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      } else if (productsBySymptoms.length === 0) {
        return productsByConditions.filter(
          (product) =>
            product &&
            product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      } else if (productsByConditions.length === 0) {
        return productsBySymptoms.filter(
          (product) =>
            product &&
            product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      } else
        return productsBySymptoms.filter(
          (product) =>
            product &&
            productsByConditions.includes(product) &&
            product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    },
  },
  methods: {
    ...mapActions("products", ["fetchProductsAction"]),
    ...mapActions("conditions", ["fetchConditionsAction"]),
    ...mapActions("symptoms", ["fetchSymptomsAction"]),
    ...mapActions("cart", ["addToCartAction"]),

    async fetchData() {
      try {
        await Promise.all([
          this.fetchProductsAction(),
          this.fetchConditionsAction(),
          this.fetchSymptomsAction(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        this.loading = false;
      }
    },

    addToCart(product) {
      if (!product.stock || product.stock < 1) {
        alert("This product is out of stock.");
        return;
      }

      this.addToCartAction({ product, quantity: 1 });
      alert(`${product.name} added to cart!`);
    },

    filterBySymptoms() {
      return this.allProducts.filter((product) => {
        return this.selectedSymptoms.some((selectedSymptom) =>
          product.symptomsTreated.some(
            (symptom) => symptom.id === selectedSymptom.value
          )
        );
      });
    },

    filterByConditions() {
      return this.allProducts.filter((product) =>
        this.selectedConditions.some((condition) =>
          product.conditionsTreated.some(
            (treatedCondition) => treatedCondition.id === condition.value
          )
        )
      );
    },
  },

  created() {
    this.fetchData();
  },
};
</script>

<style scoped>
@import "vue-multiselect/dist/vue-multiselect.min.css";

.products-container {
  font-family: "Arial", sans-serif;
  background: #f8f8f5;
  padding: 20px;
  max-width: 1500px;
  margin: auto;
  border-radius: 10px;
  text-align: center;
  margin-top: 30px;
}

.title {
  color: #3e7042;
  font-size: 22px;
  margin-bottom: 15px;
}

.input-search {
  width: 95%;
  padding: 8px;
  border: 1px solid #aac29b;
  border-radius: 5px;
  font-size: 14px;
}

.filters {
  margin-bottom: 20px;
}

.filter-label {
  font-weight: bold;
}

.multiselect {
  margin: 10px 0;
}

.products-list {
  list-style: none;
  padding: 0;
}

.product-item {
  background: white;
  margin: 10px 0;
  padding: 15px;
  border-radius: 10px;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.product-title {
  color: #3e7042;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.product-price {
  font-size: 16px;
  color: #4a7c59;
}

.out-of-stock {
  color: red;
  font-weight: bold;
}

.product-image {
  max-width: 150px;
  margin: 10px 0;
  border-radius: 10px;
}

.btn-primary {
  background: #4a7c59;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #3e7042;
}

.no-results {
  color: red;
  font-size: 16px;
  margin: 20px 0;
}

.loading-message {
  font-size: 16px;
  color: #4a7c59;
  margin: 20px 0;
}

@media (max-width: 500px) {
  .input-search {
    width: 100%;
  }
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
