import axios from "axios";
const API = "http://localhost:3000/api/carts";

export const getCart = async (token: string|null) => {
    const response = await axios.get(API, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (response.status !== 200) return null;
    else return response.data;  
};

export const putCart = async (token, products) => {
    const response = await axios.put(API, {products}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (response.status !== 200) return null;
    else return response.data;  
}

export const deleteCart = async (token, restock) => {
    const response = await axios.delete(API,{
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: { restock }
    });
    if (response.status !== 200) return null;
    else return response.data;  
}

