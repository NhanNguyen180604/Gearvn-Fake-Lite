
<template>
  <div style="background-color:white; margin:30px">
    <div>
        <!-- Bộ lọc -->
        <div class="filters d-flex justify-content-between align-items-center mb-4">
            <!-- Bộ lọc danh mục -->
            <div>
                <button class="btn custom-btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                Danh mục
                </button>
                <ul class="dropdown-menu">
                <li><button class="dropdown-item" @click="filterByCategory('Tất cả')">Tất cả</button></li>
                <li v-for="category in categories" :key="category._id">
                    <button class="dropdown-item" @click="filterByCategory(category.name)">{{ category.name }}</button>
                </li>
                </ul>
            </div>

            <!-- Bộ lọc giá -->
            <div>
                <button class="btn custom-btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                Giá
                </button>
                <ul class="dropdown-menu">
                <li><button class="dropdown-item" @click="filterByPrice(0, null)">Tất cả</button></li>
                <li><button class="dropdown-item" @click="filterByPrice(0, 500000)">Dưới 500k</button></li>
                <li><button class="dropdown-item" @click="filterByPrice(500000, 1000000)">500k - 1 triệu</button></li>
                <li><button class="dropdown-item" @click="filterByPrice(1000000, 3000000)">1 triệu - 3 triệu</button></li>
                <li><button class="dropdown-item" @click="filterByPrice(3000000, 7000000)">3 triệu - 7 triệu</button></li>
                <li><button class="dropdown-item" @click="filterByPrice(1000000, null)">Trên 7 triệu</button></li>
                </ul>
            </div>

            <!-- Bộ lọc thương hiệu -->
            <div>
                <button class="btn custom-btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                Thương hiệu
                </button>
                <ul class="dropdown-menu">
                <li>
                  <button class="dropdown-item" @click="filterByBrand('Tất cả')">Tất cả</button>
                </li>
                <li v-for="brand in brands" :key="brand">
                    <button class="dropdown-item" @click="filterByBrand(brand)">{{ brand }}</button>
                </li>

                </ul>
            </div>

            <!-- Sắp xếp -->
            <div>
                <button class="btn custom-btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                Sắp xếp
                </button>
                <ul class="dropdown-menu">
                <li><button class="dropdown-item" @click="sortByPrice(1)">Giá tăng dần</button></li>
                <li><button class="dropdown-item" @click="sortByPrice(-1)">Giá giảm dần</button></li>
                </ul>
            </div>
        </div>

        <!-- Danh sách sản phẩm -->
        <div class="product-list row row-cols-2 row-cols-md-4 g-3">
            <div v-for="product in filteredProducts" :key="product._id" class="col">
                <div class="card h-100">
                <img :src="product.images[0]?.url" class="card-img-top" alt="Hình ảnh sản phẩm" />
                <div class="card-body">
                    <h6 class="card-title">{{ product.name }}</h6>
                    <p class="card-text">{{ product.price }} VND</p>
                    <p class="card-text">Thương hiệu: {{ product.brand }}</p>
                    <button class="btn btn-primary">Mua ngay</button>
                </div>
                </div>
            </div>
        </div>

        <!-- Component phân trang -->
        <Pagination
        :page="page"
        :totalPages="totalPages"
        @page-change="(new_page) => loadPage(new_page)" 
        />
    </div>
  </div>
</template>


<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import Pagination from './Pagination.vue'; // Import the Pagination component
import { getProducts } from '../services/productService'; // Import the service

// Define the props for Pagination component
const page = ref(1);
const perPage = 12;
const totalPages = ref(1);

const categories = ref<any[]>([]);
const products = ref<any[]>([]);
const brands = ref<string[]>([]);
const activeCategory = ref<string>('Tất cả');
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const activeBrand = ref<string | null>(null);
const priceSort = ref<number>(0);

// Fetch data on mount
onMounted(() => {
  loadInitialData();
});

// Computed property for filtered products
// Tính toán lại tổng số trang mỗi khi danh sách sản phẩm thay đổi
const filteredProducts = computed(() => {
  const filtered = products.value.filter((product) => {
    let brandMatch = activeBrand.value ? product.brand === activeBrand.value : true;
    if (activeBrand.value == '') brandMatch = true;
    return brandMatch;
  });

  // Cập nhật totalPages sau khi lọc sản phẩm
  totalPages.value = Math.ceil(filtered.length / perPage);
  return filtered;
});


// Function to load initial data
const loadInitialData = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  activeCategory.value = urlParams.get('category') || 'Tất cả';
  await fetchCategories();
  await fetchProducts();
};

// Function to fetch categories
const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/categories');
    if (response.ok) {
      categories.value = await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
  }
};

// Function to fetch products based on filters and pagination
const fetchProducts = async () => {
  const category = activeCategory.value !== 'Tất cả' ? activeCategory.value : '';
  const min = minPrice.value ?? 0;
  const max = maxPrice.value ?? 999999999;

  try {
    const response = await getProducts(page.value, perPage, '', category, min, max, priceSort.value);
    if (response) {
      products.value = response.products;
      totalPages.value = Math.ceil(response.total / perPage); // Calculate total pages based on the response
      brands.value = [...new Set(response.products.map((product: any) => product.brand))]; // Unique brands
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};

// Handle page change event
const loadPage = async (newPage: number) => {
  if (newPage <= totalPages.value && newPage > 0 && newPage !== page.value) {
    page.value = newPage;
    await fetchProducts(); // Fetch products for the new page
  }
};

// Filter methods
const filterByCategory = (categoryName: string) => {
  activeCategory.value = categoryName;
  if (categoryName==='Tất cả')
    activeBrand.value='';
  page.value = 1; // Reset to page 1 when filter is applied
  fetchProducts();
};

const filterByPrice = (min: number | null, max: number | null) => {
  minPrice.value = min;
  maxPrice.value = max;
  page.value = 1; // Reset to page 1 when filter is applied
  fetchProducts();
};

const filterByBrand = (brandName: string) => {
  activeBrand.value= brandName==="Tất cả" ? '':brandName;
  console.log(activeBrand.value);

  page.value = 1; // Reset to page 1 when filter is applied
  fetchProducts();

};

const sortByPrice = (order: number) => {
  priceSort.value = order;
  page.value = 1; // Reset to page 1 when sort is applied
  fetchProducts();
};
</script>



<style scoped>
.filters {
  margin-bottom: 1.5rem;
}

.custom-btn {
  background-color: #007bff; /* Blue background */
  color: white;
  border-color: #007bff; /* Border matching button */
  transition: background-color 0.3s, color 0.3s; /* Smooth transition */
}

.custom-btn:hover {
  background-color: #0056b3; /* Darker blue on hover */
  color: #fff;
  border-color: #0056b3;
}

.custom-btn:focus {
  box-shadow: none; /* Remove default focus shadow */
}

.dropdown-menu {
  border-radius: 8px;
}

.dropdown-item:hover {
  background-color: #f8f9fa; /* Light gray background for items */
}

.filters {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-end; /* Align the filters to the right */
  gap: 15px; /* Space between filter buttons */
}

</style>