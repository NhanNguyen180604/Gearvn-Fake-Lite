import axios from "axios";
const API = "http://localhost:3000/api/guest-cart";

export const getGuestCart = async () => {
    const response = await axios.get(API);
    if (response.status !== 200) return null;
    else return response.data;  
};

export const postGuestCart = async (productId, quantity, image, price, name, max)=>{
    const response = await axios.get(API, {productId, quantity, image, price, name, max});
    if (response.status !== 200) return null;
    else return response.data;  
}

export const putGuestCart = async (products) => {
    const response = await axios.put(API, {products});
    if (response.status!== 200) return null;
    else return response.data;
}

export const deleteGuestCart = async () => {
    const response = await axios.delete(API);
    if (response.status !== 200) return null;
    else return response.data;
}