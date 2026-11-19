<script setup lang="ts">
import type { SugerenciaVue } from '@/types/proyecto'
import Icon from './Icon.vue'

defineProps<{ sugerencia: SugerenciaVue }>()
</script>

<template>
  <aside class="rounded-xl border border-accent/20 bg-accent-soft/60 p-4">
    <div class="flex items-center gap-2">
      <span
        class="inline-flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-white"
      >
        <Icon name="code" :size="11" />
        Vue
      </span>
      <p class="text-[13.5px] font-semibold text-ink">{{ sugerencia.titulo }}</p>
    </div>
    <p class="mt-2 text-[13.5px] leading-6 text-ink-2">{{ sugerencia.porque }}</p>
    <pre
      v-if="sugerencia.ejemplo"
      class="scrollbar-thin mt-3 max-w-full overflow-x-auto rounded-lg border border-accent/15 bg-surface/80 p-3 font-mono text-[12px] leading-5 text-ink"
    ><code>{{ sugerencia.ejemplo }}</code></pre>
  </aside>
</template>
