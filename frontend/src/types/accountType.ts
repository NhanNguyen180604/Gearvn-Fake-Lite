export interface Account {
	id: string;
	name: string;
	role: string;
	balance: number;
	[key: string]: any;
}

export interface AccountResponse {
	users: Account[];
	page: number;
	per_page: number;
	total: number;
	total_pages: number;
	[key: string]: any;
}
