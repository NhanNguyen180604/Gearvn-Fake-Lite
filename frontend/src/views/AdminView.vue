<script lang="ts" setup>
import AdminNavbar from '../components/AdminNavbar.vue';
import { ref, watch, onMounted } from 'vue';
import { useUser, useAuth, useSession } from '@clerk/vue';
import Restricted from '../components/Restricted.vue';

const { user, isLoaded } = useUser();
const { getToken } = useAuth();
const { session } = useSession();
const token = ref<string | null>('');

const loading = ref(!isLoaded.value);
const error = ref(false);

// every reload will show Restricted even if you are an admin, will reload on tab change
// fucking hell, very spaghetti, kill this shiet as soon as possible
watch(user, async () => {
    await initialize();
})

onMounted(async () => {
    await initialize();
});

const initialize = async () => {
    loading.value = true;
    if (user.value) {
        // navigate admin to their page
        if (user.value.publicMetadata.role !== 'admin') {
            error.value = true;
            loading.value = false;
            return;
        }
        // get user token to pass to pages
        if (session.value)
            token.value = await session.value.getToken({ template: 'test-template' });
        else token.value = await getToken.value({ template: 'test-template' });

        if (!token.value) {
            error.value = true;
        }
        else error.value = false;
    }
    else {
        error.value = true;
    }

    loading.value = false;
};
</script>

<template>
    <div v-if="loading" class="temp-text">Đang tải...</div>
    <div v-else-if="error">
        <Restricted :user="'admin'"/>
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