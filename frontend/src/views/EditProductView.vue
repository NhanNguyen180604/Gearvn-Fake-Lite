<script lang="ts" setup>
import TwoColumnLayout from '../components/TwoColumnLayout.vue';
import { getProductById, updateProduct, deleteProduct } from '../services/productService';
import { getCategories } from '../services/categoryService';
import { getBrands } from '../services/brandService';
import { type Product, type PreviewImage, type ProductImage } from '../types/productType';
import { type Category } from '../types/categoryType';
import { type Brand } from '../types/brandType';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSession, useAuth } from '@clerk/vue';
import { useUser } from '@clerk/vue';
import Restricted from '../components/Restricted.vue';

const { user, isLoaded } = useUser();
const loading = ref(true);
const error = ref(false);
watch(() => isLoaded.value, () => {
    if (user.value) {
        if (user.value.publicMetadata.role !== 'admin') {
            error.value = true;
            errorMessage.value = 'nuh uh';
        }
    }
    else {
        error.value = true;
        errorMessage.value = 'nuh uh';
    }
    loading.value = false;
});

const { getToken } = useAuth();
const { session } = useSession();
const token = ref<string | null>(null);

const route = useRoute();
const router = useRouter();

// use this to update
const product = ref<Product | null>(null);
const thumbnail = ref<PreviewImage | ProductImage | null>(null);
const images = ref<(PreviewImage | ProductImage)[]>([]);
const deletingImages = ref<string[]>([]);

// use this to reset
const initialProduct = ref<Product | null>(null);
const initialImages = ref<ProductImage[]>([]);

const categories = ref<Category[] | null>(null);
const brands = ref<Brand[] | null>(null);

const errorMessage = ref('');

const initialize = async () => {
    if (!token.value) {
        if (session.value)
            token.value = await session.value.getToken({ template: 'test-template' });
        else token.value = await getToken.value({ template: 'test-template' });
    }

    loading.value = true;
    const response = await getProductById(route.params.id as string);
    if (response) {
        // deepcopy to allow reset
        product.value = { ...response };
        initialProduct.value = { ...response };
        thumbnail.value = response.images[0];
        images.value = [...response.images.slice(1)];
        initialImages.value = [...response.images.slice(1)];
    }
    else {
        error.value = true;
        errorMessage.value = "Không thể lấy dữ liệu sản phẩm";
    }

    const cateResponse = await getCategories();
    if (cateResponse) {
        categories.value = cateResponse;
    }
    else {
        error.value = true;
        errorMessage.value = "Không thể lấy danh sách danh mục";
    }

    const brandResponse = await getBrands();
    if (brandResponse) {
        brands.value = brandResponse;
    }
    else {
        error.value = true;
        errorMessage.value = "Không thể lấy danh sách nhãn";
    }
    loading.value = false;
};

watch(() => route.params.id, async () => {
    await initialize();
}, { deep: true, immediate: true });

const reset = () => {
    if (initialProduct.value)
        product.value = { ...initialProduct.value };
    images.value = [...initialImages.value];
    if (initialProduct.value)
        thumbnail.value = initialProduct.value.images[0];
    deletingImages.value = [];
};

const removeImage = (index: number) => {
    if (index >= 0 && index < images.value.length) {
        if (images.value[index].objectURL)
            URL.revokeObjectURL(images.value[index].objectURL);
        else deletingImages.value.push(images.value[index].publicID);
        images.value = [...images.value.slice(0, index), ...images.value.slice(index + 1)];
    }
}

const handleUploadThumbnail = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && thumbnail.value) {
        if (thumbnail.value.objectURL) {
            // dont be a p*ssy, manage your memory
            URL.revokeObjectURL(thumbnail.value.objectURL);
        }
        else deletingImages.value.push(thumbnail.value.publicID);
        const file = target.files[0];
        thumbnail.value = {
            file: file,
            objectURL: URL.createObjectURL(file)
        };
    }
};

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

const submitting = ref(false);
const submit = async () => {
    if (product.value) {
        submitting.value = true;

        const formData = new FormData();
        formData.append('name', product.value.name);
        formData.append('price', product.value.price.toString());
        formData.append('category', product.value.category);
        formData.append('brand', product.value.brand);
        formData.append('description', product.value.description);
        formData.append('stock', product.value.stock.toString());

        if (thumbnail.value) {
            if (thumbnail.value.objectURL) {
                formData.append('newThumbnail', thumbnail.value.file);
            }
            else formData.append('oldImages', JSON.stringify(thumbnail.value));
        }

        images.value.forEach(image => {
            // if this is newly uploaded image
            if (image.objectURL) {
                formData.append('newImages', image.file);
            }
            // this is old image from our database
            else {
                formData.append('oldImages', JSON.stringify(image));
            }
        });

        deletingImages.value.forEach(image => formData.append('deleting', image));

        const response = await updateProduct(route.params.id as string, formData, token.value);
        if (response.status === 200) {
            // free memory, dont be a p*ssy
            if (thumbnail.value && thumbnail.value.objectURL) {
                URL.revokeObjectURL(thumbnail.value.objectURL);
            }
            images.value.forEach(image => {
                if (image.objectURL)
                    URL.revokeObjectURL(image.objectURL);
            });

            router.push(`/admin/products`);
        }
        else {
            console.log("Failed to update product");
            console.log(response);
        }

        submitting.value = false;
    }
}

