<template>
  <div class="product-container">
    <div v-if="product">
      <div class="product-actions">
        <button @click="openEditForm(product)" class="btn-edit">Update</button>
        <button @click="deleteProduct(product.id)" class="btn-delete">
          Delete
        </button>
      </div>

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
      <p><strong>Sold Stock:</strong> {{ product.productStatistics }}</p>

      <div class="conditions-section">
        <h3>Conditions Treated:</h3>
        <ul>
          <li
            v-for="condition in product.conditionsTreated"
            :key="condition.id"
          >
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
    </div>
    <div v-else class="loading-message">
      <p>Loading product details...</p>
    </div>

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
            <div>
              <h3>Symptoms Treated:</h3>
              <ul class="symptoms-list">
                <li
                  v-for="symptom in currentSymptomsTreatedInModal"
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
            <button type="submit" class="btn-primary">
              {{ isEditing ? "Update" : "Add" }}
            </button>
            <button type="button" @click="cancelForm" class="btn-secondary">
              Cancel
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import { mapGetters, mapActions } from "vuex";
import { decryptData } from "../../../utils/encryptData";

export default {
  components: { Multiselect },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
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
      product: null,
    };
  },
  computed: {
    ...mapGetters("products", ["allProducts", "productToView", "getError"]),
    ...mapGetters("conditions", ["allConditions", "symptomsTreated"]),
    currentSymptomsTreatedInModal() {
      return this.symptomsTreated(this.selectedConditions);
    },
    conditionsWithSymptoms() {
      if (!Array.isArray(this.allConditions)) {
        return [];
      }
      return this.allConditions.filter(
        (condition) =>
          Array.isArray(condition.symptoms) && condition.symptoms.length > 0
      );
    },
  },
  methods: {
    ...mapActions("products", [
      "fetchProductAction",
      "fetchProductsAction",
      "updateProductAction",
      "deleteProductAction",
    ]),
    ...mapActions("conditions", ["fetchConditionsAction"]),
    ...mapActions("symptoms", ["fetchSymptomsAction"]),

    fetchProductDetails() {
      this.fetchProductAction(this.id).then(() => {
        this.product = this.productToView;
      });
    },

    async fetchDataOnCreate() {
      await this.fetchConditionsAction();
      this.conditionsOptions = this.conditionsWithSymptoms.map((condition) => ({
        value: condition.id,
        label: condition.name,
      }));

      await this.fetchSymptomsAction();
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

        const currentSymptoms = this.product.conditionsTreated;

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
        }

        if (this.getError) {
          alert(`Error: ${this.getError.message}`);
        } else {
          alert("Product saved successfully!");
          this.cancelForm();
          this.fetchProductDetails();
        }
      } catch (error) {
        console.error("Error saving product:", error.message);
        alert("Error saving product.");
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
          this.$router.push("/admin/products");
        }
      }
    },
  },
  created() {
    this.fetchProductDetails();
    this.fetchDataOnCreate();
  },
};
</script>

<style scoped>
@import "vue-multiselect/dist/vue-multiselect.min.css";
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

.product-image-preview {
  max-width: 150px;
  margin-top: 5px;
  border-radius: 5px;
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

.conditions-section,
.symptoms-section {
  text-align: left;
  margin: 15px 0;
}

.conditions-section h3,
.symptoms-section h3 {
  color: #4a7c59;
  font-size: 18px;
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
