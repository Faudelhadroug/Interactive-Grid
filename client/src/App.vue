<script setup lang="ts">
import Grid from './components/Grid.vue'
</script>

<template>
  <div class="w-full bg-teal-950 text-slate-100">
    <h1 class="font-bold text-3xl select-none text-center py-4">
      Pathfinder visualizer
    </h1>
  </div>
  <Grid />
</template>

<style>
.wall-bg {
  background-color: rgb(38, 161, 206);
}
.wall {
  background-color: rgb(38, 161, 206);
}
.start-bg {
  background-color: rgb(242, 113, 28);
}
.start {
  animation: start-animation 0.4s ease-in normal;
  background-color: rgb(242, 113, 28);
}
@keyframes start-animation {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 50;

  }
  100% {
    opacity: 100;
  }
}
.end-bg {
  background-color: rgb(255, 205, 0);
}
.end {
  animation: end-animation 0.8s ease-out normal;
  background-color: rgb(255, 205, 0);
}
@keyframes end-animation {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 30;

  }
  100% {
    opacity: 100;
  }
}
.visited-bg {
  background-color: rgb(0, 128, 0);
}
.visited {
  animation: visited-animation 1s ease-in normal;
  background-color: rgb(0, 128, 0);
}
@keyframes visited-animation {
  0% {
    border-radius: 0.25rem;
    background-color: rgb(0, 102, 102);
    transform: scale(0);
  }
  50% {
    border-radius: 0.5rem;
    background-color: rgb(0, 204, 153);
    transform: scale(0.4);
  }
  100% {
    border-radius: 1rem;
    background-color: rgb(0, 128, 0);
    transform: scale(1);
  }
}
.path-bg {
  background-color: rgb(168, 143, 203);
}
.path {
  animation: path-animation 2s ease-in forwards;
  transform: scale(0);
}
@keyframes path-animation {
  0% {
    border-radius: 1rem;
    background-color: rgb(0, 128, 0);
    transform: scale(0);
  }
  50% {
    border-radius: 0.5rem;
    background-color: rgb(102, 51, 153);
    transform: scale(0.4);
  }
  100% {
    border-radius: 0.25rem;
    background-color: rgb(168, 143, 203);
    transform: scale(1);
  }
}
</style>
