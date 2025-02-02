<template>
  <div class="conditions-container">
    <h1 class="title">Manage Conditions</h1>

    <button @click="openAddForm" class="btn-primary">Add Condition</button>

    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search conditions..."
      class="input-search"
    />

    <div class="fetch-container">
      <label class="label"
        >Number of conditions to fetch (Min. 1 - Max. 20):</label
      >
      <input
        type="number"
        v-model="apiContitionsCount"
        min="1"
        max="20"
        class="input-number"
      />

      <button
        v-if="!loadingAPICondition"
        @click="fetchConditionsFromAPI"
        class="btn-fetch"
      >
        Fetch Conditions from API
      </button>

      <p v-if="loadingAPICondition" class="loading-message">
        Extracting {{ apiContitionsCount }} conditions... Please Wait!
      </p>
    </div>

    <h2 class="section-title">Valid Conditions</h2>
    <ul v-if="conditionsWithSymptoms.length > 0" class="conditions-list">
      <li
        v-for="condition in conditionsWithSymptoms"
        :key="condition.id"
        class="condition-item"
      >
        <span>{{ condition.name }}</span>
        <span v-if="condition.isUsed" class="condition-hint">
          - Linked to a product</span
        >
        <div>
          <button @click="editCondition(condition)" class="btn-edit">
            Update
          </button>
          <button @click="deleteCondition(condition.id)" class="btn-delete">
            Delete
          </button>
        </div>
      </li>
    </ul>
    <p v-else class="no-results">No valid conditions available.</p>

    <h2 class="section-title">
      Conditions Without Symptoms (Generated from API)
    </h2>
    <ul v-if="conditionsWithoutSymptoms.length > 0" class="conditions-list">
      <li
        v-for="condition in conditionsWithoutSymptoms"
        :key="condition.id"
        class="condition-item"
      >
        <span>{{ condition.name }}</span>
        <span class="condition-hint">
          - Generated from API (Needs symptoms)</span
        >
        <div>
          <button @click="editCondition(condition)" class="btn-edit">
            Add Symptoms
          </button>
          <button @click="deleteCondition(condition.id)" class="btn-delete">
            Delete
          </button>
        </div>
      </li>
    </ul>
    <p v-else class="no-results">No API conditions available.</p>

    <transition name="fade">
      <div v-if="showForm" class="modal-overlay" @click.self="cancelForm">
        <div class="modal-content">
          <h2>{{ isEditing ? "Update Condition" : "Add Condition" }}</h2>
          <form @submit.prevent="submitForm">
            <input
              v-model="form.name"
              placeholder="Enter condition name"
              required
              class="input-field"
            />
            <label class="label">Select Symptoms:</label>
            <multiselect
              v-model="form.selectedSymptoms"
              :options="symptomsOptions"
              :multiple="true"
              :searchable="true"
              placeholder="Search and select symptoms"
              label="label"
              track-by="value"
            />
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
import { mapActions, mapGetters } from "vuex";
import Multiselect from "vue-multiselect";

