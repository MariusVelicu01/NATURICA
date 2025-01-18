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

export default {
  name: "ForgotPasswordPage",
  data() {
    return {
      email: "",
    };
  },
  methods: {
    async handleForgotPassword() {
      try {
        const response = await fetch(
          "http://localhost:3000/users/forgot-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: this.email }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to send password reset email");
        }

        alert("Password reset email sent! Please check your inbox.");
        this.$router.push("/");
      } catch (error) {
        console.error("Error:", error.message);
        alert("Failed to send password reset email. Try again later.");
      }
    },
    navigateToLogin() {
      this.$router.push("/");
    },
  },
};
</script>
