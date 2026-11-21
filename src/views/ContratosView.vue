<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/Icon.vue'
import {
  BUCKETS,
  COLA_SQS,
  GRUPO_COGNITO,
  LAMBDAS,
  RUTAS,
  STORES,
  TABLAS,
  TEMA_SNS,
  VARIABLES,
} from '@/data/contratos'

const filtroLambda = computed(() => LAMBDAS)

const totalAcciones = computed(() => LAMBDAS.length)

const tipoVariable: Record<string, string> = {
  'env-lambda': 'Lambda',
  'parameter-store': 'Parameter Store',
  secret: 'Secrets Manager',
  vite: 'Frontend (Vite)',
}

const chipOrigen = (origen: string) =>
  origen === 'spec' ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'

const etiquetaOrigen = (origen: string) =>
  origen === 'spec' ? 'spec' : 'convención'
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-9">
    <header class="rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-7">
      <p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
        Contratos técnicos
      </p>
      <h1 class="mt-1.5 text-balance text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[30px]">
        Todo nombrado, todo definido
      </h1>
      <p class="mt-2 max-w-2xl text-[14.5px] leading-7 text-ink-2">
        Cada store, Lambda, ruta, tabla y variable del proyecto, con su archivo
        o endpoint y el paso donde se implementa. Si algo aparece en una guía,
        aparece aquí. La etiqueta distingue lo que fija la especificación de lo
        que es convención de la app.
      </p>
      <p class="mt-3 flex flex-wrap items-center gap-2 text-[11.5px] text-ink-3">
        <span class="rounded-full px-2 py-0.5 font-semibold" :class="chipOrigen('spec')">spec</span>
        Lo exige la especificación.
        <span class="rounded-full px-2 py-0.5 font-semibold" :class="chipOrigen('convencion')">convención</span>
        Decisión de esta app; puedes cambiarla.
      </p>
    </header>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-[16px] font-semibold text-ink">Stores de Pinia</h2>
        <span class="ml-auto text-[11.5px] font-medium text-ink-3">{{ STORES.length }} stores</span>
      </div>
      <div class="mt-3 space-y-3">
        <article v-for="store in STORES" :key="store.id" class="rounded-xl border border-line bg-canvas/50 p-4">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-mono text-[13px] font-semibold text-ink">{{ store.archivo }}</p>
            <span class="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-3 ring-1 ring-inset ring-line">
              id: {{ store.id }}
            </span>
            <span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" :class="chipOrigen(store.origen)">
              {{ etiquetaOrigen(store.origen) }}
            </span>
            <RouterLink
              :to="`/guia/paso-${store.implementadoEn}`"
              class="ml-auto text-[11.5px] font-semibold text-accent"
            >
              Implementado en el Paso {{ store.implementadoEn }}
            </RouterLink>
          </div>
          <p class="mt-1 font-mono text-[12px] text-accent">{{ store.export }}</p>
          <div class="mt-2 grid gap-2 sm:grid-cols-2">
            <p class="rounded bg-surface px-2.5 py-1.5 text-[11.5px] leading-5 text-ink-2 ring-1 ring-inset ring-line">
              <strong class="text-ink">Estado:</strong>
              <span v-for="(tipo, clave) in store.estado" :key="clave" class="block font-mono text-[11px]">
                {{ clave }}: {{ tipo }}
              </span>
            </p>
            <p class="rounded bg-surface px-2.5 py-1.5 text-[11.5px] leading-5 text-ink-2 ring-1 ring-inset ring-line">
              <strong class="text-ink">Getters:</strong> {{ store.getters.join(', ') || '—' }}<br />
              <strong class="text-ink">Acciones:</strong> {{ store.acciones.join(', ') }}
            </p>
          </div>
          <p v-if="store.persistencia" class="mt-2 text-[11.5px] leading-5 text-ink-3">
            Persistencia: {{ store.persistencia }}
          </p>
        </article>
      </div>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-[16px] font-semibold text-ink">Rutas del frontend</h2>
        <span class="ml-auto text-[11.5px] font-medium text-ink-3">{{ RUTAS.length }} rutas · Paso 1</span>
      </div>
      <div class="mt-3 overflow-x-auto">
        <table class="w-full min-w-[620px] text-left text-[12.5px]">
          <thead>
            <tr class="border-b border-line text-[10.5px] uppercase tracking-wide text-ink-3">
              <th class="py-2 pr-3 font-semibold">Ruta</th>
              <th class="py-2 pr-3 font-semibold">Vista</th>
              <th class="py-2 pr-3 font-semibold">Acceso</th>
              <th class="py-2 font-semibold">Origen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ruta in RUTAS" :key="ruta.ruta" class="border-b border-line/60 last:border-0">
              <td class="py-2.5 pr-3 font-mono text-[12px] text-ink">{{ ruta.ruta }}</td>
              <td class="py-2.5 pr-3 font-mono text-[11.5px] text-ink-2">{{ ruta.vista }}</td>
              <td class="py-2.5 pr-3 text-ink-2">{{ ruta.auth }}</td>
              <td class="py-2.5">
                <span class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" :class="chipOrigen(ruta.origen)">
                  {{ etiquetaOrigen(ruta.origen) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-[16px] font-semibold text-ink">Lambdas y rutas de la API</h2>
        <span class="ml-auto text-[11.5px] font-medium text-ink-3">{{ totalAcciones }} funciones</span>
      </div>
      <div class="mt-3 overflow-x-auto">
        <table class="w-full min-w-[720px] text-left text-[12.5px]">
          <thead>
            <tr class="border-b border-line text-[10.5px] uppercase tracking-wide text-ink-3">
              <th class="py-2 pr-3 font-semibold">Lambda</th>
              <th class="py-2 pr-3 font-semibold">Método</th>
              <th class="py-2 pr-3 font-semibold">Ruta / disparador</th>
              <th class="py-2 pr-3 font-semibold">Auth</th>
              <th class="py-2 pr-3 font-semibold">Variables</th>
              <th class="py-2 font-semibold">Paso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lambda in filtroLambda" :key="lambda.nombre" class="border-b border-line/60 last:border-0">
              <td class="py-2.5 pr-3 font-mono text-[12px] font-semibold text-accent">{{ lambda.nombre }}</td>
              <td class="py-2.5 pr-3 font-mono text-[11.5px] text-ink-2">{{ lambda.metodo }}</td>
              <td class="py-2.5 pr-3 font-mono text-[11.5px] text-ink-2">{{ lambda.ruta ?? 'evento' }}</td>
              <td class="py-2.5 pr-3 text-[11.5px] text-ink-2">{{ lambda.auth }}</td>
              <td class="py-2.5 pr-3 text-[11px] text-ink-3">{{ lambda.variables.join(', ') || '—' }}</td>
              <td class="py-2.5">
                <RouterLink :to="`/guia/paso-${lambda.paso}`" class="font-semibold text-accent">
                  Paso {{ lambda.paso }}
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 class="text-[16px] font-semibold text-ink">Tablas, buckets, colas y grupo de Cognito</h2>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <article v-for="tabla in TABLAS" :key="tabla.nombre" class="rounded-xl border border-line bg-canvas/50 p-4">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-mono text-[12.5px] font-semibold text-ink">{{ tabla.nombre }}</p>
            <span
              class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
              :class="tabla.obligatoria ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'"
            >
              {{ tabla.obligatoria ? 'obligatoria' : 'opcional' }}
            </span>
            <RouterLink :to="`/guia/paso-${tabla.paso}`" class="ml-auto text-[11px] font-semibold text-accent">
              Paso {{ tabla.paso }}
            </RouterLink>
          </div>
          <p class="mt-1 font-mono text-[11px] text-ink-2">PK {{ tabla.pk }} · SK {{ tabla.sk }}</p>
          <p v-if="tabla.nombrePlantilla" class="mt-1 font-mono text-[11px] text-ink-3">
            En CloudFormation: {{ tabla.nombrePlantilla }}
          </p>
          <p v-if="tabla.indices.length" class="mt-1 text-[11px] text-ink-3">
            {{ tabla.indices.join(' · ') }}
          </p>
        </article>

        <article v-for="bucket in BUCKETS" :key="bucket.nombre" class="rounded-xl border border-line bg-canvas/50 p-4">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-mono text-[12.5px] font-semibold text-ink">{{ bucket.nombre }}</p>
            <span class="rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-ink-3 ring-1 ring-inset ring-line">
              bucket S3
            </span>
            <RouterLink :to="`/guia/paso-${bucket.paso}`" class="ml-auto text-[11px] font-semibold text-accent">
              Paso {{ bucket.paso }}
            </RouterLink>
          </div>
          <p class="mt-1 text-[11.5px] leading-5 text-ink-2">{{ bucket.uso }}</p>
        </article>

        <article class="rounded-xl border border-line bg-canvas/50 p-4">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-mono text-[12.5px] font-semibold text-ink">{{ COLA_SQS.nombre }}</p>
            <RouterLink :to="`/guia/paso-${COLA_SQS.paso}`" class="ml-auto text-[11px] font-semibold text-accent">
              Paso {{ COLA_SQS.paso }}
            </RouterLink>
          </div>
          <p class="mt-1 text-[11.5px] leading-5 text-ink-2">
            Cola principal con DLQ <strong class="text-ink">{{ COLA_SQS.dlq }}</strong> y
            maxReceiveCount {{ COLA_SQS.maxReceiveCount }}.
          </p>
        </article>

        <article class="rounded-xl border border-line bg-canvas/50 p-4">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-mono text-[12.5px] font-semibold text-ink">{{ TEMA_SNS.nombre }}</p>
            <RouterLink :to="`/guia/paso-${TEMA_SNS.paso}`" class="ml-auto text-[11px] font-semibold text-accent">
              Paso {{ TEMA_SNS.paso }}
            </RouterLink>
          </div>
          <p class="mt-1 text-[11.5px] leading-5 text-ink-2">
            Tema SNS con los grupos de Cognito
            <strong class="text-ink">{{ GRUPO_COGNITO.admin }}</strong> y
            <strong class="text-ink">{{ GRUPO_COGNITO.cliente }}</strong>.
          </p>
        </article>
      </div>
    </section>

    <section class="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
      <h2 class="text-[16px] font-semibold text-ink">Variables y configuración</h2>
      <div class="mt-3 overflow-x-auto">
        <table class="w-full min-w-[560px] text-left text-[12.5px]">
          <thead>
            <tr class="border-b border-line text-[10.5px] uppercase tracking-wide text-ink-3">
              <th class="py-2 pr-3 font-semibold">Nombre</th>
              <th class="py-2 pr-3 font-semibold">Dónde</th>
              <th class="py-2 pr-3 font-semibold">Ejemplo</th>
              <th class="py-2 font-semibold">Paso</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="variable in VARIABLES" :key="variable.nombre" class="border-b border-line/60 last:border-0">
              <td class="py-2.5 pr-3 font-mono text-[12px] text-ink">{{ variable.nombre }}</td>
              <td class="py-2.5 pr-3 text-ink-2">{{ tipoVariable[variable.tipo] }}</td>
              <td class="py-2.5 pr-3 font-mono text-[11px] text-ink-3">{{ variable.ejemplo }}</td>
              <td class="py-2.5">
                <RouterLink :to="`/guia/paso-${variable.paso}`" class="font-semibold text-accent">
                  Paso {{ variable.paso }}
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-3">
        <Icon name="alert" :size="13" class="text-warning" />
        Nada que empiece por <code class="font-mono">VITE_</code> es secreto: termina en el navegador.
      </p>
    </section>
  </main>
</template>
