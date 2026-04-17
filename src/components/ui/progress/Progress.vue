<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  class: {
    type: String,
    default: ''
  },
  indicatorClass: {
    type: String,
    default: ''
  }
})

const indicatorStyle = computed(() => ({
  transform: `translateX(-${100 - Math.max(0, Math.min(100, props.modelValue))}%)`
}))
</script>

<template>
  <div :class="cn('relative h-3 w-full overflow-hidden rounded-full bg-muted', $props.class)">
    <div
      :class="
        cn(
          'gradient-progress-default h-full w-full flex-1 rounded-full transition-transform duration-500 ease-out',
          $props.indicatorClass
        )
      "
      :style="indicatorStyle"
    />
  </div>
</template>
