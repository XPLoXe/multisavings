<template>
  <div
    class="container bg-black mx-auto rounded-xl text-white min-h-screen flex flex-col max-w-3xl space-y-4 md:space-y-6">
    <div class="flex flex-col justify-center items-center">
      <h1 class="text-3xl pt-6 text-white">Saving Project
        <SvgIcon name="coffee" alt="Coffee Icon" :width="36" :height="36" class="pt-2" />
      </h1>
      <h3 class="text-white pt-6">Manage your savings across multiple accounts</h3>
    </div>
    <div class="flex flex-col justify-center items-center">
      <Accounts />
    </div>
    <div class="flex flex-col justify-center items-center">
      <AddMonth />
    </div>
  </div>
</template>

<script setup lang='ts'>
import Accounts from '~/components/Accounts.vue';
import AddMonth from '@/components/AddMonth.vue';
</script>
