const API = "http://localhost:3000/api/products";
import { type ProductResponse, type Product } from "../types/productType";
import axios, { AxiosError, isAxiosError } from "axios";

export const getProducts = async (
	page = 1,
	per_page = 20,
	query = "",
	category = "",
	minPrice = 0,
	maxPrice = 999999999,
	priceSort = 0
): Promise<ProductResponse | null> => {
	const response = await fetch(
		API +
			`?page=${page}&per_page=${per_page}&q=${query}&category=${category}&min_price=${minPrice}&max_price=${maxPrice}&price_sort=${priceSort}`
	);
	if (response.status !== 200) return null;

	return await response.json();
};

export const getProductById = async (id: string): Promise<Product | null> => {
	const response = await fetch(API + `/${id}`);
	if (response.status !== 200) return null;

	return await response.json();
};

export const deleteProduct = async (id: string) => {
	// get token here
	const token = "";
	try {
		const response = await axios.delete(API + `/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return { status: response.status, data: response.data };
	} catch (err) {
		if (isAxiosError(err)) {
			const error = err as AxiosError;
			return {
				status: error.response?.status,
				message: error.response?.data,
			};
		} else {
			console.log(err);
			return {
				status: 500,
				message: "No idea",
			};
		}
	}
};

export const postProduct = async (formData: FormData) => {
	// get token here
	const token = "";
	try {
		const response = await axios.post(API, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
				Authorization: `Bearer ${token}`,
			},
		});
		return { status: response.status, data: response.data };
	} catch (err) {
		if (isAxiosError(err)) {
			const error = err as AxiosError;
			return {
				status: error.response?.status,
				message: error.response?.data,
			};
		} else {
			console.log(err);
			return {
				status: 500,
				message: "No idea",
			};
		}
	}
};

export const updateProduct = async (id: string, formData: FormData) => {
	// get token here
	const token = "";
	try {
		const response = await axios.put(API + `/${id}`, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
				Authorization: `Bearer ${token}`,
			},
		});
		return { status: response.status, data: response.data };
	} catch (err) {
		if (isAxiosError(err)) {
			const error = err as AxiosError;
			return {
				status: error.response?.status,
				message: error.response?.data,
			};
		} else {
			console.log(err);
			return {
				status: 500,
				message: "No idea",
			};
		}
	}
};
