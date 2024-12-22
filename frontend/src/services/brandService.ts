import { type Brand } from "../types/brandType";
const API = "http://localhost:3000/api/brands";

export const getBrands = async (): Promise<Brand[] | null> => {
    const response = await fetch(API);
	if (response.status !== 200) return null;

	return await response.json();
};