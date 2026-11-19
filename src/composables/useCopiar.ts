import { onUnmounted, ref } from 'vue'

export function useCopiar() {
  const copiado = ref(false)
  let temporizador: ReturnType<typeof setTimeout> | undefined

  async function copiar(texto: string): Promise<void> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(texto)
      } else {
        const area = document.createElement('textarea')
        area.value = texto
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        document.execCommand('copy')
        document.body.removeChild(area)
      }
      copiado.value = true
    } catch {
      copiado.value = false
    }

    if (temporizador) clearTimeout(temporizador)
    temporizador = setTimeout(() => {
      copiado.value = false
    }, 1800)
  }

  onUnmounted(() => {
    if (temporizador) clearTimeout(temporizador)
  })

  return { copiado, copiar }
}
