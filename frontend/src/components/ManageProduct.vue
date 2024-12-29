<script lang="ts" setup>
import { onMounted, ref, toRef, watch } from 'vue';
import { getProducts, deleteProduct } from '../services/productService';
import { type Product } from '../types/productType';
import { type Category } from '../types/categoryType';
import { getCategories } from '../services/categoryService';
import { useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Pagination from './Pagination.vue';

const prop = defineProps({
    token: {
        type: String,
        required: true,
    }
});

const token = toRef(prop.token);

const loading = ref(true);
const error = ref({
    error: false,
    message: '',
});

const router = useRouter();
const products = ref<Product[] | null>(null);
const page = ref(1);
const perPage = 5;
const totalPages = ref(100);
const total = ref(1000);
const search = ref({
    query: '',
    category: '',
    price: -1,
    priceSort: 0,
});
const categories = ref<Category[] | null>(null);

const fetchData = async (local_page: number, per_page: number) => {
    loading.value = true;
    try {
        let minPrice = 0;
        let maxPrice = 999999999;
        switch (search.value.price) {
            case 0:
                maxPrice = 1000000;
                break;
            case 1:
                minPrice = 1000001;
                maxPrice = 5000000;
                break;
            case 2:
                minPrice = 5000001;
                maxPrice = 15000000;
                break;
            case 3:
                minPrice = 15000001;
                break;
        }

        const response = await getProducts(local_page, per_page, search.value.query, search.value.category, minPrice, maxPrice, search.value.priceSort);
        if (response) {
            products.value = response.products;
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
                message: "Không thể dữ liệu sản phẩm",
            };
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
    if (token.value) {
        await fetchData(page.value, perPage);
        const cateResponse = await getCategories();
        if (cateResponse) {
            categories.value = cateResponse;
        }
        else {
            error.value = {
                error: true,
                message: "Không thể lấy dữ liệu danh mục",
            };
        }
    }
    else {
        error.value = {
            error: true,
            message: "Không thể lấy token của admin",
        };
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

const showCateFilter = ref(false);
const setCategoryFilter = (newCate: string) => {
    if (search.value.category !== newCate)
        search.value.category = newCate;
    else search.value.category = '';
    showCateFilter.value = false;
};

const showPriceFilter = ref(false);
const setPriceFilter = (newPriceRange: number) => {
    if (search.value.price !== newPriceRange)
        search.value.price = newPriceRange;
    else search.value.price = -1;
    showPriceFilter.value = false;
};

const showPriceSort = ref(false);
const setPriceSort = (newOrder: number) => {
    if (search.value.priceSort !== newOrder)
        search.value.priceSort = newOrder;
    else search.value.priceSort = 0;
    showPriceSort.value = false;
};

const deleteProductWrapper = async (id: string) => {
    // console.log(id);
    const response = await deleteProduct(id, token.value);
    if (response.status !== 200) {
        console.log('Failed to delete');
        console.log(response.message);
    }
    // update the view
    else {
        if (products.value) {
            products.value = products.value.filter(product => product._id !== id);
        }
    }
}

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
                <input type="text" v-model="search.query" placeholder="Tìm kiếm sản phẩm">
            </div>
            <div class="filters">
                <div class="relative">
                    <button class="toggleBTN" @click="() => showCateFilter = !showCateFilter">Loại</button>
                    <div class="absolute options" v-if="showCateFilter">
                        <div v-for="category in categories" @click="setCategoryFilter(category.name)"
                            :key="category._id" :class="{ active: category.name === search.category }">
                            {{ category.name }}
                        </div>
                    </div>
                </div>
                <div class="relative">
                    <button class="toggleBTN" @click="() => showPriceFilter = !showPriceFilter">Giá</button>
                    <div class="absolute options" v-if="showPriceFilter">
                        <div @click="setPriceFilter(0)" :class="{ active: search.price === 0 }">
                            Dưới 1 triệu
                        </div>
                        <div @click="setPriceFilter(1)" :class="{ active: search.price === 1 }">
                            1 đến 5 triệu
                        </div>
                        <div @click="setPriceFilter(2)" :class="{ active: search.price === 2 }">
                            6 đến 15 triệu
                        </div>
                        <div @click="setPriceFilter(3)" :class="{ active: search.price === 3 }">
                            Trên 15 triệu
                        </div>
                    </div>
                </div>
                <div class="relative">
                    <button class="toggleBTN" @click="() => showPriceSort = !showPriceSort">Sắp xếp</button>
                    <div class="absolute options" v-if="showPriceSort">
                        <div @click="setPriceSort(1)" :class="{ active: search.priceSort === 1 }">
                            Giá tăng dần
                        </div>
                        <div @click="setPriceSort(-1)" :class="{ active: search.priceSort === -1 }">
                            Giá giảm dần
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="loading" class="temp-text">
            Đang tải...
        </div>
        <div v-else>
            <div v-if="products?.length">
                <div class="productList">
                    <div v-for="product in products" :key="product.id" class="productContainer">
                        <div class="productImage" @click="() => router.push(`/products/${product._id}/edit`)">
                            <img :src="product.images[0].url" class="img-fluid">
                        </div>
                        <div class="productInfo" @click="() => router.push(`/products/${product._id}/edit`)">
                            <div>ID: {{ product._id }}</div>
                            <div>Tên sản phẩm: {{ product.name }}</div>
                            <div>Giá: {{ product.price.toLocaleString('vi-VN') }} đ</div>
                            <div>Danh mục: {{ product.category }}</div>
                        </div>
                        <div class="productBTN">
                            <button class="deleteBTN" @click="deleteProductWrapper(product._id)">Xóa</button>
                            <button class="editBTN"
                                @click="() => router.push(`/products/${product._id}/edit`)">Sửa</button>
                        </div>
                    </div>
                </div>

                <Pagination @page-change="(new_page) => loadPage(new_page)" :page="page" :total-pages="totalPages"
                    :per-page="perPage" />
            </div>
            <div v-else class="temp-text">
                Không có sản phẩm
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

        .filters {
            display: flex;
            gap: 10px;

            .toggleBTN {
                border: 1px solid var(--dark-gray);
                border-radius: 10px;
                cursor: pointer;
                padding: 0.5rem 1rem;
                background: var(--light-gray);

                +.options {
                    min-width: 130px;
                    right: 0;
                    top: calc(100% + 5px);
                    z-index: 50;

                    * {
                        text-align: center;
                        background: var(--gray);
                        padding: 0 5px;
                        cursor: pointer;
                        padding: 5px;

                        &:first-child {
                            border-top-left-radius: 10px;
                            border-top-right-radius: 10px;
                        }

                        &:last-child {
                            border-bottom-left-radius: 10px;
                            border-bottom-right-radius: 10px;
                        }

                        &.active {
                            background: var(--ocean-blue);
                            color: white;
                        }

                        &:hover {
                            background: var(--dark-gray);
                        }
                    }
                }
            }
        }
    }
}

.productList {
    display: grid;
    grid-template-columns: 1;
    grid-auto-rows: 1fr;
    margin-top: 2rem;
    margin-bottom: 10px;

    .productContainer {
        display: grid;
        grid-template-columns: 200px auto 200px;
        gap: 20px;
        align-items: center;
        border-bottom: 1px solid var(--grid-line);

        &:first-of-type {
            border-top: 1px solid var(--grid-line);
        }

        .productImage {
            padding: 0 10px;
        }

        .productImage,
        .productInfo {
            cursor: pointer;
        }

        .productBTN {
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

.img-fluid {
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
}

.temp-text {
    width: 100%;
    min-height: 300px;
    @extend .flex-center;
    font-size: 1.5rem;
    font-weight: bold;
}
</style>