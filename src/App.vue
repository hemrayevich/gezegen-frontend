<script setup>
import Navbar from './components/layouts/Navbar.vue';
</script>

<template>
  <div class="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <Navbar />
      <RouterView />
  </div>
</template>

<style scoped></style>
