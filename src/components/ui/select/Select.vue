<script setup>
import { SelectRoot } from 'reka-ui'

defineProps({
  modelValue: {
    type: String,
    default: undefined
  },
  defaultValue: {
    type: String,
    default: undefined
  },
  open: {
    type: Boolean,
    default: undefined
  },
  defaultOpen: {
    type: Boolean,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: undefined
  }
})

defineEmits(['update:modelValue', 'update:open'])
</script>

<template>
  <SelectRoot
    :model-value="modelValue"
    :default-value="defaultValue"
    :open="open"
    :default-open="defaultOpen"
    :disabled="disabled"
    :name="name"
    @update:model-value="$emit('update:modelValue', $event)"
    @update:open="$emit('update:open', $event)"
  >
    <slot />
  </SelectRoot>
</template>
