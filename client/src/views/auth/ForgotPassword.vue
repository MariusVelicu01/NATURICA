<template>
  <div>
    <h1>Forgot Password</h1>
    <form>
      <label>Email:</label>
      <input type="email" placeholder="Enter your email" />
      <button>Reset Password</button>
    </form>
    <button @click="navigateToLogin">Login</button>
  </div>
</template>

<script>
export default {
  name: 'ForgotPassword',
    methods: {
      navigateToLogin() {
      this.$router.push('/');
    },
  }
};
</script>