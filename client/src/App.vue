<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'
import Grid from './components/Grid.vue'
import GridParams from './components/GridParams.vue'

const holdingTouch = ref(false)

const cells: Ref<[]> = ref([])
const cellsWithWall: HTMLElement[] = []
const cellStart: Ref<HTMLElement | undefined> = ref()
const cellEnd: Ref<HTMLElement | undefined> = ref()
// const cellsAvailable: HTMLElement[] = []
const cellsVisited: HTMLElement[] = []

const renderingSolution: Ref<boolean> = ref(false)

const openSet: Ref<GridPoint[]> = ref([])
const closedSet: Ref<GridPoint[]> = ref([])
const path: Ref<GridPoint[]> = ref([])

// const grid: Ref<any[]> = ref(Array.from({ length: rows })) // Array.from({ length: columns })

// interface GridPoint {
//   x: number
//   y: number
//   available: boolean
//   f: number
//   g: number
//   h: number
//   neighbors: GridPoint[]
//   parent?: GridPoint
// }
// function createGridPoint(x: number, y: number): GridPoint {
//   return {
//     x,
//     y,
//     available: true,
//     f: 0,
//     g: 0,
//     h: 0,
//     neighbors: [],
//     parent: undefined,
//   }
// }
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
