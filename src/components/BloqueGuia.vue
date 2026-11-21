<script setup lang="ts">
import type { BloqueGuia } from '@/types/proyecto'
import { useCopiar } from '@/composables/useCopiar'
import Icon from './Icon.vue'

defineProps<{ bloque: BloqueGuia }>()

const { copiado, copiar } = useCopiar()
</script>

<template>
  <div v-if="bloque.tipo === 'texto'" class="text-[14.5px] leading-7 text-ink-2">
    <p class="whitespace-pre-line">{{ bloque.md }}</p>
  </div>

  <div v-else-if="bloque.tipo === 'lista'" class="space-y-2">
    <p
      v-if="bloque.titulo"
      class="text-[13px] font-semibold uppercase tracking-wide text-ink-3"
    >
      {{ bloque.titulo }}
    </p>
    <ol
      v-if="bloque.ordenada !== false"
      class="ml-1 space-y-2"
    >
      <li
        v-for="(item, indice) in bloque.items"
        :key="indice"
        class="flex gap-3 text-[14.5px] leading-6 text-ink-2"
      >
        <span
          class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-bold text-accent"
          aria-hidden="true"
        >
          {{ indice + 1 }}
        </span>
        <span class="min-w-0 whitespace-pre-line">{{ item }}</span>
      </li>
    </ol>
    <ul v-else class="ml-1 space-y-2">
      <li
        v-for="(item, indice) in bloque.items"
        :key="indice"
        class="flex gap-3 text-[14.5px] leading-6 text-ink-2"
      >
        <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
        <span class="min-w-0 whitespace-pre-line">{{ item }}</span>
      </li>
    </ul>
  </div>

  <div
    v-else-if="bloque.tipo === 'codigo'"
    class="overflow-hidden rounded-xl border border-line bg-[#fbfcfe]"
  >
    <div class="flex items-center justify-between gap-3 border-b border-line px-3 py-1.5">
      <span class="min-w-0 truncate font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-3">
        <span v-if="bloque.titulo" class="text-ink-2">{{ bloque.titulo }} · </span>{{ bloque.lenguaje }}
      </span>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-2 transition-colors hover:bg-canvas hover:text-accent"
        @click="copiar(bloque.codigo)"
      >
        <Icon name="copy" :size="13" />
        {{ copiado ? 'Copiado' : 'Copiar' }}
      </button>
    </div>
    <pre
      class="scrollbar-thin max-w-full overflow-x-auto p-3 font-mono text-[12.5px] leading-6 text-ink"
    ><code>{{ bloque.codigo }}</code></pre>
    <p v-if="bloque.nota" class="border-t border-line px-3 py-2 text-[12px] leading-5 text-ink-3">
      {{ bloque.nota }}
    </p>
  </div>

  <div
    v-else
    class="rounded-xl border p-3.5"
    :class="{
      'border-accent/20 bg-accent-soft/50': bloque.tono === 'info',
      'border-warning/25 bg-warning-soft': bloque.tono === 'aviso',
      'border-danger/25 bg-danger-soft': bloque.tono === 'peligro',
    }"
  >
    <p class="flex items-center gap-2 text-[13px] font-semibold" :class="{
      'text-accent-deep': bloque.tono === 'info',
      'text-warning': bloque.tono === 'aviso',
      'text-danger': bloque.tono === 'peligro',
    }">
      <Icon :name="bloque.tono === 'info' ? 'spark' : 'alert'" :size="15" />
      {{ bloque.titulo ?? (bloque.tono === 'info' ? 'Nota' : 'Atención') }}
    </p>
    <p class="mt-1 whitespace-pre-line text-[13.5px] leading-6 text-ink-2">
      {{ bloque.md }}
    </p>
  </div>
</template>
