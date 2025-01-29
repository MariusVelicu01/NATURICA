<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <label>Email:</label>
      <input
        type="email"
        v-model="email"
        placeholder="Enter your email"
        required
      />
      <label>Password:</label>
      <input
        type="password"
        v-model="password"
        placeholder="Enter your password"
        required
      />
      <div>
        <label>
          <input type="radio" v-model="selectedRole" value="client" />
          Client
        </label>
        <label>
          <input type="radio" v-model="selectedRole" value="admin" />
          Admin
        </label>
      </div>
      <button type="submit">Login</button>
    </form>
    <div class="navigation-buttons">
      <button @click="navigateToSignup">Signup</button>
      <button @click="navigateToForgotPassword">Forgot Password</button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapActions } from "vuex";

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      selectedRole: "",
    };
  },
  methods: {
    ...mapMutations("auth", ["login"]),
     ...mapActions("cart", ["loadCartFromDatabase"]),

    async handleLogin() {
      if (!this.selectedRole) {
        alert("Please select a role");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
            selectedRole: this.selectedRole,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          // data poate conține un mesaj de eroare
          throw new Error(data.error || "Failed to login");
        }

        // data ar trebui să conțină { token, userId, ... }
        this.login({
          role: this.selectedRole,
          token: data.token,
          userId: data.userId, // important
        });

        await this.loadCartFromDatabase(data.userId);

        this.$router.push(`/${this.selectedRole}/home`);
      } catch (err) {
        console.error("Login Error:", err.message);
        alert("Error during login: " + err.message);
      }
    },

    navigateToSignup() {
      this.$router.push("/signup");
    },
    navigateToForgotPassword() {
      this.$router.push("/forgot-password");
    },
  },
};
</script>
