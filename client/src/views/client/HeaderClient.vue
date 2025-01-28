<template>
  <div>
    <header>
      <nav>
        <ul>
          <li><router-link to="/client/home">Home</router-link></li>
          <li><router-link to="/client/products">Products</router-link></li>
          <li><router-link to="/client/orders">Orders</router-link></li>
          <li><router-link to="/client/cart">Cart ({{ cartCount }})</router-link></li>
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
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'HeaderClient',
    computed: {
    ...mapGetters("cart", ["cartCount"]),
  },
  methods: {
    ...mapActions(['logout']),
    handleLogout() {
      this.logout();
      this.$router.push('/');
    },
  },
};
</script>
