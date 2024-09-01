<template>
  <div
    class="container relative flex flex-col min-h-screen p-4 mx-auto space-y-4 text-white bg-black rounded-xl md:max-w-3xl md:space-y-6 md:p-6">
    <!-- Login Button -->
    <div class="absolute z-20 px-2 py-1 text-black bg-white top-4 right-4 rounded-xl">
      <Login />
    </div>

    <!-- Title and Subtitle -->
    <div class="flex flex-col items-center justify-center text-center">
      <h1 class="pt-6 mt-10 text-2xl text-white md:text-3xl">
        <SvgIcon name="trending-up" alt="Trending Up" :width="30" :height="30" class="pt-2 md:w-9 md:h-9" />
        Multisavings
        <SvgIcon name="coffee-alt" alt="Coffee Icon" :width="30" :height="30" class="pt-2 md:w-9 md:h-9" />
      </h1>
      <h3 class="pt-4 text-lg text-white md:text-xl md:pt-6">Manage your savings across multiple accounts</h3>
      <h4 class="pt-2 text-base text-white md:text-lg">
        {{ user ? 'Select a period from the dropdown below' : 'Please login to start managing your accounts' }}
      </h4>
    </div>

    <!-- Accounts Component -->
    <div v-if="user" class="flex flex-col items-center justify-center w-full space-y-4 text-lg md:text-xl">
      <Accounts />
    </div>
    <a href="https://github.com/XPLoXe/multisavings" target="_blank"
      class="flex flex-row items-center justify-center p-4">
      <p class="text-sm ">All cloud stored data is encrypted</p>
      <SvgIcon name="github" alt="github" :width="30" :height="30" class="mx-2 " />
    </a>
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
