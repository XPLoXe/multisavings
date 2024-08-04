<template>
    <div>
        <button @click="addMonth" class="btn group">
            <span>Add New Month</span>
            <SvgIcon name="plus" alt="Coffee Icon" :width="24" :height="24" class="group-hover:animate-spin-half" />
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
