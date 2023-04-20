<template>
  <div class="com-page">
      <rank></rank>
      </div>
</template>

<script>

import Rank from "../components/charts/Rank.vue";

export default {
  data() {
    return {};
  },
  name:'RankPage',
  components: {
    rank: Rank,
  },
};
</script>


<style scoped>
</style>