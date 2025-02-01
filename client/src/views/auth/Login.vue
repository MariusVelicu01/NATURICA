<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <label>Email:</label>
      <input
        type="email"
        v-model="payload.email"
        placeholder="Enter your email"
        required
      />
      <label>Password:</label>
      <input
        type="password"
        v-model="payload.password"
        placeholder="Enter your password"
        required
      />
      <div>
        <label>
          <input type="radio" v-model="payload.selectedRole" value="client" />
          Client
        </label>
        <label>
          <input type="radio" v-model="payload.selectedRole" value="admin" />
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
import { mapActions, mapGetters } from "vuex";

export default {
  name: "LoginPage",
  data() {
    return {
      payload: {
        email: "",
        password: "",
        selectedRole: "",
      },
    };
  },
  computed:{
    ...mapGetters("auth", ["getError"])
  },
  methods: {
    ...mapActions("auth", ["loginAction", "extractUID"]),
    ...mapActions("cart", ["loadCartFromDatabase"]),

    async handleLogin() {
      if (!this.payload.selectedRole) {
        alert("Please select a role");
        return;
      }

      await this.loginAction(this.payload);

      if (this.payload.selectedRole === "client") {
        const authDetails = {
          email: this.payload.email,
          password: this.payload.password,
        };

        const userId = await this.extractUID(authDetails);

        if (userId !== undefined) {
          await this.loadCartFromDatabase(userId);
        } else {
          console.log("Unable to load previous cart");
        }
      }

       if (this.getError) {
          alert(`Error: ${this.getError.message}`);
        } else {
          alert('Successful Login!')
          this.$router.push(`/${this.payload.selectedRole}/home`);
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
