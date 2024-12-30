<template>

  <div>
    <h3 class="text-center mt-4">Thống kê doanh thu</h3>

    <!-- Bộ lọc khoảng thời gian -->
    <div class="filters my-3 d-flex justify-content-center gap-3">
      <div>
        <label for="fromDate">Từ ngày:</label>
        <input type="text" id="fromDate" v-model="filters.fromDate" class="form-control" />
      </div>
      <div>
        <label for="toDate">Đến ngày:</label>
        <input type="text" id="toDate" v-model="filters.toDate" class="form-control" />
      </div>
      <button class="btn btn-primary mt-4" @click="fetchRevenueData">Xem thống kê</button>
    </div>

    <!-- Biểu đồ -->
    <div v-if="chartData">
      <div class="chart-container">
        <!-- Use the 'Bar' component here -->
        <Bar :chart-data="chartData" :options="chartOptions" />
      </div>
    </div>
    <div v-else class="alert alert-info text-center mt-4">
      Không có dữ liệu để hiển thị.
    </div>
  </div>
  


</template>


<script lang="ts" setup>
import { ref, toRef, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import { getOrders } from "../services/orderService"; // Thay bằng đường dẫn thực tế của bạn

import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const filters = ref({
  fromDate: "", // Default value will be set in onMounted
  toDate: "", // Default value will be set in onMounted
});

const props = defineProps({
  token: {
    type: String,
    required: true,
  },
});

const token = toRef(props, 'token');
const loading = ref(true);
const error = ref({
  error: false,
  message: '',
});

const chartData = ref({
  labels: [] as string[],
  datasets: [
    {
      label: "Doanh thu (VND)",
      backgroundColor: "#42a5f5",
      data: [] as number[],
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false, // This allows resizing the chart
  plugins: {
    legend: {
      position: 'top',
    },
  },
  aspectRatio: 2, // This will control the aspect ratio of the chart
});

const fetchRevenueData = async () => {
  try {
    loading.value = true;

    const fromDate = filters.value.fromDate;
    const toDate = filters.value.toDate;
    const response = await getOrders(1, 1000, '', '', '', fromDate, toDate, token.value);
    console.log(response);
    if (!response) {
      alert("Không thể lấy dữ liệu");
      return;
    }

    const orders = response.orders;

    // Tổng hợp doanh thu theo ngày
    const revenueByDate: { [date: string]: number } = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString("vi-VN");
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      revenueByDate[date] += order.totalPrice;
    });

    // Cập nhật dữ liệu biểu đồ
    chartData.value.labels = Object.keys(revenueByDate);
    chartData.value.datasets[0].data = Object.values(revenueByDate);
    console.log(chartData.value.datasets[0].data);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
  }
};

// Set default values for fromDate and toDate when the component mounts
onMounted(() => {
  filters.value.fromDate = "23/12/2024"; // Set a default 'from date'
  filters.value.toDate = "24/12/2024"; // Set default 'to date' to today
  fetchRevenueData();
});
</script>

<style scoped>
.filters {
  margin: 20px auto;
}

.chart-container {
  position: relative;
  height: 300px;
  /* Adjust this height value as needed */
  width: 100%;
  /* Ensure it scales to the container's width */
  max-width: 800px;
  /* Optional: Limit the width of the chart */
  margin: 0 auto;
  /* Center the chart container */
}
</style>
