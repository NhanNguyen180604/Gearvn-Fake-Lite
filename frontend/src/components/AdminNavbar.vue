<template>
    <nav>
        <RouterLink to="/">Trang chủ</RouterLink>
        <RouterLink to="/admin/products">Quản lý sản phẩm</RouterLink>
        <RouterLink to="/admin/orders">Quản lý đơn hàng</RouterLink>
        <RouterLink to="/admin/accounts">Quản lý tài khoản</RouterLink>
        <RouterLink to="/admin/categories">Quản lý danh mục</RouterLink>
        <RouterLink to="/admin/statistics">Thống kê</RouterLink>
    </nav>
</template>

<style lang="css" scoped>
nav {
    background: var(--admin-header-color);
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

nav a{
    color: white;
    font-size: 1rem;
    padding: 5px 10px;
    margin: 5px;
    border-radius: 10px;
    transition: 0.2s ease;
}

nav a:hover,
nav .router-link-active{
    background: var(--admin-header-current-tab-color);
}

nav .router-link-active{
    color: var(--color-yellow);
}
</style>