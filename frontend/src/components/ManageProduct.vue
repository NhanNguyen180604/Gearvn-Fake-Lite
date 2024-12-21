<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { getProducts, deleteProduct } from '../services/productService';
import { type Product } from '../types/productType';
import { type Category } from '../types/categoryType';
import { getCategories } from '../services/categoryService';

const loading = ref(true);
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
            console.log("Failed to fetch products")
        }

    } catch (error) {
        console.error('Failed to fetch products:', error);
    }
    loading.value = false;
};

onMounted(async () => {
    await fetchData(page.value, perPage);
    const cateResponse = await getCategories();
    if (cateResponse) {
        categories.value = cateResponse;
    }
    else {
        console.log("Failed to fetch categories");
    }
});

watch([page, search], () => {
    debounce(() => fetchData(page.value, perPage), 300);
}, { deep: true });

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
};

const showPriceFilter = ref(false);
const setPriceFilter = (newPriceRange: number) => {
    if (search.value.price !== newPriceRange)
        search.value.price = newPriceRange;
    else search.value.price = -1;
};

const showPriceSort = ref(false);
const setPriceSort = (newOrder: number) => {
    if (search.value.priceSort !== newOrder)
        search.value.priceSort = newOrder;
    else search.value.priceSort = 0;
};

const deleteProductWrapper = async (id: string) => {
    // console.log(id);
    const response = await deleteProduct(id);
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
        <button class="addBTN">
            Thêm
        </button>
    </div>

    <div class="body-container">
        <div class="toolbar">
            <input type="text" v-model="search.query" placeholder="Tìm kiếm sản phẩm">
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
            Loading...
        </div>
        <div v-else>
            <div v-if="products?.length">
                <div class="productList">
                    <div v-for="product in products" :key="product.id" class="productContainer">
                        <div class="productImage">
                            <img :src="product.images[0].url" class="img-fluid">
                        </div>
                        <div class="productInfo">
                            <div>ID: {{ product._id }}</div>
                            <div>Tên sản phẩm: {{ product.name }}</div>
                            <div>Giá: {{ product.price.toLocaleString() }} VNĐ</div>
                            <div>Danh mục: {{ product.category }}</div>
                            <div></div>
                        </div>
                        <div class="productBTN">
                            <button class="deleteBTN" @click="deleteProductWrapper(product._id)">Xóa</button>
                            <button class="editBTN">Sửa</button>
                        </div>
                    </div>
                </div>

                <div class="pagination-outter">
                    <div class="page-item" @click="loadPage(page - 1)">Trang trước</div>
                    <div class="pagination-container">
                        <div v-for="n in totalPages" class="page-item" :class="{ active: n === page }"
                            @click="loadPage(n)">
                            {{ n }}
                        </div>
                    </div>
                    <div class="page-item" @click="loadPage(page + 1)">Trang kế</div>
                </div>
            </div>
            <div v-else class="temp-text">
                No products
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
.relative {
    position: relative;
}

.absolute {
    position: absolute;
}

.header {
    display: flex;
    justify-content: space-between
}

.header {
    padding: 0.5rem 1rem;
    border: 1px solid black;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
}

.header span {
    font-weight: bold;
    font-size: 2rem;
}

.body-container {
    border: 1px solid black;
    border-top: none;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
}

.toolbar {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
}

input[type='text'] {
    line-height: 2rem;
    font-size: 1rem;
    padding: 0 1.5rem;
    border-radius: 15px;
    border: none;
    outline: none;
    background: var(--gray);
    width: 50%;
}

.filters {
    display: flex;
    gap: 10px;
}

.filters .toggleBTN {
    border: 1px solid var(--dark-gray);
    border-radius: 10px;
    cursor: pointer;
    padding: 0.5rem 1rem;
    background: var(--light-gray);
}

.options {
    min-width: 130px;
    right: 0;
    top: calc(100% + 5px);
    z-index: 50;
}

.options * {
    text-align: center;
    background: var(--gray);
    padding: 0 5px;
    cursor: pointer;
    padding: 5px;
}

.options *:first-child {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.options *:last-child {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
}

.options *.active {
    background: var(--ocean-blue);
    color: white;
}

.options *:hover {
    background: var(--dark-gray);
}

.addBTN {
    font-size: 1rem;
    padding: 0 1rem;
    color: white;
    background: var(--ocean-blue);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.2s ease;
}

.addBTN:hover {
    opacity: 0.7;
}

.productList {
    display: grid;
    grid-template-columns: 1;
    grid-auto-rows: 1fr;
}

.productContainer {
    display: grid;
    grid-template-columns: 200px auto 200px;
    gap: 10px;
    align-items: center;
}

.img-fluid {
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
}

.productBTN {
    display: flex;
    gap: 10px;
}

.productBTN * {
    font-weight: 500;
    font-size: 1.1rem;
    padding: 8px 12px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: 0.2s ease;
}

.deleteBTN {
    background: var(--light-red);
}

.editBTN {
    background: var(--sky-blue);
}

.productBTN *:hover {
    opacity: 0.7;
}

.pagination-outter,
.pagination-container,
.page-item {
    display: flex;
    justify-content: center;
}

.pagination-outter {
    margin-bottom: 2rem;
}

.page-item {
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
    border: 1px solid var(--dark-gray);
    min-width: 30px;
    padding: 5px;
    min-height: 30px;
    text-align: center;
}

.page-item.active {
    background: var(--ocean-blue);
    color: white;
}

.pagination-outter>.page-item:first-of-type {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
}

.pagination-outter>.page-item:last-of-type {
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}

.temp-text{
    width: 100%;
    min-height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    font-weight: bold;
}
</style>