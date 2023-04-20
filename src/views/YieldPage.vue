<template>
  <div class="com-page">
      <yield></yield>
      </div>
</template>

<script>

import Yield from "../components/charts/Yield.vue"

export default {
  data() {
    return {};
  },
  methods: {},
  components: {
    yield:Yield
  },
};
</script>


<style scoped>
</style>