<script lang="ts" setup>
import { defineProps, defineEmits, toRefs } from 'vue';

const props = defineProps({
    page: {
        type: Number,
        required: true,
        default: 1,
    },
    totalPages: {
        type: Number,
        required: true,
        default: 100,
    },
});

const { totalPages, page } = toRefs(props);

const emit = defineEmits(['pageChange']);

const loadPage = async (new_page: number) => {
    if (new_page <= totalPages.value && new_page > 0 && new_page !== page.value) {
        emit('pageChange', new_page);
    }
};

</script>

<template>
    <div class="pagination-outter">
        <div class="page-item" @click="loadPage(page - 1)" :class="{ disabled: page === 1 }">
            Trang trước
        </div>
        <div class="pagination-container">
            <div v-for="n in totalPages" class="page-item" :class="{ active: n === page }" @click="loadPage(n)">
                {{ n }}
            </div>
        </div>
        <div class="page-item" @click="loadPage(page + 1)" :class="{ disabled: page === totalPages }">
            Trang kế
        </div>
    </div>
</template>

<style lang="scss" scoped>
.pagination-outter,
.pagination-container,
.page-item {
    display: flex;
    justify-content: center;
    align-items: center;
}

.pagination-outter {
    margin: 2rem 0;

    .page-item {
        cursor: pointer;
        font-size: 1rem;
        border: 1px solid var(--dark-gray);
        min-width: 30px;
        padding: 5px;
        min-height: 30px;
        text-align: center;
        color: var(--color-blue);

        &.disabled {
            color: black;
        }

        &.active {
            background: var(--ocean-blue);
            color: white;
        }
    }

    >.page-item:first-of-type {
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
    }

    >.page-item:last-of-type {
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
    }
}
</style>