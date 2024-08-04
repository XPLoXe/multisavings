<template>
    <div>
        <button @click="addMonth"
            class="px-4 py-2 bg-black  rounded-xl flex flex-row items-center justify-center space-x-4 hover:bg-white hover:text-black">
            <span>Add New Month</span>
            <SvgIcon name="plus" alt="Coffee Icon" :width="24" :height="24" />
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { addNewMonth } from '@/firestoreMethods';

const addMonth = async () => {
    try {
        const newMonthName = prompt("Enter the month name:");
        if (!newMonthName) {
            alert("Month name cannot be empty.");
            return;
        }
        const newMonthId = await addNewMonth(newMonthName);
        console.log('New month added with ID:', newMonthId);
    } catch (error) {
        console.error(error);
        alert('Failed to add month. Please try again.');
    }
    location.reload();
};
</script>

<style scoped></style>
