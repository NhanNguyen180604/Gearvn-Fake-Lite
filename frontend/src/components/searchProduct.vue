<template>
    <div class="search-results">
        <!-- Tiêu đề hiển thị kết quả tìm kiếm -->
        <h1 class="text-center my-4">Kết quả tìm kiếm: "{{ query }}"</h1>

        <!-- Danh sách sản phẩm -->
        <div v-if="filteredProducts.length > 0" class="products-container">
            <div class="product-list row row-cols-2 row-cols-md-4 g-3">
                <div v-for="product in filteredProducts" :key="product._id" class="col">
                    <div class="card h-100 d-flex flex-column">
                        <img :src="product.images[0].url" class="card-img-top" alt="Hình ảnh sản phẩm" loading="lazy" />
                        <div class="card-body d-flex flex-column">
                            <h6 class="card-title">{{ product.name }}</h6>
                            <p class="card-text flex-grow-1 mb-1">
                                Thương hiệu: {{ product.brand }}<br />
                            </p>
                            <p style="color:red">Giá: {{ formatPrice(product.price) }} </p>
                            <!-- Chỉnh sửa để nút luôn nằm ở dưới -->
                            <div class="mt-auto">
                                <RouterLink :to="`/products/${product._id}`" class="product-link">
                                    <button class="btn btn-primary w-100">Thông tin chi tiết</button>
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Thông báo nếu không tìm thấy sản phẩm -->
        <div v-else class="text-center mt-5">
            <h4>Không tìm thấy sản phẩm nào phù hợp với từ khoá "{{ query }}"</h4>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { getProducts } from "../services/productService"; // Import service

// Truy cập route để lấy query
const route = useRoute();
const query = ref(route.query.query as string); // Nhận query từ URL, sử dụng ref để có thể thay đổi giá trị

// Dữ liệu sản phẩm
const products = ref<Array<any>>([]); // Tất cả sản phẩm

// Lọc sản phẩm dựa trên query
const filteredProducts = computed(() => {
    // Kiểm tra nếu query rỗng, không thực hiện lọc
    if (!query.value.trim()) {
        return products.value;  // Nếu query rỗng, trả về tất cả sản phẩm
    }

    // Lọc sản phẩm theo các tiêu chí: tên, thương hiệu, mô tả và danh mục
    return products.value.filter((product) => {
        const queryLower = query.value.toLowerCase(); // Chuyển query thành chữ thường
        console.log(product.brand.toLowerCase());
        console.log(product.brand.toLowerCase().includes(queryLower));


        // Kiểm tra tên sản phẩm, thương hiệu, mô tả và danh mục có chứa query không
        return (
            product.name.toLowerCase().includes(queryLower) ||  // Tên sản phẩm
            product.brand.toLowerCase().includes(queryLower) || // Thương hiệu sản phẩm
            (product.description && product.description.toLowerCase().includes(queryLower)) || // Mô tả sản phẩm
            (product.category && product.category.toLowerCase().includes(queryLower)) // Danh mục sản phẩm
        );
    });
});


// Hàm lấy danh sách sản phẩm từ dịch vụ
const fetchProducts = async (): Promise<void> => {
    try {
        const response = await getProducts(1, 1000); // Gọi API để lấy tất cả sản phẩm
        products.value = response.products || []; // Lưu sản phẩm vào state
        console.log(response);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        products.value = []; // Nếu lỗi, đặt danh sách sản phẩm rỗng
    }
};

// Hàm format giá tiền
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);
};

// Lấy dữ liệu khi component được mount
onMounted(async () => {
    await fetchProducts(); // Gọi hàm lấy danh sách sản phẩm
});

// Lắng nghe sự thay đổi của query
watch(
    () => route.query.query, // Theo dõi sự thay đổi của query
    (newQuery) => {
        query.value = newQuery as string; // Cập nhật query mới
    }
);
</script>

<style lang="scss" scoped>
.search-results {
    padding: 1rem;
}

.products-container {
    margin-top: 2rem;
}

.card {
    border-radius: 10px;
    overflow: hidden;
}

.card-price {
    font-size: 1.2rem;
}
</style>
