<template>
  <div>
    <h1>Sign Up</h1>
    <form @submit.prevent="handleSignup">
      <label>First Name:</label>
      <input type="text" v-model="firstName" placeholder="Enter your first name" required />

      <label>Last Name:</label>
      <input type="text" v-model="lastName" placeholder="Enter your last name" required />

      <label>Email:</label>
      <input type="email" v-model="email" placeholder="Enter your email" required />

      <label>Password:</label>
      <input type="password" v-model="password" placeholder="Enter your password" required />

      <label>Confirm Password:</label>
      <input type="password" v-model="confirmPassword" placeholder="Confirm your password" required />

      <label>Date of Birth:</label>
      <input type="date" v-model="dateOfBirth" required />

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
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
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

      if (!this.firstName || !this.lastName || !this.dateOfBirth) {
        alert('Please complete all required fields');
        return;
      }

      const userData = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        dateOfBirth: this.dateOfBirth,
        role: this.selectedRole,
      };

      console.log('User Data:', userData);

      this.signup(userData);

      if (this.selectedRole === 'client') {
        this.$router.push('/client/home');
      } else if (this.selectedRole === 'admin') {
        this.$router.push('/admin/home');
      }
    },
    navigateToLogin() {
      this.$router.push('/');
    },
  },
};
</script>
