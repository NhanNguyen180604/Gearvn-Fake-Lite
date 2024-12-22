<script lang="ts" setup>
import { onMounted } from 'vue';
import AdminNavbar from '../components/AdminNavbar.vue';
import { useRouter } from 'vue-router';
onMounted(() => {
    const router = useRouter();
    router.push('/admin/products');
})
</script>

<template>
    <AdminNavbar />
    <RouterView />
</template>