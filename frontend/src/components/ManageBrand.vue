<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { getBrands, deleteBrand } from '../services/brandService';
import { type Brand } from '../types/brandType';
import { useRouter } from 'vue-router';
import { useSession, useAuth } from '@clerk/vue';

const { getToken } = useAuth();
const { session } = useSession();
const token = ref<string | null>(null);

const router = useRouter();
const loading = ref(true);
const error = ref({
    error: false,
    message: '',
});

const search = ref('');
const realSearch = ref('');
const brands = ref<Brand[]>([]);

const fetchData = async () => {
    loading.value = true;
    try {
        const brandResponse = await getBrands();
        if (brandResponse) {
            brands.value = brandResponse;
        }
        else {
            error.value = {
                error: true,
                message: "Không thể lấy dữ liệu hãng sản xuất",
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
    if (session.value)
        token.value = await session.value.getToken({ template: 'test-template' });
    else token.value = await getToken.value({ template: 'test-template' });

    if (!token.value) {
        error.value = {
            error: true,
            message: "Không thể lấy token của admin",
        };
    }
    else {
        await fetchData();
    }
});

watch([search], () => {
    debounce(() => {
        realSearch.value = search.value;
    }, 300);
});

// i need someone to fix this, might trigger bug
let debounceTimeout: number | undefined;
const debounce = (fn: Function, delay: number) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(fn, delay);
};

const deleteBrandWrapper = async (name: string) => {
    const response = await deleteBrand(name, token.value);
    if (response.status !== 200 || !response.data?.success) {
        console.error("Failed to delete caccount");
        if (response.message)
            console.log(response.message);
    }
    else {
        brands.value = brands.value.filter(brand => brand.name !== name);
    }
};

</script>

<template>
    <div class="header">
        <span>Quản lý hãng sản xuất</span>
        <button @click="() => router.push('/admin/brands/new')">
            Thêm
        </button>
    </div>

    <div v-if="error.error">{{ error.message }}</div>
    <div class="body-container" v-else>
        <div class="toolbar">
            <div class="searchBar">
                <FontAwesomeIcon :icon="faSearch" class="searchIcon" />
                <input type="text" v-model="search" placeholder="Tìm kiếm hãng">
            </div>
        </div>

        <div v-if="loading" class="temp-text">
            Đang tải...
        </div>
        <div v-else>
            <div v-if="brands.length" class="gridContainer">
                <div v-for="brand in brands.filter(brand => brand.name.toLowerCase().match(realSearch.toLowerCase()))">
                    <div class="nameContainer">{{ brand.name }}</div>
                    <div class="btnContainer">
                        <button @click="deleteBrandWrapper(brand.name)">Xóa</button>
                    </div>
                </div>
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
            width: 100%;
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
    }
}

.gridContainer {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    padding: 1rem;

    @media screen and (max-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
    }

    @media screen and (max-width: 500px) {
        grid-template-columns: repeat(2, 1fr);
    }

    >* {
        text-align: center;
        padding: 1rem 0.5rem;
        background-color: var(--background-gray);
        border-radius: 1rem;
    }

    .nameContainer {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
    }

    .btnContainer {
        @extend .flex-center;
        flex-direction: column;
        gap: 5px;
        padding: 5px;

        * {
            width: 100%;
            border: none;
            transition: 0.2s ease;
            font-weight: bold;
            border-radius: 10px;

            &:hover {
                opacity: 0.7;
            }

            &:first-of-type {
                background: var(--color-red);
            }
        }
    }
}

.temp-text {
    width: 100%;
    min-height: 300px;
    @extend .flex-center;
    font-size: 1.5rem;
    font-weight: bold;
}
</style>