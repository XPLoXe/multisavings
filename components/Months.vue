<template>
    <div class="dropdown-container pointer relative inline-block text-left">
        <div>
            <button @click="toggleDropdown"
                class="inline-flex justify-center transition duration-300 ease-in-out w-full rounded-xl border-gray-300 shadow-sm px-4 py-2 bg-black font-medium hover:bg-white hover:text-black focus:outline-none">
                {{ selectedOption }}
                <SvgIcon name="chevron-down" alt="chevron-down" class="ml-4" :isHoverable="true" />
            </button>
        </div>

        <div v-if="open" class=" absolute top-8  mt-2 w-56 rounded-xl border border-white shadow-lg bg-black">
            <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button v-for="(option, index) in options" :key="index" @click="selectOption(option)"
                    class="block px-4 py-2 transition duration-300 ease-in-out hover:bg-white hover:text-black w-full text-left">
                    {{ option }}
                </button>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
const selectedOption = ref('Select Month');
const options = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October',
    'November', 'December'
];

function toggleDropdown() {
    open.value = !open.value;
}

function selectOption(option: string) {
    selectedOption.value = option;
    open.value = false;
}

</script>


<style lang="pcss">
.dropdown-container {
    @apply flex flex-row justify-center items-center;
}
</style>