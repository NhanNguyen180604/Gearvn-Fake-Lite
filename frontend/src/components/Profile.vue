<script lang="ts" setup>
import { toRef, onMounted, ref, watch } from 'vue';
import { useUser } from '@clerk/vue';
import { postDeposit, getBalance } from '../services/walletService';
import { getOrders } from '../services/orderService';
import { type Order } from '../types/orderType';



const prop = defineProps({
    token: {
        type: String,
        required: true,
    }
});

const { user, isLoaded, isSignedIn } = useUser();
const balance = ref(0);
const token = toRef(prop.token);
const depositInfo = ref({
    cardNumber: '',
    ccv: '',
    expiryDate: '',
    amount: 0,
    success: true,
    failureMessage: '',
});
const showID = ref(false);
const error = ref({
    error: false,
    message: '',
});

const orders = ref<Order[] | null>(null);
    const page = ref(1);
const perPage = 5;
const totalPages = ref(100);
const total = ref(1000);
const loading = ref(true);



const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN', {
        style: 'decimal',
        minimumFractionDigits: 0,
    });
};
watch(
    () => depositInfo.value.amount,
    (newAmount) => {
        depositInfo.value.formattedAmount = formatCurrency(newAmount);
    }
);
const submit = async () => {
    if (user.value) {
        const formData = new FormData();
        formData.append('cardNumber', depositInfo.value.cardNumber);
        formData.append('ccv', depositInfo.value.ccv);
        formData.append('expiryDate', depositInfo.value.expiryDate);
        formData.append('amount', depositInfo.value.amount.toString());

        const response = await postDeposit(user.value?.id, formData, token.value);

        if (response.status === 200) {
            console.log('deposit success');
            depositInfo.value.success = true;

            // update balance
            balance.value += depositInfo.value.amount;
        }
        else {
            console.log('Failed to deposit money');
            depositInfo.value.success = false;
            if (response.message)
                depositInfo.value.failureMessage = response.message.toString();
        }

        depositInfo.value.amount = 0;
    }
};

onMounted(async () => {
    if (user.value) {
        const response = await getBalance(user.value.id, token.value);
        if (response.status === 200) {
            balance.value = response.data?.balance;
        }
    }
});

</script>

