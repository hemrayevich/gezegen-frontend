<script setup>
import ToggleDarkMode from '../common/ToggleDarkMode.vue';
</script>

<template>
    <div class="container mx-auto pt-4 px-3">
        <header
            class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <a href="#" class="text-sm font-semibold text-gray-900 dark:text-white">Studio</a>

            <ul class="mr-auto flex">
                <li class="text-md font-semibold hover:font-bold mx-4 dark:text-white">
                    <RouterLink to="/">Home</RouterLink>
                </li>
                <li class="text-md font-semibold hover:font-bold mx-4 dark:text-white">
                    <RouterLink to="/about">About</RouterLink>
                </li>
                <li class="text-md font-semibold hover:font-bold mx-4 dark:text-white">
                    <RouterLink to="/hotels">Hotel</RouterLink>
                </li>
                <li class="text-md font-semibold hover:font-bold mx-4 dark:text-white">
                    <RouterLink to="/flights">Flights</RouterLink>
                </li>
            </ul>
            <ToggleDarkMode />
        </header>
    </div>
</template>

<style scoped></style>
