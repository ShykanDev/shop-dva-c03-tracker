import type { Paso } from '@/types/proyecto'
import { construirPrompt } from './contexto'

export const paso15: Paso = {
  id: 'paso-15',
  numero: 15,
  titulo: 'Examen: preguntas y mocks',
  resumen:
    'Pasar de construir a medir: diagnósticos por tarea, repaso de lo débil y simulacros completos.',
  objetivo:
    'Sacar 80 % o más en simulacros seguidos, sin fallar siempre en el mismo dominio, y tener el examen agendado.',
  acciones: [
    {
      id: 'paso-15.1',
      texto: 'Usar la app de estudio DVA-C03 para preguntas por dominio y por tarea',
      detalle:
        'Si el módulo aún no está listo, usa las preguntas de escenario y los labs como material de repaso.',
      skills: [],
    },
    {
      id: 'paso-15.2',
      texto: 'Hacer diagnósticos por tarea y repasar las tareas débiles',
      detalle:
        'No repases lo que ya dominas. El diagnóstico sirve para elegir qué estudiar, no para coleccionar puntajes.',
      skills: [],
    },
    {
      id: 'paso-15.3',
      texto: 'Hacer simulacros completos de 65 preguntas y 130 minutos, sin pausar',
      detalle:
        'Mismo formato que el examen: 50 preguntas puntuadas y 15 no puntuadas. Sin mirar apuntes.',
      skills: [],
    },
    {
      id: 'paso-15.4',
      texto: 'Llegar a 80 % o más en varios mocks seguidos sin fallar siempre en el mismo dominio',
      detalle:
        'La meta no es un pico de suerte: es consistencia. Si siempre falla el Dominio 2, ese es el siguiente paso.',
      skills: [],
    },
  ],
  verifica: [
    {
      id: 'paso-15.v1',
      texto: 'Examen agendado en Pearson VUE / OnVUE, en español si lo prefieres, con el cupón del 50 % (75 USD)',
      detalle:
        'El examen está disponible desde el 1 de diciembre de 2026. La meta es estudiar hasta el 30 de diciembre de 2026 y presentar a inicios de enero de 2027, sin presión.',
      skills: [],
    },
  ],
  skills: [],
  guia: [
    {
      tipo: 'texto',
      md: 'Construir la tienda te dio contexto; ahora necesitas evidencia de que puedes responder bajo presión. El examen DVA-C03 tiene 65 preguntas, 130 minutos, 50 puntuadas y 15 no puntuadas, y se aprueba con 720 sobre 1000. La preparación se mide con diagnósticos por tarea y simulacros completos, no con la sensación de "ya casi".',
    },
    {
      tipo: 'lista',
      titulo: 'Cómo usar la app de estudio',
      items: [
        'Empieza por el diagnóstico de cada dominio. Anota las tareas con menos del 70 %.',
        'Estudia solo esas tareas y vuelve a diagnosticar. Si subió, pasa a la siguiente; si no, cambia de material o pide ayuda.',
        'Alterna preguntas de conocimiento con preguntas de escenario. El examen castiga la definición memorizada sin criterio.',
        'Cada vez que falles, escribe la razón en una frase: "confundí presigned URL con bucket público". Ese registro vale más que repetir 100 preguntas al azar.',
      ],
    },
    {
      tipo: 'lista',
      titulo: 'Simulacro completo',
      items: [
        'Siéntate 130 minutos sin pausas, sin teléfono y sin consultar apuntes. El examen real no te deja pausar.',
        'Marca las preguntas dudosas y vuelve al final. No te quedes 10 minutos en una sola.',
        'Al terminar, revisa no solo el puntaje: mira el tiempo por pregunta y los dominios con más fallos.',
        'Repite el simulacro después de estudiar las debilidades. La meta es 80 % o más en varias rondas seguidas.',
        'Si siempre fallas el mismo dominio, no agendes todavía. Cambia de estrategia: lab corto, explicación propia o preguntas de escenario.',
      ],
    },
    {
      tipo: 'lista',
      titulo: 'Agendar el examen',
      items: [
        'Entra a Pearson VUE / OnVUE y elige AWS Certified Developer – Associate (DVA-C03).',
        'Elige español si te da más seguridad; el examen también está disponible en inglés.',
        'Aplica el cupón del 50 %: el precio queda en 75 USD. Verifica la vigencia antes de pagar.',
        'Puedes presentar en línea con OnVUE o en un centro. Prueba antes el equipo, la cámara y la conexión.',
        'El examen está disponible desde el 1 de diciembre de 2026. La meta es estudiar hasta el 30 de diciembre de 2026 y presentar a inicios de enero de 2027, sin presión.',
        'Agenda solo cuando los mocks sean consistentes. Una fecha no arregla un dominio flojo.',
      ],
    },
    {
      tipo: 'nota',
      tono: 'info',
      titulo: 'Qué significa estar listo',
      md: 'No es "terminé los 15 pasos". Es: puedes comprar y administrar la tienda de punta a punta, entiendes por qué elegiste cada servicio, y sacas 80 % o más en mocks seguidos sin fallar siempre en el mismo dominio.',
    },
    {
      tipo: 'nota',
      tono: 'aviso',
      titulo: 'No cambies el proyecto para perseguir preguntas',
      md: 'Si un mock revela una debilidad, haz un lab corto o repasa el concepto. No agregues servicios a la tienda solo para "cubrir" una pregunta: rompe la demo y no garantiza el aprendizaje.',
    },
  ],
  promptAmazonQ: construirPrompt({
    paso: 15,
    titulo: 'Examen: preguntas y mocks',
    quiere:
      'prepararme para el examen DVA-C03 con diagnósticos por tarea, repaso de las débiles, simulacros completos de 65 preguntas y 130 minutos, y agendar el examen con el cupón del 50 %',
    yaHice: 'los Pasos 0 a 14: la tienda, los labs y la puesta en producción',
    extra:
      'Ayúdame a interpretar mis resultados: si fallo siempre en el Dominio 2, ¿qué labs o conceptos debo repasar primero? No me des un calendario: dame el orden de los temas y cómo saber que ya estoy listo.',
  }),
}
