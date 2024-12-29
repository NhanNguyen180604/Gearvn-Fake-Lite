const API = "http://localhost:3000/api/wallet";
import axios, { AxiosError, isAxiosError } from "axios";

export const postDeposit = async (
	id: string | null,
	formData: FormData,
	token: string | null
) => {
	try {
		const response = await axios.post(API + `/${id}/deposit`, formData, {
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

export const getBalance = async (id: string | null, token: string | null) => {
	try {
		const response = await axios.get(API + `/${id}`, {
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
