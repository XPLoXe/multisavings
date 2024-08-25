<template>
  <div
    class="container bg-black mx-auto rounded-xl text-white min-h-screen flex flex-col md:max-w-3xl space-y-4 md:space-y-6 p-4 md:p-6 relative">
    <!-- Login Button -->
    <div class="absolute top-4 right-4 bg-white text-black rounded-xl px-2 py-1 z-20">
      <Login />
    </div>

    <!-- Title and Subtitle -->
    <div class="flex flex-col justify-center items-center text-center">
      <h1 class="text-2xl md:text-3xl pt-6 text-white mt-10">
        <SvgIcon name="trending-up" alt="Trending Up" :width="30" :height="30" class="pt-2 md:w-9 md:h-9" />
        Multisavings
        <SvgIcon name="coffee-alt" alt="Coffee Icon" :width="30" :height="30" class="pt-2 md:w-9 md:h-9" />
      </h1>
      <h3 class="text-white text-lg md:text-xl pt-4 md:pt-6">Manage your savings across multiple accounts</h3>
      <h4 class="text-white text-base md:text-lg pt-2">Select a period from the dropdown below</h4>
    </div>

    <!-- Accounts Component -->
    <div v-if="user" class="flex flex-col justify-center items-center space-y-4 text-lg md:text-xl w-full">
      <Accounts />
    </div>
    <p class="text-sm mx-auto">All data is encrypted</p>
  </div>
</template>

<script setup lang='ts'>
import Accounts from '~/components/Accounts.vue';
import Login from '~/components/Login.vue';
import { auth } from '@/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

const user = ref<User | null>(null);

onMounted(() => {
  // Listen for authentication state changes
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
  });
});
</script>
