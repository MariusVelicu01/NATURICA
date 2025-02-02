<template>
  <div class="client-container">
    <header class="client-header">
      <button class="menu-btn" @click="toggleMenu">☰</button>

      <nav :class="{ 'show-menu': menuOpen }">
        <ul>
          <li @click="closeMenu">
            <router-link to="/client/home">Home</router-link>
          </li>
          <li @click="closeMenu">
            <router-link to="/client/products">Products</router-link>
          </li>
          <li @click="closeMenu">
            <router-link to="/client/orders">Orders</router-link>
          </li>
          <li @click="closeMenu">
            <router-link to="/client/cart">Cart ({{ cartCount }})</router-link>
          </li>
          <li @click="closeMenu">
            <button @click="handleLogout" class="logout-btn">Logout</button>
          </li>
        </ul>
      </nav>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>


<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "HeaderClient",
  data() {
    return {
      menuOpen: false,
    };
  },
  computed: {
    ...mapGetters("cart", ["cartCount"]),
    userId() {
      return this.$store.getters["auth/userId"];
    },
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
      this.$router.push("/");
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    closeMenu() {
      this.menuOpen = false;
    },
  },
};
</script>

<style scoped>
.client-container {
  background-color: #4a7c59;
  height: 70px;
  font-family: "Poppins", sans-serif;
}

.client-header {
  background: #4a7c59;
  padding: 15px 0;
  text-align: center;
  position: relative;
}

.client-header nav {
  display: flex;
  justify-content: center;
}

.client-header nav ul {
  padding: 0;
  margin: 0;
  display: flex;
}

.client-header nav ul li {
  display: inline;
}

.client-header nav ul li a {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  border-radius: 5px;
  padding: 10px 15px;
}

.client-header nav ul li a:hover {
  background: rgba(255, 255, 255, 0.2);
}

.logout-btn {
  background-color: #d9534f;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #c9302c;
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  position: absolute;
  left: 20px;
  top: 15px;
}

.client-main {
  padding: 20px;
}

@media (max-width: 700px) {
  .menu-btn {
    display: block;
  }

  .client-header nav {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    background: #4a7c59;
    padding: 10px 0;
    z-index: 9999;
  }

  .client-header nav.show-menu {
    display: block;
  }

  .client-header nav ul {
    flex-direction: column;
    align-items: center;
  }

  .client-header nav ul li a {
    display: block;
    width: 100%;
    text-align: center;
  }
}
</style>

