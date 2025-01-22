<template>
  <div>
    <h1>Manage Symptoms</h1>

    <form @submit.prevent="addSymptom">
      <input v-model="newSymptom" placeholder="Enter symptom name" required />
      <button type="submit">Add Symptom</button>
    </form>

    <ul>
      <li v-for="symptom in allSymptoms" :key="symptom.id">
        <span>{{ symptom.name }}</span>
        <span v-if="symptom.isUsed" class="hint"> - Linked to a condition</span>
        <button 
          @click="editSymptom(symptom)" 
          :disabled="symptom.isUsed"
          :class="{ disabled: symptom.isUsed }"
        >
          Edit
        </button>
        <button 
          @click="deleteSymptom(symptom.id)" 
          :disabled="symptom.isUsed"
          :class="{ disabled: symptom.isUsed }"
        >
          Delete
        </button>
      </li>
    </ul>

    <div v-if="isEditing">
      <input v-model="editName" placeholder="Edit symptom name" />
      <button @click="updateSymptom">Update</button>
      <button @click="cancelEdit">Cancel</button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  data() {
    return {
      newSymptom: '', 
      isEditing: false, 
      editId: null, 
      editName: '', 
    };
  },
  computed: {
    ...mapGetters('symptoms', ['allSymptoms']), 
  },
  methods: {
    ...mapActions('symptoms', ['fetchSymptomsAction', 'addSymptomAction', 'updateSymptomAction', 'deleteSymptomAction']),
    
    async addSymptom() {
      if (!this.newSymptom.trim()) {
        alert('Symptom name cannot be empty.');
        return;
      }
      await this.addSymptomAction(this.newSymptom);
      this.newSymptom = '';
      this.fetchSymptomsAction();
    },
    editSymptom(symptom) {
      this.isEditing = true;
      this.editId = symptom.id;
      this.editName = symptom.name;
    },
    async updateSymptom() {
      if (!this.editName.trim()) {
        alert('Symptom name cannot be empty.');
        return;
      }
      await this.updateSymptomAction({ id: this.editId, name: this.editName });
      this.cancelEdit();
      this.fetchSymptomsAction();
    },
    async deleteSymptom(id) {
      const confirmed = confirm('Are you sure you want to delete this symptom?');
      if (confirmed) {
        await this.deleteSymptomAction(id);
        this.fetchSymptomsAction();
      }
    },
    cancelEdit() {
      this.isEditing = false;
      this.editId = null;
      this.editName = '';
    },
  },
  created() {
    this.fetchSymptomsAction(); 
  },
};
</script>

<style>
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.hint {
  color: gray;
  font-style: italic;
}
</style>
