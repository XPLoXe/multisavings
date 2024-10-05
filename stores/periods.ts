// stores/periods.ts
import { defineStore } from 'pinia';
import { 
  fetchPeriods, 
  fetchPeriodById, 
  addNewPeriod, 
  updateAccountAmount, 
  addAccountToPeriod, 
  deleteAccountFromPeriod, 
  deletePeriodById,
  getCurrentUser,
} from '@/firestoreMethods.js';

export const usePeriodStore = defineStore('periods', {
  state: () => ({
    periods: [] as Period[],
    selectedPeriod: null as Period | null,
    userId: null as string | null,
  }),

  actions: {
    async initializeStore() {
      const user = getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      this.userId = user.uid;

      this.loadState();
    },
    async loadState() {
      // Load state from local storage
      const persistedPeriods = localStorage.getItem(`periods_${this.userId}`);
      const persistedSelectedPeriod = localStorage.getItem(`selectedPeriod_${this.userId}`);
      
      if (persistedPeriods) {
        this.periods = JSON.parse(persistedPeriods);
      }
      
      if (persistedSelectedPeriod) {
        this.selectedPeriod = JSON.parse(persistedSelectedPeriod);
      } else if (this.periods.length > 0) {
        this.selectedPeriod = this.periods[0];
      }
    },

    saveState() {
      if (this.userId) {
        localStorage.setItem(`periods_${this.userId}`, JSON.stringify(this.periods));
        localStorage.setItem(`selectedPeriod_${this.userId}`, JSON.stringify(this.selectedPeriod));
      }
    },

    async fetchAllPeriods() {
      this.initializeStore(); // Load from local storage
      try {
        if (this.periods.length === 0) {
          console.log('Fetching periods from Firestore...');
          const periods = await fetchPeriods();
          this.periods = periods;
          this.selectedPeriod = periods.length > 0 ? periods[0] : null;
          this.saveState(); // Save to local storage
        }
      } catch (error) {
        console.error('Error fetching periods:', error);
      }
    },

    async selectPeriod(periodId: string) {
      try {
        let period = this.periods.find(p => p.id === periodId);
        if (!period) {
          // Fetch from Firestore only if the period is not in the state
          period = await fetchPeriodById(periodId);
          if (period) {
            this.periods.push(period); // Cache it locally if fetched from Firestore
          }
        }

        this.selectedPeriod = period || null;
        this.saveState(); // Save to local storage
      } catch (error) {
        console.error('Error selecting period:', error);
      }
    },

    async createPeriod(periodName: string) {
      try {
        const newPeriod = await addNewPeriod(periodName);
        this.periods.unshift(newPeriod); // Add the new period to the beginning of the state array
        this.selectPeriod(newPeriod.id); // Select the newly created period
        this.saveState(); // Save to local storage
      } catch (error) {
        console.error('Error creating period:', error);
      }
    },

  async updateAccountAmount(periodId: string, accountId: string, newAmount: number) {
    try {
      // Retrieve the period from the store
      const period = this.periods.find(p => p.id === periodId);
      if (!period) {
        console.error(`Period with ID ${periodId} not found.`);
        return;
      }

      // Find the account in the period to update
      const account = period.accounts.find(a => a.id === accountId);
      if (!account) {
        console.error(`Account with ID ${accountId} not found in period ${periodId}.`);
        return;
      }

      // If the percentage is `null`, it means the account was newly added in the current period
      // Keep the percentage as `null` to indicate no comparison with previous periods
      let newPercentage: number | null = null;

      if (account.percentage !== null) {
        // Calculate the new percentage based on `baseValue` only if the account is not new
        const baseValue = account.baseValue || account.amount; // Default to current amount if baseValue is undefined
        newPercentage = ((newAmount - baseValue) / Math.abs(baseValue)) * 100;
      }

      // Update the local store with the new amount and percentage
      account.amount = newAmount;
      account.percentage = newPercentage;

      // Save the changes to Firestore and get the updated list of accounts
      const updatedAccounts = await updateAccountAmount(periodId, accountId, newAmount, newPercentage);

      // Update the period in the local store with the returned accounts
      period.accounts = updatedAccounts;

      // Update the selected period if applicable
      if (this.selectedPeriod && this.selectedPeriod.id === periodId) {
        this.selectedPeriod.accounts = updatedAccounts;
      }

      this.saveState(); // Save the updated state to local storage
    } catch (error) {
      console.error('Error updating account amount:', error);
    }
  },

    async addAccountToPeriod(periodId: string, account: Account) {
      try {
        await addAccountToPeriod(periodId, account);
        const period = this.periods.find(p => p.id === periodId);
        if (period) {
          period.accounts.push(account);
          this.selectedPeriod = period;
          this.saveState(); // Save to local storage
        } else {
          await this.selectPeriod(periodId); // Refresh the selected period from Firestore
        }
      } catch (error) {
        console.error('Error adding account to period:', error);
      }
    },

    async deleteAccountFromPeriod(periodId: string, accountId: string) {
      try {
        await deleteAccountFromPeriod(periodId, accountId);
        const period = this.periods.find(p => p.id === periodId);
        if (period) {
          period.accounts = period.accounts.filter(a => a.id !== accountId);
          this.selectedPeriod = period;
          this.saveState(); // Save to local storage
        } else {
          await this.selectPeriod(periodId); // Refresh the selected period from Firestore
        }
      } catch (error) {
        console.error('Error deleting account from period:', error);
      }
    },

    async deletePeriod(periodId: string) {
      try {
        const deletedPeriod = await deletePeriodById(periodId);
        this.periods = this.periods.filter(p => p.id !== periodId); // Remove the period from the state
        this.selectedPeriod = this.periods.length > 0 ? this.periods[0] : null;
        this.saveState(); // Save to local storage
      } catch (error) {
        console.error('Error deleting period:', error);
      }
    },

    // Clear local storage when logging out
    clearLocalStorage() {
      if (this.userId) {
        localStorage.removeItem(`periods_${this.userId}`);
        localStorage.removeItem(`selectedPeriod_${this.userId}`);
        this.userId = null;
        this.periods = [];
        this.selectedPeriod = null;
      }
    },
  },
});
