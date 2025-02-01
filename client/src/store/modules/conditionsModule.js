import { faker } from "@faker-js/faker";
import { decryptData } from "../../utils/encryptData";

const conditionsModule = {
  state: () => ({
    conditions: [],
  }),
  mutations: {
    setConditions(state, conditions) {
      state.conditions = conditions;
    },
    addCondition(state, condition) {
      state.conditions.push(condition);
    },
    updateCondition(state, updatedCondition) {
      const index = state.conditions.findIndex(
        (c) => c.id === updatedCondition.id
      );
      if (index !== -1) {
        state.conditions.splice(index, 1, updatedCondition);
      }
    },
    deleteCondition(state, id) {
      state.conditions = state.conditions.filter(
        (condition) => condition.id !== id
      );
    },
    
  },
  actions: {
    async fetchConditionsAction({ commit }) {
      try {
        const response = await fetch("http://localhost:3000/conditions", {
          headers: {
            Authorization: `Bearer ${decryptData(localStorage.getItem("token"))}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch conditions");
        const data = await response.json();
        commit("setConditions", data);
      } catch (error) {
        console.error("Fetch Conditions Error:", error.message);
      }
    },
    async addConditionAction({ commit }, payload) {
      try {
        const response = await fetch("http://localhost:3000/conditions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${decryptData(localStorage.getItem("token"))}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to add condition");
        const newCondition = await response.json();
        commit("addCondition", newCondition);
      } catch (error) {
        console.error("Add Condition Error:", error.message);
      }
    },
    async updateConditionAction({ commit }, { id, payload }) {
      try {
        const response = await fetch(`http://localhost:3000/conditions/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${decryptData(localStorage.getItem("token"))}`,
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to update condition");
        const updatedCondition = await response.json();
        commit("updateCondition", updatedCondition);
      } catch (error) {
        console.error("Update Condition Error:", error.message);
      }
    },
    async deleteConditionAction({ commit }, id) {
      try {
        const response = await fetch(`http://localhost:3000/conditions/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${decryptData(localStorage.getItem("token"))}`,
          },
        });
        if (!response.ok) throw new Error("Failed to delete condition");
        commit("deleteCondition", id);
      } catch (error) {
        console.error("Delete Condition Error:", error.message);
      }
    },
    async fetchConditionsFromAPIAction({ commit }, count) {
      function getRandomOffsets(count, maxOffset = 2400) {
        const offsets = new Set();
        while (offsets.size < count) {
          offsets.add(faker.number.int({ min: 1, max: maxOffset }));
        }
        return [...offsets];
      }

      const offsets = getRandomOffsets(count);
      let conditions = [];

      for (let offset of offsets) {
        try {
          const response = await fetch(
            `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=&maxList=1&offset=${offset}`
          );
          const result = await response.json();
          if (result && result[3] && result[3].length > 0) {
            conditions.push(result[3][0][0]);
          }
        } catch (error) {
          console.error(`Failed to fetch condition at offset ${offset}:`, error);
        }
      }

      if (conditions.length === 0) {
        console.warn("No conditions retrieved from API.");
        return { added: 0, skipped: count };
      }

      try {
        const backendResponse = await fetch(
          "http://localhost:3000/conditions/add-from-api",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${decryptData(localStorage.getItem("token"))}`,
            },
            body: JSON.stringify({ conditions }),
          }
        );

        const backendResult = await backendResponse.json();
        if (!backendResponse.ok) {
          throw new Error(backendResult.error || "Failed to add conditions.");
        }

        commit("setConditions", [...conditions]);

        return backendResult;
      } catch (error) {
        console.error("Error in fetchConditionsFromAPIAction:", error);
        throw error;
      }
    },
  },
  getters: {
    allConditions: (state) => state.conditions,
    symptomsTreated: (state, getters) => (selectedConditions) => {
      const symptomsSet = new Set();

      selectedConditions.forEach((condition) => {
        const matchedCondition = getters.allConditions.find(
          (cond) => cond.id === condition.value || cond.id === condition.id
        );
        if (matchedCondition && matchedCondition.symptoms) {
          matchedCondition.symptoms.forEach((symptom) => {
            symptomsSet.add(JSON.stringify(symptom));
          });
        }
      });

      return Array.from(symptomsSet).map((symptom) => JSON.parse(symptom));
    },
  },
};

export default conditionsModule;
