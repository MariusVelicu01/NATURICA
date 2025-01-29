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
    userId() {
      return this.$store.getters["auth/userId"];
    }
  },
  methods: {
    ...mapActions("auth", ["logout"]),
    ...mapActions("cart", ["clearCartAction", "saveCartToDatabase"]),

    async handleLogout() {
      if (this.userId) {
        await this.saveCartToDatabase(this.userId);
      }
      this.clearCartAction();
      this.logout();
      this.$router.push('/');
    },
  },
};
</script>
