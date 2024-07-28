<!-- components/SvgIcon.vue -->
<template>
    <div v-html="iconContent" :class="['icon', { 'hoverable': isHoverable }]"
        :style="{ width: width + 'px', height: height + 'px' }"></div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { defineProps } from 'vue';

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    alt: {
        type: String,
        default: '',
    },
    width: {
        type: Number,
        default: 24,
    },
    height: {
        type: Number,
        default: 24,
    },
    isHoverable: {
        type: Boolean,
        default: false,
    },
});

const iconContent = ref('');

watchEffect(async () => {
    try {
        const iconModule = await import(`~/assets/svg/${props.name}.svg?raw`);
        iconContent.value = iconModule.default.replace(/<svg/, `<svg class="icon-svg"`);
    } catch (error) {
        console.error(`Error loading icon: ${props.name}`, error);
        iconContent.value = '';
    }
});
</script>

<style scoped>
.icon {
    display: inline-block;
}

.icon-svg {
    fill: white;
    transition: fill 0.3s ease;
}

.hoverable .icon-svg:hover {
    fill: black;
}
</style>
