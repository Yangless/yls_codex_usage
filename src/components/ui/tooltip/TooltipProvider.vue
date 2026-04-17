<script setup>
import { TooltipProvider } from 'reka-ui'
</script>

<template>
  <TooltipProvider
    v-bind="$attrs"
    :delay-duration="100"
  >
    <slot />
  </TooltipProvider>
</template>
