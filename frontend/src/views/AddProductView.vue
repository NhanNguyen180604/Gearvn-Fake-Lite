<script lang="ts" setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { getCategories } from '../services/categoryService';
import { getBrands } from '../services/brandService';
import { postProduct } from '../services/productService';
import { type Category } from '../types/categoryType';
import { type Brand } from '../types/brandType';
import { type Product, type PreviewImage } from '../types/productType';
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import TwoColumnLayout from '../components/TwoColumnLayout.vue';
import { useSession, useAuth } from '@clerk/vue';
import { useUser } from '@clerk/vue';
import Restricted from '../components/Restricted.vue';

const { user, isLoaded } = useUser();
const loading = ref(!isLoaded.value);
const error = ref(false);
watch(() => isLoaded.value, () => {
    if (user.value) {
        if (user.value.publicMetadata.role !== 'admin') {
            error.value = true;
        }
    }
    else {
        error.value = true;
    }
    loading.value = false;
});

const { getToken } = useAuth();
const { session } = useSession();
const token = ref<string | null>(null);

const router = useRouter();

const categories = ref<Category[] | null>(null);
const brands = ref<Brand[] | null>(null);

onMounted(async () => {
    if (session.value)
        token.value = await session.value.getToken({ template: 'test-template' });
    else token.value = await getToken.value({ template: 'test-template' });

    const cateResponse = await getCategories();
    if (cateResponse) {
        categories.value = cateResponse;
        product.value.category = cateResponse[0].name;
    }
    else {
        console.log("Couldn't get categories");
    }

    const brandResponse = await getBrands();
    if (brandResponse) {
        brands.value = brandResponse;
        product.value.brand = brandResponse[0].name;
    }
    else {
        console.log("Couldn't get brands");
    }
});

const product = ref<Product>({
    _id: '',
    name: '',
    price: 0,
    category: '',
    brand: '',
    description: '',
    stock: 0,
    images: [],  // not using this,
    imagePreviews: [],
});

const thumbnail = ref<PreviewImage | null>(null);
const handleUploadThumbnail = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
        const file = target.files[0];
        if (thumbnail.value) {
            // dont be a p*ssy, manage your memory
            URL.revokeObjectURL(thumbnail.value.objectURL);
        }
        thumbnail.value = {
            file: file,
            objectURL: URL.createObjectURL(file),
        };
    }
};

const images = ref<PreviewImage[]>([]);
const handleUploadImages = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
        for (const file of target.files) {
            images.value.push({
                file: file,
                objectURL: URL.createObjectURL(file),
            });
        }
    }
};

const removeImage = (index: number) => {
    if (index >= 0 && index < images.value.length) {
        URL.revokeObjectURL(images.value[index].objectURL);
        images.value = [...images.value.slice(0, index), ...images.value.slice(index + 1)];
    }
};

const submitting = ref(false);
const submit = async () => {
    submitting.value = true;

    const formData = new FormData();
    formData.append('name', product.value.name);
    formData.append('price', product.value.price.toString());
    formData.append('category', product.value.category);
    formData.append('brand', product.value.brand);
    formData.append('description', product.value.description);
    formData.append('stock', product.value.stock.toString());
    if (thumbnail.value) {
        formData.append('images', thumbnail.value.file);
    }
    images.value.forEach(image => {
        formData.append('images', image.file);
    });


    const response = await postProduct(formData, token.value);
    if (response.status === 201) {
        // free memory, dont be a p*ssy
        if (thumbnail.value) {
            URL.revokeObjectURL(thumbnail.value.objectURL);
        }
        images.value.forEach(image => {
            URL.revokeObjectURL(image.objectURL);
        });

        router.push(`/admin/products`);
    }
    else {
        console.log("Failed to post product");
        console.log(response);
    }

    submitting.value = false;
};

const reset = () => {
    product.value = {
        _id: '',
        name: '',
        price: 0,
        category: categories.value ? categories.value[0].name : '',
        brand: brands.value ? brands.value[0].name : '',
        description: '',
        stock: 0,
        images: [],  // not using this,
        imagePreviews: [],
    };

    if (thumbnail.value) {
        URL.revokeObjectURL(thumbnail.value.objectURL);
        thumbnail.value = null;
    }

    images.value.forEach(image => {
        URL.revokeObjectURL(image.objectURL);
    });
    images.value = [];
};

const canPost = () => {
    return product.value.name.trim().length
        && categories.value?.some(category => category.name === product.value.category)
        && brands.value?.some(brand => brand.name === product.value.brand)
        && product.value.price && product.value.stock
        && product.value.description.trim().length
        && thumbnail.value && !submitting.value;
};

</script>

