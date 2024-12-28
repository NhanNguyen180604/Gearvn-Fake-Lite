<script lang="ts" setup>
import { defineProps, defineEmits, toRefs, onMounted, ref } from 'vue';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps({
    page: {
        type: Number,
        required: true,
        default: 1,
    },
    perPage: {
        type: Number,
        required: true,
        default: 5,
    },
    totalPages: {
        type: Number,
        required: true,
        default: 100,
    }
});

const { totalPages, page } = toRefs(props);
const pageItemSlice = Math.min(totalPages.value, 5);
const start = ref(page.value);
const end = ref(page.value);

onMounted(() => {
    for (let i = 0; i < pageItemSlice - 1;) {
        if (start.value > 1) {
            i++;
            start.value -= 1;
        }

        if (i >= pageItemSlice)
            break;

        if (end.value < totalPages.value) {
            i++;
            end.value += 1;
        }
    }
});

const emit = defineEmits(['pageChange']);

const loadPage = (new_page: number) => {
    if (new_page <= totalPages.value && new_page > 0 && new_page !== page.value) {
        emit('pageChange', new_page);
    }
};

const goToPage = () => {
    const inputElement = document.getElementById('page-input') as HTMLInputElement;
    emit('pageChange', parseInt(inputElement.value));
};

</script>

<template>
    <div class="pagination-container">
        <a class="page-arrow" :class="{ disabled: page === 1 }" @click="loadPage(page - 1)">
            <FontAwesomeIcon :icon="faAngleLeft" />
        </a>
        <a v-for="n in pageItemSlice" :class="{ active: page === n - 1 + start }" class="page-item"
            @click="loadPage(n - 1 + start)">
            {{ n - 1 + start }}
        </a>
        <a class="page-arrow" :class="{ disabled: page === totalPages }" @click="loadPage(page + 1)">
            <FontAwesomeIcon :icon="faAngleRight" />
        </a>
    </div>
    <div class="navigation">
        <label>Go to page</label>
        <div class="page-input"><input type="number" id="page-input" @keydown="(e: KeyboardEvent) => {
            if (e.key === 'Enter')
                goToPage();
        }"></div>
        <div>of {{ totalPages }}</div>
        <button @click="goToPage">Go</button>
    </div>
</template>

<style lang="scss" scoped>
.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.pagination-container {
    @extend .flex-center;

    >* {
        text-decoration: none;
        border: 1px solid var(--dark-gray);
        @extend .flex-center;
        cursor: pointer;
        min-width: 30px;
        min-height: 30px;
        color: var(--color-blue);
        padding: 5px;

        &.disabled {
            color: black;
        }
    }

    .page-arrow {
        &:first-of-type {
            border-top-left-radius: 15px;
            border-bottom-left-radius: 15px;
        }

        &:last-of-type {
            border-top-right-radius: 15px;
            border-bottom-right-radius: 15px;
        }
    }

    .page-item {
        font-size: 1rem;

        &.disabled {
            color: black;
        }

        &.active {
            background: var(--ocean-blue);
            color: white;
        }
    }
}

.navigation {
    margin-top: 10px;
    @extend .flex-center;
    gap: 5px;

    .page-input {
        width: 30px;
        position: relative;

        input[type='number'] {
            font-family: inherit;
            font-size: 1rem;
            padding: 0;
            width: 100%;
            border: none;
            outline: none;
            text-align: center;
            -moz-appearance: textfield;  // non-standard? should I use this?

            &::-webkit-outer-spin-button,
            &::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
        }

        &::after {
            content: '';
            width: 30px;
            height: 1px;
            background: var(--color-gray);
            position: absolute;
            bottom: -2px;
            left: 0;
        }
    }

    button {
        border: none;
        margin-left: 10px;
        font-family: inherit;
        font-size: 1rem;
        background: var(--ocean-blue);
        color: white;
        padding: 5px 10px;
        border-radius: 10px;
        cursor: pointer;
        transition: 0.2s ease;

        &:hover {
            opacity: 0.7;
        }
    }
}
</style>