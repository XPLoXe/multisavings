<template>
    <div class="flex flex-col pointer" @click="handleLogin">
        <div class="flex flex-row items-center justify-center">
            <SvgIcon :name="loginIcon" :width="24" :height="24" class="mr-2" />
            <p>{{ buttonText }}</p>
        </div>
        <p v-if="user">Welcome, {{ user.displayName }}</p>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePeriodStore } from '~/stores/periods';
import { auth, signInWithGoogle, signOutUser } from '@/firebase.js'
import { onAuthStateChanged, type User } from 'firebase/auth'

const user = ref<User | null>(null)
const loginIcon = ref('login')
const buttonText = ref('Sign in with Google')
const periodStore = usePeriodStore();

// Update UI based on user authentication state
function updateUI(currentUser: User | null) {
    user.value = currentUser;
    loginIcon.value = currentUser ? 'logout' : 'login'
    buttonText.value = currentUser ? 'Sign out' : 'Sign in with Google'
}

// Sign in with Google
async function handleSignIn() {
    try {
        const currentUser = await signInWithGoogle()
        updateUI(currentUser)
    } catch (error) {
        console.error('Google sign-in failed:', error)
    }
}

// Sign out
async function handleSignOut() {
    try {
        await signOutUser();
        periodStore.clearLocalStorage(); // Clear local storage when signing out
        updateUI(null);
    } catch (error) {
        console.error('Sign-out failed:', error)
    }
}

// Handle login
function handleLogin() {
    if (user.value) {
        handleSignOut()
    } else {
        handleSignIn()
    }
}

// Monitor auth state
onMounted(() => {
    onAuthStateChanged(auth, async (currentUser) => {
        updateUI(currentUser)
        if (user.value) {
            await periodStore.fetchAllPeriods(); // Fetch all periods after login
        }
    });
});
</script>
