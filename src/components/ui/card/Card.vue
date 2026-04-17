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
  <div
    :class="
      cn(
        'glass-panel rounded-[28px] border border-border/60 text-card-foreground shadow-[0_24px_80px_-44px_rgba(15,23,42,0.48)]',
        $props.class
      )
    "
  >
    <slot />
  </div>
</template>
