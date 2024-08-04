<template>
    <div class="flex flex-col justify-center items-center space-y-8">
        <Months />
        <div class="flex flex-row space-x-12 justify-center items-center">
            <div class="item">
                <div
                    class="flex flex-row items-center space-x-4 hover:bg-white px-4 py-2 rounded-xl hover:text-black group">
                    <h3 class="font-bold">Account</h3>
                    <SvgIcon name="plus" alt="plus Icon" :width="24" :height="24"
                        class="font-bold group-hover:animate-spin-half" />
                </div>
                <div v-for="item in selectedMonth.accounts" :key="item.id">
                    <div>{{ item.name }}</div>
                </div>
            </div>
            <div class="flex flex-col justify-center items-center">
                <h3 class="font-bold px-4 py-2">Balance</h3>
                <div v-for="item in selectedMonth.accounts" :key="item.id">
                    <div>$ {{ item.amount }}</div>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup lang='ts'>
const data = {
    "2023-01": {
        month: "January",
        year: 2023,
        accounts: [
            { id: "acc1", name: "Chase Saving Account", amount: 1000 },
            { id: "acc2", name: "Chase Investing Account", amount: 5000 },
            { id: "acc3", name: "Binance", amount: 3000 },
            { id: "acc4", name: "BBVA", amount: 2000 },
            { id: "acc5", name: "Trade Republic", amount: 1500 }
        ]
    },
    "2023-02": {
        month: "February",
        year: 2023,
        accounts: [
            { id: "acc1", name: "Chase Saving Account", amount: 1200 },
            { id: "acc2", name: "Chase Investing Account", amount: 5100 },
            { id: "acc3", name: "Binance", amount: 3100 },
            { id: "acc4", name: "BBVA", amount: 2100 },
            { id: "acc5", name: "Trade Republic", amount: 1600 }
        ]
    },
    // Add more months as needed
};

// make the data available to the template
import { ref } from 'vue';
import Months from './Months.vue';

const selectedMonth = ref(data["2023-01"]);



</script>

<style scoped lang="pcss">
.item {
    @apply flex flex-col justify-center items-center;
}
</style>