<script setup>
import { cn } from '@/lib/utils'

defineProps({
  class: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div :class="cn('flex flex-col gap-2 p-6', $props.class)">
    <slot />
  </div>
</template>
