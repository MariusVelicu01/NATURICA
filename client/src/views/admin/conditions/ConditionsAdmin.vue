<template>
  <div>
    <h1>Manage Conditions</h1>

    <button @click="openAddForm">Add Condition</button>

    <ul>
      <li v-for="condition in allConditions" :key="condition.id">
        <span>{{ condition.name }}</span>
        <span v-if="condition.isUsed" class="hint"> - Linked to a product</span>
        <button @click="editCondition(condition)">Update</button>
        <button @click="deleteCondition(condition.id)">Delete</button>
      </li>
    </ul>

    <div v-if="showForm">
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
        <button @click="cancelForm">Cancel</button>
      </form>
    </div>
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
    };
  },
  computed: {
    ...mapGetters("conditions", ["allConditions"]),
    ...mapGetters("symptoms", ["allSymptoms"]),
  },
  methods: {
    ...mapActions("conditions", [
      "fetchConditionsAction",
      "addConditionAction",
      "updateConditionAction",
      "deleteConditionAction",
    ]),
    ...mapActions("symptoms", ["fetchSymptomsAction"]),

    async fetchData() {
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
        this.fetchData();
      } else {
        await this.addConditionAction(payload);
        this.fetchData();
      }

      this.cancelForm();
    },

    async deleteCondition(id) {
      const confirmed = confirm(
        "Are you sure you want to delete this condition?"
      );
      if (confirmed) {
        this.cancelForm();
        await this.deleteConditionAction(id);
        this.fetchData();
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
  },
  created() {
    this.fetchData();
  },
};
</script>

<style>
.hint {
  color: gray;
  font-style: italic;
}
@import "vue-multiselect/dist/vue-multiselect.min.css";
</style>
