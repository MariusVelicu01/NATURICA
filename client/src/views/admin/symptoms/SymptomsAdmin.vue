<template>
  <div>
    <h1>Manage Symptoms</h1>

    <form @submit.prevent="addSymptom">
      <input v-model="newSymptom" placeholder="Enter symptom name" required />
      <button type="submit">Add Symptom</button>
    </form>

    <input
      v-model="searchQuery"
      placeholder="Search symptoms..."
      @input="filterSymptoms"
    />

    <div v-if="filteredSymptoms.length!==0">
    <ul>
      <li v-for="symptom in filteredSymptoms" :key="symptom.id">
        <span>{{ symptom.name }}</span>
        <span v-if="symptom.isUsed" class="hint"> - Linked to a condition</span>
        <button @click="editSymptom(symptom)">Edit</button>
        <button @click="deleteSymptom(symptom.id)">Delete</button>
      </li>
    </ul>
    </div>
    <div v-else>
      No symptoms found...
    </div>

    <div v-if="isEditing">
      <input v-model="editName" placeholder="Edit symptom name" />
      <button @click="updateSymptom">Update</button>
      <button @click="cancelEdit">Cancel</button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      newSymptom: "",
      isEditing: false,
      editId: null,
      editName: "",
      searchQuery: "",
    };
  },
  computed: {
    ...mapGetters("symptoms", ["allSymptoms", "getError"]),

    filteredSymptoms() {
      return this.allSymptoms.filter(
        (symptom) =>
          symptom.name &&
          symptom.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {
    ...mapActions("symptoms", [
      "fetchSymptomsAction",
      "addSymptomAction",
      "updateSymptomAction",
      "deleteSymptomAction",
    ]),

    async addSymptom() {
      if (!this.newSymptom.trim()) {
        alert("Symptom name cannot be empty.");
        return;
      }
      await this.addSymptomAction(this.newSymptom);
      this.newSymptom = "";
      if (this.getError) {
        alert(`Error: ${this.getError.message}`);
      } else {
        window.location.reload();
        alert("Symptom added successfully!");
      }

      this.fetchSymptomsAction();
    },
    editSymptom(symptom) {
      this.isEditing = true;
      this.editId = symptom.id;
      this.editName = symptom.name;
    },
    async updateSymptom() {
      if (!this.editName.trim()) {
        alert("Symptom name cannot be empty.");
        return;
      }
      await this.updateSymptomAction({ id: this.editId, name: this.editName });
      this.cancelEdit();
      if (this.getError) {
        alert(`Error: ${this.getError.message}`);
      } else {
        alert("Symptom updated successfully!");
      }

      this.fetchSymptomsAction();
    },
    async deleteSymptom(id) {
      const confirmed = confirm(
        "Are you sure you want to delete this symptom?"
      );
      if (confirmed) {
        await this.deleteSymptomAction(id);
        if (this.getError) {
          alert(`Error: ${this.getError.message}`);
        } else {
          alert("Symptom deleted successfully!");
        }

        this.fetchSymptomsAction();
      }
    },
    cancelEdit() {
      this.isEditing = false;
      this.editId = null;
      this.editName = "";
    },
  },
  created() {
    this.fetchSymptomsAction();
  },
};
</script>

<style>
.hint {
  color: gray;
  font-style: italic;
}
</style>
