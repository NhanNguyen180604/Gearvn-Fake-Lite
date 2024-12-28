const API = "http://localhost:3000/api/accounts";
import { type AccountResponse } from "../types/accountType";
import axios, { AxiosError, isAxiosError } from "axios";

export const getAccounts = async (
	page = 1,
	per_page = 10,
	q = "",
	token: string | null = ""
): Promise<AccountResponse | null> => {
	const response = await fetch(
		API + `?page=${page}&per_page=${per_page}&q=${q}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}
	);
	if (response.status !== 200) return null;

	return await response.json();
};

export const deleteAccount = async (id: string, token: string | null) => {
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