export default {
  components: { Multiselect },
  data() {
    return {
      showForm: false,
      isEditing: false,
      form: {
        id: null,
        name: "",
        selectedSymptoms: [],
      },
      symptomsOptions: [],
      apiContitionsCount: 5,
      searchQuery: "",
      loadingAPICondition: false,
    };
  },
  computed: {
    ...mapGetters("conditions", ["allConditions", "getError"]),
    ...mapGetters("symptoms", ["allSymptoms"]),

    conditionsWithSymptoms() {
      if (!Array.isArray(this.allConditions)) return [];
      return this.allConditions
        .filter(
          (condition) =>
            condition &&
            Array.isArray(condition.symptoms) &&
            condition.symptoms.length > 0 &&
            condition.name
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    conditionsWithoutSymptoms() {
      if (!Array.isArray(this.allConditions)) return [];
      return this.allConditions
        .filter(
          (condition) =>
            condition &&
            (!Array.isArray(condition.symptoms) ||
              condition.symptoms.length === 0) &&
            condition.name
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  },
  methods: {
    ...mapActions("conditions", [
      "fetchConditionsAction",
      "addConditionAction",
      "updateConditionAction",
      "deleteConditionAction",
      "fetchConditionsFromAPIAction",
    ]),
    ...mapActions("symptoms", ["fetchSymptomsAction"]),

    async fetchDataOnCreate() {
      await this.fetchSymptomsAction();
      this.symptomsOptions = this.allSymptoms.map((symptom) => ({
        value: symptom.id,
        label: symptom.name,
      }));
      await this.fetchConditionsAction();
    },

    openAddForm() {
      this.resetForm();
      this.showForm = true;
      this.isEditing = false;
    },

    editCondition(condition) {
      this.isEditing = true;
      this.form.id = condition.id;
      this.form.name = condition.name;
      this.form.selectedSymptoms = condition.symptoms.map((symptom) => ({
        value: symptom.id,
        label: symptom.name,
      }));
      this.showForm = true;
    },

    async submitForm() {
      if (!this.form.name.trim() || this.form.selectedSymptoms.length === 0) {
        alert("Please provide a name and select symptoms.");
        return;
      }

      const payload = {
        name: this.form.name,
        symptoms: this.form.selectedSymptoms.map((symptom) => ({
          id: symptom.value,
          name: symptom.label,
        })),
      };

      if (this.isEditing) {
        await this.updateConditionAction({ id: this.form.id, payload });
        if (this.getError) {
          alert(`Error: ${this.getError.message}`);
        } else {
          alert("Condition updated successfully!");
          this.cancelForm();
          await this.fetchConditionsAction();
        }
      } else {
        await this.addConditionAction(payload);
        if (this.getError) {
          alert(`Error: ${this.getError.message}`);
        } else {
          window.location.reload();
          alert("Condition added successfully!");
        }
      }
    },

    async deleteCondition(id) {
      const confirmed = confirm(
        "Are you sure you want to delete this condition?"
      );
      if (confirmed) {
        this.cancelForm();
        await this.deleteConditionAction(id);
        if (this.getError) {
          alert(`Error: ${this.getError.message}`);
        } else {
          alert("Condition deleted successfully!");
          await this.fetchConditionsAction();
        }
      }
    },

    resetForm() {
      this.form.id = null;
      this.form.name = "";
      this.form.selectedSymptoms = [];
    },

    cancelForm() {
      this.resetForm();
      this.showForm = false;
    },

    async fetchConditionsFromAPI() {
      this.loadingAPICondition = true;
      try {
        const response = await this.fetchConditionsFromAPIAction(
          this.apiContitionsCount
        );
        window.location.reload();
        alert(
          `Added: ${response.added} (${response.addedConditions.join(
            ", "
          )})\nSkipped: ${response.skipped} (${response.skippedConditions.join(
            ", "
          )})`
        );
        this.fetchConditionsAction();
        this.loadingAPICondition = false;
      } catch (error) {
        console.error("Error fetching conditions from API:", error);
        alert("Failed to fetch conditions.");
        this.loadingAPICondition = false;
      }
    },
  },
  created() {
    this.fetchDataOnCreate();
  },
};
</script>

<style scoped>
.conditions-container {
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

.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.input-search {
  width: 100%;
  padding: 8px;
  border: 1px solid #aac29b;
  border-radius: 5px;
  font-size: 14px;
}

.fetch-container {
  background: #eef0eb;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.input-number {
  width: 50px;
  padding: 5px;
  margin-left: 5px;
  border: 1px solid #aac29b;
  border-radius: 5px;
}

.loading-message {
  font-size: 14px;
  color: #e67e22;
  font-style: italic;
}

.btn-primary,
.btn-secondary,
.btn-edit,
.btn-delete,
.btn-fetch {
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

.btn-fetch {
  background: #2980b9;
  color: white;
}
.btn-fetch:hover {
  background: #2471a3;
}

.condition-hint {
  color: #413a35;
  font-style: italic;
}

.condition-item {
  background: white;
  margin: 5px 0;
  padding: 8px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-results {
  color: #e74c3c;
  font-size: 14px;
}

@media (max-width: 500px) {
  .conditions-container {
    padding: 15px;
  }

  .input-search {
    width: 100%;
    font-size: 12px;
  }

  .top-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    font-size: 12px;
  }

  .condition-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
