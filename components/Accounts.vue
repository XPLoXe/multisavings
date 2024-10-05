<template>
    <div class="flex flex-col justify-center items-center space-y-6 md:min-w-[500px]">
        <Periods @selected="selectPeriod" :periodDeleted="periodDeleted" />

        <div class="grid w-full grid-cols-2 scrollable-container custom-scrollbar md:gap-8">
            <!-- Account Column -->
            <div class="w-full">
                <button class="flex items-center justify-between w-full bg-black btn group sticky-header"
                    @click="addAccount">
                    <h3 class="font-bold">Account</h3>
                    <SvgIcon name="plus" alt="Add Account" :width="24" :height="24"
                        class="group-hover:animate-spin-half" />
                </button>

                <div v-for="item in selectedPeriod?.accounts" :key="item.id" class="flex items-center py-2">
                    <button class="flex-shrink-0 btn group" @click="deleteAccount(item.id)">
                        <SvgIcon name="trash" alt="Delete Account" :width="24" :height="24"
                            class="group-hover:animate-spin-once" />
                    </button>
                    <span class="block ml-2 overflow-hidden md:text-xl whitespace-nowrap text-ellipsis">
                        {{ item.name }}
                    </span>
                </div>
            </div>

            <!-- Balance Column -->
            <div>
                <button class="flex items-center justify-between w-full py-4 bg-black btn group sticky-header"
                    @click="handleBalanceChange">
                    <h3 class="font-bold">Balance</h3>
                    <SvgIcon :name="balanceIcon" alt="See Percentage" :width="24" :height="24"
                        class="group-hover:animate-spin-half" />
                </button>

                <transition-group name="fade" tag="div">
                    <div v-for="item in selectedPeriod?.accounts" :key="item.id"
                        class="flex items-center justify-center py-2">
                        <div class="flex items-center space-x-2">
                            <SvgIcon :name="balanceIcon" alt="Account Balance" :width="24" :height="24" />
                            <span class="md:text-xl">{{ balanceIcon === 'dollar' ? item.amount :
                                formatPercentage(item.percentage)
                                }}</span>
                        </div>
                        <button class="flex-shrink-0 btn group" @click="editAmount(item.id)">
                            <SvgIcon name="edit" alt="Edit Balance" :width="24" :height="24"
                                class="group-hover:animate-spin-once" />
                        </button>
                    </div>
                </transition-group>
            </div>
        </div>

        <!-- Fixed Total Amount at the bottom -->
        <div class="flex items-center justify-center w-full py-4 text-xl text-white bg-black sticky-footer">
            <span class="pr-2">Total: </span>
            <SvgIcon :name="balanceIcon" alt="Account Balance" :width="24" :height="24" />
            <span>{{ balanceIcon === 'dollar' ? totalAmount : formatPercentage(totalPercentage) }}</span>
        </div>

        <div class="flex flex-row pb-5">
            <AddPeriod />
            <!-- delete period -->
            <button class="items-center btn group" @click="deletePeriod">
                <span>Delete Period</span>
                <SvgIcon name="trash" alt="Delete Period" :width="24" :height="24"
                    class="group-hover:animate-spin-once" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePeriodStore } from '~/stores/periods'; // Import the Pinia store
import { storeToRefs } from 'pinia';
import Periods from './Periods.vue';
import AddPeriod from '~/components/AddPeriod.vue';

// Get the store and its state/actions
const periodStore = usePeriodStore();
const { selectedPeriod } = storeToRefs(periodStore);

// State to track period deletion
const periodDeleted = ref(false);

// Computed property to calculate total amount
const totalAmount = computed(() => {
    return selectedPeriod?.value?.accounts.reduce((sum, account) => sum + account.amount, 0) || 0;
});

function formatPercentage(value: number | undefined | null): string {
    if (value === undefined || value === null || isNaN(value)) return '-';
    return `${value.toFixed(2)}%`;
}

// Computed property to calculate the total percentage change
const totalPercentage = computed(() => {
    if (!selectedPeriod.value || selectedPeriod.value.accounts.length === 0) return 0;

    // Calculate the current total amount
    const currentTotal = selectedPeriod.value.accounts.reduce((sum, account) => sum + account.amount, 0);

    // Calculate the sum of all original amounts using `baseValue`, ignoring newly added accounts
    const previousTotal = selectedPeriod.value.accounts.reduce((sum, account) => {
        // If `percentage` is `null`, it means the account was newly added in the current period
        if (account.percentage === null) return sum;
        const baseValue = account.baseValue ?? account.amount;
        return sum + baseValue;
    }, 0);

    // Calculate the total percentage change using absolute value of previous total
    return previousTotal !== 0 ? ((currentTotal - previousTotal) / Math.abs(previousTotal)) * 100 : 0;
});


// Fetch accounts for the selected period
function selectPeriod(period: Period) {
    periodStore.selectPeriod(period.id);
}

// Delete the selected period
async function deletePeriod() {
    if (!selectedPeriod.value) return;

    const confirmDelete = confirm('Are you sure you want to delete this period?');
    if (confirmDelete) {
        try {
            await periodStore.deletePeriod(selectedPeriod?.value.id);
            periodDeleted.value = true; // Trigger periodDeleted prop in child
        } catch (error) {
            console.error('Error deleting period:', error);
        } finally {
            periodDeleted.value = false; // Reset after handling
            location.reload();
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
                percentage: null,
                baseValue: parseFloat(accountAmount)
            };
            await periodStore.addAccountToPeriod(selectedPeriod?.value.id, newAccount);
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
        await periodStore.deleteAccountFromPeriod(selectedPeriod?.value.id, accountId);
    } catch (error) {
        console.error('Error deleting account:', error);
    }
}

// Handle the balance change icon
const balanceIcon = ref('dollar');
function handleBalanceChange() {
    balanceIcon.value = balanceIcon.value === 'percent' ? 'dollar' : 'percent';
}

// Edit the amount of an existing account
async function editAmount(accountId: string) {
    if (!selectedPeriod.value) return;

    const newAmount = prompt('Enter the new amount:');
    if (newAmount) {
        try {
            const parsedAmount = parseFloat(newAmount);
            await periodStore.updateAccountAmount(selectedPeriod.value.id, accountId, parsedAmount);
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
  @apply grid-cols-2;
}

/* Sticky header styles */
.sticky-header {
  @apply sticky -top-1 z-10; /* Make header sticky and ensure it's above content */
}

.sticky-footer {
  @apply sticky bottom-0 z-10;
}

.scrollable-container {
  @apply md:max-h-80 max-h-72 overflow-y-auto mt-4; /* Set max height and enable scrolling */
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
