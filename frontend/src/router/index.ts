import { createRouter, createWebHistory } from "vue-router";
import ManageProduct from "../components/ManageProduct.vue";
import HelloWorld from "../components/HelloWorld.vue";

export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HelloWorld,
        },
        {
            path: '/admin/products',
            name: 'adminManageProduct',
            component: ManageProduct,
        },
    ]
});