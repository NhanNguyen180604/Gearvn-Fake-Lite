import axios, { AxiosError, isAxiosError } from "axios";

const API = "http://localhost:3000/api/sub-system/payment";
export const userPay = async (
	token: string | null,
	id: string | null,
	paymentInfo: {}
) => {
	try {
		const response = await axios.post(API + `/${id}`, paymentInfo, {
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

export const guestPay = async (paymentInfo: {}) => {
	try {
		const response = await axios.post(API + `/guest`, paymentInfo);
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
