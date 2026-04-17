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
  <div :class="cn('h-px w-full bg-border/60', $props.class)" />
</template>
