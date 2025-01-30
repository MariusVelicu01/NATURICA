<template>
  <div>
    <h1>Sign Up</h1>
    <form @submit.prevent="handleSignup">
      <label>First Name:</label>
      <input
        type="text"
        v-model="payload.firstName"
        placeholder="Enter your first name"
        required
      />

      <label>Last Name:</label>
      <input
        type="text"
        v-model="payload.lastName"
        placeholder="Enter your last name"
        required
      />

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

      <label>Confirm Password:</label>
      <input
        type="password"
        v-model="payload.confirmPassword"
        placeholder="Confirm your password"
        required
      />

      <label>Date of Birth:</label>
      <input type="date" v-model="payload.dateOfBirth" required />

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

      <button>Sign Up</button>
    </form>
    <button @click="navigateToLogin">Login</button>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "SignupPage",
  data() {
    return {
      payload: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        dateOfBirth: "",
        selectedRole: "",
      },
    };
  },
  methods: {
    ...mapActions("auth", ["signupAction"]),
    async handleSignup() {
      if (!this.payload.selectedRole) {
        alert("Please select a role");
        return;
      } 

      if (this.payload.password !== this.payload.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      await this.signupAction(this.payload);

      this.$router.push(`/${this.payload.selectedRole}/home`);
    },
    navigateToLogin() {
      this.$router.push("/");
    },
  },
};
</script>
