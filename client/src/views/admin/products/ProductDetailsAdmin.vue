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
    <p><strong>Product Statistics:</strong> {{ product.productStatistics }}</p>

    <button @click="openEditForm(product)">Update</button>
    <button @click="deleteProduct(product.id)">Delete</button>
    </div>
    <div v-else>
      <p>Loading product details...</p>
    </div>

    <div v-if="showForm">
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
        <button @click="cancelForm">Cancel</button>
      </form>
    </div>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import { mapGetters, mapActions } from "vuex";

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
    ...mapGetters("products", ["allProducts", "productToView"]),
    ...mapGetters("conditions", ["allConditions", "symptomsTreated"]),
    currentSymptomsTreated() {
      return this.symptomsTreated(this.product.conditionsTreated);
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

    async fetchData() {
      await this.fetchConditionsAction();
      this.conditionsOptions = this.allConditions.map((condition) => ({
        value: condition.id,
        label: condition.name,
      }));
      console.log(this.conditionsOptions);
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
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: formData,
            }
          );

          if (!uploadResponse.ok) {
            throw new Error("Failed to upload file.");
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
        }

        alert("Product saved successfully!");
        this.cancelForm();
        await this.fetchProductDetails();
        await this.fetchProductsAction();
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
        await this.fetchProductsAction();
        this.$router.push("/admin/products");
      }
    },
  },
  created() {
    this.fetchProductDetails();
    this.fetchData()  
},
};
</script>