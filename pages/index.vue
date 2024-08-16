<template>
  <div
    class="container bg-black mx-auto rounded-xl text-white min-h-screen flex flex-col max-w-3xl space-y-4 md:space-y-6 relative">
    <div class="absolute top-4 right-4 bg-white text-black rounded-xl px-2 py-1">
      <Login />
    </div>
    <div class="flex flex-col justify-center items-center">
      <h1 class="text-3xl pt-6 text-white">Saving Project
        <SvgIcon name="coffee-alt" alt="Coffee Icon" :width="36" :height="36" class="pt-2" />
      </h1>
      <h3 class="text-white pt-6">Manage your savings across multiple accounts</h3>
    </div>
    <div v-if="user" class="flex flex-col justify-center items-center space-y-4">
      <Accounts />
      <AddPeriod />
    </div>
  </div>
</template>

<script setup lang='ts'>
import Accounts from '~/components/Accounts.vue';
import AddPeriod from '~/components/AddPeriod.vue';
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
