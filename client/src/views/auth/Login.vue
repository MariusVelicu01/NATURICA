<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <label>Email:</label>
      <input type="email" v-model="email" placeholder="Enter your email" required />
      <label>Password:</label>
      <input type="password" v-model="password" placeholder="Enter your password" required />

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
import { mapMutations } from 'vuex';

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      selectedRole: '',
    };
  },
  methods: {
    ...mapMutations(['login']),
    handleLogin() {
      if (!this.selectedRole) {
        alert('Please select a role');
        return;
      }

      this.login(this.selectedRole);

      if (this.selectedRole === 'client') {
        this.$router.push('/client/home');
      } else if (this.selectedRole === 'admin') {
        this.$router.push('/admin/home');
      }
    },
    navigateToSignup() {
      this.$router.push('/signup');
    },
    navigateToForgotPassword() {
      this.$router.push('/forgot-password');
    },
  },
};
</script>