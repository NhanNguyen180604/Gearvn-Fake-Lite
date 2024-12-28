import { createRouter, createWebHistory } from "vue-router";
import ManageProduct from "../components/ManageProduct.vue";
import HelloWorld from "../components/HelloWorld.vue";
import AdminView from "../views/AdminView.vue";
import AddProductView from "../views/AddProductView.vue";
import EditProductView from "../views/EditProductView.vue";
import ManageOrder from "../components/ManageOrder.vue";
import userView from "../views/UserView.vue";
import homeBody from "../components/homeBody.vue";
import productList from "../components/userFilterCategory.vue";
import ProductDetail from '../components/productDetail.vue';
import searchResult from '../components/searchProduct.vue';



export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/",
			name: "home",
			component: userView,   // put home here
			children: [
				{
					path: '',
					name: 'homeBody',
					component: homeBody,
				},
				{
					path: "/products",
					name:'productList',
					component: productList,
				},
				{
					path: '/products/:_id',
					name: 'ProductDetail',
					component: ProductDetail,
					props: true, // Allow route params as props
				  },
				  {
					path: '/search',
					name: 'searchProduct',
					component: searchResult,
					props: true, // Allow route params as props
				  },
				
			]
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
					component: HelloWorld,  // put manage account here
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
