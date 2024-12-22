import { createRouter, createWebHistory } from "vue-router";
import ManageProduct from "../components/ManageProduct.vue";
import HelloWorld from "../components/HelloWorld.vue";
import AdminView from "../views/AdminView.vue";
import AddProductView from "../views/AddProductView.vue";

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/",
			name: "home",
			component: HelloWorld,
		},
		{
			path: "/admin",
			name: "admin",
			component: AdminView,
			children: [
				{
					path: "products",
					name: "adminManageProduct",
					component: ManageProduct,
				},
			],
		},
		{
			path: "/products",
			name: "products",
			children: [
				{
					path: "new",
					name: "adminAddProduct",
					component: AddProductView,
				},
			],
		},
	],
});
