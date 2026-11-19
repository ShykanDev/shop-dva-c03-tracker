<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    valor: number
    etiqueta?: string
    compacta?: boolean
    tono?: 'accent' | 'success'
  }>(),
  { compacta: false, tono: 'accent' },
)

const seguro = computed(() => Math.max(0, Math.min(100, Math.round(props.valor))))

const color = computed(() =>
  props.tono === 'success' ? 'bg-success' : 'bg-accent',
)
</script>

<template>
  <div class="w-full">
    <div
      class="w-full overflow-hidden rounded-full bg-[#edf1f7]"
      :class="compacta ? 'h-1.5' : 'h-2'"
      role="progressbar"
      :aria-valuenow="seguro"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="etiqueta ?? `Progreso ${seguro}%`"
    >
      <span
        class="block h-full rounded-full transition-[width] duration-300 ease-out"
        :class="color"
        :style="{ width: `${seguro}%` }"
      />
    </div>
    <p
      v-if="etiqueta"
      class="mt-1.5 flex items-baseline justify-between gap-3 text-[12px] font-medium text-ink-3"
    >
      <span>{{ etiqueta }}</span>
      <span class="font-bold tabular-nums text-ink">{{ seguro }}%</span>
    </p>
  </div>
</template>
