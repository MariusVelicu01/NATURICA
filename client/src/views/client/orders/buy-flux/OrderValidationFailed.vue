<template>
  <div class="access-denied-container">
    <h1 class="title">Access Denied</h1>
    <p class="message">You cannot access this page without completing the necessary steps.</p>
    <router-link to="/client/products" class="btn-return">Return to Products</router-link>
  </div>
</template>

<style scoped>
.access-denied-container {
  font-family: "Arial", sans-serif;
  background: #f8f8f5;
  padding: 20px;
  max-width: 600px;
  margin: auto;
  border-radius: 10px;
  margin-top: 30px;
  text-align: center;
}

.title {
  color: #e74c3c;
  font-size: 24px;
  margin-bottom: 15px;
}

.message {
  color: #555;
  font-size: 16px;
  margin-bottom: 20px;
}

.btn-return {
  display: inline-block;
  padding: 10px 20px;
  background: #4a7c59;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 16px;
}

.btn-return:hover {
  background: #3e7042;
}
</style>
