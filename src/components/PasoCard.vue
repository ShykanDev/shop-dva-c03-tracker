<script setup lang="ts">
import { computed } from 'vue'
import { estaHecha, estaPromptHecho } from '@/composables/useProgreso'
import { useTotales } from '@/composables/useTotales'
import type { Paso } from '@/types/proyecto'
import CheckItem from './CheckItem.vue'
import EstadoChip from './EstadoChip.vue'
import Icon from './Icon.vue'
import ProgresoBar from './ProgresoBar.vue'
import PromptAmazonQ from './PromptAmazonQ.vue'

const props = defineProps<{ paso: Paso }>()

defineEmits<{ toggle: [id: string] }>()

const { pasoCompletado, progresoPaso } = useTotales()

const avance = computed(() => progresoPaso(props.paso))
const completo = computed(() => pasoCompletado(props.paso))
const promptHecho = computed(() => estaPromptHecho(`${props.paso.id}.prompt`))
</script>

<template>
  <article
    :id="paso.id"
    class="scroll-mt-28 rounded-2xl border border-line bg-surface shadow-soft"
  >
    <header class="flex flex-wrap items-start gap-3 p-5 sm:gap-4 sm:p-6">
      <span
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-[15px] font-bold text-accent"
        aria-hidden="true"
      >
        {{ paso.numero }}
      </span>

      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="text-[17px] font-semibold leading-6 tracking-[-0.01em] text-ink">
            {{ paso.titulo }}
          </h2>
          <EstadoChip :mostrar="completo" />
        </div>
        <p class="mt-1 text-[13.5px] leading-6 text-ink-3">{{ paso.resumen }}</p>

        <div class="mt-3 flex items-center gap-3">
          <ProgresoBar
            :valor="avance.pct"
            compacta
            class="max-w-56"
            :tono="completo ? 'success' : 'accent'"
          />
          <span class="shrink-0 text-[12px] font-medium tabular-nums text-ink-3">
            {{ avance.hechas }} de {{ avance.total }}
          </span>
        </div>
      </div>

      <RouterLink
        :to="`/guia/${paso.id}`"
        class="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-accent transition-colors hover:bg-accent-soft"
      >
        Ver guía
        <Icon name="chevron-right" :size="14" />
      </RouterLink>
    </header>

    <div class="border-t border-line px-4 py-4 sm:px-6">
      <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
        Acciones
      </p>
      <div class="divide-y divide-line/70">
        <CheckItem
          v-for="accion in paso.acciones"
          :key="accion.id"
          :accion="accion"
          :hecho="estaHecha(accion.id)"
          @toggle="$emit('toggle', $event)"
        />
      </div>

      <template v-if="paso.verifica.length > 0">
        <p class="mt-4 mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          <Icon name="flag" :size="12" />
          Verifica
        </p>
        <div class="divide-y divide-line/70">
          <CheckItem
            v-for="accion in paso.verifica"
            :key="accion.id"
            :accion="accion"
            :hecho="estaHecha(accion.id)"
            @toggle="$emit('toggle', $event)"
          />
        </div>
      </template>

      <details class="group mt-4 rounded-xl border border-line bg-canvas/60">
        <summary
          class="flex cursor-pointer list-none flex-wrap items-center gap-2 px-3.5 py-2.5 text-[12.5px] font-semibold text-ink-2 [&::-webkit-details-marker]:hidden"
        >
          <Icon
            name="chevron-right"
            :size="14"
            class="text-ink-3 transition-transform group-open:rotate-90"
          />
          Prompt para Amazon Q
          <span class="font-normal text-ink-3">· fallback listo para copiar</span>
          <EstadoChip :mostrar="promptHecho" class="ml-auto" />
        </summary>
        <div class="border-t border-line p-3">
          <PromptAmazonQ
            :prompt-id="`${paso.id}.prompt`"
            :texto="paso.promptAmazonQ"
            :titulo="`Paso ${paso.numero} — ${paso.titulo}`"
          />
        </div>
      </details>
    </div>
  </article>
</template>
