<template>
  <div>
    <header>
      <nav>
        <ul>
          <li><router-link to="/admin/home">Home</router-link></li>
          <li><router-link to="/admin/symptoms">Symptoms</router-link></li>
          <li><router-link to="/admin/conditions">Conditions</router-link></li>
          <li><router-link to="/admin/products">Products</router-link></li>
          <li><router-link to="/admin/orders">Orders</router-link></li>
          <li><button @click="handleLogout">Logout</button></li>
        </ul>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'HeaderAdmin',
  methods: {
    ...mapActions('auth',['logout']),
    handleLogout() {
      this.logout();
      this.$router.push('/');
    },
  },
};
</script>
