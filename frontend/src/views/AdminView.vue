<script lang="ts" setup>
import AdminNavbar from '../components/AdminNavbar.vue';
import { ref, watch } from 'vue';
import { useUser, useAuth, useSession } from '@clerk/vue';
import AdminOnly from '../components/AdminOnly.vue';

const { user, isLoaded } = useUser();
const { getToken } = useAuth();
const { session } = useSession();
const token = ref<string | null>('');

const loading = ref(!isLoaded.value);
const error = ref(false);
watch(() => isLoaded.value, async () => {
    if (user.value && user.value.publicMetadata.role !== 'admin') {
        error.value = true;
        loading.value = false;
        return;
    }

    if (session.value) {
        token.value = await session.value.getToken({ template: 'test-template' });
    }
    else token.value = await getToken.value({ template: 'test-template' });

    if (!token.value) {
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
        <AdminNavbar :token="token" />
        <RouterView v-slot="{ Component, route }" v-if="!loading">
            <component :is="Component" :token="token" />
        </RouterView>
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