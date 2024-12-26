<script lang="ts" setup>
import AdminNavbar from '../components/AdminNavbar.vue';
import { ref, watch } from 'vue';
import { useUser } from '@clerk/vue';
import AdminOnly from '../components/AdminOnly.vue';

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
})
</script>

<template>
    <div v-if="loading" class="temp-text">Đang tải...</div>
    <div v-else-if="error">
        <AdminOnly />
    </div>
    <div v-else>
        <AdminNavbar />
        <RouterView />
    </div>
</template>

<style lang="scss" scoped>
.temp-text {
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: center;
    align-items: center;
    height: 80vh;
    font-size: 1.5rem;
    font-weight: bold;
}
</style>