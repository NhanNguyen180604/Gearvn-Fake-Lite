export interface Product {
	brand: string;
	category: string;
	description: string;
	images: ProductImage[];
	name: string;
	price: number;
	stock: number;
	_id: string;
	[key: string]: any;
}

export interface ProductImage {
	publicID: string;
	url: string;
	[key: string]: any;
}

export interface ProductResponse {
	products: Product[];
	page: number;
	per_page: number;
	total: number;
	total_pages: number;
	[key: string]: any;
}
