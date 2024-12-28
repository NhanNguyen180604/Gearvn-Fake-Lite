import { type Brand } from "../types/brandType";
const API = "http://localhost:3000/api/brands";
import axios, { AxiosError, isAxiosError } from "axios";

export const getBrands = async (): Promise<Brand[] | null> => {
	const response = await fetch(API);
	if (response.status !== 200) return null;

	return await response.json();
};

export const deleteBrand = async (name: string, token: string | null) => {
	try {
		const response = await axios.delete(API + `/${name}`, {
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

export const putBrand = async (
	name: string,
	new_name: string,
	token: string | null
) => {
	try {
		const response = await axios.put(
			API + `/${name}`,
			{ name: new_name },
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

export const postBrand = async (name: string, token: string | null) => {
	try {
		const response = await axios.post(
			API,
			{ name: name },
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
