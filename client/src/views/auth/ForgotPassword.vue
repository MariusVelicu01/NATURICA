<template>
  <div class="forgot-password-container">
    <div class="app-header">
      <h1 class="app-name">NATURICA</h1>
      <p class="app-slogan">Remedies from Life for Life</p>
    </div>

    <h1>Forgot Password</h1>
    <form class="forgot-password-form" @submit.prevent="handleForgotPassword">
      <label>Email:</label>
      <input
        type="email"
        v-model="email"
        placeholder="Enter your email"
        required
      />
      <button type="submit" class="btn-reset">Reset Password</button>
    </form>
    <button @click="navigateToLogin" class="btn-secondary">
      Back to Login
    </button>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "ForgotPasswordPage",
  data() {
    return {
      email: "",
    };
  },
  computed: {
    ...mapGetters("auth", ["getError"]),
  },
  methods: {
    ...mapActions("auth", ["forgotPasswordAction"]),
    async handleForgotPassword() {
      await this.forgotPasswordAction(this.email);
      if (this.getError) {
        alert(`Error: ${this.getError.message}`);
      }
      this.navigateToLogin();
    },
    navigateToLogin() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.forgot-password-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background: #f9f8f3;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  font-family: "Arial", sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 20px;
}

.app-name {
  font-size: 32px;
  font-weight: bold;
  color: #2c6b2f;
}

.app-slogan {
  font-size: 14px;
  font-style: italic;
  color: #555;
}

h1 {
  color: #2d6a4f;
  font-size: 24px;
  margin-bottom: 15px;
}

input {
  width: 90%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #b7c4b1;
  border-radius: 5px;
  font-size: 16px;
}

.btn-reset {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  background-color: #3a7942;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-reset:hover {
  background-color: #2d6a4f;
}

.btn-secondary {
  margin-top: 10px;
  padding: 8px 12px;
  background: none;
  border: 1px solid #3a7942;
  color: #3a7942;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-secondary:hover {
  background: #3a7942;
  color: white;
}
</style>
