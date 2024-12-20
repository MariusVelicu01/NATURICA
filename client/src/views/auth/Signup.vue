<template>
  <div>
    <h1>Sign Up</h1>
    <form  @submit.prevent="handleSignup">
      <label>Email:</label>
      <input type="email" v-model="email" placeholder="Enter your email" required/>
      <label>Password:</label>
      <input type="password" v-model="password" placeholder="Enter your password" required/>
      <label>Confirm Password:</label>
      <input type="password" v-model="confirmPassword" placeholder="Confirm your password" required/>
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
        <button>Sign Up</button>
    </form>
    <button @click="navigateToLogin">Login</button>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'SignupPage',
    data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      selectedRole: '',
    };
  },
  methods: {
    ...mapMutations(['signup']),
    handleSignup() {
      if (!this.selectedRole) {
        alert('Please select a role');
        return;
      } else if (this.password !== this.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      this.signup(this.selectedRole);

      if (this.selectedRole === 'client') {
        this.$router.push('/client/home');
      } else if (this.selectedRole === 'admin') {
        this.$router.push('/admin/home');
      }
    },
          navigateToLogin() {
      this.$router.push('/login');
    },
  },
};
</script>