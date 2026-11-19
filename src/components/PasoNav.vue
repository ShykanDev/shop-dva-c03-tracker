<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PASOS } from '@/data/pasos'
import Icon from './Icon.vue'

const props = defineProps<{ activo: string }>()
const router = useRouter()

function ir(pasoId: string) {
  router.push(`/guia/${pasoId}`)
}
</script>

<template>
  <nav aria-label="Índice de pasos">
    <div class="lg:hidden">
      <label for="paso-select" class="sr-only">Ir a un paso</label>
      <select
        id="paso-select"
        :value="activo"
        class="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-[13.5px] font-medium text-ink shadow-sm"
        @change="ir(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="paso in PASOS" :key="paso.id" :value="paso.id">
          Paso {{ paso.numero }} — {{ paso.titulo }}
        </option>
        <option value="cierre">Cierre del proyecto</option>
      </select>
    </div>

    <div class="hidden lg:block">
      <p class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
        Recorrido
      </p>
      <ul class="space-y-0.5">
        <li v-for="paso in PASOS" :key="paso.id">
          <RouterLink
            :to="`/guia/${paso.id}`"
            class="flex items-start gap-2 rounded-lg px-2 py-1.5 text-[12.5px] leading-5 transition-colors"
            :class="
              activo === paso.id
                ? 'bg-accent-soft font-semibold text-accent'
                : 'text-ink-2 hover:bg-canvas hover:text-ink'
            "
          >
            <span
              class="mt-0.5 w-5 shrink-0 text-right font-mono text-[11px] font-semibold"
              :class="activo === paso.id ? 'text-accent' : 'text-ink-3'"
            >
              {{ paso.numero }}
            </span>
            <span class="min-w-0">{{ paso.titulo }}</span>
          </RouterLink>
        </li>
        <li class="pt-1">
          <RouterLink
            to="/cierre"
            class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] font-medium transition-colors"
            :class="
              activo === 'cierre'
                ? 'bg-accent-soft font-semibold text-accent'
                : 'text-ink-2 hover:bg-canvas hover:text-ink'
            "
          >
            <Icon name="flag" :size="14" class="ml-0.5" />
            Cierre del proyecto
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>
