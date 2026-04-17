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
  <h3 :class="cn('text-xl font-semibold tracking-tight text-foreground', $props.class)">
    <slot />
  </h3>
</template>
