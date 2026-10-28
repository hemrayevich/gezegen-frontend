<script setup>
import { ref, reactive, onMounted } from 'vue'

const API_URL = 'http://127.0.0.1:8000/api/v1'

const airports = ref([])
const flights = ref([])
const searchExecuted = ref(false)
const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const selectedFlightId = ref(null)
const availableDates = ref([])

const fetchAvailableDates = async () => {
    if (!searchForm.departure_airport_id || !searchForm.arrival_airport_id) return

    try {
        const params = new URLSearchParams()
        params.append('departure_airport_id', searchForm.departure_airport_id)
        params.append('arrival_airport_id', searchForm.arrival_airport_id)

        const res = await fetch(`${API_URL}/flights?${params.toString()}`)
        const result = await res.json()
        const rawData = result.data
        const flightsList = Array.isArray(rawData) ? rawData : (rawData.data || [])

        // Извлекаем только даты ( YYYY-MM-DD ) и убираем дубликаты
        const dates = flightsList.map(f => f.departure_time.split(' ')[0])
        availableDates.value = [...new Set(dates)]
    } catch (e) {
        console.error('Ошибка загрузки дат', e)
    }
}

const searchForm = reactive({
    departure_airport_id: '',
    arrival_airport_id: '',
    date: ''
})

const passenger = reactive({
    full_name: '',
    email: '',
    phone: '',
    card_num: '',
    passport_code: '',
    seats_count: 1
})

onMounted(async () => {
    try {
        const res = await fetch(`${API_URL}/airports`)
        const result = await res.json()
        airports.value = result.data.data || result.data
    } catch (error) {
        console.error('Ошибка загрузки аэропортов:', error)
    }
})


const handleSearch = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
        const params = new URLSearchParams()
        if (searchForm.departure_airport_id) params.append('departure_airport_id', searchForm.departure_airport_id)
        if (searchForm.arrival_airport_id) params.append('arrival_airport_id', searchForm.arrival_airport_id)

        const res = await fetch(`${API_URL}/flights?${params.toString()}`)
        const result = await res.json()

        let rawData = result.data
        let allFlights = Array.isArray(rawData) ? rawData : (rawData.data || [])

        if (searchForm.date) {
            allFlights = allFlights.filter(flight => {
                if (!flight.departure_time) return false
                const flightDateOnly = flight.departure_time.split(' ')[0] 
                return flightDateOnly === searchForm.date
            })
        }

        flights.value = allFlights
        searchExecuted.value = true
        selectedFlightId.value = null
    } catch (error) {
        console.error('Ошибка при поиске рейсов:', error)
        errorMessage.value = 'Не удалось загрузить рейсы.'
    } finally {
        isLoading.value = false
    }
}

const selectFlight = (id) => {
    if (selectedFlightId.value === id) {
        selectedFlightId.value = null
    } else {
        selectedFlightId.value = id
        passenger.seats_count = 1
        errorMessage.value = ''
    }
}

const buyTicket = async (flight) => {
    if (!passenger.full_name || !passenger.email || !passenger.passport_code || !passenger.card_num) {
        errorMessage.value = 'Заполните все обязательные поля формы!'
        return
    }

    isSubmitting.value = true
    errorMessage.value = ''

    try {
        const payload = {
            flight_id: flight.id,
            seats_count: passenger.seats_count,
            full_name: passenger.full_name,
            email: passenger.email,
            phone: passenger.phone,
            card_num: passenger.card_num,
            passport_code: passenger.passport_code
        }

        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        const result = await res.json()

        if (!res.ok) {
            throw new Error(result.message || 'Ошибка бронирования')
        }

        flight.empty_seats -= passenger.seats_count

        alert(result.message || 'Билет успешно забронирован!')
        selectedFlightId.value = null

        passenger.full_name = ''
        passenger.email = ''
        passenger.phone = ''
        passenger.card_num = ''
        passenger.passport_code = ''
        passenger.seats_count = 1

    } catch (error) {
        console.error('Ошибка покупки:', error)
        errorMessage.value = error.message || 'Ошибка при оформлении билета.'
    } finally {
        isSubmitting.value = false
    }
}

const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    const date = new Date(dateTimeStr)
    return date.toLocaleDateString()
}
</script>

