<template>
    <div>
        <button @click="addPeriod" class="items-center btn group">
            <span>Add New Period</span>
            <SvgIcon name="plus" alt="Coffee Icon" :width="24" :height="24" class="group-hover:animate-spin-half" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { usePeriodStore } from '~/stores/periods'; // Import the Pinia store

const periodStore = usePeriodStore(); // Use the Pinia store

const addPeriod = async () => {
    try {
        const newPeriodName = prompt("Enter the period name:");
        if (!newPeriodName) {
            alert("Period name cannot be empty.");
            return;
        }
        if (newPeriodName.length > 10) {
            alert("Period name cannot be longer than 10 characters.");
            return;
        }

        await periodStore.createPeriod(newPeriodName);
        console.log('New period added successfully');
    } catch (error) {
        console.error(error);
        alert('Failed to add period. Please try again.');
    } finally {
        location.reload();
    }
};
</script>

<style scoped></style>
