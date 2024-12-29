<script lang="ts" setup>
import { defineProps, toRef, onMounted } from 'vue';

const props = defineProps({
    token: {
        type: [String, null],
        required: true,
    }
});

const token = toRef(props);
// console.log(token.value.token);

onMounted(async () => {
    
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
            Balance
        </div>
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
    }
}
</style>