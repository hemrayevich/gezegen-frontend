<script setup>
import Modal from '@/components/common/Modal.vue';
import { ref, onMounted } from 'vue';

const modalVar = ref(false);
const cities = ref([]);
const hotels = ref([]);

function modalToggle() {
  modalVar.value = !modalVar.value;
}

onMounted(async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/cities');
    const data = await response.json();

    cities.value = data.data || data;
    console.log('Загруженные комнаты:', cities.value);
  } catch (error) {
    console.error('Ошибка при загрузке комнат:', error);
  }
});

onMounted(async () => {
  try {
    const response = await fetch('http://192.168.3.186:8000/api/hotels');
    const data = await response.json();

    hotels.value = data.data || data;
    console.log('Загруженные комнаты:', hotels.value);
  } catch (error) {
    console.error('Ошибка при загрузке комнат:', error);
  }
});
</script>

<template>
  <div class="text-center mt-8">
    <button @click="modalToggle()" type="button"
      class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white">
      Click Me
    </button>


    <div class="mt-6 max-w-2xl mx-auto text-left">
      <h2 class="text-xl font-bold mb-4 text-center">Список комнат</h2>
      <div v-for="city in cities" :key="cities.id" class="p-4 mb-2 border rounded-lg bg-gray-50 shadow-sm">
        <p class="font-semibold">Номер: {{ city.name }}</p>
        <!-- <p class="text-gray-600">Цена: ${{ room.price_per_night }}</p> -->
      </div>
      <div>Salam</div>
      <div v-for="hotel in hotels" :key="hotel.id" class="p-4 mb-2 border rounded-lg bg-gray-50 shadow-sm">
        <p class="font-semibold">Номер: {{ hotel.name }}</p>
        <!-- <p class="text-gray-600">Цена: ${{ room.price_per_night }}</p> -->
      </div>
    </div>
  </div>

  <Modal :modalVar="modalVar" @close="modalToggle" />
</template>

<style scoped></style>
