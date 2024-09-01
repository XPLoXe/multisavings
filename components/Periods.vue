<template>
    <div ref="dropdown" class="relative inline-block text-left dropdown-container pointer">
        <div>
            <button @click="toggleDropdown"
                class="font-medium bg-black border-gray-300 shadow-sm btn group focus:outline-none">
                {{ selectedOption }}
                <SvgIcon name="chevron-down" alt="chevron-down" class="ml-4 group-focus:animate-spin-half"
                    :isHoverable="true" :width="28" :height="28" />
            </button>
        </div>

        <transition name="fade">
            <div v-if="open && periods.length > 0"
                class="absolute mt-2 bg-black border border-white shadow-lg w-72 top-8 rounded-xl">
                <div class="py-1 overflow-scroll overflow-x-hidden max-h-64 custom-scrollbar" role="menu"
                    aria-orientation="vertical" aria-labelledby="options-menu">
                    <button v-for="(option, index) in periods" :key="index" @click="selectOption(option)"
                        class="w-full btn items group">
                        <img src="../assets/img/cursor-hover-right.png"
                            class="finger finger-right group-hover:opacity-100" />
                        {{ option.period }}
                        <img src="../assets/img/cursor-hover-left.png"
                            class="finger finger-left group-hover:opacity-100" />
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineEmits, watch } from 'vue';
import { usePeriodStore } from '~/stores/periods';
import { storeToRefs } from 'pinia';

const props = defineProps({
    periodDeleted: Boolean,
});

const periodStore = usePeriodStore();
const { periods, selectedPeriod } = storeToRefs(periodStore);

const open = ref(false);
const selectedOption = ref('Select Period');
const dropdown = ref(null);

const emit = defineEmits(['selected']);

function toggleDropdown() {
    open.value = !open.value;
}

function selectOption(option: Period) {
    selectedOption.value = option.period;
    periodStore.selectPeriod(option.id);
    open.value = false;
    emit('selected', option);
}

function handleClickOutside(event: MouseEvent) {
    if (dropdown.value && !(dropdown.value as HTMLElement).contains(event.target as Node)) {
        open.value = false;
    }
}

async function loadPeriods() {
    try {
        await periodStore.fetchAllPeriods();
        selectedOption.value = periods.value.length > 0 ? periods.value[0].period : 'Select Period';
        if (selectedOption.value !== 'Select Period') {
            emit('selected', periods.value[0]);
        }
    } catch (error) {
        console.error('Error loading periods:', error);
    }
}

// Watch for periodDeleted prop change
watch(() => props.periodDeleted, (newVal) => {
    if (newVal) {
        loadPeriods();
    }
});

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    loadPeriods(); // Load periods on mount
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="pcss">
.dropdown-container {
  @apply flex flex-row justify-center items-center z-20;
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
  @apply justify-center items-center;
}

.finger {
  @apply w-6 h-6;
  @apply transition-opacity duration-300 opacity-0;
}
.finger-right {
  @apply mr-4;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter, .fade-leave-to {
    opacity: 0;
}

.fade-enter-to, .fade-leave {
    opacity: 1;
}
</style>
