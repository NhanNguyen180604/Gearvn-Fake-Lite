const API = "http://localhost:3000/api/accounts";
import { type AccountResponse } from "../types/accountType";

export const getAccounts = async (
	page = 1,
	per_page = 10,
	q = ""
): Promise<AccountResponse | null> => {
	const response = await fetch(
		API + `?page=${page}&per_page=${per_page}&q=${q}`
	);
	if (response.status !== 200) return null;

	return await response.json();
};
