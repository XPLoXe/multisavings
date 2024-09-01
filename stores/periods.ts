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
} from '@/firestoreMethods.js';

export const usePeriodStore = defineStore('periods', {
  state: () => ({
    periods: [] as Period[],
    selectedPeriod: null as Period | null,
  }),

  actions: {
    async loadState() {
      const persistedPeriods = localStorage.getItem('periods');
      const persistedSelectedPeriod = localStorage.getItem('selectedPeriod');
      
      if (persistedPeriods) {
        this.periods = JSON.parse(persistedPeriods);
      }
      
      if (persistedSelectedPeriod) {
        this.selectedPeriod = JSON.parse(persistedSelectedPeriod);
      }
    },

    saveState() {
      localStorage.setItem('periods', JSON.stringify(this.periods));
      localStorage.setItem('selectedPeriod', JSON.stringify(this.selectedPeriod));
    },

    async fetchAllPeriods() {
      this.loadState(); // Load from local storage
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
        await updateAccountAmount(periodId, accountId, newAmount);
        const period = this.periods.find(p => p.id === periodId);
        if (period) {
          const account = period.accounts.find(a => a.id === accountId);
          if (account) {
            account.amount = newAmount;
          }
          this.selectedPeriod = period;
          this.saveState(); // Save to local storage
        } else {
          await this.selectPeriod(periodId); // Refresh the selected period from Firestore
        }
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
  },
});
