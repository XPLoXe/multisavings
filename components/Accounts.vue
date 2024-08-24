<template>
    <div class="flex flex-col justify-center items-center space-y-6 min-w-[500px]">
        <Periods @selected="fetchAccountsForPeriod" :periodDeleted="periodDeleted" />

        <div class="scrollable-container custom-scrollbar grid grid-cols-2 gap-8 w-full">
            <!-- Account Column -->
            <div class="w-full">
                <button class="btn group w-full flex justify-between items-center bg-black sticky-header"
                    @click="addAccount">
                    <h3 class="font-bold">Account</h3>
                    <SvgIcon name="plus" alt="Add Account" :width="24" :height="24"
                        class="group-hover:animate-spin-half" />
                </button>

                <div v-for="item in selectedPeriod?.accounts" :key="item.id" class="flex items-center py-2">
                    <button class="btn group flex-shrink-0" @click="deleteAccount(item.id)">
                        <SvgIcon name="trash" alt="Delete Account" :width="24" :height="24"
                            class="group-hover:animate-spin-once" />
                    </button>
                    <span class="ml-2 text-xl">{{ item.name }}</span>
                </div>
            </div>

            <!-- Balance Column -->
            <div>
                <button class="btn group w-full flex justify-between items-center bg-black sticky-header"
                    @click="handleBalanceChange">
                    <h3 class="font-bold">Balance</h3>
                    <SvgIcon :name="balanceIcon" alt="See Percentage" :width="24" :height="24"
                        class="group-hover:animate-spin-half" />
                </button>

                <transition-group name="fade" tag="div">
                    <div v-for="item in selectedPeriod?.accounts" :key="item.id"
                        class="flex justify-center items-center py-2">
                        <div class="flex items-center space-x-2">
                            <SvgIcon name="dollar" alt="Account Balance" :width="24" :height="24" />
                            <span class="text-xl">{{ item.amount }}</span>
                        </div>
                        <button class="btn group flex-shrink-0" @click="editAmount(item.id)">
                            <SvgIcon name="edit" alt="Edit Balance" :width="24" :height="24"
                                class="group-hover:animate-spin-once" />
                        </button>
                    </div>
                </transition-group>
            </div>
        </div>
        <div class="flex flex-row pb-10">
            <AddPeriod />
            <!-- delete period -->
            <button class="btn group" @click="deletePeriod">
                <span>Delete Period</span>
                <SvgIcon name="trash" alt="Delete Period" :width="24" :height="24"
                    class="group-hover:animate-spin-half" />
            </button>
        </div>
    </div>
</template>



<script setup lang="ts">
import { ref } from 'vue';
import { fetchPeriodById, addAccountToPeriod, deleteAccountFromPeriod, updateAccountAmount, deletePeriodById, fetchLastCreatedPeriod } from '@/firestoreMethods';
import Periods from './Periods.vue';
import AddPeriod from '~/components/AddPeriod.vue';


const selectedPeriod = ref<Period | null>(null);
const periodDeleted = ref(false); // State to track period deletion

// Fetch accounts for the selected period from Firestore
async function fetchAccountsForPeriod(period: Period) {
    try {
        const periodData = await fetchPeriodById(period.id);
        selectedPeriod.value = periodData;
    } catch (error) {
        console.error('Error fetching period data:', error);
    }
}

// Delete the selected period
async function deletePeriod() {
    if (!selectedPeriod.value) return;

    const confirmDelete = confirm('Are you sure you want to delete this period?');
    if (confirmDelete) {
        try {
            await deletePeriodById(selectedPeriod.value.id);
            periodDeleted.value = true; // Trigger periodDeleted prop in child
        } catch (error) {
            console.error('Error deleting period:', error);
        } finally {
            selectedPeriod.value = await fetchLastCreatedPeriod();
            periodDeleted.value = false; // Reset after handling
        }
    }
}

// Add a new account to the selected period
async function addAccount() {
    if (!selectedPeriod.value) return;

    const accountName = prompt('Enter the account name:');
    const accountAmount = prompt('Enter the account amount:');

    if (accountName && accountAmount) {
        if (accountName.length > 15 || accountAmount.length > 15) {
            alert("Name and Amount cannot be longer than 15 characters.");
            return;
        }
        try {
            const newAccount: Account = {
                id: generateUniqueId(),
                name: accountName,
                amount: parseFloat(accountAmount),
            };
            await addAccountToPeriod(selectedPeriod.value.id, newAccount);
            selectedPeriod.value.accounts.push(newAccount);
        } catch (error) {
            console.error('Error adding new account:', error);
        }
    } else {
        alert('Account name and amount are required.');
    }
}
// Delete an account from the selected period
async function deleteAccount(accountId: string) {
    if (!selectedPeriod.value) return;

    try {
        await deleteAccountFromPeriod(selectedPeriod.value.id, accountId);
        // Remove the account from the local state
        selectedPeriod.value.accounts = selectedPeriod.value.accounts.filter(
            (account) => account.id !== accountId
        );
    } catch (error) {
        console.error('Error deleting account:', error);
    }
}

// Handle the balance change icon
const balanceIcon = ref('dollar');
function handleBalanceChange() {
    balanceIcon.value = balanceIcon.value === 'percent' ? 'dollar' : 'percent';
    // TO Do: Implement the balance change logic
}

// Edit the amount of an existing account
async function editAmount(accountId: string) {
    if (!selectedPeriod.value) return;

    const newAmount = prompt('Enter the new amount:');
    if (newAmount) {
        try {
            const parsedAmount = parseFloat(newAmount);
            await updateAccountAmount(selectedPeriod.value.id, accountId, parsedAmount);
            // Update the local state with the new amount
            const accountToEdit = selectedPeriod.value.accounts.find(account => account.id === accountId);
            if (accountToEdit) {
                accountToEdit.amount = parsedAmount;
            }
        } catch (error) {
            console.error('Error updating account amount:', error);
        }
    } else {
        alert('Amount is required.');
    }
}

// Generate a unique ID for a new account
function generateUniqueId(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
}


</script>

<style scoped lang="pcss">
.grid {
  @apply grid-cols-2 gap-8;
}

/* Sticky header styles */
.sticky-header {
  @apply sticky top-0 z-10; /* Make header sticky and ensure it's above content */
}

.scrollable-container {
  @apply max-h-72 overflow-y-auto mt-4; /* Set max height and enable scrolling */
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
