<script setup>
import { ref, onMounted } from 'vue';

const hotels = ref([]);

onMounted(async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/hotels');
        const data = await response.json();

        hotels.value = data.data || data;
        console.log('Загруженные комнаты:', hotels.value);
    } catch (error) {
        console.error('Ошибка при загрузке комнат:', error);
    }
});

</script>

<template>
    <h1 class="text-red-500">Hotel</h1>

    <div class="mt-6 max-w-2xl mx-auto text-left">
        <div>Salam</div>
        <div v-for="hotel in hotels" :key="hotel.id" class="p-4 mb-2 border rounded-lg bg-gray-50 shadow-sm">
            <p class="font-semibold">Номер: {{ hotel.name }}</p>
            <!-- <p class="text-gray-600">Цена: ${{ room.price_per_night }}</p> -->
        </div>
    </div>
</template>

<style scoped></style>