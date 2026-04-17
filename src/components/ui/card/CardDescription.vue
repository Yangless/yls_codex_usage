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
  <p :class="cn('text-sm leading-6 text-muted-foreground', $props.class)">
    <slot />
  </p>
</template>
