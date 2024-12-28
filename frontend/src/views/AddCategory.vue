<script lang="ts" setup>
import { postCategory } from '../services/categoryService';
import { onMounted, ref, watch } from 'vue';
import { useSession, useAuth } from '@clerk/vue';
import { useUser } from '@clerk/vue';
import { router } from '../router';

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

const category = ref('');

onMounted(async () => {
    if (session.value)
        token.value = await session.value.getToken({ template: 'test-template' });
    else token.value = await getToken.value({ template: 'test-template' });
});

const submitting = ref(false);
const submit = async () => {
    submitting.value = true;

    const response = await postCategory(category.value, token.value);
    if (response.status === 200 || response.status === 201)
        router.push('/admin/categories');
    else {
        console.log("Failed to post new category");
        if (response.message)
            console.log(response.message);
    }

    submitting.value = false;
};

const canPost = () => {
    return Boolean(!submitting.value && category.value.length);
}

</script>

<template>
    <div v-if="loading" class="temp-text">Đang tải...</div>
    <div v-else-if="error">

    </div>
    <div v-else>
        <form>
            <h1>Thêm danh mục</h1>
            <input type="text" v-model="category" placeholder="Nhập tên danh mục mới">
            <button @click.prevent="submit" :disabled="!canPost()">
                <span :class="{'hidden': submitting}">Đăng danh mục</span>
                <span :class="{'hidden': !submitting}">Đang đăng</span>
            </button>
        </form>
    </div>

</template>

<style lang="scss" scoped>
.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.hidden{
    opacity: 0;
}

form {
    padding: 0 16rem;
    @extend .flex-center;
    flex-direction: column;
    gap: 10px;
    height: 80vh;

    h1 {
        margin-bottom: 1rem;
    }

    button {
        display: grid;
        grid-template-areas: "stack";
        border: none;
        transition: 0.2s ease;
        padding: 0.5rem 1rem;
        font-weight: bold;
        border-radius: 1rem;
        background: var(--ocean-blue);
        color: white;
        margin-top: 10px;

        &:hover {
            opacity: 0.7;
        }

        &:disabled {
            opacity: 0.3;
        }

        * {
            grid-area: stack;
        }
    }

    input[type='text'] {
        padding: 0.5rem 1rem;
        border-radius: 5px;
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