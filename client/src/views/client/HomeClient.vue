<template>
  <div>
    <h1>Welcome, Client!</h1>
    <button @click="handleLogout">Logout</button>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'HomeClient',
  methods: {
    ...mapActions(['logout']),
    handleLogout() {
      this.logout(); 
      this.$router.push('/login');
    },
  },
};
</script>
