<template>
  <div class="com-page">
      <stock></stock>
      </div>
</template>

<script>

import Stock from "../components/charts/Stock.vue";

export default {
  data() {
    return {};
  },
  name:'StockPage',
  components: {
    stock: Stock
  },
};
</script>


<style scoped>
</style>