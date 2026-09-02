# Plan de Trabajo (v2 — enfoque UI/UX Web) — TP Física II

## Simulador web interactivo de circuitos resistivos de corriente directa

> **Materia:** Física II — Ingeniería en Sistemas de Información
> **Tema:** Circuitos resistivos de corriente directa (UT 4 — Electrodinámica)
> **Enfoque de esta versión:** experiencia de usuario. Web linda, animada, con navegación atractiva, circuitos grandes y claros (no formato libro), cálculo en vivo y constructor de circuitos propio. Deploy en servidor gratuito con contador de accesos persistente.
> **Método de trabajo:** vibe coding (generación asistida por IA).

> **Cambio de stack respecto del plan anterior:** el plan v1 usaba Python + Streamlit porque el foco era el cálculo. Como ahora la prioridad es la UI/UX, las animaciones, el deploy web y el contador, el stack pasa a **JavaScript/TypeScript + React (Next.js)**. La física y las ecuaciones no cambian (ver Anexo Físico); cambia con qué se implementa.

---

## 1. Qué vamos a construir

Una aplicación web de una sola página (SPA) que:

1. **Muestra circuitos grandes, claros y animados** — con la corriente "fluyendo" por los cables y valores que se actualizan en vivo.
2. **Resuelve cualquier red resistiva de CC** que el usuario arme o cargue (no solo los de la guía).
3. **Constructor de circuitos propio**: arrastrar y soltar resistencias, fuentes y cables en un canvas.
4. **Cálculo en vivo**: al mover un valor (slider o input), todo se recalcula al instante.
5. **Modo guiado**: los problemas de la guía precargados, con explicación paso a paso (para el informe y la defensa).
6. **Deploy gratuito** + **contador de accesos persistente**.

---

## 2. Stack tecnológico

| Capa               | Tecnología                                            | Por qué                                                                                                                |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Framework          | **Next.js 14+ (App Router) + React + TypeScript**     | Una sola base para UI + backend del contador; deploy gratis en Vercel; ideal para vibe coding (v0.dev genera Next.js). |
| Estilos            | **Tailwind CSS** + **shadcn/ui**                      | Diseño moderno y consistente con poco esfuerzo; componentes listos y editables.                                        |
| Animaciones        | **Framer Motion**                                     | Transiciones de pantalla, aparición de resultados, contadores animados.                                                |
| Canvas / circuitos | **React Flow (`@xyflow/react`)**                      | Nodos arrastrables, cables, zoom/pan. Base del constructor y del render animado.                                       |
| Cálculo            | **mathjs**                                            | Álgebra lineal (resolver el sistema de Kirchhoff).                                                                     |
| Gráficos           | **Recharts**                                          | Curvas I–V, potencia, barridos de parámetros.                                                                          |
| Backend contador   | **Route Handler de Next.js** + base gratuita (ver §7) | Contador persistente sin servidor propio.                                                                              |
| Hosting            | **Vercel** (plan gratuito)                            | Deploy directo desde GitHub, HTTPS, dominio gratis.                                                                    |

> **Alternativa más simple:** si Next.js te resulta pesado, **Vite + React + TypeScript** funciona igual para la UI; en ese caso el contador se resuelve con un servicio externo (§7, opción B) porque Vite no trae backend.

---

## 3. Experiencia de usuario (el corazón de esta versión)

### 3.1. Principios de diseño

- **Grande y ancho, no formato libro.** El circuito es el protagonista: ocupa la mayor parte de la pantalla, con aire alrededor. Nada de figuras chiquitas tipo Serway.
- **Claridad antes que densidad.** Pocos elementos por pantalla, jerarquía visual fuerte, números destacados.
- **Todo reacciona.** Cambiás algo → se ve el efecto al instante, con una micro-animación que lo hace evidente.
- **Movimiento con sentido.** Las animaciones comunican física (la corriente fluye, la magnitud cambia), no son decoración vacía.
- **Una sola mano de obra visual.** Un sistema de diseño (colores, tipografía, espaciados) aplicado en todo.

