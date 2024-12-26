<template>  
    <nav class="navbar px-4">
        <div class="container-fluid d-flex align-items-center">
            <!-- Logo -->
            <div class="d-flex align-items-center">
                <RouterLink to="/" class="text-dark d-flex align-items-center" style="text-decoration: none;">
                    <span style="font-size: 3rem; line-height: 0.7;">⚡</span>
                    <span style="font-weight: bold; color: #007bff; margin-left: 0.7rem;">ĐIỆN TỬ</span>
                </RouterLink>
            </div>
            <!-- Search Bar -->
            <div class="d-flex flex-grow-1 justify-content-center mx-4">
                <form class="d-flex w-75" role="search">
                    <input class="form-control px-4" type="search"
                        placeholder="🔍 Tìm kiếm sản phẩm" v-model="searchInput" />
                </form>
            </div>

            <!-- Right Section -->
            <div class="d-flex align-items-center">
                <RouterLink to="/login" class="btn btn-outline-dark me-2" style="background-color:var(--shop-signin-color)">Đăng nhập</RouterLink>
                <RouterLink to="/register" class="btn btn-dark me-2">Đăng ký</RouterLink>
                <RouterLink to="/cart" class="text-dark d-flex align-items-center me-3">
                    <i class="bi bi-cart3 fs-4"></i>
                    <span class="ms-1">Giỏ hàng</span>
                </RouterLink>
                <RouterLink to="/profile" class="text-dark d-flex align-items-center">
                    <i class="bi bi-person-circle fs-4"></i>
                </RouterLink>
            </div>
        </div>
    </nav>

</template>

<style lang="scss" scoped>
.navbar .container-fluid {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: nowrap;


}
.navbar {
    background-color: var( --shop-header-color); /* Màu nền mới */
}



</style>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            searchInput: '',
            searchResults: [],
        };
    },
    methods: {
        async handleSearch() {
            if (this.searchInput.trim() === '') {
                return; // Ignore empty input
            }

            try {
                const response = await axios.get('/api/search', {
                    params: { query: this.searchInput },
                });
                this.searchResults = response.data; // Store results to display
            } catch (error) {
                console.error('Search error:', error.message);
            }
        },
    },
};
</script>
