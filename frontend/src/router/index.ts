import { createRouter, createWebHistory } from "vue-router";
import ManageProduct from "../components/ManageProduct.vue";
import HelloWorld from "../components/HelloWorld.vue";
import AdminView from "../views/AdminView.vue";
import AddProductView from "../views/AddProductView.vue";
import EditProductView from "../views/EditProductView.vue";
import ManageOrder from "../components/ManageOrder.vue";
import ManageAccount from "../components/ManageAccount.vue";

export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/",
			name: "home",
			component: HelloWorld,   // put home here
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
				{
					path: "orders",
					name: "adminManageOrder",
					component: ManageOrder,
				},
				{
					path: "accounts",
					name: "adminManageAccount",
					component: ManageAccount,
				},
				{
					path: "statistics",
					name: "adminStatistics",
					component: HelloWorld,   // put statistics here, wtf is statistics
				},
				{
					path: "categories",
					name: "adminManageCategory",
					component: HelloWorld,   // put manage categories here
				}
			],
		},
		{
			path: "/products",
			name: "products",
			children: [
				{
					path: ":id",
					name: "productDetail",
					children: [
						{
							path: "",
							name: "productDetailsReal",
							component: HelloWorld,  // put product details here
						},
						{
							path: "edit",
							name: "productEdit",
							component: EditProductView,
						},
					],
				},
				{
					path: "new",
					name: "adminAddProduct",
					component: AddProductView,
				},
			],
		},
	],
});
