<script setup>
import { computed } from 'vue';
import userHeader from '../components/userHeader.vue'

</script>

<template>
    <div style="background-color: var(--background-gray)">
        <userHeader />

        <RouterView />

        
    </div>
</template>

<script>
export default {
    name: 'UserView',
}
</script>