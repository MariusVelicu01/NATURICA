import { decryptData } from "../../utils/encryptData";

const symptomsModule = {
    state: () => ({
      symptoms: [],
    }),
    mutations: {
      setSymptoms(state, symptoms) {
        state.symptoms = symptoms;
      },
      addSymptom(state, symptom) {
        state.symptoms.push(symptom);
      },
      updateSymptom(state, updatedSymptom) {
        const index = state.symptoms.findIndex(s => s.id === updatedSymptom.id);
        if (index !== -1) {
          state.symptoms.splice(index, 1, updatedSymptom);
        }
      },
      deleteSymptom(state, id) {
        state.symptoms = state.symptoms.filter(symptom => symptom.id !== id);
      },
    },
    actions: {
      async fetchSymptomsAction({ commit }) {
        try {
          const response = await fetch('http://localhost:3000/symptoms', {
            headers: {
              Authorization: `Bearer ${decryptData(localStorage.getItem('token'))}`,
            },
          });
          if (!response.ok) throw new Error('Failed to fetch symptoms');
          const data = await response.json();
          commit('setSymptoms', data);
        } catch (error) {
          console.error('Fetch Symptoms Error:', error.message);
        }
      },
      async addSymptomAction({ commit }, name) {
        try {
          const response = await fetch('http://localhost:3000/symptoms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${decryptData(localStorage.getItem('token'))}`,
            },
            body: JSON.stringify({ name }),
          });
          if (!response.ok) throw new Error('Failed to add symptom');
          const newSymptom = await response.json();
          commit('addSymptom', newSymptom);
        } catch (error) {
          console.error('Add Symptom Error:', error.message);
        }
      },
      async updateSymptomAction({ commit }, { id, name }) {
        try {
          const response = await fetch(`http://localhost:3000/symptoms/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${decryptData(localStorage.getItem('token'))}`,
            },
            body: JSON.stringify({ name }),
          });
          if (!response.ok) throw new Error('Failed to update symptom');
          const updatedSymptom = await response.json();
          commit('updateSymptom', updatedSymptom);
        } catch (error) {
          console.error('Update Symptom Error:', error.message);
        }
      },
      async deleteSymptomAction({ commit }, id) {
        try {
          const response = await fetch(`http://localhost:3000/symptoms/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${decryptData(localStorage.getItem('token'))}`,
            },
          });
          if (!response.ok) throw new Error('Failed to delete symptom');
          commit('deleteSymptom', id);
        } catch (error) {
          console.error('Delete Symptom Error:', error.message);
        }
      },
    },
    getters: {
      allSymptoms: (state) => state.symptoms,
    },
  };
  
  export default symptomsModule;
  