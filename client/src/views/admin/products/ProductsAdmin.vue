<template>
  <div>
    <h1>Manage Products</h1>
    <button @click="openAddForm">Add Product</button>

    <div>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search products..."
      />
    </div>

    <div>
      <label for="symptoms-select">Filter by Symptoms:</label>
      <multiselect
        id="symptoms-select"
        v-model="selectedSymptomsFilter"
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
        v-model="selectedConditionsFilter"
        :options="filteredConditionsOptions"
        :multiple="true"
        :searchable="true"
        placeholder="Select conditions"
        label="label"
        track-by="value"
      />
    </div>

    <div v-if="filteredProducts.length === 0">
      No products match your criteria.
    </div>
    <div v-else-if="this.loading">Loading products...</div>
    <ul v-else>
      <li v-for="product in filteredProducts" :key="product.id">
        <router-link :to="`/admin/products/${product.id}`">
          <h2>{{ product.name }}</h2>
        </router-link>
        <p>Price: ${{ product.price }}</p>
        <img
          v-if="product.imgSrc"
          :src="product.imgSrc"
          alt="Product Image"
          style="max-width: 200px; display: block; margin-bottom: 10px"
        />
        <button @click="openEditForm(product)">Update</button>
        <button @click="deleteProduct(product.id)">Delete</button>
      </li>
    </ul>

    <div v-if="showForm">
      <transition name="fade">
        <div v-if="showForm" class="modal-overlay" @click.self="cancelForm">
          <div class="modal-content">
            <h2>{{ isEditing ? "Update Product" : "Add Product" }}</h2>

            <form @submit.prevent="submitForm">
              <input v-model="form.name" placeholder="Product Name" required />
              <textarea
                v-model="form.productDetails"
                placeholder="Details"
                required
              />
              <multiselect
                v-model="selectedConditions"
                :options="conditionsOptions"
                :multiple="true"
                :searchable="true"
                placeholder="Select conditions"
                label="label"
                track-by="value"
              />
              <div v-if="symptomsTreated.length > 0">
                <h3>Symptoms Treated:</h3>
                <ul>
                  <li
                    v-for="symptom in currentSymptomsTreated"
                    :key="symptom.id"
                  >
                    {{ symptom.name }}
                  </li>
                </ul>
              </div>
              <input
                v-model="form.price"
                type="number"
                placeholder="Price"
                required
              />
              <input
                v-model="form.stock"
                type="number"
                placeholder="Stock"
                required
              />
              <div v-if="form.imgSrc">
                <label>Current Image:</label>
                <img
                  :src="form.imgSrc"
                  alt="Product Image"
                  style="max-width: 200px; display: block; margin-bottom: 10px"
                />
                <span>File Name: {{ extractFileName(form.imgSrc) }}</span>
              </div>

              <label>Upload New Image:</label>
              <input
                type="file"
                @change="handleFileChange"
                accept="image/png, image/jpeg"
              />
              <button type="submit">{{ isEditing ? "Update" : "Add" }}</button>
              <button type="button" @click="cancelForm">Cancel</button>
            </form>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import { mapActions, mapGetters } from "vuex";
import { decryptData } from "../../../utils/encryptData";

