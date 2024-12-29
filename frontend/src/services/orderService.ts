const API = "http://localhost:3000/api/orders";
import { type Order, type OrderResponse } from "../types/orderType";
import axios, { AxiosError, isAxiosError } from "axios";

export const getOrders = async (
	page = 1,
	per_page = 20,
	_id = "",
	phoneNumber = "",
	status = "",
	fromDate = "",
	toDate = "",
	token: string | null = ""
): Promise<OrderResponse | null> => {
	const response = await fetch(
		API +
			`?page=${page}&per_page=${per_page}&id=${_id}&phone_number=${phoneNumber}&status=${status}&from=${fromDate}&to=${toDate}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);
	if (response.status !== 200) return null;

	return await response.json();
};

export const getMyOrders = async (
	page = 1,
	per_page = 20,

	token: string | null = ""
): Promise<OrderResponse | null> => {
	const response = await fetch(
		API +
			`/one?page=${page}&per_page=${per_page}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);
	if (response.status !== 200) return null;

	return await response.json();
};

export const updateOrderStatus = async (
	id: string,
	status: string,
	token: string | null
) => {
	try {
		const response = await axios.put(
			API + `/${id}`,
			{
				status: status,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
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
