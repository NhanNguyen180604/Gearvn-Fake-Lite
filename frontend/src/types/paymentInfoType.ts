export interface PaymentInfo {
	fullName: string;
	phoneNumber: string;
	city: string;
	district: string;
	street: string;
	cardNumber: string;
	cvv: string;
	expiryDate: string;
	[key: string]: any;
}
