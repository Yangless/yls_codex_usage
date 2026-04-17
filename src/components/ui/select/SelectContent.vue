<script setup>
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import {
  SelectContent,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectViewport
} from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'popper'
  }
})
</script>

<template>
  <SelectPortal>
    <SelectContent
      v-bind="$attrs"
      :position="props.position"
      :class="
        cn(
          'glass-popover relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-2xl border border-border/70 text-popover-foreground shadow-[0_24px_60px_-28px_rgba(0,0,0,0.28)] dark-border-soft dark:shadow-[0_30px_80px_-34px_rgba(0,0,0,0.82)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          props.position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          props.class
        )
      "
    >
      <SelectScrollUpButton class="flex cursor-default items-center justify-center py-1">
        <ChevronUp class="size-4 text-muted-foreground" />
      </SelectScrollUpButton>
      <SelectViewport
        :class="cn('p-1.5', props.position === 'popper' && 'min-w-[var(--reka-select-trigger-width)]')"
      >
        <slot />
      </SelectViewport>
      <SelectScrollDownButton class="flex cursor-default items-center justify-center py-1">
        <ChevronDown class="size-4 text-muted-foreground" />
      </SelectScrollDownButton>
    </SelectContent>
  </SelectPortal>
</template>
