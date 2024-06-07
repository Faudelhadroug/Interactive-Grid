<script setup lang="ts">
import { useClearWall } from '../composables/grid.ts'
</script>

<template>
  <div>
    <div class="bg-yellow-200 p-[1rem] space-x-[5rem] flex justify-center">
      <button @click="useClearWall()">
        Clear all wall
      </button>
      <!--
      <button @click="clearVisited()">
        Clear visited path
      </button> -->
      <!-- <button @click="randomizeStartAndEnd()">
        Randomize start and end
      </button> -->
      <!-- <button @click="aStarAlgo()">
        A* search algo
      </button>
      <button @click="dijkstraAlgo()">
        Dijkstra algo
      </button>
      <button @click="dfsAlgo()">
        DFS algo
      </button> -->
    </div>
    <div class="bg-red-200 select-none p-[0.5rem] md:p-[3rem]" @touchstart="holdingTouch = true" @touchend="holdingTouch = false" @mouseup="holdingTouch = false" @mousedown="holdingTouch = true">
      <p class="text-center underline text-3xl pb-[1rem]">
        This project is still in developement and is subject to change (Preferably use a desktop)
      </p>
      <div class="flex justify-center space-x-[2rem] pb-[1rem]">
        <p class="flex items-center">
          Start <span class="start w-4 h-4 inline-block ml-1" />
        </p>
        <p class="flex items-center">
          End <span class="end w-4 h-4 inline-block ml-1" />
        </p>
        <p class="flex items-center">
          Wall <span class="wall w-4 h-4 inline-block ml-1" />
        </p>
        <p class="flex items-center">
          Visited  <span class="visited w-4 h-4 inline-block ml-1" />
        </p>
        <p class="flex items-center">
          Path  <span class="path w-4 h-4 inline-block ml-1" />
        </p>
      </div>
    </div>
  </div>
</template>