<template>
    <div v-if="loading" class="temp-text">Đang tải...</div>
    <div v-else-if="error">
        <Restricted :user="'admin'" />
    </div>
    <TwoColumnLayout tag="form" v-else>
        <template v-slot:title>
            <h1>Thêm sản phẩm mới</h1>
        </template>

        <template v-slot:leftColumn>
            <div class="thumbnail">
                <img :src="thumbnail?.objectURL" class="img-fluid">
            </div>
            <label class="uploadFileLabel">
                Thêm hình ảnh chính
                <input type="file" accept=".png, .jpg, .jpeg" :disabled="submitting" @change="handleUploadThumbnail"
                    @click="(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        target.value = '';
                    }">
            </label>

            <div class="otherImages">
                <div v-for="(image, index) in images" :key="`other-image-preview-${index}`">
                    <img :src="image.objectURL" class="img-fluid">
                    <label @click.prevent="removeImage(index)">
                        <FontAwesomeIcon :icon="faXmark" />
                    </label>
                </div>
            </div>
            <label class="uploadFileLabel">
                Thêm các hình ảnh phụ
                <input type="file" multiple accept=".png, .jpg, .jpeg" :disabled="submitting"
                    @change="handleUploadImages" @click="(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        target.value = '';
                    }">
            </label>

            <div class="actionBTNs">
                <button class="resetBTN" @click.prevent="reset" :disabled="submitting">
                    Xóa các thay đổi
                </button>
                <button class="submitBTN" :disabled="!canPost()" @click.prevent="submit">
                    {{ submitting ? 'Đang đăng...' : "Đăng sản phẩm" }}
                </button>
                <button class="returnBTN" @click.prevent="() => router.push(`/admin/products`)" :disabled="submitting">
                    Hủy và quay về
                </button>
            </div>
        </template>

        <template v-slot:rightColumn>
            <section>
                <label for="Name">Tên sản phẩm</label>
                <input type="text" v-model="product.name" name="Name" id="Name" :disabled="submitting">
            </section>

            <section>
                <label for="Price">Giá</label>
                <input type="number" min="1" v-model="product.price" name="Price" id="Price" :disabled="submitting">
            </section>

            <section>
                <label for="Category">Danh mục</label>
                <select v-model="product.category" name="Category" id="Category" :disabled="submitting">
                    <option v-for="category in categories" :key="category._id" :value="category.name">
                        {{ category.name }}
                    </option>
                </select>
            </section>

            <section>
                <label for="Brand">Hãng</label>
                <select v-model="product.brand" name="Brand" id="Brand" :disabled="submitting">
                    <option v-for="brand in brands" :key="brand._id" :value="brand.name">
                        {{ brand.name }}
                    </option>
                </select>
            </section>

            <section>
                <label for="Stock">Số lượng tồn kho</label>
                <input type="number" min="0" v-model="product.stock" name="Stock" id="Stock" :disabled="submitting">
            </section>

            <section>
                <label for="Description">
                    Mô tả chi tiết
                </label>
                <textarea name="Description" id="Description" v-model="product.description" rows="5"
                    :disabled="submitting"></textarea>
            </section>
        </template>
    </TwoColumnLayout>
</template>

<style lang="scss" scoped>
.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.errorMessage {
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
    min-height: 600px;
    @extend .flex-center;
    flex-direction: column;
}

.img-fluid {
    object-fit: contain;
    max-height: 100%;
    max-width: 100%;
}

input[type='file'] {
    display: none;
}

.otherImages,
.thumbnail {
    background: var(--gray);
    min-height: 200px;
    width: 100%;
}

.thumbnail {
    @extend .flex-center;
}

.otherImages {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 1fr;
    gap: 20px;

    >div {
        position: relative;
    }

    label {
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(50%, -50%);
        border: none;
        border-radius: 99px;
        width: 20px;
        height: 20px;
        cursor: pointer;
        background: var(--color-gray);
        color: white;
        @extend .flex-center;
        @extend .hoverStuff;
    }
}

.uploadFileLabel {
    background: var(--ocean-blue);
    color: white;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    transition: 0.2s ease;
    cursor: pointer;
    @extend .hoverStuff;
}

.hoverStuff:hover {
    opacity: 0.7;
}

.description {
    grid-column: 1/3;
}

section {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    font-size: 1rem;

    *:nth-child(2) {
        padding: 1rem;
        margin-top: 5px;
        border-radius: 5px;
        outline: none;
        border: 1px solid black;
        background: var(--gray);
        font-size: 1rem;
        font-family: inherit;

        :hover {
            outline: 1px solid black;
        }
    }

    textarea {
        padding: 1rem;
        font-size: 1rem;
        font-family: inherit;
        resize: vertical;
        border-radius: 5px;
        border: 1px solid black;
    }
}

.actionBTNs {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;

    button {
        padding: 12px 0;
        font-size: 1rem;
        font-family: inherit;
        font-weight: bold;
        transition: 0.2s ease;
        cursor: pointer;
        border: none;
        border-radius: 100px;
    }

    :not(:disabled):hover {
        @extend .hoverStuff;
    }

    .resetBTN {
        background: var(--color-red);
    }

    .submitBTN,
    .returnBTN {
        background: var(--ocean-blue);
        color: white;
    }

    :disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
}

.temp-text {
    @extend .flex-center;
    height: 80vh;
    font-size: 1.5rem;
    font-weight: bold;

    * {
        text-align: center;
    }
}
</style>