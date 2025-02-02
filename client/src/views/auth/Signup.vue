<template>
  <div class="signup-container">
    <div class="app-header">
      <h1 class="app-name">NATURICA</h1>
      <p class="app-slogan">Remedies from Life for Life</p>
    </div>

    <h1>Sign Up</h1>
    <form class="signup-form" @submit.prevent="handleSignup">
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

      <div class="role-selection">
        <label>
          <input type="radio" v-model="payload.selectedRole" value="client" />
          Client
        </label>
        <label>
          <input type="radio" v-model="payload.selectedRole" value="admin" />
          Admin
        </label>
      </div>

      <button type="submit" class="btn-signup">Sign Up</button>
    </form>

    <div class="navigation-buttons">
      <button @click="navigateToLogin" class="btn-secondary">Login</button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

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
  computed: {
    ...mapGetters("auth", ["getError"]),
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

      const birthDate = new Date(this.payload.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();

      if (age < 16) {
        alert("You must be at least 16 years old to sign up.");
        return;
      }

      await this.signupAction(this.payload);

      if (this.getError) {
        alert(`Error: ${this.getError.message}`);
      } else {
        this.$router.push(`/${this.payload.selectedRole}/home`);
      }
    },
    navigateToLogin() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.signup-container {
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

.btn-signup {
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

.btn-signup:hover {
  background-color: #2d6a4f;
}

.role-selection {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin: 10px 0;
}

.role-selection label {
  font-size: 16px;
  color: #2d6a4f;
  cursor: pointer;
}

.navigation-buttons {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.btn-secondary {
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
