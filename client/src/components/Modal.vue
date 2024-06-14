<script setup lang="ts">

</script>

<template>
  <div class="flex fixed overflow-scroll bottom-0 z-40 w-full h-screen py-[4rem] justify-center items-center bg-slate-200/90 ">
    <div class="bg-slate-200 text-teal-950 max-w-[40rem] z-50 absolute top-[0.5rem] m-[1rem] my-[4rem] p-[2rem] border-solid border-red-950 border-[0.3rem] xl:border-[0.65rem] rounded-md">
      <div class="flex justify-between space-x-[1rem] md:space-x-[2.5rem] xl:space-x-[5rem] pb-[1rem]">
        <h2 class="font-bold text-3xl">
          <slot name="title" />
        </h2>
        <slot name="numberSlide" />
        <slot name="closeSVG" />
      </div>
      <p class="pb-[1rem]">
        <slot name="description" />
      </p>
      <slot name="descriptionWithImage" />
      <slot name="descriptionWithImageVertical" />
      <div>
        <slot name="image" />
      </div>
      <div class="flex flex-col sm:flex-row justify-between items-center sm:items-start space-y-[1rem] sm:space-y-0 sm:space-x-[1rem] pt-[2rem]">
        <slot name="button" />
        <div class="space-x-[1rem]  flex flex-wrap justify-center sm:justify-end">
          <slot name="buttonPrev" />
          <slot name="buttonNext" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>
