<script setup>
import { TooltipArrow, TooltipContent, TooltipPortal } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: {
    type: String,
    default: ''
  },
  sideOffset: {
    type: Number,
    default: 8
  }
})
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      v-bind="$attrs"
      :side-offset="props.sideOffset"
      :class="
        cn(
          'glass-popover z-50 overflow-hidden rounded-lg border border-border/60 px-3 py-1.5 text-xs text-popover-foreground shadow-[0_18px_48px_-20px_rgba(0,0,0,0.45)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          props.class
        )
      "
    >
      <slot />
      <TooltipArrow class="fill-popover/95" />
    </TooltipContent>
  </TooltipPortal>
</template>
