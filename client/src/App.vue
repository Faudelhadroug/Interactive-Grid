<script setup lang="ts">
import Grid from './components/Grid.vue'
import GridParams from './components/GridParams.vue'
</script>

<template>
  <div class="bg-blue-300 w-screen">
    <h1 class="font-bold text-3xl select-none text-center py-4">
      Interactive grid
    </h1>
  </div>
  <GridParams />
  <Grid />
</template>

<style>
.wall {
  background-color: rgb(164, 0, 0);
}
.start {
  background-color: rgb(13, 96, 221)
}
.end {
  background-color: rgb(195, 191, 3);
}
.visited {
  background-color: rgb(44, 157, 33)
}

.path {
  background-color: rgb(174, 93, 209)
}
</style>
