<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name:
      | 'check'
      | 'copy'
      | 'chevron-right'
      | 'chevron-down'
      | 'external'
      | 'reset'
      | 'book'
      | 'list'
      | 'flag'
      | 'spark'
      | 'alert'
      | 'clock'
      | 'code'
      | 'download'
      | 'upload'
    size?: number
  }>(),
  { size: 18 },
)

const paths: Record<string, string> = {
  check: 'M20 6 9 17l-5-5',
  copy: 'M9 9h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9Zm10-4H7a2 2 0 0 0-2 2v10M9 5V3',
  'chevron-right': 'm9 18 6-6-6-6',
  'chevron-down': 'm6 9 6 6 6-6',
  external: 'M14 4h6v6M20 4 10 14M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4',
  reset: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5',
  book: 'M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2V5Zm0 14a2 2 0 0 1 2-2h13',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  flag: 'M5 21V4m0 0h9l-1.5 3L14 10H5',
  spark: 'M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
  alert: 'M12 9v4m0 4h.01M10.3 4.2 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  code: 'm8 7-5 5 5 5m8-10 5 5-5 5',
  download: 'M12 3v12m0 0 4-4m-4 4-4-4M4 21h16',
  upload: 'M12 21V9m0 0 4 4m-4-4-4 4M4 3h16',
}

const d = computed(() => paths[props.name] ?? paths.check)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    class="shrink-0"
  >
    <path :d="d" />
  </svg>
</template>
