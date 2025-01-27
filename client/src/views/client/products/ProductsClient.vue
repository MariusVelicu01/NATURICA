<template>
  <div>
    <h1>Products</h1>

    <div>
      <label for="symptoms-select">Filter by Symptoms:</label>
      <multiselect
        id="symptoms-select"
        v-model="selectedSymptoms"
        :options="symptomsOptions"
        :multiple="true"
        :searchable="true"
        placeholder="Select symptoms"
        label="label"
        track-by="value"
      />

      <label for="conditions-select">Filter by Conditions:</label>
      <multiselect
        id="conditions-select"
        v-model="selectedConditions"
        :options="filteredConditionsOptions"
        :multiple="true"
        :searchable="true"
        placeholder="Select conditions"
        label="label"
        track-by="value"
      />
    </div>

    <div v-if="loading">Loading products...</div>
    <div v-else-if="filteredProducts.length === 0">
      No products match your criteria.
    </div>
    <ul v-else>
      <li v-for="product in filteredProducts" :key="product.id">
        <h2>{{ product.name }}</h2>
        <p>Price: ${{ product.price }}</p>
        <img
          v-if="product.imgSrc"
          :src="product.imgSrc"
          alt="Product Image"
          style="max-width: 200px; display: block; margin-bottom: 10px"
        />
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
    };
  },
  computed: {
    ...mapGetters("products", ["allProducts"]),
    ...mapGetters("conditions", ["allConditions", "symptomsTreated"]),
    ...mapGetters("symptoms", ["allSymptoms"]),

    symptomsOptions() {
      return this.allSymptoms.map((symptom) => ({
        value: symptom.id,
        label: symptom.name,
      }));
    },

    filteredConditionsOptions() {
      if (this.selectedSymptoms.length === 0) {
        return this.allConditions.map((condition) => ({
          value: condition.id,
          label: condition.name,
        }));
      }
      return this.allConditions
        .filter((condition) =>
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

    filteredProducts() {
      const productsBySymptoms = this.filterBySymptoms();
      const productsByConditions = this.filterByConditions();

      if (
        productsBySymptoms.length === 0 &&
        productsByConditions.length === 0
      ) {
        return this.allProducts;
      }

      if (productsBySymptoms.length === 0) {
        return productsByConditions;
      }
      if (productsByConditions.length === 0) {
        return productsBySymptoms;
      }

      return productsBySymptoms.filter((product) =>
        productsByConditions.includes(product)
      );
    },
  },
  methods: {
    ...mapActions("products", ["fetchProductsAction"]),
    ...mapActions("conditions", ["fetchConditionsAction"]),
    ...mapActions("symptoms", ["fetchSymptomsAction"]),

    filterBySymptoms() {
      return this.allProducts.filter((product) => {
        const productSymptoms = this.symptomsTreated(product.conditionsTreated);
        return this.selectedSymptoms.some((selectedSymptom) =>
          productSymptoms.some(
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
  },

  created() {
    this.fetchData();
  },
};
</script>

<style>
@import "vue-multiselect/dist/vue-multiselect.min.css";
</style>
