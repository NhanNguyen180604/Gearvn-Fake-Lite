<script lang="ts" setup>
import { toRef, onMounted, ref } from 'vue';
import { useUser } from '@clerk/vue';
import { postDeposit, getBalance } from '../services/walletService';

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
    <div v-if="!isLoaded">

    </div>
    <div v-else-if="!isSignedIn">

    </div>
    <div v-else class="profileContainer">
        <!-- basic information -->
        <div class="userInfo">
            <img :src="user?.imageUrl || 'https://placehold.co/150x150?text=User+Avatar'">
            <div>
                <div class="name">{{ user?.username }}</div>
                <div class="id">ID: {{ user?.id }}</div>
                <div class="balance">Số dư: <span>{{ balance.toLocaleString('vi-VN') }} đ</span></div>
            </div>
        </div>

        <!-- money deposit form -->
        <form>
            <h3>Nạp tiền vào ví</h3>

            <label for="cardNumber">Số tài khoản</label>
            <input type="text" id="cardNumber" placeholder="Số tài khoản" required v-model="depositInfo.cardNumber">

            <label for="cvv">CVV</label>
            <input type="text" id="cvv" placeholder="Số CVV" required v-model="depositInfo.ccv">

            <label for="expiryDate">Ngày hết hạn</label>
            <input type="text" id="expiryDate" placeholder="Ngày hết hạn của thẻ" required
                v-model="depositInfo.expiryDate">

            <label for="amount">Số tiền nạp vào (VNĐ)</label>
            <input type="number" min="0" step="1" id="amount" required v-model="depositInfo.amount">

            <div v-if="!depositInfo.success" class="failMessage">Nạp tiền thất bại, lý do {{ depositInfo.failureMessage
                }}</div>
            <button @click.prevent="submit">Nạp tiền</button>
        </form>

        <!-- your order list -->
        <div>

        </div>
    </div>
</template>

<style lang="scss" scoped>
.profileContainer {
    display: grid;
    grid-template-columns: 600px auto;
    padding: 20px;
    gap: 20px;

    >* {
        box-shadow: 0px 0px 5px var(--color-gray);
    }

    .userInfo {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .name {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
        }

        .id,
        .balance {
            font-size: 1.2rem;
        }

        .balance {
            margin-top: 10px;

            span {
                font-weight: 600;
            }
        }

        img {
            width: 150px;
            height: 150px;
            object-fit: contain;
            border-radius: 50%;
        }
    }

    form {
        width: 100%;
        padding: 1rem 8rem;
        justify-self: center;

        h3 {
            margin-bottom: 20px;
        }

        label,
        input {
            display: block;
        }

        input {
            width: 100%;
            margin-bottom: 10px;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            border: 1px solid var(--color-gray);
        }

        .failMessage {
            color: var(--color-red);
            margin-bottom: 10px;
        }

        button {
            background: var(--ocean-blue);
            color: white;
            font-weight: bold;
            border: none;
            border-radius: 10px;
            padding: 0.5rem 1rem;
            transition: 0.2s ease;
            margin-top: 15px;

            &:hover {
                opacity: 0.7;
            }
        }
    }
}
</style>