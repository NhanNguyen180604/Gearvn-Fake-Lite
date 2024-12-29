import axios, { AxiosError, isAxiosError } from "axios";

const API = "http://localhost:3000/api/sub-system/payment"
export const withdraw = async(token, id, paymentInfo)=>{
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