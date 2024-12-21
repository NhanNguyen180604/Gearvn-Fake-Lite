const API = "http://localhost:3000/api/categories";
import { type Category } from "../types/categoryType";

export const getCategories = async (): Promise<Category[] | null> => {
	const response = await fetch(API);
	if (response.status !== 200) return null;

	return await response.json();
};
