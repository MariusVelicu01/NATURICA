<template>
  <div class="products-container">
    <h1 class="title">Manage Products</h1>

    <button @click="openAddForm" class="btn-primary">Add Product</button>
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
        v-model="selectedSymptomsFilter"
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
        v-model="selectedConditionsFilter"
        :options="filteredConditionsOptions"
        :multiple="true"
        :searchable="true"
        placeholder="Select conditions"
        label="label"
        track-by="value"
        class="multiselect"
      />
    </div>

    <div class="stock-filter">
      <label class="switch">
        <input type="checkbox" v-model="showOutOfStockOnly" />
        <span class="slider"></span>
      </label>
      <span>Show Products Out of Stock</span>
    </div>

    <div v-if="filteredProducts.length === 0" class="no-results">
      No products match your criteria.
    </div>

    <div v-else-if="loading" class="loading-message">Loading products...</div>

    <ul v-else class="products-list">
      <li
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-item"
      >
        <router-link
          :to="`/admin/products/${product.id}`"
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
        <p v-if="product.stock === 0" id="out-of-stock">OUT OF STOCK</p>
        <div class="product-actions">
          <button @click="openEditForm(product)" class="btn-edit">
            Update
          </button>
          <button @click="deleteProduct(product.id)" class="btn-delete">
            Delete
          </button>
        </div>
      </li>
    </ul>

    <transition name="fade">
      <div v-if="showForm" class="modal-overlay" @click.self="cancelForm">
        <div class="modal-content">
          <h2>{{ isEditing ? "Update Product" : "Add Product" }}</h2>
          <form @submit.prevent="submitForm">
            <input
              v-model="form.name"
              placeholder="Product Name"
              required
              class="input-field"
            />
            <textarea
              v-model="form.productDetails"
              placeholder="Details"
              required
              class="textarea-field"
            ></textarea>
            <multiselect
              v-model="selectedConditions"
              :options="conditionsOptions"
              :multiple="true"
              :searchable="true"
              placeholder="Select conditions"
              label="label"
              track-by="value"
              class="multiselect"
            />
            <div v-if="symptomsTreated.length > 0">
              <h3>Symptoms Treated:</h3>
              <ul class="symptoms-list">
                <li v-for="symptom in currentSymptomsTreated" :key="symptom.id">
                  {{ symptom.name }}
                </li>
              </ul>
            </div>
            <input
              v-model="form.price"
              type="number"
              placeholder="Price"
              required
              class="input-field"
            />
            <input
              v-model="form.stock"
              type="number"
              placeholder="Stock"
              required
              class="input-field"
            />

            <div v-if="form.imgSrc">
              <label>Current Image:</label>
              <img
                :src="form.imgSrc"
                alt="Product Image"
                class="product-image-preview"
              />
              <div>File Name: {{ extractFileName(form.imgSrc) }}</div>
            </div>

            <div>
              <label>Upload New Image:</label>
              <input
                type="file"
                @change="handleFileChange"
                accept="image/png, image/jpeg"
                class="input-file"
              />
            </div>
            <div>
              <button type="submit" class="btn-primary">
                {{ isEditing ? "Update" : "Add" }}
              </button>
              <button type="button" @click="cancelForm" class="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
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
      showOutOfStockOnly: false,
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
      let productsBySymptoms = this.filterBySymptoms();
      let productsByConditions = this.filterByConditions();

      let products = this.allProducts;

      if (this.showOutOfStockOnly) {
        products = products.filter((product) => product.stock === 0);
        productsBySymptoms = productsBySymptoms.filter(
          (product) => product.stock === 0
        );
        productsByConditions = products.filter(
          (product) => product.stock === 0
        );
      }

      if (
        productsBySymptoms.length === 0 &&
        productsByConditions.length === 0
      ) {
        return products.filter(
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

        const currentSymptoms = this.symptomsTreated(this.selectedConditions);

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
          symptomsTreated: currentSymptoms.map((symptom) => ({
            id: symptom.id,
            name: symptom.name,
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
        return this.selectedSymptomsFilter.some((selectedSymptom) =>
          product.symptomsTreated.some(
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
  width: 100%;
  padding: 8px;
  border: 1px solid #aac29b;
  border-radius: 5px;
  font-size: 14px;
}

.filters {
  background: #eef0eb;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.filter-label {
  font-size: 14px;
  font-weight: bold;
  margin-right: 10px;
}

.multiselect {
  width: 100%;
  margin-top: 5px;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 8px;
  border: 1px solid #aac29b;
  border-radius: 5px;
  margin-bottom: 10px;
}

.input-file {
  margin-top: 10px;
}

.textarea-field {
  height: 80px;
}

.btn-primary,
.btn-secondary,
.btn-edit,
.btn-delete {
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  margin: 3px;
}

.btn-primary {
  background: #4a7c59;
  color: white;
}
.btn-primary:hover {
  background: #3e7042;
}

.btn-secondary {
  background: #e4b363;
  color: white;
}
.btn-secondary:hover {
  background: #d9a14a;
}

.btn-edit {
  background: #f1c40f;
  color: white;
}
.btn-edit:hover {
  background: #d9a14a;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}
.btn-delete:hover {
  background: #c0392b;
}

.products-list {
  list-style: none;
  padding: 0;
}

.product-item {
  background: white;
  margin: 5px 0;
  padding: 8px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.product-title {
  font-size: 18px;
  font-weight: bold;
  color: #3e7042;
  text-decoration: none;
}

.product-price {
  font-size: 16px;
  color: #4a7c59;
}

.product-image {
  max-width: 200px;
  margin-top: 5px;
  border-radius: 5px;
}

.product-image-preview {
  max-width: 100px;
  margin-top: 5px;
  border-radius: 5px;
}

.product-actions {
  display: flex;
  justify-content: center;
}

#out-of-stock {
  color: red;
}

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
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
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
