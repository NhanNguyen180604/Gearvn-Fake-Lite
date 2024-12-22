export interface Product {
	name: string;
	price: number;
	category: string;
	brand: string;
	description: string;
	images: ProductImage[] | [];
	stock: number;
	_id: string;
	[key: string]: any;
}

export interface ProductImage {
	publicID: string;
	url: string;
	[key: string]: any;
}

export interface PreviewImage {
	file: File;
	objectURL: string;
}

export interface ProductResponse {
	products: Product[];
	page: number;
	per_page: number;
	total: number;
	total_pages: number;
	[key: string]: any;
}
