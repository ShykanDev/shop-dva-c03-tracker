<script setup lang="ts">
import type { Accion } from '@/types/proyecto'
import EstadoChip from './EstadoChip.vue'
import Icon from './Icon.vue'

defineProps<{
  accion: Accion
  hecho: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
}>()
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="hecho"
    :aria-label="accion.texto"
    class="group flex w-full items-start gap-3 rounded-lg px-1.5 py-2 text-left transition-colors hover:bg-canvas"
    data-testid="check-item"
    @click="emit('toggle', accion.id)"
  >
    <span
      class="mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border transition-colors"
      :class="
        hecho
          ? 'border-accent bg-accent text-white'
          : 'border-line-strong bg-surface text-transparent group-hover:border-accent'
      "
      aria-hidden="true"
    >
      <Icon name="check" :size="14" />
    </span>

    <span class="min-w-0 flex-1">
      <span class="block text-[14.5px] leading-6 text-ink">
        {{ accion.texto }}
      </span>
      <span
        v-if="accion.detalle"
        class="mt-0.5 block text-[12.5px] leading-5 text-ink-3"
      >
        {{ accion.detalle }}
      </span>
      <span
        v-if="accion.skills?.length"
        class="mt-1.5 flex flex-wrap gap-1"
      >
        <span
          v-for="skill in accion.skills"
          :key="skill"
          class="rounded bg-canvas px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-ink-3 ring-1 ring-inset ring-line"
        >
          {{ skill }}
        </span>
      </span>
    </span>

    <EstadoChip :mostrar="hecho" class="mt-0.5 shrink-0" />
  </button>
</template>