<template>
    <div class="min-h-screen bg-[#ece9e2] p-6 text-slate-800 font-sans">
        <div class="max-w-4xl mx-auto space-y-6">

            <div class="bg-[#f5f3ee] p-4 rounded-xl border border-stone-300 shadow-sm flex flex-wrap gap-4 items-end">
                <div class="flex-1 min-w-[180px]">
                    <label class="block text-xs text-stone-600 mb-1 font-medium">From Airport</label>
                    <select v-model="searchForm.departure_airport_id" @change="fetchAvailableDates"
                        class="w-full bg-[#e8e4db] border border-stone-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600">
                        <option value="" disabled>Select departure</option>
                        <option v-for="airport in airports" :key="airport.id" :value="airport.id">
                            {{ airport.name }} ({{ airport.code }})
                        </option>
                    </select>
                </div>

                <div class="flex-1 min-w-[180px]">
                    <label class="block text-xs text-stone-600 mb-1 font-medium">To Airport</label>
                    <select v-model="searchForm.arrival_airport_id" @change="fetchAvailableDates"
                        class="w-full bg-[#e8e4db] border border-stone-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600">
                        <option value="" disabled>Select arrival</option>
                        <option v-for="airport in airports" :key="airport.id" :value="airport.id">
                            {{ airport.name }} ({{ airport.code }})
                        </option>
                    </select>
                </div>

                <div class="flex-1 min-w-[180px]">
                    <label class="block text-xs text-stone-600 mb-1 font-medium">Date</label>
                    <input type="date" v-model="searchForm.date"
                        class="w-full bg-[#e8e4db] border border-stone-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
                    <!-- Подсказка с доступными датами рейсов -->
                    <div v-if="availableDates.length > 0" class="text-xs text-stone-600 mt-1">
                        Доступные даты рейсов:
                        <span v-for="(date, index) in availableDates" :key="index"
                            class="font-semibold text-teal-700 mr-2">
                            {{ date }}
                        </span>
                    </div>
                </div>

                <div>
                    <button @click="handleSearch"
                        class="bg-[#009698] hover:bg-[#007f81] text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search
                    </button>
                </div>
            </div>

            <div v-if="searchExecuted" class="text-lg font-semibold text-stone-800">
                Available Flights {{ searchForm.date ? `· ${searchForm.date}` : '' }}
            </div>

            <div v-if="isLoading" class="text-center py-8 text-stone-500">
                Загрузка рейсов...
            </div>

            <div v-else-if="flights.length === 0 && searchExecuted" class="text-center py-8 text-stone-500">
                Рейсов по заданным направлениям и дате не найдено.
            </div>

            <div v-else class="space-y-4">
                <div v-for="flight in flights" :key="flight.id"
                    class="bg-[#f5f3ee] rounded-xl p-5 border border-stone-300 shadow-sm relative">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <div class="text-xs text-stone-500 font-medium mb-1">
                                {{ flight.airline }} · {{ flight.flight_code }}
                            </div>
                            <div class="flex items-center gap-6">
                                <div>
                                    <span class="text-2xl font-bold block">{{ formatTime(flight.departure_time)
                                        }}</span>
                                    <span class="text-xs text-stone-500 font-semibold">{{ flight.departure_airport?.code
                                        }}</span>
                                </div>
                                <div class="text-center text-xs text-stone-400">
                                    <span>✈</span>
                                    <div class="text-[10px]">{{ formatDate(flight.departure_time) }}</div>
                                </div>
                                <div>
                                    <span class="text-2xl font-bold block">{{ formatTime(flight.arrival_time) }}</span>
                                    <span class="text-xs text-stone-500 font-semibold">{{ flight.arrival_airport?.code
                                        }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="text-right">
                            <div class="text-2xl font-bold text-stone-900">${{ flight.price }}</div>
                            <div class="text-xs text-stone-500 mb-1">per person</div>
                            <div class="text-xs text-stone-600 mb-2 font-medium">
                                Empty seats: {{ flight.empty_seats }}
                            </div>
                            <button @click="selectFlight(flight.id)"
                                :class="selectedFlightId === flight.id ? 'bg-stone-800 text-white' : 'bg-[#2b3842] text-white hover:bg-stone-700'"
                                class="px-4 py-1.5 rounded text-xs font-semibold transition-colors">
                                {{ selectedFlightId === flight.id ? 'Selected' : 'Select' }}
                            </button>
                        </div>
                    </div>

                    <div v-if="selectedFlightId === flight.id" class="mt-6 pt-4 border-t border-stone-300/60">
                        <h4 class="text-sm font-semibold mb-3 text-stone-700">Passenger & Payment Details</h4>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <div>
                                <label class="block text-xs text-stone-600 mb-1">Full name</label>
                                <input type="text" v-model="passenger.full_name" placeholder="John Doe"
                                    class="w-full bg-[#e8e4db] border border-stone-300 rounded p-2 text-sm focus:outline-none" />
                            </div>
                            <div>
                                <label class="block text-xs text-stone-600 mb-1">Email</label>
                                <input type="email" v-model="passenger.email" placeholder="example@mail.com"
                                    class="w-full bg-[#e8e4db] border border-stone-300 rounded p-2 text-sm focus:outline-none" />
                            </div>
                            <div>
                                <label class="block text-xs text-stone-600 mb-1">Phone</label>
                                <input type="text" v-model="passenger.phone" placeholder="+123456789"
                                    class="w-full bg-[#e8e4db] border border-stone-300 rounded p-2 text-sm focus:outline-none" />
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div>
                                <label class="block text-xs text-stone-600 mb-1">Passport Code</label>
                                <input type="text" v-model="passenger.passport_code" placeholder="AB1234567"
                                    class="w-full bg-[#e8e4db] border border-stone-300 rounded p-2 text-sm focus:outline-none" />
                            </div>
                            <div>
                                <label class="block text-xs text-stone-600 mb-1">Card Number</label>
                                <input type="text" v-model="passenger.card_num" placeholder="4000 0000 0000 0000"
                                    class="w-full bg-[#e8e4db] border border-stone-300 rounded p-2 text-sm focus:outline-none" />
                            </div>
                            <div>
                                <label class="block text-xs text-stone-600 mb-1">Seats Count</label>
                                <input type="number" v-model.number="passenger.seats_count" min="1"
                                    :max="flight.empty_seats"
                                    class="w-full bg-[#e8e4db] border border-stone-300 rounded p-2 text-sm focus:outline-none" />
                            </div>
                        </div>

                        <div class="flex justify-between items-end">
                            <div>
                                <p class="text-xs text-stone-600">
                                    Total ${{ flight.price * passenger.seats_count }}.
                                </p>
                                <p v-if="errorMessage" class="text-xs text-red-500 mt-1">
                                    {{ errorMessage }}
                                </p>
                            </div>

                            <button @click="buyTicket(flight)"
                                :disabled="isSubmitting || flight.empty_seats < passenger.seats_count"
                                class="bg-[#009698] hover:bg-[#007f81] disabled:bg-stone-400 text-white font-medium px-5 py-2 rounded text-sm transition-colors">
                                {{ isSubmitting ? 'Processing...' : 'Buy' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped></style>