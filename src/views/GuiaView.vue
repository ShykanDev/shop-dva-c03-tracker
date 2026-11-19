<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import BloqueGuia from '@/components/BloqueGuia.vue'
import CheckItem from '@/components/CheckItem.vue'
import EstadoChip from '@/components/EstadoChip.vue'
import Icon from '@/components/Icon.vue'
import PasoNav from '@/components/PasoNav.vue'
import ProgresoBar from '@/components/ProgresoBar.vue'
import PromptAmazonQ from '@/components/PromptAmazonQ.vue'
import SugerenciaVue from '@/components/SugerenciaVue.vue'
import { PASOS, buscarPaso } from '@/data/pasos'
import { alternarAccion, estaHecha } from '@/composables/useProgreso'
import { useTotales } from '@/composables/useTotales'

const props = defineProps<{ pasoId: string }>()
const router = useRouter()

const paso = computed(() => buscarPaso(props.pasoId))
const { pasoCompletado, progresoPaso } = useTotales()

const avance = computed(() => (paso.value ? progresoPaso(paso.value) : { hechas: 0, total: 0, pct: 0 }))
const completo = computed(() => (paso.value ? pasoCompletado(paso.value) : false))

const indice = computed(() =>
  PASOS.findIndex((item) => item.id === props.pasoId),
)

const anterior = computed(() => (indice.value > 0 ? PASOS[indice.value - 1] : null))
const siguiente = computed(() =>
  indice.value >= 0 && indice.value < PASOS.length - 1
    ? PASOS[indice.value + 1]
    : null,
)

