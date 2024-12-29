<script lang="ts" setup>
import {computed, ref, onMounted, onBeforeUnmount, watch} from "vue";
import 'primeicons/primeicons.css';
import { SignIn, UserButton } from "@clerk/vue";
import { deleteCart, getCart, putCart } from "../services/cartService";
import { useAuth, useSession } from "@clerk/vue";
const session = useSession();
import { onBeforeRouteLeave, RouterLink } from "vue-router";
const taisaophaithembien = defineProps({
  token: {
      type: String,
      default: null,
  }
})
const loading = ref(true);
  const cartItems = ref([]);
  const cartTotal = computed(() =>
    cartItems.value.reduce((total, item) => 
      total + item.price * item.quantity, 0)
  );

  const increaseQuantity = (index: number) => {
    if (cartItems.value[index].quantity < cartItems.value[index].max) {
      cartItems.value[index].quantity++;
    }
    
  };
  const decreaseQuantity = (index: number) => {
      if (cartItems.value[index].quantity > 1) {
        cartItems.value[index].quantity--;
      }
    };
  const removeItem = (index: number) => {
      cartItems.value.splice(index, 1);
  };
  const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};
const validateQuantity = (index: number) => {
  if (cartItems.value[index].quantity < 1) {
    cartItems.value[index].quantity = 1;
  } else if (cartItems.value[index].quantity > cartItems.value[index].max) {
    cartItems.value[index].quantity = cartItems.value[index].max;
  }
};
  
  onMounted(async () => {
    if(taisaophaithembien.token){
      // await putCart(taisaophaithembien.token, [{_id: "6766551b08f8de2582a52542", quantity:1}, {_id: "67664e3608f8de2582a5247a", quantity:1}])
      const cartResponse = await getCart(taisaophaithembien.token);
      cartItems.value = cartResponse.products.map(product=>({
        _id: product.productID._id,
        image: product.productID.images[0]?.url||"https://via.placeholder.com/150",
        price: product.productID.price,
        name: product.productID.name,
        quantity: product.quantity,
        max: product.productID.stock,
      })); 
    }
    else if(session.value) {
    const savedCart = session.value.publicMetadata.guestCart;
    if (savedCart) {
      cartItems.value = savedCart;
    }
    }
    loading.value = false;
  });
  onBeforeRouteLeave (async (to, from, next) => {
  try {
    if (taisaophaithembien.token) {
      if (cartItems.value.length > 0) {
        await deleteCart(taisaophaithembien.token, true);
        await putCart(taisaophaithembien.token, cartItems.value);
        console.log('Cart updated after changes');
      } else {
        await deleteCart(taisaophaithembien.token, true);
      }
    }
    next();
  } catch (error) {
    console.error('Failed to update cart:', error);
    next();
  }
});
// watch(cartItems, updateCart, { deep: true });
//   const updateCart = async () => {
//   try {
//     if (taisaophaithembien.token) {
//       if (cartItems.value.some(item => item.quantity === "")) {
//         console.log('Quantity is empty, update aborted');
//         return;
//       }
//       if (cartItems.value.length > 0) {
//         loading.value = true;
//         await deleteCart(taisaophaithembien.token, true);
//         await putCart(taisaophaithembien.token, cartItems.value);
//         console.log('Cart updated after changes');
//         loading.value = false;
//       } else {
//         loading.value = true;
//         await deleteCart(taisaophaithembien.token, true);
//         loading.value = false;
//       }
//     }
//   } catch (error) {
//     console.error('Failed to update cart:', error);
//   }
// };
// watch(cartItems, updateCart, { deep: true });
</script>

