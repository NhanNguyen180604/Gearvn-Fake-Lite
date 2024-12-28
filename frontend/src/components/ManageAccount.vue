<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { getAccounts, deleteAccount } from '../services/accountService';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { type Account } from "../types/accountType";
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

const router = useRouter();
const page = ref(1);
const perPage = 2;
const totalPages = ref(100);
const total = ref(1000);
const accounts = ref<Account[] | null>([]);
const search = ref<string>('');

const fetchData = async (local_page: number, per_page: number) => {
    loading.value = true;
    try {
        const response = await getAccounts(local_page, per_page, search.value, token.value);
        if (response) {
            accounts.value = response.users;
            totalPages.value = response.total_pages;
            total.value = response.total;

            if (response.page !== page.value) {
                page.value = response.page;
            }
            console.log(accounts.value);
        }
        else {
            error.value = {
                error: true,
                message: "Không thể lấy tài khoản",
            }
        }
    } catch (err) {
        error.value = {
            error: true,
            message: "Đã có lỗi, vui lòng thử lại",
        };
    }
    loading.value = false;
};

onMounted(async () => {
    if (session.value)
        token.value = await session.value.getToken({ template: 'test-template' });
    else token.value = await getToken.value({ template: 'test-template' });

    if (!token.value) {
        error.value = {
            error: true,
            message: "Không thể lấy token của admin",
        };
    }
    else {
        await fetchData(page.value, perPage);
    }
});

watch([page, search], () => {
    debounce(() => fetchData(page.value, perPage), 300);
});

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

const deleteAccountWrapper = async (id: string) => {
    const response = await deleteAccount(id, token.value);
};

</script>

<template>
    <div class="header">
        <span>Quản lý sản phẩm</span>
        <button @click="() => router.push('/products/new')">
            Thêm
        </button>
    </div>

    <div v-if="error.error">{{ error.message }}</div>
    <div class="body-container" v-else>
        <div class="toolbar">
            <div class="searchBar">
                <FontAwesomeIcon :icon="faSearch" class="searchIcon" />
                <input type="text" v-model="search" placeholder="Tìm kiếm người dùng">
            </div>
        </div>

        <div v-if="loading" class="temp-text">
            Đang tải...
        </div>
        <div v-else>
            <div v-if="accounts?.length">
                <div class="accountList">
                    <div v-for="account in accounts" class="accountContainer">
                        <div class="accountInfo">
                            <div>ID: {{ account.id }}</div>
                            <div>Tên: {{ account.name }}</div>
                            <div>Role: {{ account.role }}</div>
                        </div>
                        <div class="accountBTN">
                            <button class="deleteBTN">Xóa</button>
                        </div>
                    </div>
                </div>

                <Pagination @page-change="(new_page) => loadPage(new_page)" :page="page" :total-pages="totalPages"
                    :per-page="perPage" />
            </div>
            <div v-else class="temp-text">
                Không có tài khoản
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

    button {
        font-size: 1rem;
        padding: 0 1rem;
        color: white;
        background: var(--ocean-blue);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: 0.2s ease;

        &:hover {
            opacity: 0.7;
        }
    }
}

.body-container {
    .toolbar {
        padding: 1rem;
        display: flex;
        justify-content: space-between;

        .searchBar {
            background: var(--gray);
            width: 70%;
            padding: 0 1rem;
            border-radius: 15px;
            @extend .relative;

            .searchIcon {
                @extend .absolute;
                top: 50%;
                transform: translateY(-50%);
            }

            input {
                line-height: 2rem;
                font-size: 1rem;
                padding: 0 1.5rem;
                border: none;
                outline: none;
                background: none;
                width: calc(100% - 1.5rem);
            }
        }
    }
}

.accountList {
    display: grid;
    grid-template-columns: 1;
    grid-auto-rows: 1fr;
    margin-top: 2rem;
    margin-bottom: 10px;

    .accountContainer {
        display: grid;
        grid-template-columns: auto 200px;
        gap: 20px;
        align-items: center;
        border-bottom: 1px solid var(--grid-line);

        &:first-of-type {
            border-top: 1px solid var(--grid-line);
        }

        .accountInfo {
            cursor: pointer;
            margin-left: 3rem;
        }

        .accountBTN {
            display: flex;
            justify-self: center;
            gap: 10px;

            * {
                font-weight: 500;
                font-size: 1.1rem;
                padding: 8px 12px;
                border-radius: 10px;
                border: none;
                cursor: pointer;
                transition: 0.2s ease;
            }

            *:hover {
                opacity: 0.7;
            }

            .deleteBTN {
                background: var(--color-red);
            }

            .editBTN {
                background: var(--admin-edit-color);
            }
        }
    }
}

.temp-text {
    width: 100%;
    min-height: 300px;
    @extend .flex-center;
    font-size: 1.5rem;
    font-weight: bold;
}
</style>