watch(
  () => props.pasoId,
  (id) => {
    if (!buscarPaso(id)) router.replace('/guia/paso-0')
  },
  { immediate: true },
)
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
    <div v-if="!paso" class="rounded-2xl border border-line bg-surface p-8 text-center">
      <p class="text-[15px] font-semibold text-ink">Paso no encontrado</p>
      <p class="mt-1 text-[13px] text-ink-3">Volviendo al Paso 0…</p>
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
      <aside class="lg:sticky lg:top-[104px] lg:self-start">
        <PasoNav :activo="paso.id" />
      </aside>

      <div class="min-w-0">
        <header class="rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-7">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
              Paso {{ paso.numero }} de 15
            </p>
            <EstadoChip :mostrar="completo" class="ml-auto" />
          </div>
          <h1 class="mt-1.5 text-balance text-[25px] font-bold leading-[1.18] tracking-[-0.02em] text-ink sm:text-[29px]">
            {{ paso.titulo }}
          </h1>
          <p class="mt-2 text-[14.5px] leading-7 text-ink-2">{{ paso.resumen }}</p>

          <div class="mt-4 rounded-xl border border-accent/15 bg-accent-soft/50 px-4 py-3">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-accent-deep">
              Objetivo del paso
            </p>
            <p class="mt-1 text-[13.5px] leading-6 text-ink-2">{{ paso.objetivo }}</p>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <ProgresoBar
              :valor="avance.pct"
              compacta
              class="max-w-60"
              :tono="completo ? 'success' : 'accent'"
            />
            <span class="text-[12px] font-medium tabular-nums text-ink-3">
              {{ avance.hechas }} de {{ avance.total }}
            </span>
            <span
              v-for="skill in paso.skills"
              :key="skill"
              class="rounded bg-canvas px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-ink-3 ring-1 ring-inset ring-line"
            >
              {{ skill }}
            </span>
          </div>
        </header>

        <section class="mt-5 space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
          <h2 class="text-[15px] font-semibold text-ink">Cómo hacerlo</h2>
          <BloqueGuia v-for="(bloque, i) in paso.guia" :key="i" :bloque="bloque" />
        </section>

        <section v-if="paso.verifica.length > 0" class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
          <h2 class="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Icon name="flag" :size="16" class="text-accent" />
            Verifica
          </h2>
          <p class="mt-1 text-[12.5px] text-ink-3">Marca cada criterio cuando lo compruebes.</p>
          <div class="mt-2 divide-y divide-line/70">
            <CheckItem
              v-for="accion in paso.verifica"
              :key="accion.id"
              :accion="accion"
              :hecho="estaHecha(accion.id)"
              @toggle="alternarAccion"
            />
          </div>
        </section>

        <section v-if="paso.laboratorios?.length" id="labs" class="mt-5 scroll-mt-28 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-[15px] font-semibold text-ink">Los {{ paso.laboratorios.length }} labs, uno por uno</h2>
            <p class="text-[11.5px] text-ink-3">En orden · borra cada recurso al terminar</p>
          </div>

          <article
            v-for="(lab, i) in paso.laboratorios"
            :key="lab.id"
            :id="lab.id"
            class="scroll-mt-28 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6"
          >
            <header class="flex flex-wrap items-center gap-2">
              <span class="rounded-lg bg-accent-soft px-2 py-1 text-[11px] font-bold text-accent">
                Lab {{ i + 1 }}
              </span>
              <h3 class="text-[15px] font-semibold text-ink">{{ lab.titulo }}</h3>
              <EstadoChip
                :mostrar="paso.acciones[i] ? estaHecha(paso.acciones[i].id) : false"
                class="ml-auto"
              />
            </header>
            <p class="mt-2 text-[13.5px] leading-6 text-ink-2">{{ lab.objetivo }}</p>

            <div class="mt-3">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Cómo hacerlo</p>
              <ol class="mt-2 space-y-2">
                <li
                  v-for="(pasoLab, n) in lab.como"
                  :key="n"
                  class="flex gap-3 text-[13.5px] leading-6 text-ink-2"
                >
                  <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-canvas text-[10.5px] font-bold text-ink-3">
                    {{ n + 1 }}
                  </span>
                  <span class="min-w-0">{{ pasoLab }}</span>
                </li>
              </ol>
            </div>

            <p class="mt-3 rounded-lg bg-canvas px-3 py-2 text-[12.5px] leading-5 text-ink-2">
              <strong class="text-ink">Verifica:</strong> {{ lab.verifica }}
            </p>
            <p v-if="lab.limpieza" class="mt-2 rounded-lg bg-warning-soft px-3 py-2 text-[12.5px] leading-5 text-ink-2">
              <strong class="text-warning">Limpieza:</strong> {{ lab.limpieza }}
            </p>

            <div v-if="paso.acciones[i]" class="mt-3 rounded-xl border border-line">
              <CheckItem
                :accion="paso.acciones[i]"
                :hecho="estaHecha(paso.acciones[i].id)"
                @toggle="alternarAccion"
              />
            </div>

            <div class="mt-3">
              <PromptAmazonQ
                :prompt-id="`${paso.id}.${lab.id}.prompt`"
                :texto="lab.prompt"
                :titulo="`Prompt de Amazon Q — ${lab.titulo}`"
              />
            </div>
          </article>
        </section>

        <div v-if="paso.sugerenciaVue" class="mt-5">
          <SugerenciaVue :sugerencia="paso.sugerenciaVue" />
        </div>

        <section class="mt-5">
          <PromptAmazonQ
            :prompt-id="`${paso.id}.prompt`"
            :texto="paso.promptAmazonQ"
            :titulo="`Prompt para Amazon Q — Paso ${paso.numero}`"
          />
        </section>

        <nav class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <RouterLink
            v-if="anterior"
            :to="`/guia/${anterior.id}`"
            class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-ink-2 transition-colors hover:bg-surface hover:text-accent"
          >
            <Icon name="chevron-right" :size="14" class="rotate-180" />
            Paso {{ anterior.numero }} — {{ anterior.titulo }}
          </RouterLink>
          <RouterLink
            v-else
            to="/checklist"
            class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-ink-2 transition-colors hover:bg-surface hover:text-accent"
          >
            <Icon name="list" :size="14" />
            Ir al checklist
          </RouterLink>

          <RouterLink
            v-if="siguiente"
            :to="`/guia/${siguiente.id}`"
            class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-accent transition-colors hover:bg-accent-soft"
          >
            Paso {{ siguiente.numero }} — {{ siguiente.titulo }}
            <Icon name="chevron-right" :size="14" />
          </RouterLink>
          <RouterLink
            v-else
            to="/cierre"
            class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-accent transition-colors hover:bg-accent-soft"
          >
            Ir al cierre
            <Icon name="chevron-right" :size="14" />
          </RouterLink>
        </nav>
      </div>
    </div>
  </main>
</template>
