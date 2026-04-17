<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  tone?: 'default' | 'warm' | 'emerald' | 'sky'
}>()

const toneClassMap = {
  default: 'from-white/45 to-white/5',
  warm: 'from-[hsl(var(--primary)/0.12)] to-transparent',
  emerald: 'from-[hsl(var(--chart-2)/0.12)] to-transparent',
  sky: 'from-[hsl(var(--chart-1)/0.12)] to-transparent'
}
</script>

<template>
  <div
    :class="[
      'flex min-h-28 flex-col justify-between gap-4 rounded-[22px] border border-border/50 bg-gradient-to-br p-5 backdrop-blur-sm',
      toneClassMap[tone || 'default']
    ]"
  >
    <span class="text-sm text-muted-foreground">{{ label }}</span>
    <strong class="text-[clamp(1.25rem,3vw,1.9rem)] font-semibold tracking-tight text-foreground">{{ value }}</strong>
  </div>
</template>