<template>
    <div v-if="!isLoaded"></div>
    <div v-else-if="!isSignedIn"></div>

    <div v-else>
        <div class="profileContainer">

            <!-- Left section: User information -->
            <div class="userSection">
                <h2 class="sectionTitle">Thông tin người dùng</h2>
                <div class="userInfoContainer">
                    <!-- Image on the left -->
                    <img :src="user?.imageUrl || 'https://placehold.co/150x150?text=User+Avatar'" style="width:100px; height:100px; border-radius: 50%; margin-right: 20px;">
                    
                    <!-- Information on the right -->
                    <div class="userDetails">
                        <div class="name">Tên: {{ user?.username }}</div>
                        <div class="id">ID: {{ user?.id }}</div>
                        <div class="balance">Số dư: <span>{{ balance.toLocaleString('vi-VN') }} đ</span></div>
                    </div>
                </div>

            </div>

            <!-- Right section: Deposit form -->
            <div class="depositSection">
                <h2 class="sectionTitle">Nạp tiền vào ví</h2>
                <form>
                    <label for="cardNumber">Số tài khoản</label>
                    <input type="text" id="cardNumber" placeholder="Số tài khoản" required
                        v-model="depositInfo.cardNumber">

                    <label for="cvv">CVV</label>
                    <input type="text" id="cvv" placeholder="Số CVV" required v-model="depositInfo.ccv">

                    <label for="expiryDate">Ngày hết hạn</label>
                    <input type="text" id="expiryDate" placeholder="Ngày hết hạn của thẻ" required
                        v-model="depositInfo.expiryDate">

                    <label for="amount">Số tiền nạp vào (VNĐ)</label>
                    <input type="number" min="0" step="1000" id="amount" required v-model="depositInfo.amount">
                    <p><strong>Số tiền đã nhập:</strong> {{ depositInfo.formattedAmount }} đ</p>

                    <div v-if="!depositInfo.success" class="failMessage">Nạp tiền thất bại, lý do {{
                        depositInfo.failureMessage }}</div>
                    <button @click.prevent="submit">Nạp tiền</button>
                </form>
            </div>

        </div>

        <!-- New section: Order list as table -->
        
        <div style="display:flex; justify-content: center; width:100%;"><h2 class="sectionTitle" style="width:80%; margin-top:20px;margin-bottom:10px">Danh sách đơn đặt hàng</h2></div>
        <div class="orderSection">
            <div  v-if="orders&&orders.length === 0" class="noOrdersMessage">
                <p>Chưa có đơn hàng nào.</p>
            </div>
            <div v-else>
                <table class="orderTable">
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>SĐT</th>
                            <th>Địa chỉ</th>
                            <th>Sản phẩm</th>
                            <th>Tổng tiền</th>
                            <th>Tình trạng</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(order, index) in orders" :key="index">
                            <td>{{ order.fullName }}</td>
                            <td>{{ order.phoneNumber }}</td>
                            <td>{{ order.street }}, {{ order.distreet }}, {{ order.city }}</td>
                            <td>
                                <ul>
                                    <li v-for="(product, index) in order.products" :key="index">{{ product.Name }} - {{
                                        product.quantity }} x {{ product.Price | formatCurrency }} đ</li>
                                </ul>
                            </td>
                            <td>{{ order.totalPrice | formatCurrency }} đ</td>
                            <td>{{ order.status }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>


</template>


<style lang="scss" scoped>
.profileContainer {
    display: flex;
    gap: 40px;
    padding: 20px;
    background: var(--background-gray);
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    justify-content: center;
}

.userSection {
    flex: 1;
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    /* Reduce width of the sections */
    width: 100%;

    h2 {
        margin-bottom: 20px;
        color: #ffffff;
    }

    .userInfo {
        p {
            margin: 10px 0;
            font-size: 16px;
            color: #555;

            strong {
                color: #333;
            }
        }
    }
}
.userInfoContainer {
    display: flex;
    align-items: center; /* Vertically align the content */
    padding: 20px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.userDetails {
    display: flex;
    flex-direction: column;
}

.name, .id, .balance {
    font-size: 16px;
    margin-bottom: 10px;
}

.balance span {
    font-weight: bold;
}

.sectionTitle {
    background-color: var(--ocean-blue);
    color: white;
    padding: 10px;
    text-align: center;
    border-radius: 5px;
    margin-bottom: 20px;
}

.depositSection {
    flex: 1.5;
    background: #ffffff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    /* Reduce width of the sections */
    width: 100%;

    form {
        label {
            display: block;
            margin: 10px 0 5px;
            font-size: 14px;
            color: #555;
        }

        input {
            display: block;
            width: 100%;
            margin-bottom: 15px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            color: #333;
        }

        .failMessage {
            color: #e74c3c;
            font-size: 14px;
            margin-bottom: 10px;
        }

    }

}

button {
    display: inline-block;
    background: #E13737;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
        background: #931e1e;
    }
}
.orderSection {
    display:flex;
    justify-content: center;
    width: 100%;

}

.noOrdersMessage {
    font-size: 16px;
    color: #555;
}

.orderTable {
    width: 100%; /* Set the table width to 80% of the parent container */
    border-collapse: collapse;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Optional: Add a shadow for a better look */
    th, td {
        padding: 12px;
        text-align: left;
        border: 1px solid #ddd;
    }

    th {
        background-color: #007bff;
        color: white;
        font-weight: bold;
    }

    td {
        font-size: 14px;
        color: #555;
    }

    td ul {
        padding-left: 20px;
    }
}

</style>