### 3.2. Sistema visual (propuesta, ajustable)

- **Tema:** oscuro por defecto (hace que los circuitos y la corriente "brillen"), con opción de tema claro.
- **Paleta:**
  - Fondo: gris azulado muy oscuro (slate-950 / #0b0f1a).
  - Superficie de tarjetas: slate-900/800.
  - Acento de corriente: cian/verde eléctrico (#22d3ee → #a3e635) — la corriente se anima en este color.
  - Tensión/positivo: ámbar/naranja; negativo/tierra: azul frío.
  - Texto: casi blanco; números en fuente mono para que "canten".
- **Tipografía:** una sans geométrica moderna (Inter o Geist) para UI + una mono (JetBrains Mono / Geist Mono) para valores numéricos.
- **Componentes:** shadcn/ui (botones, sliders, tabs, tooltips, sheets) para que todo se vea coherente y profesional.
- **Escala de color por magnitud:** los cables/valores cambian de intensidad según la corriente (más corriente = más brillo/velocidad de animación).

### 3.3. Navegación y estructura

Navegación de tipo "app", no de documento. Propuesta:

- **Landing / Home** — hero con un circuito animado de fondo, título del proyecto, y dos CTAs: "Explorar" y "Modo guía". Muestra el contador de accesos de forma linda (número animado).
- **Simulador** (pantalla principal) — canvas grande con el circuito + panel lateral de controles y resultados.
- **Modo guía** — galería de los 8 problemas de la guía; al elegir uno, se carga en el simulador con su explicación paso a paso.
- **Constructor** — modo del simulador donde arrastrás componentes para armar tu propio circuito.
- **Acerca de / Teoría** — resumen teórico (para el informe) con tarjetas visuales.

Transiciones entre pantallas con Framer Motion (fade/slide suaves). Barra de navegación superior minimalista + posible "command palette" (⌘K) como toque pro.

### 3.4. Mapa de pantallas

```
Home (hero animado + contador)
 ├─ Simulador
 │    ├─ Canvas del circuito (React Flow, animado)
 │    ├─ Panel de controles (sliders/inputs, live calc)
 │    ├─ Panel de resultados (corrientes, tensiones, potencias)
 │    └─ Paso a paso (nivel cátedra: nodos → mallas → sistema → solución)
 ├─ Modo guía (galería P8, P9, P11–P16)
 │    └─ Caso seleccionado → Simulador + paso a paso
 ├─ Constructor (drag & drop de componentes)
 └─ Teoría / Acerca de
```

---

## 4. Diseño y animación de los circuitos

Este es el punto que más te importa, así que va detallado.

### 4.1. Cómo se ven

- Circuito dibujado en un **canvas grande** (React Flow), con zoom y desplazamiento.
- **Componentes estilizados** como nodos personalizados de React Flow, cada uno con su ícono SVG limpio:
  - Resistencia: zigzag clásico, con su etiqueta (R1) y valor (10 Ω) grande y legible.
  - Fuente de tensión: símbolo de batería con su valor (9 V).
  - Fuente de corriente: círculo con flecha.
  - Nodos/uniones: puntos destacados.
- **Cables gruesos y limpios**, con esquinas redondeadas. Nada de líneas finas tipo libro.
- **Etiquetas siempre legibles**: valores en fuente mono, con buen contraste.

### 4.2. Animación de la corriente (el efecto clave)

- Cada cable es un `path` SVG con **guiones animados** (`stroke-dashoffset` animándose): se ve como si "puntos de corriente" viajaran por el cable.
- **Dirección** del movimiento = sentido real de la corriente (si da negativa, la animación va al revés — coincide con la interpretación física de "sentido opuesto").
- **Velocidad y densidad** de los guiones **proporcionales a la magnitud** de la corriente: más corriente → fluye más rápido / más brillante.
- **Color por intensidad**: escala de color (p. ej. de tenue a cian brillante) según cuánta corriente pasa.
- **Al recalcular**: los valores numéricos hacen "tween" (transición animada de número viejo a nuevo) con Framer Motion, y los cables ajustan su animación en vivo.
- Opcional (queda muy bien): **mapa de calor de tensión** — colorear los nodos según su potencial.

### 4.3. Constructor (drag & drop)

- Paleta lateral con los componentes; se arrastran al canvas.
- Se conectan arrastrando cables entre terminales (React Flow maneja esto nativo).
- Al soltar/conectar, se recalcula y anima solo.
- Validaciones amables: avisar si el circuito está incompleto o mal conectado (sin cerrar malla, sin referencia a tierra, etc.).

> **Nota técnica para vibe coding:** React Flow ya trae nodos personalizados, edges animados, controles de zoom y minimapa. Pedile al asistente "custom nodes para resistor/fuente con SVG" y "animated edges con velocidad según un valor" — son patrones muy documentados.

---

## 5. Funcionalidades

### 5.1. Simulador interactivo (núcleo)

- Cargás/armás un circuito → se resuelve → se muestran y animan corrientes, tensiones de nodo, caídas y potencias.
- Panel de resultados con tarjetas grandes por magnitud, ordenables/filtrables.
- **Paso a paso (nivel cátedra) para cualquier circuito**, no solo los de la guía: como el motor resuelve por corrientes de rama, muestra el mismo procedimiento que efectivamente calcula (detalle en §5.6). Va en un panel plegable para no tapar el circuito.
- Cálculo de `Vb − Va` entre dos nodos elegidos (como pide el P9).

### 5.2. Cálculo en vivo

- Cada valor (R, E, I) tiene un **slider + input**. Al moverlo, recálculo instantáneo y re-animación.
- Sin botón "calcular": la app siempre está resuelta y actualizada.

### 5.3. Generar circuito propio

- Modo constructor (§4.3). Guardar/cargar circuitos como JSON (localStorage al principio; opcional compartir por URL).

### 5.4. Modo guía (para el informe y la defensa)

- Los 8 problemas precargados. Cada uno:
  - Se abre en el simulador con sus valores.
  - Usa el mismo **paso a paso** del simulador (§5.6) y, además, la **validación**: resultado del simulador vs resultado oficial + error relativo.
  - Opcional: mallas predefinidas iguales a las de la resolución oficial, para que el paso a paso salga idéntico al PDF (ver §5.6).

### 5.5. Exploración / barridos (plus para "simulación")

- Elegís un parámetro (p. ej. R2) y un rango; la app grafica cómo cambia una magnitud (p. ej. la corriente por una rama) en ese rango. Con Recharts, animado. Esto cumple de sobra el "simular" de la consigna.

### 5.6. Paso a paso (nivel de detalle)

Muestra **solo lo que muestra la cátedra**, sin agregar más. En un panel plegable, con estos bloques:

1. Corrientes asignadas (sentido arbitrario), sobre el esquema.
2. Ecuaciones de nodo (KCL).
3. Ecuaciones de malla (KVL).
4. Sistema con los valores reemplazados.
5. Solución (los valores de las corrientes).
6. Interpretación de signos (corriente negativa ⇒ sentido real opuesto).

**No** incluir pasos de más: nada de aritmética intermedia detallada ni del álgebra de resolución de matrices. El objetivo es que se lea igual que una resolución de la guía.

- **Circuitos libres:** el motor elige un conjunto de mallas válido automáticamente (árbol de expansión). El resultado es correcto; las mallas pueden diferir de las de una resolución hecha a mano.
- **Modo guía:** se pueden fijar las mismas mallas de la resolución oficial para que el paso a paso coincida exactamente con el PDF.

---

## 6. Arquitectura técnica

### 6.1. Estructura (Next.js App Router)

```
circuitos-cc/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Home (hero + contador)
│   ├── simulador/page.tsx
│   ├── guia/page.tsx
│   ├── guia/[problema]/page.tsx
│   ├── teoria/page.tsx
│   └── api/
│       └── views/route.ts       # endpoint del contador (GET incrementa/lee)
├── components/
│   ├── circuit/                 # nodos React Flow, edges animados, canvas
│   │   ├── ResistorNode.tsx
│   │   ├── SourceNode.tsx
│   │   ├── AnimatedWire.tsx
│   │   └── CircuitCanvas.tsx
│   ├── controls/                # sliders, inputs, panel de parámetros
│   ├── results/                 # tarjetas de resultados, tabla, Vb-Va
│   ├── steps/                   # render del paso a paso
│   └── ui/                      # shadcn/ui
├── lib/
│   ├── engine/
│   │   ├── kirchhoff.ts         # solver por corrientes de rama (KCL + KVL)
│   │   ├── model.ts             # tipos: Node, Component, Circuit
│   │   ├── graph.ts             # React Flow <-> netlist; árbol de expansión y mallas
│   │   ├── power.ts
│   │   └── steps.ts             # narración paso a paso (modo guía)
│   ├── problems/                # los 8 casos de la guía como datos
│   │   └── guia04.ts
│   └── counter.ts               # cliente del contador
├── public/
├── package.json
└── README.md
```

### 6.2. Motor de cálculo (`lib/engine/kirchhoff.ts`)

- El motor usa el **método de corrientes de rama de la cátedra** (Kirchhoff clásico): asigna una corriente a cada rama, plantea **KCL** en los nodos (`n−1` ecuaciones) y **KVL** en las mallas (`b−n+1` ecuaciones), arma el sistema y lo resuelve. Las corrientes que dan negativas se reportan como "sentido real opuesto al asumido".
- **Detección automática de mallas** para circuitos arbitrarios (constructor): se arma un árbol de expansión del grafo del circuito y cada rama fuera del árbol define una malla fundamental (`lib/engine/graph.ts`). Así funciona con cualquier circuito que arme el usuario, no solo los de la guía.
- Fuentes: las de corriente aportan corrientes conocidas (reducen incógnitas); las de tensión aparecen en las ecuaciones de malla (KVL).
- El sistema `A·x = b` se resuelve con `math.lusolve` de mathjs (solo el álgebra de matrices).
- Devuelve corrientes de rama, caídas de tensión, potencias, tensiones de nodo y `Vb − Va` por un camino.
- El **paso a paso** está disponible en el simulador general para cualquier circuito (no solo el modo guía): muestra estas mismas ecuaciones (nodos → mallas → sistema → solución → interpretación de signos), al nivel de detalle de las resoluciones de la cátedra (ver §5.6).

> El solver se implementa a mano; mathjs se usa solo para resolver el sistema de matrices. La física (armar las ecuaciones de Kirchhoff desde el circuito) es el algoritmo propio.

### 6.3. Modelo de datos y puente con React Flow

- `Circuit = { nodes: Node[], components: Component[] }` (netlist).
- `graph.ts` convierte el estado visual de React Flow (nodos + edges) en la netlist para el motor, y vuelca los resultados (corrientes) de vuelta a los edges para animarlos.

---

## 7. Contador de accesos persistente

Necesitás que el número sobreviva a los reinicios (persistente) y sea gratis. Dos caminos:

### Opción A (recomendada si usás Next.js) — endpoint propio + base gratuita

- Un **Route Handler** `app/api/views/route.ts` que incrementa y devuelve el total.
- Backend de datos gratuito y persistente:
  - **Supabase** (Postgres, capa gratuita): una tabla `stats` con una fila `views`; incremento con una función/RPC. Bonus: si después querés guardar circuitos compartidos, ya tenés base de datos.
  - o **Upstash Redis** (capa gratuita): un simple `INCR views`. Es lo más liviano para solo un contador.
- Para no inflar el número en cada refresh: contar **visitantes únicos** marcando una bandera en `localStorage`, o contar cargas si preferís algo simple.

### Opción B (cero backend) — servicio de contador externo

- **CounterAPI** (`counterapi.dev`) o **GoatCounter** (open source, versión hosted gratis y con API). Se llama con un `fetch` al cargar la página.
- Ventaja: no configurás nada. Desventaja: dependés de un tercero y puede traer marca/limitaciones.
- **Evitar `countapi.xyz`** (el clásico), que estuvo caído/inestable.

> Los límites de las capas gratuitas cambian seguido: verificá los actuales al momento de configurarlo. Para un TP, cualquiera de las dos opciones sobra.

**Mostralo lindo:** un número que cuenta hacia arriba con animación (Framer Motion) en el Home, tipo "N visitas".

---

## 8. Deploy en servidor gratuito

- **Vercel (plan Hobby, gratis):** conectás el repo de GitHub y cada push despliega solo. HTTPS y subdominio `*.vercel.app` incluidos. Es el camino natural para Next.js e incluye los Route Handlers (contador) sin configurar nada aparte.
- Alternativas: **Netlify** (similar) o **GitHub Pages** (solo si es 100% estático, sin backend — ahí el contador tiene que ser la Opción B).
- Pasos: repo en GitHub → importar en Vercel → configurar variables de entorno (claves de Supabase/Upstash si usás Opción A) → deploy.

---

## 9. Flujo de vibe coding (cómo construirlo con IA)

La idea es delegar la mayor parte a asistentes de IA, pero con criterio. Reparto sugerido:

- **UI y pantallas → v0.dev** (de Vercel): describís cada pantalla y te genera componentes Next.js + Tailwind + shadcn listos para pegar. Ideal para el look & feel.
- **Lógica, integración y motor → Cursor / Claude / Codex**: el constructor (React Flow), el cableado de datos, el contador, y sobre todo **el motor de cálculo**.
- **Regla de oro:** el **motor de física NO se vibe-codea a ciegas.** Es lo que la IA más se equivoca (bugs de signo, matrices mal armadas). Verificá el motor contra los valores del Anexo Físico antes de confiar en él. Acá tu perfil de QA juega a favor: tratá los 8 problemas como casos de prueba.
- Trabajá por piezas chicas y verificables (una pantalla, un componente, el motor) en vez de pedir "hacé toda la app".

### Prompts de arranque sugeridos

1. _"Creá un proyecto Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui, con tema oscuro por defecto y esta estructura de carpetas [§6.1]. Home con un hero y un placeholder de contador."_
2. _"Implementá `lib/engine/model.ts`, `lib/engine/graph.ts` (árbol de expansión + mallas fundamentales) y `lib/engine/kirchhoff.ts`: un solver por el método de corrientes de rama (KCL en los nodos + KVL en las mallas), con interpretación de signos de las corrientes negativas, usando mathjs solo para resolver el sistema. Verificá contra el Problema 11 (Anexo Físico): I0=0.34, I1=0.66, I2=−0.09 A."_
3. _"Armá `CircuitCanvas` con React Flow: nodos personalizados para resistor y fuente (SVG), y edges con guiones animados cuya velocidad dependa de un valor de corriente."_
4. _"Conectá el panel de controles (sliders) al motor para recálculo en vivo y re-animación de los cables."_
5. _"Agregá un panel plegable de 'paso a paso' que muestre, para el circuito actual, las corrientes asignadas, las ecuaciones de nodo (KCL), las de malla (KVL), el sistema con valores, la solución y la interpretación de signos — al nivel de una resolución de la cátedra, sin aritmética intermedia de más."_
6. …seguir por pantalla/feature.

---

## 10. Fases de implementación

| Fase | Objetivo                                                                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | Bootstrap: Next.js + Tailwind + shadcn, estructura (§6.1), tema oscuro, layout y navegación base.                                                     |
| 1    | **Motor** MNA en TS + modelo de datos. Verificar contra P9 y P11 (Anexo Físico).                                                                      |
| 2    | Render del circuito con React Flow (nodos + cables) — todavía sin animar.                                                                             |
| 3    | **Animación de corriente** en los cables + valores animados + cálculo en vivo con sliders + panel de **paso a paso** (nivel cátedra) en el simulador. |
| 4    | Modo guía: los 8 problemas precargados + validación + (opcional) mallas fijas para que el paso a paso coincida con el PDF.                            |
| 5    | Constructor (drag & drop) + guardar/cargar circuitos.                                                                                                 |
| 6    | Exploración/barridos (Recharts). Pulido visual y de animaciones.                                                                                      |
| 7    | Contador persistente + deploy en Vercel.                                                                                                              |
| 8    | Informe, manual y ensayo de la exposición.                                                                                                            |

---

## 11. Validación (Etapa 5 de la consigna)

- Los 8 problemas de la guía son los **casos de prueba**. Para cada uno: cargar en modo guía y comparar resultado del simulador vs resultado oficial, con error relativo.
- Tabla de validación en el informe (Problema | Referencia | Simulador | Error | Estado).
- Recomendado (y fácil con tu perfil): tests automáticos del **motor** (Vitest/Jest) con los valores del Anexo Físico, para blindar la parte de cálculo del vibe coding.

---

## 12. Entregables (Etapa 6)

- **Informe:** intro, objetivos, marco teórico, desarrollo (arquitectura, motor, UI/UX), resultados (capturas del simulador animado), validación, conclusiones, bibliografía.
- **Software:** repo + link al deploy en Vercel.
- **Manual de usuario:** cómo usar el simulador, el constructor y el modo guía.
- **Exposición (10–15 min):** demo en vivo del simulador y del constructor (que es lo más vistoso), + un caso de la guía con su paso a paso y validación.

---

## Anexo Físico — Ecuaciones y valores de referencia (stack-independiente)

> Estos son los mismos del plan v1. Sirven para implementar el motor y para validar. Las derivaciones completas paso a paso están en el plan v1 (Anexo D); acá va lo esencial.

**Leyes:** Ohm `V=IR`; Serie `R_eq=ΣR`; Paralelo `1/R_eq=Σ1/R`; Potencia `P=VI=I²R=V²/R`; KCL `ΣI=0` en cada nodo; KVL `ΣV=0` en cada malla.

**Convención de signos de la cátedra (para el paso a paso), recorriendo mallas en sentido horario:** caída `R·I` negativa si el recorrido va a favor de la corriente, positiva si va en contra; fuente `+E` si se pasa de − a +, `−E` si de + a −.

**Valores esperados (para validar el motor):**

- **P8 (V=9 V):**
  - 5(a): `R_eq=27.5 Ω`; `I(R2,R6,grupo)=0.327 A`; `I(R3)=0.245 A`; `I(R1,R4,R5)=0.081 A`.
  - 5(b): `R_eq=35 Ω`; `I(R1,R4,R5)=0.257 A`; `I(R2)=I(R3)=0.128 A`.
- **P9** (R1=25,R2=20,R3=10,R4=15,R5=30; E1=10,E2=15,E3=10 V): `I0=−0.0172 A` (sentido opuesto), `I1=0.4310 A`, `I2=0.4138 A`, `Vb−Va=2.154 V`.
- **P11** (R1=6,R2=10,R3=9; Ie=1 A,Is=0.25 A): `I0=0.34 A`, `I1=0.66 A`, `I2=−0.09 A` (sentido opuesto).
- **P12 — amperímetro (shunt Ayrton)** (rg=10,Ig=0.01; escalas 0.1/1/10 A): `R1≈0.011 Ω`, `R2=0.1 Ω`, `R3=1 Ω`.
- **P13 — voltímetro (multiplicadoras en cascada)** (rg=10,Ig=0.001; escalas 3/15/150 V): `R1=2990 Ω`, `R2=12000 Ω`, `R3=135000 Ω`.
- **P14 — divisor:** `Vs = Ve·R2·R3 / (R1R2+R1R3+R2R3)`.
- **P15 — potenciómetro (balance):** `Ex = Ep·(L'bc/Lbc)`.
- **P16 — Wheatstone (balance):** `Rx = R1·(Rbc/Rab) = R1·(Lbc/Lab)`.

> El detalle de ecuaciones por problema (planteo de nodos y mallas) está en el plan v1, Anexo D. El motor implementa este mismo método (corrientes de rama, KCL + KVL), así que el paso a paso del simulador coincide con las resoluciones oficiales de la cátedra.
