<template>
    <div class="temp-text">
        <div>Chỉ có admin mới được quyền truy cập nội dung này</div>
        <RouterLink to="/">Quay về</RouterLink>
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

    a {
        cursor: pointer;
        border: none;
        padding: 5px 15px;
        font-size: 1.2rem;
        border-radius: 10px;
        background: var(--ocean-blue);
        color: white;
        text-decoration: none;
    }
}
</style>