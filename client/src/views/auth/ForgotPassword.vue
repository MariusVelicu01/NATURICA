<template>
  <div>
    <h1>Forgot Password</h1>
    <form @submit.prevent="handleForgotPassword">
      <label>Email:</label>
      <input
        type="email"
        v-model="email"
        placeholder="Enter your email"
        required
      />
      <button type="submit">Reset Password</button>
    </form>
    <button @click="navigateToLogin">Back to Login</button>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: "ForgotPasswordPage",
  data() {
    return {
      email: "",
    };
  },
  computed:{
    ...mapGetters("auth",["getError"])
  },
  methods: {
    ...mapActions("auth",["forgotPasswordAction"]),
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
