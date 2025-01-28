<template>
  <div>
    <h1>Order Confirmation</h1>
    <p>Thank you for your order!</p>
    <p><strong>Payment Method:</strong> {{ $route.query.paymentMethod }}</p>
    <p><strong>Shipping Address:</strong></p>
    <p>{{ $route.query.address }}, {{ $route.query.city }}</p>
    <p>{{ $route.query.postalCode }}, {{ $route.query.country }}</p>
    <router-link to="/client/products">Back to Products</router-link>
  </div>
</template>
