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
        async handleSignup() {
      if (!this.selectedRole) {
        alert('Please select a role');
        return;
      } else {
        console.log(this.selectedRole)
      }
      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
            firstName: this.firstName,
            lastName: this.lastName,
            dateOfBirth: this.dateOfBirth,
            role: this.selectedRole,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to sign up');
        }

        alert('User signed up successfully!');
        this.signup(this.selectedRole);
        this.$router.push(`/${this.selectedRole}/home`);
      } catch (err) {
        console.error('Signup Error:', err.message);
        alert('Error during signup: ' + err.message);
      }
    },
    navigateToLogin() {
      this.$router.push('/');
    },
  },
};
</script>
