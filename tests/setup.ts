import { beforeEach } from 'vitest'
import { reiniciarProgresoEnMemoria } from '@/composables/useProgreso'

beforeEach(() => {
  localStorage.clear()
  reiniciarProgresoEnMemoria()
})
