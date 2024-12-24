<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { type Order } from '../types/orderType';
import { getOrders, updateOrderStatus } from '../services/orderService';
import Pagination from './Pagination.vue';
import { useSession, useAuth } from '@clerk/vue';

const { getToken } = useAuth();
const { session } = useSession();
const token = ref<string | null>(null);

const loading = ref(true);
const error = ref({
    error: false,
    message: '',
});

const page = ref(1);
const perPage = 5;
const totalPages = ref(100);
const total = ref(1000);
const search = ref({
    _id: '',
    phoneNumber: '',
    status: '',
    fromDate: '',
    toDate: '',
});

const orders = ref<Order[] | null>(null);

const fetchData = async (local_page: number, per_page: number) => {
    loading.value = true;

    let response = await getOrders(local_page, per_page, search.value._id, search.value.phoneNumber, search.value.status, search.value.fromDate, search.value.toDate, token.value);
    if (response) {
        orders.value = response.orders;
        totalPages.value = response.total_pages;
        total.value = response.total;

        // when search
        if (response.page !== page.value) {
            page.value = response.page;
        }
    }
    else {
        error.value = {
            error: true,
            message: "Không thể lấy dữ liệu đơn hàng"
        };
    }

    loading.value = false;
};

onMounted(async () => {
    if (session.value)
        token.value = await session.value.getToken({ template: 'test-template' });
    else token.value = await getToken.value({ template: 'test-template' });
    
    if (token.value)
        await fetchData(page.value, perPage);
    else {
        error.value = {
            error: true,
            message: "Không thể lấy token của admin",
        }
    }
});

watch([page, search], () => {
    debounce(() => fetchData(page.value, perPage), 300);
}, { deep: true });

// i need someone to fix this, might trigger bug
let debounceTimeout: number | undefined;
const debounce = (fn: Function, delay: number) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(fn, delay);
};

const loadPage = async (new_page: number) => {
    if (new_page <= totalPages.value && new_page > 0 && new_page !== page.value) {
        page.value = new_page;
    }
};

const formatDate = (date: any) => {
    return (new Date(date)).toLocaleDateString('en-GB');
}

const updateOrderStatusWrapper = async (id: string, status: string) => {
    const response = await updateOrderStatus(id, status, token.value);
    if (response.status !== 200) {
        console.log("Could not update order status");
        console.log(response.message);
    }
    else {
        if (orders.value && response.data?.status) {
            const index = orders.value?.map(order => order._id).indexOf(id);
            if (index >= 0) {
                orders.value[index] = {
                    ...orders.value[index],
                    status: response.data.status,
                }
            }
        }
    }
};

</script>

<template>
    <div class="header">
        <span>Quản lý đơn hàng</span>
    </div>

    <div class="body-container">
        <div class="search-box">
            <label for="_id">ID</label>
            <input type="text" v-model="search._id" id="_id" placeholder="Nhập id đơn hàng">

            <label for="phoneNumber">SĐT</label>
            <input type="text" v-model="search.phoneNumber" id="phoneNumber" placeholder="SĐT khách hàng">

            <label for="status">Tình trạng</label>
            <input type="text" v-model="search.status" id="status" placeholder="Tình trạng đơn hàng">

            <label for="fromDate">Từ ngày</label>
            <input type="text" v-model="search.fromDate" id="fromDate" placeholder="06/09/2024">

            <label for="toDate">Đến ngày</label>
            <input type="text" v-model="search.toDate" id="toDate" placeholder="09/06/2025">
        </div>

        <div v-if="loading" class="temp-text">Đang tải...</div>
        <div v-else-if="error.error" class="temp-text">{{ error.message }}</div>
        <div v-else>
            <div class="order-container" v-if="orders">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>SĐT</th>
                            <th>Tình trạng</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>

                    <tbody v-if="orders">
                        <tr v-for="order in orders">
                            <td>{{ order._id }}</td>
                            <td>{{ order.fullName }}</td>
                            <td>{{ order.phoneNumber }}</td>
                            <td>{{ order.status }}</td>
                            <td>{{ formatDate(order.createdAt) }}</td>
                            <td>{{ order.totalPrice.toLocaleString() }} VNĐ</td>
                            <td>
                                <button v-if="order.status === 'Đang chờ'" class="shipping-btn"
                                    @click="() => updateOrderStatusWrapper(order._id, 'Đang giao')">Đang giao</button>
                                <button v-else="order.status === 'Đang giao'" :disabled="order.status === 'Đã giao'"
                                    class="shipped-btn" @click="() => updateOrderStatusWrapper(order._id, 'Đã giao')">
                                    Đã giao
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <Pagination :page="page" :total-pages="totalPages" @page-change="(new_page) => loadPage(new_page)" />
            </div>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
}

.relative {
    position: relative;
}

.absolute {
    position: absolute;
}

.header {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    border: 1px solid black;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;

    span {
        font-weight: bold;
        font-size: 2rem;
    }
}

.body-container {
    display: flex;
    flex-direction: column;

    .search-box {
        margin: 1rem 0;
        padding: 0 24rem;
        display: grid;
        grid-template-columns: 2fr 5fr;
        gap: 10px;

        * {
            display: block;
        }

        input {
            border-radius: 5px;
            border: 1px solid gray;
            outline: none;
            padding: 5px 15px;

            &:hover {
                outline: 1px solid black;
            }
        }
    }

    .order-container {
        margin-top: 2rem;
        padding: 0 1rem;
        font-family: inherit;
        border-collapse: collapse;

        table {
            width: 100%;
            table-layout: auto;

            * {
                padding: 5px;
            }

            th {
                font-weight: 600;
                text-align: start;
            }

            button {
                width: 100%;
                border-radius: 15px;
                border: none;
                font-weight: bold;
                transition: 0.2s ease;

                &:not(:disabled) {
                    cursor: pointer;
                }

                &:not(:disabled):hover {
                    opacity: 0.7;
                }
            }

            .shipping-btn {
                background: var(--admin-paging-color);
                color: white;
            }

            .shipped-btn {
                background: var(--color-yellow);

                &:disabled {
                    background: var(--light-green);
                    color: white;
                }
            }
        }
    }
}

.temp-text {
    @extend .flex-center;
    font-size: 1.5rem;
    font-weight: bold;
    min-height: 100px;
}
</style>