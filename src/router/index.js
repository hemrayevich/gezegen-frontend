import { createRouter, createWebHistory } from 'vue-router'


import HomePage from '@/views/HomePage.vue'
import AboutPage from '@/views/AboutPage.vue'
import HotelPage from '@/views/HotelPage.vue'
import FlightPage from '@/views/FlightPage.vue'



const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage
    },
    {
        path: '/about',
        name: 'about',
        component: AboutPage
    },
    {
        path: '/hotels',
        name: 'hotels',
        component: HotelPage
    },
    {
        path: '/flights',
        name: 'flights',
        component: FlightPage
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;