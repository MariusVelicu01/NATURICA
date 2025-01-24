const conditionsModule = {
    state: () => ({
      conditions: [], // Lista condițiilor
    }),
    mutations: {
      setConditions(state, conditions) {
        state.conditions = conditions;
      },
      addCondition(state, condition) {
        state.conditions.push(condition);
      },
      updateCondition(state, updatedCondition) {
        const index = state.conditions.findIndex(c => c.id === updatedCondition.id);
        if (index !== -1) {
          state.conditions.splice(index, 1, updatedCondition);
        }
      },
      deleteCondition(state, id) {
        state.conditions = state.conditions.filter(condition => condition.id !== id);
      },
    },
    actions: {
      async fetchConditionsAction({ commit }) {
        try {
          const response = await fetch('http://localhost:3000/conditions', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (!response.ok) throw new Error('Failed to fetch conditions');
          const data = await response.json();
          commit('setConditions', data);
        } catch (error) {
          console.error('Fetch Conditions Error:', error.message);
        }
      },
      async addConditionAction({ commit }, payload) {
        try {
          const response = await fetch('http://localhost:3000/conditions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error('Failed to add condition');
          const newCondition = await response.json();
          commit('addCondition', newCondition);
        } catch (error) {
          console.error('Add Condition Error:', error.message);
        }
      },
      async updateConditionAction({ commit }, { id, payload }) {
        try {
          const response = await fetch(`http://localhost:3000/conditions/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error('Failed to update condition');
          const updatedCondition = await response.json();
          commit('updateCondition', updatedCondition);
        } catch (error) {
          console.error('Update Condition Error:', error.message);
        }
      },
      async deleteConditionAction({ commit }, id) {
        try {
          const response = await fetch(`http://localhost:3000/conditions/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          if (!response.ok) throw new Error('Failed to delete condition');
          commit('deleteCondition', id);
        } catch (error) {
          console.error('Delete Condition Error:', error.message);
        }
      },
    },
    getters: {
      allConditions: (state) => state.conditions,
    },
  };
  
  export default conditionsModule;
  