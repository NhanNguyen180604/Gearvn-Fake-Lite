<template>
  <div>
    <div class="product-detail container">
      <!-- Product Info Section -->
      <div class="row my-4" style="background-color: white;">
        <!-- Image Gallery -->
        <div class="col-md-6">
          <div class="image-gallery">
            <img
              :src="currentImage"
              class="main-image img-fluid"
              alt="Product Image"
            />
            <button
              class="arrow left-arrow"
              @click="prevImage"
              aria-label="Previous Image"
            >
              ◀
            </button>
            <button
              class="arrow right-arrow"
              @click="nextImage"
              aria-label="Next Image"
            >
              ▶
            </button>
          </div>
        </div>

        <!-- Product Details -->
        <div v-if="product" class="col-md-6" style="margin-top: 20px">
          <h1 class="product-title">{{ product.name }}</h1>
          <p class="product-brand">Brand: {{ product.brand }}</p>
          <p class="product-price text-danger">{{ product.price }} đ</p>
          <button
            class="btn btn-danger btn-add-to-cart"
            @click="addToCart(product.id)"
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      <!-- Product Description -->
      <div v-if="product" class="description-section my-4" style="background-color: white; padding: 10px;">
        <h2>Thông tin chi tiết</h2>
        <p>{{ product.description }}</p>
      </div>

      <!-- Similar Products -->
      <div class="similar-products-section my-4" style="background-color: white; padding: 10px">
        <h2>Gợi ý sản phẩm tương tự</h2>
        <div class="d-flex overflow-auto">
          <div
            v-for="similarProduct in similarProducts"
            :key="similarProduct.id"
            class="card mx-2"
            style="width: 200px;"
          >
            <img
              :src="similarProduct.images[0]?.url"
              class="card-img-top"
              alt="Similar Product Image"
            />
            <div class="card-body">
              <h5 class="card-title">{{ similarProduct.name }}</h5>
              <p class="card-text">
                {{ similarProduct.price }} đ<br />
              </p>
              <RouterLink :to="`/products/${similarProduct._id}`" class="product-link">
                <button class="btn btn-primary">Thông tin chi tiết</button>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getProductById, getProducts } from '../services/productService'; // Import services

// Get the product ID from route params
const route = useRoute();

// Product details
const product = ref<any | null>(null); // Product details object
const similarProducts = ref<any[]>([]); // List of similar products
const currentImage = ref<string>(''); // To hold the current image URL for the gallery

// Function to fetch product details by ID
const fetchProductDetails = async () => {
  try {
const productId = route.params._id as string; // Ensure productId is treated as string

    const response = await getProductById(productId); // Call service to fetch product by ID
    product.value = response; // Set product details
    currentImage.value = response.images[0]?.url || ''; // Set the first image as the current image
    await fetchSimilarProducts(response.category); // Fetch similar products based on the category
  } catch (error) {
    console.error('Failed to fetch product details:', error);
  }
};

// Function to fetch similar products by category
const fetchSimilarProducts = async (category: string) => {
  try {
    const response = await getProducts(1, 5, '', category); // Fetch similar products by category
    similarProducts.value = response.products;
  } catch (error) {
    console.error('Failed to fetch similar products:', error);
  }
};

// Load product details and similar products when component is mounted
onMounted(async () => {
  await fetchProductDetails();
});

// Watch for changes in the route and reload data
watch(() => route.params._id, async (newProductId) => {
  // When route changes, fetch new product details and similar products
  await fetchProductDetails(); 
});

// Functions to navigate between product images
const prevImage = () => {
  const currentIndex = product.value.images.findIndex(
    (image: any) => image.url === currentImage.value
  );
  const prevIndex = (currentIndex - 1 + product.value.images.length) % product.value.images.length;
  currentImage.value = product.value.images[prevIndex].url;
};

const nextImage = () => {
  const currentIndex = product.value.images.findIndex(
    (image: any) => image.url === currentImage.value
  );
  const nextIndex = (currentIndex + 1) % product.value.images.length;
  currentImage.value = product.value.images[nextIndex].url;
};

// Add product to cart (assuming you have a cart service)
const addToCart = (productId: string) => {
  // Add product to cart logic here
};
</script>
