<template>
  <div>
    <h1>Manage Conditions</h1>

    <button @click="openAddForm">Add Condition</button>

    <label>Number of conditions to fetch:</label>
    <input type="number" v-model="apiContitionsCount" min="0" max="20" />

    <button @click="fetchConditionsFromAPI">Fetch Conditions from API</button>

    <h2>Valid Conditions</h2>
    <ul v-if="conditionsWithSymptoms.length > 0">
      <li v-for="condition in this.conditionsWithSymptoms" :key="condition.id">
        <span>{{ condition.name }}</span>
        <span v-if="condition.isUsed" class="hint"> - Linked to a product</span>
        <button @click="editCondition(condition)">Update</button>
        <button @click="deleteCondition(condition.id)">Delete</button>
      </li>
    </ul>
    <p v-else>No confirmed conditions available.</p>

    <h2>Conditions Without Symptoms (Generated from API)</h2>
    <ul v-if="this.conditionsWithoutSymptoms.length > 0">
      <li
        v-for="condition in this.conditionsWithoutSymptoms"
        :key="condition.id"
      >
        <span>{{ condition.name }}</span>
        <span class="hint"> - Generated from API (Needs symptoms)</span>
        <button @click="editCondition(condition)">Add Symptoms</button>
        <button @click="deleteCondition(condition.id)">Delete</button>
      </li>
    </ul>
    <p v-else>All API conditions have been confirmed.</p>

    <transition name="fade">
      <div v-if="showForm" class="modal-overlay" @click.self="cancelForm">
        <div class="modal-content">
          <h2>{{ isEditing ? "Update Condition" : "Add Condition" }}</h2>
          <form @submit.prevent="submitForm">
            <input
              v-model="form.name"
              placeholder="Enter condition name"
              required
            />
            <label>Select Symptoms:</label>
            <multiselect
              v-model="form.selectedSymptoms"
              :options="symptomsOptions"
              :multiple="true"
              :searchable="true"
              placeholder="Search and select symptoms"
              label="label"
              track-by="value"
            />
            <button type="submit">{{ isEditing ? "Update" : "Add" }}</button>
            <button type="button" @click="cancelForm">Cancel</button>
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
    };
  },
  computed: {
    ...mapGetters("conditions", ["allConditions", "getError"]),
    ...mapGetters("symptoms", ["allSymptoms"]),

    conditionsWithSymptoms() {
      if (!Array.isArray(this.allConditions)) return [];
      return this.allConditions.filter(
        (condition) =>
          Array.isArray(condition.symptoms) && condition.symptoms.length > 0
      );
    },

    conditionsWithoutSymptoms() {
      if (!Array.isArray(this.allConditions)) return [];
      return this.allConditions.filter(
        (condition) =>
          !Array.isArray(condition.symptoms) || condition.symptoms.length === 0
      );
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
          alert("Condition added successfully!");
          this.cancelForm();
          await this.fetchConditionsAction();
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
      try {
        const response = await this.fetchConditionsFromAPIAction(
          this.apiContitionsCount
        );
        alert(`Added: ${response.added}, Skipped: ${response.skipped}`);
        this.fetchConditionsAction();
      } catch (error) {
        console.error("Error fetching conditions from API:", error);
        alert("Failed to fetch conditions.");
      }
    },
  },
  created() {
    this.fetchDataOnCreate();
  },
};
</script>

<style>
.hint {
  color: gray;
  font-style: italic;
}
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
  width: 400px;
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
