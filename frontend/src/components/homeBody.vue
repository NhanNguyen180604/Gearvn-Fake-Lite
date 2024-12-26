<template>
  <div>
    <!-- Danh sách danh mục -->
    <div
      class="category-list d-flex align-items-center gap-2 p-2 bg-light"
      style="border: 1px solid #ddd; border-radius: 8px; margin-top: 10px;"
    >
      <button
        class="btn btn-outline-secondary px-3 py-1 text-nowrap"
        :class="{ 'active-category': activeCategory === 'Tất cả' }"
        @click="filterCategory('Tất cả')"
      >
        Tất cả
      </button>
      <button
        v-for="category in categories"
        :key="category._id"
        class="btn btn-outline-secondary px-3 py-1 text-nowrap"
        :class="{ 'active-category': activeCategory === category.name }"
        @click="filterCategory(category.name)"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- Danh sách sản phẩm theo từng danh mục -->
    <div v-for="(category, index) in filteredCategories" :key="category.title" class="product-carousel my-4"
    style=" margin: 20px">
      <h5 class="d-flex justify-content-between align-items-center">
        {{ category.title }}
        <a :href="`/products?category=${category.title}`" class="text-danger text-decoration-none">Xem thêm</a>
      </h5>

      <!-- Kiểm tra nếu không có sản phẩm -->
      <div v-if="category.products.length === 0" class="alert alert-warning">
      </div>

      <!-- Hiển thị danh sách sản phẩm -->
      <div v-else class="d-flex align-items-center">
        <!-- Nút Trái -->
        <button
          class="btn btn-light border rounded-circle me-2"
          @click="prevPage(index)"
          :disabled="currentPages[index] === 0"
        >
          <i class="bi bi-arrow-left"></i>
        </button>

        <!-- Danh sách sản phẩm -->
        <div class="row row-cols-2 row-cols-md-4 g-3 w-100 overflow-hidden">
          <div
            v-for="(product, pIndex) in paginatedProducts(category.products, index)"
            :key="pIndex"
            class="col"
          >
            <div class="card h-100">
              <img :src="product.images[0].url" class="card-img-top" alt="Hình ảnh sản phẩm" loading="lazy" />
              <div class="card-body d-flex flex-column">
                <h6 class="card-title">{{ product.name }}</h6>
                <p class="card-text mb-1">
                  {{ product.price }} vnđ<br />
                  Thương hiệu: {{ product.brand }} 
                </p>
                <button class="btn btn-primary mt-auto">Thông tin chi tiết</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Nút Phải -->
        <button
          class="btn btn-light border rounded-circle ms-2"
          @click="nextPage(index)"
          :disabled="(currentPages[index] + 1) * itemsPerPage >= category.products.length"
        >
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>

    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  data() {
    return {
      searchQuery: "", // Tìm kiếm tên sản phẩm
      minPrice: null, // Giá tối thiểu
      maxPrice: null, // Giá tối đa
      priceSort: 0, // Sắp xếp giá (0: không, 1: tăng dần, -1: giảm dần)
      activeCategory: "Tất cả", // Danh mục hiện tại
      productsByCategory: [], // Dữ liệu sản phẩm
      filteredCategories: [], // Danh mục đã lọc
      currentPages: [], // Trang hiện tại của từng danh mục
      itemsPerPage: 4, // Số sản phẩm mỗi trang
       categories: [] // <-- Define categories here
    };
  },
  created() {
    this.fetchProducts(); // Lấy danh sách sản phẩm từ API
    this.fetchCategories(); // Lấy danh sách category từ API
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await axios.get("http://localhost:3000/api/categories");
        this.categories = response.data; // Gán dữ liệu danh mục
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    },
    // Lấy danh sách sản phẩm từ API
    async fetchProducts() {
    try {
        this.categories = await this.fetchCategories(); // Lấy danh sách danh mục từ API

        const params = {
        page: 1, // Trang mặc định
        per_page: 100, // Số sản phẩm mỗi trang
        q: this.searchQuery || undefined,
        min_price: this.minPrice || undefined,
        max_price: this.maxPrice || undefined,
        price_sort: this.priceSort || 0,
        };

        const response = await axios.get("http://localhost:3000/api/products", { params });

        // Gán dữ liệu sản phẩm
        this.productsByCategory = response.data.products;

        // Nhóm sản phẩm theo danh mục
        this.filteredCategories = this.mapProductsByCategory(this.productsByCategory);
        this.currentPages = new Array(this.filteredCategories.length).fill(0); // Reset phân trang
    } catch (error) {
        console.error("Failed to fetch products:", error);
    }
    },

    // Nhóm sản phẩm theo danh mục
    mapProductsByCategory(products) {
      const categoryMap = {};

      // Nhóm sản phẩm theo danh mục
      products.forEach((product) => {
        const category = product.category || "Khác"; // Danh mục "Khác" nếu không có danh mục
        if (!categoryMap[category]) {
          categoryMap[category] = { title: category, products: [] };
        }
        categoryMap[category].products.push(product);
      });

      return Object.values(categoryMap); // Chuyển đổi thành mảng
    },

    // Bộ lọc danh mục
     filterCategory(categoryName) {

    this.activeCategory = categoryName; // Gán danh mục đang được chọn

    if (categoryName === "Tất cả") {
        // Nếu chọn "Tất cả", không lọc, hiển thị tất cả sản phẩm
        this.filteredCategories = this.mapProductsByCategory(this.productsByCategory);
    } else {
        // Nếu chọn danh mục cụ thể, lọc theo danh mục đó
        this.filteredCategories = this.mapProductsByCategory(
        this.productsByCategory.filter((product) =>
            product.category.toLowerCase().includes(categoryName.toLowerCase())
        )
        );
    }
    this.resetPagination(); // Reset phân trang khi thay đổi danh mục
    },


    // Reset phân trang
    resetPagination() {
      this.currentPages = new Array(this.filteredCategories.length).fill(0);
    },

    // Sản phẩm phân trang
    paginatedProducts(products, categoryIndex) {
      const start = this.currentPages[categoryIndex] * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return products.slice(start, end);
    },

    // Trang trước
    prevPage(categoryIndex) {
      if (this.currentPages[categoryIndex] > 0) this.currentPages[categoryIndex]--;
    },

    // Trang sau
    nextPage(categoryIndex) {
      if (
        (this.currentPages[categoryIndex] + 1) * this.itemsPerPage <
        this.filteredCategories[categoryIndex].products.length
      )
        this.currentPages[categoryIndex]++;
    },
  },
};
</script>
