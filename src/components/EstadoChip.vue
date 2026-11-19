<script setup lang="ts">
import Icon from './Icon.vue'

withDefaults(
  defineProps<{
    mostrar: boolean
    texto?: string
  }>(),
  { texto: 'Completado' },
)
</script>

<template>
  <span
    v-if="mostrar"
    class="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success ring-1 ring-inset ring-success/20"
    data-testid="estado-chip"
  >
    <Icon name="check" :size="12" />
    {{ texto }}
  </span>
</template>
