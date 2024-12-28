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
                <form @submit.prevent="handleSearch" class="d-flex w-75" role="search">
                    <input
                        class="form-control px-4"
                        type="search"
                        placeholder="🔍 Tìm kiếm sản phẩm"
                        v-model="searchInput"
                    />
                </form>
            </div>

            <!-- Right Section -->
            <div class="d-flex align-items-center">
                <!-- Hiển thị nếu người dùng chưa đăng nhập -->
                <div v-if="!isLoggedIn" class="d-flex align-items-center">
                    <RouterLink to="/login" class="btn btn-outline-dark me-2"
                        style="background-color:var(--shop-signin-color)">Đăng nhập</RouterLink>
                    <RouterLink to="/register" class="btn btn-dark me-2">Đăng ký</RouterLink>
                    <RouterLink to="/cart" class="text-dark d-flex align-items-center me-3">
                        <i class="bi bi-cart3 fs-4"></i>
                        <span class="ms-1">Giỏ hàng</span>
                    </RouterLink>
                </div>
                <!-- Hiển thị nếu người dùng đã đăng nhập -->
                <div v-else class="d-flex align-items-center">
                    <RouterLink to="/cart" class="text-dark d-flex align-items-center me-3">
                        <i class="bi bi-cart3 fs-4"></i>
                        <span class="ms-1">Giỏ hàng</span>
                    </RouterLink>
                    <RouterLink to="/profile" class="text-dark d-flex align-items-center">
                        <i class="bi bi-person-circle fs-4"></i>
                    </RouterLink>
                </div>
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
    background-color: var(--shop-header-color);
    /* Màu nền mới */
}
</style>

<script lang="ts" setup>
import { useSession, useAuth } from '@clerk/vue';
import { ref, onMounted } from 'vue';

// Clerk hooks
const { getToken } = useAuth();
const { session } = useSession();

// Reactive states
const isLoggedIn = ref(false); // Trạng thái đăng nhập
const token = ref<string | null>(null); // Token xác thực (chuỗi hoặc null)

// Tìm kiếm
const searchInput = ref<string>(''); // Input tìm kiếm (chuỗi)
const searchResults = ref<Array<any>>([]); // Kết quả tìm kiếm (mảng)

// Kiểm tra trạng thái đăng nhập
const checkLoginStatus = async (): Promise<void> => {
    try {
        if (session.value) {
            token.value = await session.value.getToken(); // Nếu session có giá trị
        } else if (getToken.value) {
            token.value = await getToken.value(); // Sử dụng .value để gọi hàm
        }
        isLoggedIn.value = !!token.value; // Gán trạng thái đăng nhập
    } catch (error) {
        console.error('Failed to check login status:', error);
        isLoggedIn.value = false; // Trạng thái không đăng nhập nếu lỗi xảy ra
    }
};

// Tự động kiểm tra trạng thái đăng nhập khi component được mounted
onMounted(async () => {
    await checkLoginStatus();
});

// Xử lý tìm kiếm
const handleSearch = async (): Promise<void> => {
    if (searchInput.value.trim() === '') {
        console.warn('Search input is empty.');
        return;
    }

    try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(searchInput.value)}`, {
            headers: {
                Authorization: `Bearer ${token.value}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Search request failed with status ${response.status}`);
        }
        searchResults.value = await response.json();
    } catch (error) {
        console.error('Search error:', error);
    }
};
</script>

