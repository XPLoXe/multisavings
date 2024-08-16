<template>
    <div class="flex flex-col justify-center items-center space-y-6">
        <Months @selected="fetchAccountsForMonth" />
        <div class="items">
            <div class="item">
                <button class="btn items-center group account" @click="addAccount">
                    <h3 class="font-bold">Account</h3>
                    <SvgIcon name="plus" alt="Add Account" :width="20" :height="20"
                        class="font-bold group-hover:animate-spin-half" />
                </button>
                <div v-for="item in selectedMonth?.accounts" :key="item.id" class="account-entry">
                    <div class="flex flex-row items-center">
                        <button class="btn items-center group delete" @click="deleteAccount(item.id)">
                            <SvgIcon name="trash" alt="Delete Account" :width="20" :height="20"
                                class="group-hover:animate-spin-once" />
                        </button>
                        <span>{{ item.name }}</span>
                    </div>
                </div>
            </div>
            <div class="item">
                <div class="px-4 py-2">
                    <h3 class="font-bold">Balance</h3>
                </div>
                <div v-for="item in selectedMonth?.accounts" :key="item.id" class="balance-entry">
                    <div class="flex flex-row justify-center items-center">
                        <div class="flex space-x-4 flex-row px-4 py-2 justify-center items-center">
                            <SvgIcon name="dollar" alt="Account Balance" :width="20" :height="20" />
                        </div>
                        <span>{{ item.amount }}</span>
                        <button class="btn items-center group" @click="editAmount(item.id)">
                            <SvgIcon name="edit" alt="Account Balance" :width="20" :height="20"
                                class="group-hover:animate-spin-once" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<script setup lang="ts">
import { ref } from 'vue';
import { fetchMonthById, addAccountToMonth, deleteAccountFromMonth, updateAccountAmount } from '@/firestoreMethods';
import Months from './Months.vue';

const selectedMonth = ref<Month | null>(null);

// Fetch accounts for the selected month from Firestore
async function fetchAccountsForMonth(month: Month) {
    console.log('Selected month:', month.id);
    try {
        const monthData = await fetchMonthById(month.id);
        selectedMonth.value = monthData;
    } catch (error) {
        console.error('Error fetching month data:', error);
    }
}

// Add a new account to the selected month
async function addAccount() {
    if (!selectedMonth.value) return;

    const accountName = prompt('Enter the account name:');
    const accountAmount = prompt('Enter the account amount:');

    if (accountName && accountAmount) {
        try {
            const newAccount: Account = {
                id: generateUniqueId(),
                name: accountName,
                amount: parseFloat(accountAmount),
            };
            await addAccountToMonth(selectedMonth.value.id, newAccount);
            selectedMonth.value.accounts.push(newAccount);
        } catch (error) {
            console.error('Error adding new account:', error);
        }
    } else {
        alert('Account name and amount are required.');
    }
}
// Delete an account from the selected month
async function deleteAccount(accountId: string) {
    console.log('Deleting account:', accountId);
    if (!selectedMonth.value) return;

    try {
        await deleteAccountFromMonth(selectedMonth.value.id, accountId);
        // Remove the account from the local state
        selectedMonth.value.accounts = selectedMonth.value.accounts.filter(
            (account) => account.id !== accountId
        );
    } catch (error) {
        console.error('Error deleting account:', error);
    }
}

// Edit the amount of an existing account
async function editAmount(accountId: string) {
    if (!selectedMonth.value) return;

    const newAmount = prompt('Enter the new amount:');
    if (newAmount) {
        try {
            const parsedAmount = parseFloat(newAmount);
            await updateAccountAmount(selectedMonth.value.id, accountId, parsedAmount);
            // Update the local state with the new amount
            const accountToEdit = selectedMonth.value.accounts.find(account => account.id === accountId);
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
.items {
  @apply flex flex-row space-x-12;
}

.item {
  @apply flex flex-col space-y-2;
}

.account {
  @apply w-40 min-w-40 items-center;
}

.account-entry, .balance-entry {
  @apply py-2;
}

.account-entry span, .balance-entry span {
  @apply text-lg;
}

</style>
