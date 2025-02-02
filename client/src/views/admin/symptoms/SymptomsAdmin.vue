<template>
  <div class="symptoms-container">
    <h1 class="title">Manage Symptoms</h1>

    <form class="symptom-form" @submit.prevent="addSymptom">
      <input
        v-model="newSymptom"
        placeholder="Enter symptom name"
        required
        class="input-field"
      />
      <button type="submit" class="btn-primary">Add Symptom</button>
    </form>

    <input
      v-model="searchQuery"
      placeholder="Search symptoms..."
      @input="filterSymptoms"
      class="input-search"
    />

    <div v-if="filteredSymptoms.length !== 0">
      <ul class="symptom-list">
        <li
          v-for="symptom in filteredSymptoms"
          :key="symptom.id"
          class="symptom-item"
        >
          <span class="symptom-name">{{ symptom.name }}</span>
          <span v-if="symptom.isUsed" class="symptom-hint">
            - Linked to a condition</span
          >
          <div class="btn-group">
            <button @click="editSymptom(symptom)" class="btn-edit">Edit</button>
            <button @click="deleteSymptom(symptom.id)" class="btn-delete">
              Delete
            </button>
          </div>
        </li>
      </ul>
    </div>

    <div v-else class="no-results">No symptoms found...</div>

    <transition name="fade">
      <div v-if="isEditing" class="modal-overlay" @click.self="cancelEdit">
        <div class="modal-content">
          <h2>Edit Symptom</h2>
          <input
            v-model="editName"
            placeholder="Edit symptom name"
            class="input-field"
          />
          <div class="btn-group">
            <button @click="updateSymptom" class="btn-primary">Update</button>
            <button @click="cancelEdit" class="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </transition>
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

<style scoped>
.symptoms-container {
  font-family: "Arial", sans-serif;
  background: #f8f8f5;
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

.input-field {
  width: 90%;
  padding: 8px;
  border: 1px solid #aac29b;
  border-radius: 5px;
  font-size: 14px;
  margin-bottom: 10px;
}

.input-search {
  width: 95%;
  padding: 8px;
  border: 1px solid #aac29b;
  border-radius: 5px;
  font-size: 14px;
  margin-bottom: 10px;
}

.symptom-hint {
  color: #413a35;
  font-style: italic;
}

.symptom-item {
  background: white;
  margin: 5px 5px;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-results {
  color: #e74c3c;
  font-size: 14px;
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
  .symptoms-container {
    padding: 15px;
  }

  .input-field,
  .input-search {
    font-size: 12px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    font-size: 12px;
  }

  .symptom-item {
    flex-direction: column;
    text-align: center;
  }

  .modal-content {
    width: 90%;
  }
}
</style>
