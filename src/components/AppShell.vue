<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { TOTAL_ACCIONES, TOTAL_PROMPTS, useTotales } from '@/composables/useTotales'
import ProgresoBar from './ProgresoBar.vue'
import Icon from './Icon.vue'

const route = useRoute()
const { accionesCompletadas, promptsCompletados, porcentajeGlobal } = useTotales()

const tabs = computed(() => [
  {
    to: '/checklist',
    label: 'Checklist',
    icon: 'list' as const,
    activo: route.path.startsWith('/checklist') || route.path === '/',
  },
  {
    to: '/guia/paso-0',
    label: 'Guía',
    icon: 'book' as const,
    activo: route.path.startsWith('/guia'),
  },
  {
    to: '/proyecto',
    label: 'Proyecto',
    icon: 'code' as const,
    activo: route.path.startsWith('/proyecto'),
  },
  {
    to: '/cierre',
    label: 'Cierre',
    icon: 'flag' as const,
    activo: route.path.startsWith('/cierre'),
  },
])
</script>

<template>
  <div class="min-h-screen bg-canvas">
    <header
      class="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md"
    >
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
          <RouterLink to="/checklist" class="flex items-center gap-2.5">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-[15px] font-bold text-white shadow-sm"
              aria-hidden="true"
            >
              S
            </span>
            <span class="min-w-0">
              <span class="block text-[14.5px] font-semibold leading-5 tracking-[-0.01em] text-ink">
                Shop · Seguimiento DVA-C03
              </span>
              <span class="block text-[11.5px] leading-4 text-ink-3">
                Tienda en línea serverless · guía y checklist
              </span>
            </span>
          </RouterLink>

          <div class="ml-auto flex items-center gap-3 text-[11.5px] font-medium text-ink-3">
            <span class="tabular-nums">
              <strong class="text-ink">{{ accionesCompletadas }}</strong>
              /{{ TOTAL_ACCIONES }} acciones
            </span>
            <span class="hidden h-3 w-px bg-line sm:block" />
            <span class="hidden tabular-nums sm:block">
              <strong class="text-ink">{{ promptsCompletados }}</strong>
              /{{ TOTAL_PROMPTS }} prompts
            </span>
          </div>
        </div>

        <div class="flex items-end justify-between gap-4">
          <nav class="flex gap-1" role="tablist" aria-label="Secciones">
            <RouterLink
              v-for="tab in tabs"
              :key="tab.to"
              :to="tab.to"
              role="tab"
              :aria-selected="tab.activo"
              class="inline-flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-[12.5px] font-semibold transition-colors"
              :class="
                tab.activo
                  ? 'border-accent text-accent'
                  : 'border-transparent text-ink-3 hover:border-line-strong hover:text-ink-2'
              "
            >
              <Icon :name="tab.icon" :size="14" />
              {{ tab.label }}
            </RouterLink>
          </nav>
          <div class="mb-2 hidden w-40 sm:block">
            <ProgresoBar :valor="porcentajeGlobal" compacta />
          </div>
        </div>
      </div>
    </header>

    <slot />

    <footer class="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
      <p class="border-t border-line pt-5 text-[11.5px] leading-5 text-ink-3">
        El progreso se guarda solo en este navegador con la clave
        <code class="rounded bg-surface px-1 py-0.5 font-mono text-[11px] text-ink-2 ring-1 ring-inset ring-line">
          shop-dva-c03:progress
        </code>
        · Sin servidor, sin cuenta y sin fechas por semana.
      </p>
    </footer>
  </div>
</template>
