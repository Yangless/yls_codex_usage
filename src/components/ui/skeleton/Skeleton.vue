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
  <div :class="cn('animate-pulse rounded-2xl bg-muted/80', $props.class)" />
</template>
