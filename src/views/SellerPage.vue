<template>
  <div class="com-page">
      <seller></seller>
      </div>
</template>

<script>

import Seller from "../components/charts/Seller.vue";

export default {
  data() {
    return {};
  },
  name:'SellerPage',
  components: {
    seller: Seller
  },
};
</script>


<style scoped>
</style>