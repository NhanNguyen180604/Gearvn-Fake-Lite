export interface Order {
	_id: string;
	user: string;
	products: OrderProduct[];
	fullName: string;
	phoneNumber: string;
	city: string;
	district: string;
	street: string;
	totalPrice: number;
	createdAt: Date;
	updatedAt: Date;
	status: string;
	[key: string]: any;
}

export interface OrderProduct {
	productID: string;
	productName: string;
	productPrice: number;
	quantity: number;
	[key: string]: any;
}

export interface OrderResponse {
	orders: Order[];
	page: number;
	per_page: number;
	total: number;
	total_pages: number;
	[key: string]: any;
}
