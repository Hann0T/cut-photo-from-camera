import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import Home from './pages/Home.vue';
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    { path: '/', component: Home, name: 'Home' },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp(App);

app.use(router);

app.mount('#app');
