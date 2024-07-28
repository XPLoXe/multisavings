<template>
    <div ref="dropdown" class="dropdown-container pointer relative inline-block text-left">
        <div>
            <button @click="toggleDropdown"
                class="inline-flex justify-center transition duration-300 ease-in-out w-full rounded-xl border-gray-300 shadow-sm px-4 py-2 bg-black font-medium hover:bg-white hover:text-black focus:outline-none">
                {{ selectedOption }}
                <SvgIcon name="chevron-down" alt="chevron-down" class="ml-4" :isHoverable="true" />
            </button>
        </div>

        <div v-if="open" class="absolute top-8 mt-2 w-56 rounded-xl border border-white shadow-lg bg-black">
            <div class="py-1 overflow-scroll h-64 overflow-x-hidden custom-scrollbar" role="menu"
                aria-orientation="vertical" aria-labelledby="options-menu">
                <button v-for="(option, index) in options" :key="index" @click="selectOption(option)"
                    class="block px-4 py-2 transition duration-300 ease-in-out hover:bg-white hover:text-black w-full text-left">
                    {{ option }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const open = ref(false);
const selectedOption = ref('Select Month');
const options = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October',
    'November', 'December'
];

const dropdown = ref(null);

function toggleDropdown() {
    open.value = !open.value;
}

function selectOption(option: string) {
    selectedOption.value = option;
    open.value = false;
}

function handleClickOutside(event: MouseEvent) {
    if (dropdown.value && !(dropdown.value as HTMLElement).contains(event.target as Node)) {
        open.value = false;
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="pcss">
.dropdown-container {
  @apply flex flex-row justify-center items-center;
}

/* Custom pixel art scrollbar styles */
.custom-scrollbar::-webkit-scrollbar {
  width: 10px; /* Width of the scrollbar */
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: black; /* Background of the scrollbar track */
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: white; /* Color of the scrollbar thumb */
  border: 2px solid black; /* Adds a border around the thumb */
  border-radius: 0; /* Square edges for pixel art look */
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: gray; /* Color of the scrollbar thumb on hover */
}

.custom-scrollbar {
  scrollbar-width: thin; /* Makes the scrollbar thinner */
  scrollbar-color: white black; /* Thumb and track color */
}
</style>
