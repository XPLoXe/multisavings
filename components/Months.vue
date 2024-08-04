<template>
    <div ref="dropdown" class="dropdown-container pointer relative inline-block text-left">
        <div>
            <button @click="toggleDropdown"
                class="btn group border-gray-300 shadow-sm bg-black font-medium focus:outline-none">
                {{ selectedOption }}
                <SvgIcon name="chevron-down" alt="chevron-down" class="ml-4 group-focus:animate-spin-half"
                    :isHoverable="true" />
            </button>
        </div>

        <div v-if="open" class="absolute top-8 mt-2 w-56 rounded-xl border border-white shadow-lg bg-black">
            <div class="py-1 overflow-scroll max-h-64 overflow-x-hidden custom-scrollbar" role="menu"
                aria-orientation="vertical" aria-labelledby="options-menu">
                <button v-for="(option, index) in options" :key="index" @click="selectOption(option.month)"
                    class="btn items text-left">
                    {{ option.month }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { fetchMonths } from '@/firestoreMethods';

const open = ref(false);
const selectedOption = ref('Select Month');
const options = ref<Month[]>([]);

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

onMounted(async () => {
    document.addEventListener('click', handleClickOutside);

    try {
        const fetchedMonths = await fetchMonths();
        options.value = fetchedMonths.length > 0 ? fetchedMonths : [
            'January', 'February', 'March', 'April', 'May',
            'June', 'July', 'August', 'September', 'October',
            'November', 'December'
        ]; // Default options if none are fetched
    } catch (error) {
        console.error('Error loading months:', error);
    }
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

.items {
  @apply justify-start;
}
</style>
