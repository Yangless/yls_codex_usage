<script setup>
import { ChevronDown } from 'lucide-vue-next'
import { SelectIcon, SelectTrigger } from 'reka-ui'
import { cn } from '@/lib/utils'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  class: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <SelectTrigger
    v-bind="$attrs"
    :class="
      cn(
        'glass-surface flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="size-4 shrink-0 text-muted-foreground opacity-80" />
    </SelectIcon>
  </SelectTrigger>
</template>