const deleting = ref(false);
const deleteProductWrapper = async (id: string) => {
    deleting.value = true;

    if (product.value) {
        const response = await deleteProduct(id, token.value);
        if (response.status === 200) {
            router.push('/admin/products');
        }
        else {
            console.log("Failed to delete product");
            console.log(response);
        }
    }

    deleting.value = false;
}

const canPost = () => {
    return product.value && product.value.name.trim().length
        && categories.value?.some(category => category.name === product.value?.category)
        && brands.value?.some(brand => brand.name === product.value?.brand)
        && product.value.price && product.value.stock
        && product.value.description.trim().length
        && product.value.images.length && !submitting.value && !deleting.value;
};

</script>

<template>
    <div v-if="loading" class="temp-text">Đang tải...</div>
    <div v-else-if="error" class="temp-text">
        <div v-if="errorMessage === 'nuh uh'">
            <Restricted :user="'admin'"/>
        </div>
        <div v-else>
            <div>Đã có lỗi xảy ra trong lúc lấy dữ liệu.</div>
            <div>Vui lòng thử tải lại trang.</div>
            <div>{{ errorMessage }}</div>
        </div>
    </div>
    <TwoColumnLayout tag="form" v-else>
        <template v-slot:title>
            <h1>Chỉnh sửa sản phẩm</h1>
        </template>

        <template v-slot:leftColumn>
            <div class="thumbnail">
                <img :src="thumbnail.url || thumbnail.objectURL" class="img-fluid" v-if="thumbnail">
            </div>
            <label class="uploadFileLabel">
                Chọn ảnh chính mới
                <input type="file" accept=".png, .jpg, .jpeg" @change="handleUploadThumbnail" @click="(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    target.value = '';
                }" :disabled="submitting || deleting">
            </label>

            <div class="otherImages">
                <div v-for="(image, index) in images" :key="`other-image-preview-${index}`">
                    <img :src="image.url || image.objectURL" class="img-fluid">
                    <label @click.prevent="() => removeImage(index)">
                        <FontAwesomeIcon :icon="faXmark" />
                    </label>
                </div>
            </div>
            <label class="uploadFileLabel">
                Thêm các hình ảnh phụ
                <input type="file" multiple accept=".png, .jpg, .jpeg" @change="handleUploadImages" @click="(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    target.value = '';
                }" :disabled="submitting || deleting">
            </label>

            <div class="actionBTNs">
                <button class="resetBTN" @click.prevent="reset" :disabled="submitting || deleting">
                    Xóa các thay đổi
                </button>
                <button class="submitBTN" :disabled="!canPost()" @click.prevent="submit">
                    {{ submitting ? 'Đang cập nhật...' : "Cập nhật sản phẩm" }}
                </button>
                <button class="resetBTN" @click.prevent="async () => {
                    if (product)
                        await deleteProductWrapper(product._id)
                }" :disabled="submitting || deleting">
                    {{ deleting ? 'Đang xóa...' : 'Xóa sản phẩm' }}
                </button>
                <button class="returnBTN" @click.prevent="() => router.push(`/admin/products`)"
                    :disabled="submitting || deleting">
                    Hủy và quay về
                </button>
            </div>
        </template>

        <template v-slot:rightColumn>
            <section>
                <label for="Name">Tên sản phẩm</label>
                <input type="text" v-model="product.name" name="Name" id="Name" v-if="product"
                    :disabled="submitting || deleting">
            </section>

            <section>
                <label for="Price">Giá</label>
                <input type="number" min="1" v-model="product.price" name="Price" id="Price" v-if="product"
                    :disabled="submitting || deleting">
            </section>

            <section>
                <label for="Category">Danh mục</label>
                <select v-model="product.category" name="Category" id="Category" v-if="product"
                    :disabled="submitting || deleting">
                    <option v-for="category in categories" :key="category._id" :value="category.name">
                        {{ category.name }}
                    </option>
                </select>
            </section>

            <section>
                <label for="Brand">Hãng</label>
                <select v-model="product.brand" name="Brand" id="Brand" v-if="product">
                    <option v-for="brand in brands" :key="brand._id" :value="brand.name"
                        :disabled="submitting || deleting">
                        {{ brand.name }}
                    </option>
                </select>
            </section>

            <section>
                <label for="Stock">Số lượng tồn kho</label>
                <input type="number" min="0" v-model="product.stock" name="Stock" id="Stock" v-if="product"
                    :disabled="submitting || deleting">
            </section>

            <section>
                <label for="Description">
                    Mô tả chi tiết
                </label>
                <textarea name="Description" id="Description" v-model="product.description" rows="5"
                    :disabled="submitting || deleting" v-if="product"></textarea>
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