<script setup>
import { SelectValue } from 'reka-ui'
</script>

<template>
  <SelectValue v-bind="$attrs">
    <slot />
  </SelectValue>
</template>