export default {
  components: { Multiselect },
  data() {
    return {
      showForm: false,
      isEditing: false,
      form: {
        id: null,
        name: "",
        productDetails: "",
        price: 0,
        stock: 0,
        imgSrc: "",
      },
      file: null,
      selectedConditions: [],
      conditionsOptions: [],
      selectedSymptomsFilter: [],
      selectedConditionsFilter: [],
      loading: true,
      searchQuery: "",
    };
  },
  computed: {
    ...mapGetters("products", ["allProducts", "getError"]),
    ...mapGetters("conditions", ["allConditions", "symptomsTreated"]),
    ...mapGetters("symptoms", ["allSymptoms"]),
    currentSymptomsTreated() {
      return this.symptomsTreated(this.selectedConditions);
    },

    symptomsOptions() {
      return this.allSymptoms.map((symptom) => ({
        value: symptom.id,
        label: symptom.name,
      }));
    },

    filteredConditionsOptions() {
      if (!Array.isArray(this.conditionsWithSymptoms)) return [];
      if (this.selectedSymptomsFilter.length === 0) {
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
              this.selectedSymptomsFilter.some(
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
      const productsBySymptoms = this.filterBySymptoms();
      const productsByConditions = this.filterByConditions();

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
    ...mapActions("products", [
      "fetchProductsAction",
      "addProductAction",
      "updateProductAction",
      "deleteProductAction",
    ]),
    ...mapActions("conditions", ["fetchConditionsAction"]),
    ...mapActions("symptoms", ["fetchSymptomsAction"]),

    async fetchDataOnCreate() {
      await this.fetchConditionsAction();
      this.conditionsOptions = this.conditionsWithSymptoms.map((condition) => ({
        value: condition.id,
        label: condition.name,
      }));
      await this.fetchProductsAction();
      await this.fetchSymptomsAction();
      this.loading = false;
    },

    async fetchData() {
      this.conditionsOptions = this.conditionsWithSymptoms.map((condition) => ({
        value: condition.id,
        label: condition.name,
      }));
      this.loading = false;
      await this.fetchProductsAction();
    },

    openAddForm() {
      this.clearForm();
      this.showForm = true;
      this.isEditing = false;
    },

    openEditForm(product) {
      this.showForm = true;
      this.isEditing = true;
      this.form = { ...product };
      this.selectedConditions = product.conditionsTreated.map((condition) => ({
        value: condition.id,
        label: condition.name,
      }));
    },

    handleFileChange(event) {
      this.file = event.target.files[0];
    },

    extractFileName(url) {
      if (!url) return "No file";
      const segments = url.split("/");
      return segments[segments.length - 1];
    },

    async submitForm() {
      try {
        let imageUrl = this.form.imgSrc;

        if (this.file) {
          const formData = new FormData();
          formData.append("file", this.file);

          const uploadResponse = await fetch(
            "http://localhost:3000/storage/upload",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${decryptData(
                  localStorage.getItem("token")
                )}`,
              },
              body: formData,
            }
          );

          if (!uploadResponse.ok) {
            alert("Failed to upload file.");
            return;
          }

          const { url } = await uploadResponse.json();
          imageUrl = url;
        }

        const payload = {
          name: this.form.name,
          productDetails: this.form.productDetails,
          price: this.form.price,
          stock: this.form.stock,
          imgSrc: imageUrl,
          conditionsTreated: this.selectedConditions.map((condition) => ({
            id: condition.value,
            name: condition.label,
          })),
        };

        if (this.isEditing) {
          await this.updateProductAction({
            id: this.form.id,
            payload,
          });
          if (this.getError) {
            alert(`Error: ${this.getError.message}`);
          } else {
            this.cancelForm();
            alert("Product saved successfully!");
            await this.fetchData();
          }
        } else {
          await this.addProductAction(payload);
          if (this.getError) {
            alert(`Error: ${this.getError.message}`);
          } else {
            this.cancelForm();
            window.location.reload();
            alert("Product saved successfully!");
          }
        }
      } catch (error) {
        console.error("Error saving product:", error.message);
      }
    },

    clearForm() {
      this.form = {
        id: null,
        name: "",
        productDetails: "",
        price: 0,
        stock: 0,
        imgSrc: "",
      };
      this.file = null;
      this.selectedConditions = [];
    },

    cancelForm() {
      this.showForm = false;
      this.clearForm();
    },

    async deleteProduct(id) {
      const confirmed = confirm(
        "Are you sure you want to delete this product?"
      );
      if (confirmed) {
        this.cancelForm();
        await this.deleteProductAction(id);
        if (this.getError) {
          alert(`Error: ${this.getError.message}`);
        } else {
          alert("Product deleted successfully!");
        }

        await this.fetchData();
      }
    },

    filterBySymptoms() {
      return this.allProducts.filter((product) => {
        const productSymptoms = this.symptomsTreated(product.conditionsTreated);
        return this.selectedSymptomsFilter.some((selectedSymptom) =>
          productSymptoms.some(
            (symptom) => symptom.id === selectedSymptom.value
          )
        );
      });
    },

    filterByConditions() {
      return this.allProducts.filter((product) =>
        this.selectedConditionsFilter.some((condition) =>
          product.conditionsTreated.some(
            (treatedCondition) => treatedCondition.id === condition.value
          )
        )
      );
    },
  },
  created() {
    this.fetchDataOnCreate();
  },
};
</script>

<style>
@import "vue-multiselect/dist/vue-multiselect.min.css";
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 5px;
  max-height: 80vh;
  overflow-y: auto;
  width: 500px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
