<script lang="ts" setup>
import { defineProps } from 'vue';
defineProps({
    tag: {
        type: String,
        required: true,
        default: 'form',
    }
});
</script>

<template>
    <template :is="tag" class="container">
        <header>
            <slot name="title"></slot>
        </header>

        <div class="leftColumn">
            <slot name="leftColumn"></slot>
        </div>

        <div class="rightColumn">
            <slot name="rightColumn"></slot>
        </div>
    </template>
</template>

<style lang="scss" scoped>
.container {
    display: grid;
    gap: 20px;
    grid-template-columns: 4fr 6fr;
    padding: 0 8rem;
    font-family: inherit;

    header {
        grid-column: 1/3;
        text-align: center;
    }

    .leftColumn,
    .rightColumn {
        display: flex;
        flex-direction: column;
    }

    .leftColumn {
        align-items: center;
        gap: 10px;
    }
}
</style>