<template>
  <div class="admin-container">
    <header class="admin-header">
      <button class="menu-btn" @click="toggleMenu">☰</button>

      <nav :class="{ 'show-menu': menuOpen }">
        <ul>
          <li @click="closeMenu">
            <router-link to="/admin/home">Home</router-link>
          </li>
          <li @click="closeMenu">
            <router-link to="/admin/symptoms">Symptoms</router-link>
          </li>
          <li @click="closeMenu">
            <router-link to="/admin/conditions">Conditions</router-link>
          </li>
          <li @click="closeMenu">
            <router-link to="/admin/products">Products</router-link>
          </li>
          <li @click="closeMenu">
            <router-link to="/admin/orders">Orders</router-link>
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
export default {
  data() {
    return {
      menuOpen: false,
    };
  },
  methods: {
    handleLogout() {
      this.$store.dispatch("auth/logout");
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
.admin-container {
  background-color: #f7f3e9;
  height: 70px;
  font-family: "Poppins", sans-serif;
}

.admin-header {
  background: #4a7c59;
  padding: 15px 0;
  text-align: center;
  position: relative;
}

.admin-header nav {
  display: flex;
  justify-content: center;
}

.admin-header nav ul {
  padding: 0;
  margin: 0;
  display: flex;
}

.admin-header nav ul li {
  display: inline;
}

.admin-header nav ul li a {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  border-radius: 5px;
}

.admin-header nav ul li a:hover {
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

@media (max-width: 700px) {
  .admin-container {
    background-color: #4a7c59;
    height: 100px;
    padding: 30 0;
    font-family: "Poppins", sans-serif;
  }

  .menu-btn {
    display: block;
  }

  .admin-header nav {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    background: #4a7c59;
    padding: 10px 0;
    z-index: 9999;
  }

  .admin-header nav.show-menu {
    display: block;
  }

  .admin-header nav ul {
    flex-direction: column;
    align-items: center;
  }

  .admin-header nav ul li a {
    display: block;
    width: 100%;
    text-align: center;
  }
}
</style>
