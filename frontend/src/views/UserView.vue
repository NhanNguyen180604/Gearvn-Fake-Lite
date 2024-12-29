<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import userHeader from '../components/userHeader.vue'
import { useRouter } from "vue-router";
import { useUser, useAuth, useSession } from '@clerk/vue';

const { getToken } = useAuth();
const { session } = useSession();

const router = useRouter();

const { user } = useUser();
const token = ref('');
const loading = ref(true);

watch(user, async () => {
    await initialize();
});
onMounted(async () => {
    await initialize();
});

const initialize = async () => {
    loading.value = true;

    if (user.value) {
        // navigate admin to their page
        if (user.value.publicMetadata.role === 'admin')
            router.push('/admin/products');

        // get user token to pass to pages
        if (session.value)
            token.value = await session.value.getToken({ template: 'test-template' });
        else token.value = await getToken.value({ template: 'test-template' });
    }

    loading.value = false;
};

</script>

<template>
    <div style="background-color: var(--background-gray)">
        <userHeader />

        <RouterView v-slot="{ Component, route }" v-if="!loading">
            <component :is="Component" :token="token" />
        </RouterView>


    </div>
</template>

<script>
export default {
    name: 'UserView',
}
</script>