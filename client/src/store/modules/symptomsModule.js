import { decryptData } from "../../utils/encryptData";

const symptomsModule = {
  state: () => ({
    symptoms: [],
    errorState: null,
  }),
  mutations: {
    setSymptoms(state, symptoms) {
      state.symptoms = symptoms;
      state.errorState = null;
    },
    addSymptom(state, symptom) {
      state.symptoms.push(symptom);
      state.errorState = null;
    },
    updateSymptom(state, updatedSymptom) {
      const index = state.symptoms.findIndex((s) => s.id === updatedSymptom.id);
      if (index !== -1) {
        state.symptoms.splice(index, 1, updatedSymptom);
      }
      state.errorState = null;
    },
    deleteSymptom(state, id) {
      state.symptoms = state.symptoms.filter((symptom) => symptom.id !== id);
      state.errorState = null;
    },
    setError(state, error) {
      state.errorState = error;
    },
  },
  actions: {
    async fetchSymptomsAction({ commit }) {
      try {
        const response = await fetch("http://localhost:3000/symptoms", {
          headers: {
            Authorization: `Bearer ${decryptData(
              localStorage.getItem("token")
            )}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          commit("setError", {
            status: response.status,
            message: data.error,
          });

          return;
        }
        commit("setSymptoms", data);
      } catch (error) {
        console.error("Fetch Symptoms Error:", error.message);
      }
    },
    async addSymptomAction({ commit }, name) {
      try {
        const response = await fetch("http://localhost:3000/symptoms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${decryptData(
              localStorage.getItem("token")
            )}`,
          },
          body: JSON.stringify({ name }),
        });
        const data = await response.json();

        if (!response.ok) {
          commit("setError", {
            status: response.status,
            message: data.error,
          });

          return;
        }
        commit("addSymptom", data);
      } catch (error) {
        console.error("Add Symptom Error:", error.message);
      }
    },
    async updateSymptomAction({ commit }, { id, name }) {
      try {
        const response = await fetch(`http://localhost:3000/symptoms/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${decryptData(
              localStorage.getItem("token")
            )}`,
          },
          body: JSON.stringify({ name }),
        });
        const data = await response.json();

        if (!response.ok) {
          commit("setError", {
            status: response.status,
            message: data.error,
          });

          return;
        }
        commit("updateSymptom", data);
      } catch (error) {
        console.error("Update Symptom Error:", error.message);
      }
    },
    async deleteSymptomAction({ commit }, id) {
      try {
        const response = await fetch(`http://localhost:3000/symptoms/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${decryptData(
              localStorage.getItem("token")
            )}`,
          },
        });
        if (!response.ok) {
          const errorMessage = await response.json();
          commit("setError", {
            status: response.status,
            message: errorMessage.error,
          });

          return;
        }
        commit("deleteSymptom", id);
      } catch (error) {
        console.error("Delete Symptom Error:", error.message);
      }
    },
  },
  getters: {
    allSymptoms: (state) => state.symptoms,
    getError: (state) => state.errorState,
  },
};

export default symptomsModule;
