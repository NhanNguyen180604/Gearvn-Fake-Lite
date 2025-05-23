<template>
  <div v-if="show" class="popup success">
        <i class='pi pi-check-circle'></i>
        <p>Thêm sản phẩm vào giỏ hàng thành công</p>
        <button @click="handleMoveToCart" class= 'success-btn'>Xem giỏ hàng</button>
        <button @click="handleResultClick" class = 'success-btn'>Đóng</button>
  </div>
  <div>
    <div class="product-detail container">
      <!-- Product Info Section -->
      <div class="row my-4" style="background-color: white;">
        <!-- Image Gallery -->
        <div class="col-md-6">
          <div class="image-gallery position-relative">
            <img :src="currentImage" class="main-image img-fluid" alt="Product Image" />
            <button class="arrow left-arrow" @click="prevImage" aria-label="Previous Image">
              ◀
            </button>
            <button class="arrow right-arrow" @click="nextImage" aria-label="Next Image">
              ▶
            </button>
          </div>
        </div>

        <!-- Product Details -->
        <div v-if="product" class="col-md-6" style="margin-top: 20px">
          <h1 class="product-title">{{ product.name }}</h1>
          <p class="product-brand" style="font-size: 30px;">Thương hiệu: {{ product.brand }}</p>
          <p class="card-text flex-grow-1 mb-1" style="color:red">{{ formatPrice(product.price) }}</p>

          <button class="btn btn-danger btn-add-to-cart" @click="addToCart(route.params._id)">
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
          <div v-for="similarProduct in similarProducts" :key="similarProduct.id" class="card mx-2"
            style="width: 200px;">
            <img :src="similarProduct.images[0]?.url" class="card-img-top" alt="Similar Product Image" />
            <div class="card-body d-flex flex-column">
              <h6 class="card-title">{{ similarProduct.name }}</h6>
              <p class="card-text flex-grow-1 mb-1">
                Thương hiệu: {{ similarProduct.brand }}<br />
              </p>
              <p style="color:red">{{ formatPrice(similarProduct.price) }}</p>

              <!-- Chỉnh sửa để nút luôn nằm ở dưới -->
              <div class="mt-auto">
                <RouterLink :to="`/products/${similarProduct._id}`" class="product-link">
                  <button class="btn btn-primary w-100">Thông tin chi tiết</button>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$warning: var(--color-red);
.image-gallery {
  position: relative;
}

.main-image {
  width: 100%;
  /* Ensures image fills the container */
  height: 400px;
  /* Fixed height for consistency */
  object-fit: cover;
  /* Ensures aspect ratio is preserved while filling the space */
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 30px;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 10;
  border-radius: 30%;
}

.left-arrow {
  left: 10px;
}

.right-arrow {
  right: 10px;
}

.arrow:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.card-img-top {
  width: 100%;
  /* Ensures image covers the container */
  height: 200px;
  /* Fixed height for all product images */
  object-fit: cover;
  /* Maintain aspect ratio while covering the space */
}
  .success-btn{
    width: 15rem;
    display: block;
    margin: 0 auto;
    margin-top: 1rem;
    padding: 1rem 3rem;
    border: none;
    border-radius: 3rem;
    font-weight: bold;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
    background-color: green;
    color: white;
    &:hover {
        background-color: lighten(green, 10%);
    }
  }

  .popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 5rem 2rem;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  i{
    display: block;
    font-size: 5rem;
    text-align: center;
    margin-bottom: 2rem;
  }
  p{
    text-align: center;
    font-size: 3rem;
  }
  }
  
  .popup.success {
  border-color: green;
  i{
    color: green;
  }
  }
  
</style>


<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getProductById, getProducts } from '../services/productService'; // Import services
import { putCart } from '../services/cartService';
import { useSession } from '@clerk/vue';
import axios from 'axios';
import { getGuestCart, putGuestCart } from '../services/guestCartService';
import { router } from '../router';

const session = useSession();
axios.defaults.withCredentials = true;
const props = defineProps({
  token: {
    type: String,
    default: null
  }
})
// Get the product ID from route params
const route = useRoute();

// Product details
const product = ref<any | null>(null); // Product details object
const similarProducts = ref<any[]>([]); // List of similar products
const currentImage = ref<string>(''); // To hold the current image URL for the gallery

const show = ref(false);

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
const addToCart = async (productId) => {
  if (props.token) {
    await putCart(props.token, [{ _id: productId, quantity: 1 }]);
  }
  else {
    await putGuestCart([{ _id: productId, quantity: 1 , name: product.value.name, price: product.value.price, max: product.value.stock, image:product.value.images[0]?.url||"https://via.placeholder.com/150"}]); 
  }
  show.value = true;
};
const handleResultClick = () => {
    show.value = false;
};
const handleMoveToCart = () => {
  router.push('/cart');
}
const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + ' đ';
};

</script>
