import { createRouter, createWebHistory } from "vue-router";
import ManageProduct from "../components/ManageProduct.vue";
import HelloWorld from "../components/HelloWorld.vue";
import AdminView from "../views/AdminView.vue";
import AddProductView from "../views/AddProductView.vue";
import EditProductView from "../views/EditProductView.vue";
import ManageOrder from "../components/ManageOrder.vue";
import ManageAccount from "../components/ManageAccount.vue";
import userView from "../views/UserView.vue";
import homeBody from "../components/homeBody.vue";
import productList from "../components/userFilterCategory.vue";
import ManageCategory from "../components/ManageCategory.vue";
import ManageBrand from "../components/ManageBrand.vue";
import AddCategory from "../views/AddCategory.vue";
import AddBrand from "../views/AddBrand.vue";
import ProductDetail from "../components/productDetail.vue";
import searchResult from "../components/searchProduct.vue";
import Profile from "../components/Profile.vue";
import statistic from "../components/statistic.vue";
import Cart from "../components/Cart.vue";
import Payment from "../components/Payment.vue";


export const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: "/",
			name: "home",
			component: userView, // put home here
			children: [
				{
					path: "",
					name: "homeBody",
					component: homeBody,
				},
				{
					path: "/products",
					name: "productList",
					component: productList,
				},
				{
					path: "/products/:_id",
					name: "ProductDetail",
					component: ProductDetail,
					props: true, // Allow route params as props
				},
				{
					path: "/search",
					name: "searchProduct",
					component: searchResult,
					props: true, // Allow route params as props
				},
				{
					path: "/profile",
					name: "profile",
					component: Profile,
				},
				{
					path: "cart",
					name: "cart",
					component: Cart,
				},
				{
					path: "payment",
					name: "payment",
					component: Payment,
				},

			],
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
					component: statistic, // put statistics here, wtf is statistics
				},
				{
					path: "categories",
					name: "adminCategory",
					children: [
						{
							path: "",
							name: "adminManageCategory",
							component: ManageCategory,
						},
						{
							path: "new",
							name: "adminNewCategory",
							component: AddCategory,
						},
					],
				},
				{
					path: "brands",
					name: "adminBrand",
					children: [
						{
							path: "",
							name: "adminManageBrand",
							component: ManageBrand,
						},
						{
							path: "new",
							name: "adminNewBrand",
							component: AddBrand,
						},
					],
				},
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
							component: HelloWorld, // put product details here
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
