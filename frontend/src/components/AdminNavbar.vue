<script lang="ts" setup>
import { defineProps, ref, toRef, onMounted } from 'vue';
import { getBalance } from '../services/walletService';
import { useUser, SignedIn, SignOutButton } from '@clerk/vue';

const prop = defineProps({
    token: {
        type: [String, null],
        required: true,
    }
});

const { user } = useUser();
const token = toRef(prop.token);
const balance = ref(0);
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
    <div class="navContainer">
        <nav>
            <RouterLink to="/admin/products">Quản lý sản phẩm</RouterLink>
            <RouterLink to="/admin/orders">Quản lý đơn hàng</RouterLink>
            <RouterLink to="/admin/accounts">Quản lý tài khoản</RouterLink>
            <RouterLink to="/admin/categories">Quản lý danh mục</RouterLink>
            <RouterLink to="/admin/brands">Quản lý hãng sản xuất</RouterLink>
            <RouterLink to="/admin/statistics">Thống kê</RouterLink>
        </nav>

        <div class="balance">
            {{ balance.toLocaleString('vi-VN') }} đ
        </div>

        <SignedIn>
            <SignOutButton>
                <button class="btn btn-outline-dark me-2" style="background-color:var(--shop-signin-color)">
                    Đăng xuất
                </button>
            </SignOutButton>
        </SignedIn>
    </div>

</template>

<style lang="scss" scoped>
.navContainer {
    background: var(--admin-header-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;

    nav {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0 1rem;

        a {
            color: white;
            font-size: 1rem;
            padding: 5px 10px;
            margin: 5px;
            border-radius: 10px;
            transition: 0.2s ease;
            text-decoration: none;

            &:hover,
            &.router-link-active {
                background: var(--admin-header-current-tab-color);
            }
        }

        .router-link-active {
            color: var(--color-yellow);
        }
    }

    .balance {
        margin-right: 20px;
        color: white;
        font-weight: 600;
    }
}
</style>