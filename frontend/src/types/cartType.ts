export interface CartItem {
	_id: string;
	image: string;
	price: number;
	name: string;
	quantity: number;
	[key: string]: any;
}
