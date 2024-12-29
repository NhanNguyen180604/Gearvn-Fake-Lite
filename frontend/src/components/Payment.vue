<template>
    <div v-if="show" class="popup" :class="type">
        <!-- <p>{{ message }}</p> -->
         <p>Bạn đã chuyển tiền thành công</p>
        <button @click="closePopup">Close</button>
    </div>
    <div class="payment-container">
        <h1>Thanh toán</h1>
        <div class="cart-container">
            <h2>Thông tin đơn hàng</h2>
            <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
                <div class="item-details">
                    <img :src="item.image" alt="Product Image" class="item-image" />
                    <div>
                        <h2 class="item-name">{{ item.name }}</h2>
                        <p class="item-price">Giá: {{ formatPrice(item.price) }}</p>
                    </div>
                </div>
                <div class="added-info">
                    <div class="item-quantity">SL: {{ item.quantity }}</div>
                    <div class="item-total">Thành tiền: {{ formatPrice(item.price * item.quantity) }}</div>
                </div>
            </div>
            <div class="cart-total">
                <h3>Tổng thành tiền: {{ formatPrice(totalAmount) }}</h3>
            </div>
        </div>

        <form @submit.prevent="handlePayment" class="payment-form">
            <h2 style="margin-top: 0;">Thông tin khách hàng</h2>
            <div class="form-row">
                <div class="form-group">
                    <label>Họ và tên</label>
                    <input type="text" v-model="paymentInfo.fullName" required />
                </div>
                <div class="form-group">
                    <label>Số điện thoại</label>
                    <input type="tel" v-model="paymentInfo.phone" required />
                </div>
            </div>
            <h2>Địa chỉ khách hàng</h2>
            <div class="form-row">
                <div class="form-group">
                    <label>Thành phố</label>
                    <input type="text" v-model="paymentInfo.city" required />
                </div>
                <div class="form-group">
                    <label>Quận/Huyện</label>
                    <input type="text" v-model="paymentInfo.district" required />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Số nhà, Tên đường, Phường/Xã</label>
                    <input type="text" id="street" v-model="paymentInfo.street" required />
                </div>
            </div>

            <div class="payment-methods">
                <h2>Phương thức thanh toán</h2>
                <div>Chuyển khoản ngân hàng</div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Mã ví (Wallet ID)</label>
                    <input type="text" v-model="paymentInfo.walletId" required />
                </div>
                <div class="form-group"></div>
            </div>

            <button type="submit" class="submit-btn" @click="handlePayment">Xác nhận thanh toán</button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { useSession } from '@clerk/vue';
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCart } from '../services/cartService';
const show = ref(true);
const message = ref('');
const type = ref('success');
const session = useSession();

const props = defineProps({
    token: {
        type: String,
        default: null,
    }
})

onMounted(async () => {
    if (props.token) {
        const cartResponse = await getCart(props.token);
        cartItems.value = cartResponse.products.map(product => ({
            _id: product.productID._id,
            image: product.productID.images[0]?.url || "https://via.placeholder.com/150",
            price: product.productID.price,
            name: product.productID.name,
            quantity: product.quantity,
            max: product.productID.stock,
        }));
    }
})
const router = useRouter();

// Mock cart items - replace with your actual cart data
const cartItems = ref([]);
const paymentInfo = ref([]);
const showPopup = (msg: string, popupType: string) => {
    message.value = msg;
    type.value = popupType;
    show.value = true;
};

const closePopup = () => {
    show.value = false;
};

const totalAmount = computed((): number => {
    return cartItems.value.reduce((total, item) => {
        return total + (item.price * item.quantity)
    }, 0)
})

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// const handlePayment = () => {
//     try {
//             // Call the payment API
//             const response = await fetch(`/api/payment/${paymentInfo.walletID}/withdraw`, {
//                 method: 'POST',
//                 // headers: {
//                 //     'Content-Type': 'application/json',
//                 // },
//                 body: JSON.stringify({
//                     amount: totalAmount.value,
//                 }),
//             });

//             const result = await response.json();

//             if (response.ok) {
//                 // Show success popup
//                 showPopup('Payment successful!', 'success');
//             } else {
//                 // Show error popup
//                 showPopup(`Payment failed: ${result.message}`, 'error');
//             }
//         } else {
//             console.error('No active session found');
//         }
//     } catch (error) {
//         console.error('Failed to handle payment:', error);
//         showPopup('Payment failed: An error occurred', 'error');
//     }
// }
</script>

<style lang="scss" scoped>
$warning: var(--color-red);

* {
    box-sizing: border-box;
}

.payment-container {
    max-width: 60rem;
    margin: 0 auto;
    padding: 1.5rem;
    padding-top: 1px;

    h1 {
        font-weight: bold;
        text-align: center;
        background-color: $warning;
        color: white;
        padding: 1.5rem;
        border: solid
    }
}


.payment-form {
    margin: 0 auto;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;

    h2 {
        margin-top: 3rem;
    }

    .form-row {
        display: flex;
        gap: 5rem;
        margin-bottom: 1rem;
    }

    .form-group {
        flex: 1;

        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
        }

        input {
            width: 100%;
            padding: 0.5rem;
            border: 0.1rem solid #ddd;
            border-radius: 0.25rem;
            font-size: 1rem;

            &:focus {
                outline: none;
                border-color: gray;
            }
        }
    }
}

.wallet-input {
    margin: 1rem 0;
    display: flex;
    align-items: center;
    gap: 1rem;

    label {
        flex: 0 0 auto;
        margin-right: 1rem;
    }

    input {
        flex: 1;
    }
}

.submit-btn {
    display: block;
    width: 100%;
    padding: 1rem;
    background-color: $warning;
    color: white;
    border: none;
    border-radius: 3rem;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: lighten(red, 20%);
    }
}

.cart-container {
    margin: 0 auto;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    margin-bottom: 0.5rem;

    .cart-title {
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        background-color: $warning;
        color: white;
        padding: 1.5rem;
        border: solid
    }

    .cart-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        border-bottom: 1px solid #e5e5e5;

        .item-details {
            display: flex;
            align-items: center;
            margin: 2rem 0;

            .item-check {
                width: 1.25rem;
                height: 1.25rem;
                margin-right: 0.5rem;
            }

            .item-image {
                width: 60px;
                height: 60px;
                border-radius: 8px;
                margin-right: 1rem;
            }

            .item-name {
                font-weight: bold;
                font-size: 1rem;
                margin: 0 auto;
            }

            .item-price {
                margin: 0 auto;
                color: #777;
            }
        }

        .item-quantity,
        .item-total {
            text-align: end;
            margin: 0 auto;
            color: #777;
        }
    }

    .cart-total {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 1rem;
        font-weight: bold;
        margin-top: 2rem;
    }
}

.payment-methods {
    margin-bottom: 1rem;
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.popup.success {
  border-color: green;
}

.popup.error {
  border-color: red;
}

.popup button {
  margin-top: 1rem;
}
</style>