<template>
    <div>
        <button v-if="!user" @click="handleSignIn">Sign in with Google</button>
        <button v-if="user" @click="handleSignOut">Sign out</button>
        <p v-if="user">Welcome, {{ user.displayName }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { auth, signInWithGoogle, signOutUser } from '@/firebase.js';
import { onAuthStateChanged, type User } from 'firebase/auth';

const user = ref<User | null>(null);

// Sign in with Google
async function handleSignIn() {
    try {
        user.value = await signInWithGoogle();
    } catch (error) {
        console.error('Sign-in failed:', error);
    }
}

// Sign out
async function handleSignOut() {
    try {
        await signOutUser();
        user.value = null;
    } catch (error) {
        console.error('Sign-out failed:', error);
    }
}

// Monitor auth state
onMounted(() => {
    onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
    });
});
</script>
