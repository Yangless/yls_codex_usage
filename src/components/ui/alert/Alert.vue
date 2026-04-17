<script setup>
import { computed, useSlots } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva('relative w-full rounded-3xl border px-4 py-4 text-sm', {
  variants: {
    variant: {
      default: 'border-border/70 surface-card-70 text-foreground',
      destructive: 'border-destructive/30 surface-destructive-8 text-destructive'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const props = defineProps({
  variant: {
    type: String,
    default: 'default'
  },
  class: {
    type: String,
    default: ''
  }
})

const slots = useSlots()
const classes = computed(() => cn(alertVariants({ variant: props.variant }), props.class))
</script>

<template>
  <div :class="classes" role="alert">
    <div v-if="slots.title" class="mb-1 font-medium">
      <slot name="title" />
    </div>
    <div class="leading-6">
      <slot />
    </div>
  </div>
</template>