<template>
  <div class="cart-page">
    <div class="cart-container">
      <h1 class="cart-title">Giỏ hàng <span class="pi pi-cart-plus"></span></h1>

    
      <div v-if="loading" class="loading-spinner">
        <p>Loading... </p>
        <i class="pi pi-spinner pi-spin"></i>            
      </div>
      <!-- Cart Items -->
      <div v-else>
        <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
          <div class="item-details">
            <img :src="item.image" alt="Product Image" class="item-image" />
            <div>
              <h2 class="item-name">{{ item.name }}</h2>
              <p class="item-price">Giá: {{ formatPrice(item.price) }} </p>
            </div>
          </div>
          <div class="item-actions">
            <button @click="decreaseQuantity(index)" class="quantity-btn">-</button>
            <input
              type="number"
              v-model.number="item.quantity"
              min="1"
              max = "2"
              @input="validateQuantity(index)"
              class="quantity-input"
            />
            <button @click="increaseQuantity(index)" class="quantity-btn">+</button>
            <button @click="removeItem(index)" class="remove-btn"><i class="pi pi-times"></i></button>
          </div>
        </div>
        <!-- Empty Cart -->
        <div v-if="cartItems.length === 0" class="empty-cart">
          <p>Your cart is empty.</p>
          <RouterLink to="/" class="go-shopping">Go Shopping</RouterLink>
        </div>
        <!-- Total -->
        <div class="cart-total" v-if="cartItems.length > 0">
          <h3>Tổng tiền: {{ formatPrice(cartTotal) }} </h3>
          <RouterLink to="/payment" class="checkout-btn">Thanh toán ngay</RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>


<style lang="scss" scoped>
$warning: var(--color-red);
.cart-page {
  *{
    box-sizing: border-box;
  }
  background-color: #f9f9f9;
  min-height: 100vh;
  padding: 2rem;

  .loading-spinner {
  font-size: 1.5rem; // Adjust font size as needed
  text-align: center;

  i {
    font-size: 2rem; // Adjust icon size if needed
  }

  p {
    font-size: 1.5rem; // Adjust text size
  }
}
  .cart-container {
    max-width: 50rem;
    margin: 0 auto;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 2rem;

    .cart-title {
      font-size: 1.5rem;
      font-weight: bold;
      text-align: center;
      background-color: $warning;
      color: white;
      padding: 1.5rem;
      border: solid
    }

    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid #e5e5e5;

      .item-details {
        display: flex;
        align-items: center;
        margin: 2rem 0;
        
        .item-check {
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.5rem;
        }

        .item-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          margin-right: 1rem;
        }

        .item-name {
          font-weight: bold;
          font-size: 1rem;
          margin: 0 auto;
        }

        .item-price {
          margin: 0 auto;
          color: #777;
        }
      }

      .item-actions {
        display: flex;
        align-items: center;

        .quantity-btn {
          background: #f1f1f1;
          border: 1px solid #ccc;
          padding: 0.1rem 0.5rem;
          font-size: 1.1rem;
          cursor: pointer;
          &:hover {
            background: #ddd;
          }
        }

        .quantity-input {
          width: 2.5rem;
          padding: 0.1rem;
          text-align: center;
          font-size: 1.1rem;
          border: 1px solid #ccc;
          &::-webkit-outer-spin-button,
          &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          /* Hide spinners - Firefox */
          &[type=number] {
            -moz-appearance: textfield;
          }
        }

        .remove-btn {
          margin-left: 0.5rem;
          background: #f1f1f1;
          border: 1px solid #ccc;
          padding: 0.36rem 0.5rem;
          font-size: 1.1rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center; 
          &:hover {
            background: #ddd;
            color: $warning;
          }
        }
      }
    }

    .cart-total {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 1.2rem;
      font-weight: bold;
      margin-top: 2rem;
      * {
        font-size: inherit;
        font-weight: inherit;
      }

      .checkout-btn {
        text-decoration: none;
        text-align: center;
        padding: 0.5rem 1.5rem;
        background: $warning;
        color: #fff;
        border: none;
        border-radius: 3rem;
        cursor: pointer;
        &:hover {
          background: lighten(red, 20%);
        }
        &:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
      }
    }

    .empty-cart {
      text-align: center;
      color: #777;

      .go-shopping {
        color: #007bff;
        text-decoration: underline;
        &:hover {
          color: #0056b3;
        }
      }
    }
  }
}
</style>
