<script setup lang="ts">
import { useCopiar } from '@/composables/useCopiar'
import { alternarPrompt, estaPromptHecho } from '@/composables/useProgreso'
import EstadoChip from './EstadoChip.vue'
import Icon from './Icon.vue'

const props = withDefaults(
  defineProps<{
    promptId: string
    texto: string
    titulo?: string
  }>(),
  { titulo: 'Prompt para Amazon Q' },
)

const { copiado, copiar } = useCopiar()

function alternar() {
  alternarPrompt(props.promptId)
}
</script>

<template>
  <section class="rounded-xl border border-accent/20 bg-accent-soft/40">
    <header class="flex flex-wrap items-center gap-2 border-b border-accent/15 px-4 py-2.5">
      <Icon name="spark" :size="15" class="text-accent" />
      <p class="text-[13px] font-semibold text-ink">{{ titulo }}</p>
      <span
        class="rounded bg-surface px-1.5 py-0.5 text-[10.5px] font-medium text-ink-3 ring-1 ring-inset ring-line"
      >
        Fallback sin IA
      </span>
      <EstadoChip :mostrar="estaPromptHecho(promptId)" class="ml-auto" />
    </header>

    <pre
      class="scrollbar-thin max-h-80 max-w-full overflow-auto whitespace-pre-wrap px-4 py-3 font-mono text-[12px] leading-5 text-ink-2"
    >{{ texto }}</pre>

    <footer class="flex flex-wrap items-center gap-2 border-t border-accent/15 px-4 py-2.5">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1.5 text-[12px] font-semibold text-accent ring-1 ring-inset ring-accent/25 transition-colors hover:bg-accent hover:text-white"
        @click="copiar(texto)"
      >
        <Icon name="copy" :size="14" />
        {{ copiado ? 'Copiado' : 'Copiar prompt' }}
      </button>

      <button
        type="button"
        role="checkbox"
        :aria-checked="estaPromptHecho(promptId)"
        class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-ink-2 transition-colors hover:bg-surface"
        @click="alternar"
      >
        <span
          class="flex h-4 w-4 items-center justify-center rounded border"
          :class="
            estaPromptHecho(promptId)
              ? 'border-success bg-success text-white'
              : 'border-line-strong text-transparent'
          "
          aria-hidden="true"
        >
          <Icon name="check" :size="11" />
        </span>
        Marcar prompt como completado
      </button>

      <span class="sr-only" aria-live="polite">{{ copiado ? 'Prompt copiado' : '' }}</span>
    </footer>
  </section>
</template>
