export type TheoryDevelopment = {
  developmentSummary: string;
  developmentDetailed: string;
};

export const theoryDevelopments: Record<string, TheoryDevelopment> = {
  "current-density": {
    developmentSummary: String.raw`La **corriente eléctrica** es la cantidad de carga que atraviesa una sección de un conductor por unidad de tiempo: mide el "caudal" de carga.

- Definición: I = dQ/dt. Unidad: ampere (A) = coulomb/segundo.
- **Sentido convencional:** se toma el del flujo de cargas positivas, opuesto al movimiento real de los electrones en un metal.
- En **régimen estacionario**, la corriente es constante en el tiempo.

La **densidad de corriente** (J) dice cómo se reparte la corriente dentro del conductor: es la corriente por unidad de área, y es un vector.

**Deducción de J = n·q·v_d** (relacionar la corriente con el movimiento de los portadores):
1. Tomamos un conductor de sección A, con n portadores por unidad de volumen, cada uno con carga q, moviéndose con una velocidad media de arrastre v_d.
2. En un tiempo Δt, cada portador recorre una distancia Δx = v_d·Δt.
3. Los portadores que logran cruzar la sección en ese tiempo son los que están dentro de un volumen V = A·Δx = A·v_d·Δt.
4. La cantidad de portadores en ese volumen es N = n·V = n·A·v_d·Δt.
5. La carga total que cruza es ΔQ = q·N = n·q·A·v_d·Δt.
6. La corriente es I = ΔQ/Δt = n·q·A·v_d.
7. Dividiendo por el área se obtiene la densidad de corriente: J = I/A = n·q·v_d.

**Fórmulas:**
- I = dQ/dt
- J = I/A
- I = n·q·A·v_d
- J = n·q·v_d`,
    developmentDetailed: String.raw`**Corriente eléctrica.** Si una carga neta dQ atraviesa una superficie en un intervalo dt, la corriente instantánea es:

I = dQ/dt

Unidad: ampere (A) = C/s. Por convención, el sentido de la corriente es el del flujo de cargas positivas (opuesto al desplazamiento real de los electrones en un metal). En régimen estacionario, I no depende del tiempo.

**Densidad de corriente.** Es una magnitud vectorial que describe la distribución microscópica de la corriente dentro de un conductor. Si por una sección de área A circula una corriente I de manera uniforme:

J = I/A

Si J no es uniforme sobre la sección, la corriente total es el flujo de J a través de la superficie:

I = ∫∫ J · dA

**Relación con los portadores de carga.** Consideremos un conductor con n portadores de carga por unidad de volumen, cada uno con carga q, que se mueven con velocidad de arrastre v_d (todos en la misma dirección, en promedio). En un intervalo Δt, un portador recorre Δx = v_d·Δt. Los portadores que atraviesan una sección de área A en ese intervalo son los contenidos en el volumen ΔV = A·v_d·Δt. La cantidad de portadores en ese volumen es:

ΔN = n·ΔV = n·A·v_d·Δt

La carga transportada es ΔQ = q·ΔN = n·q·A·v_d·Δt, y la corriente:

I = ΔQ/Δt = n·q·v_d·A

de donde:

**J = n·q·v_d**

Esta expresión vincula la magnitud macroscópica J con la cinemática microscópica de los portadores.`,
  },
  "continuity-conductor": {
    developmentSummary: String.raw`La **ecuación de continuidad** es la expresión matemática de la **conservación de la carga**: la carga no se crea ni se destruye.

- Idea: si tomamos un volumen cerrado, la corriente neta que sale de él tiene que ser igual a la rapidez con que disminuye la carga que hay adentro. En forma integral: ∮ J·dA = − dQ/dt.
- En **régimen estacionario** la carga no se acumula en ningún punto (dQ/dt = 0), así que todo lo que entra sale: ∮ J·dA = 0. En un nodo de un circuito, esto es exactamente la **ley de nodos**: Σ I_entran = Σ I_salen.

El **modelo de conducción** (modelo de Drude) explica por qué aparece una velocidad de arrastre y de dónde sale la ley de Ohm.

**Deducción de v_d y de la conductividad σ:**
1. Sin campo aplicado, los electrones libres se mueven al azar por agitación térmica; su velocidad media neta es cero (no hay corriente).
2. Al aplicar un campo E, sobre cada electrón actúa una fuerza F = q·E, que le da una aceleración a = F/m = q·E/m.
3. Los electrones chocan continuamente con los iones del material. Entre choque y choque pasa un tiempo medio τ. En ese lapso, el electrón gana una velocidad v = a·τ = (q·E/m)·τ.
4. Cada colisión "reinicia" el movimiento, así que en promedio los electrones avanzan con esa velocidad de arrastre: v_d = q·E·τ/m.
5. Reemplazamos v_d en J = n·q·v_d: J = n·q·(q·E·τ/m) = (n·q²·τ/m)·E.
6. Llamamos conductividad a σ = n·q²·τ/m, y queda J = σ·E, que es la ley de Ohm en forma microscópica: la densidad de corriente es proporcional al campo.

**Fórmulas:**
- Continuidad: ∮ J·dA = − dQ/dt
- Estacionario (nodo): Σ I_entran = Σ I_salen
- v_d = q·E·τ/m
- σ = n·q²·τ/m
- J = σ·E`,
    developmentDetailed: String.raw`**Ecuación de continuidad.** Expresa la conservación de la carga eléctrica. Sea un volumen V limitado por una superficie cerrada S. La carga que sale de ese volumen por unidad de tiempo, a través de S, debe ser igual a la rapidez con que disminuye la carga Q_int contenida en V:

∮∮_S J · dA = − dQ_int/dt

En **régimen estacionario** la carga encerrada no cambia con el tiempo (dQ_int/dt = 0), de modo que:

∮∮_S J · dA = 0

Esta forma integral, aplicada a un nodo de un circuito (un punto donde confluyen varias ramas), es exactamente la ley de nodos de Kirchhoff: la corriente neta que sale de un nodo es cero, es decir, Σ I_entran = Σ I_salen.

**Modelo de conducción (modelo de Drude).** Este modelo clásico explica la conducción eléctrica en metales suponiendo que los electrones de valencia forman un "gas" de electrones libres que se mueven al azar entre los iones de la red cristalina, con velocidades térmicas altas pero orientadas aleatoriamente (velocidad media neta nula sin campo aplicado).

Al aplicar un campo eléctrico E, cada electrón experimenta una fuerza F = qE y una aceleración a = qE/m. Sea τ el tiempo medio libre entre colisiones sucesivas con la red. Inmediatamente después de una colisión se supone que la velocidad adquirida por el campo se pierde (el electrón "olvida" su velocidad de arrastre previa), y entre colisiones el electrón acelera desde el reposo (en la dirección del campo) durante un tiempo promedio τ, alcanzando una velocidad de arrastre promediada:

v_d = a·τ = (q·E/m)·τ

Sustituyendo en J = n·q·v_d:

J = n·q·(qEτ/m) = (n·q²·τ/m)·E

Definiendo la **conductividad** σ = n·q²·τ/m, se obtiene la ley de Ohm en su forma microscópica:

**J = σ·E**

Esta relación establece la proporcionalidad entre J y E que caracteriza a los materiales óhmicos, y conecta un parámetro macroscópico (σ) con propiedades microscópicas del material (n, τ) y de los portadores (q, m).`,
  },
  "ohm-resistivity": {
    developmentSummary: String.raw`La **ley de Ohm** dice que, en muchos materiales, la corriente es proporcional a la diferencia de potencial aplicada. La forma que se usa en circuitos (V = I·R) se puede deducir a partir de la forma microscópica (J = σ·E).

**Deducción de V = I·R y de R = ρ·L/A:**
1. Tomamos un conductor recto de longitud L y sección uniforme A, con una tensión V entre sus extremos.
2. Si el campo es uniforme dentro del conductor, se relaciona con la tensión como E = V/L.
3. La densidad de corriente, si es uniforme, es J = I/A.
4. Reemplazamos en la ley de Ohm microscópica J = σ·E: I/A = σ·(V/L).
5. Despejamos V: V = (L / (σ·A))·I.
6. El factor que acompaña a I es la resistencia: R = L/(σ·A). Usando la resistividad ρ = 1/σ, queda R = ρ·L/A.
7. Entonces V = I·R.

De acá se ve por qué la resistencia **crece con la longitud** y **baja con la sección**: un conductor más largo y más fino opone más resistencia.

- Un material es **óhmico** cuando R es constante (su curva I–V es una recta); en los **no óhmicos**, R cambia y la curva se curva.
- La resistividad depende de la temperatura: en los metales aumenta al calentarse.

**Fórmulas:**
- Microscópica: J = σ·E ; ρ = 1/σ
- R = ρ·L/A
- V = I·R
- ρ(T) = ρ₀·[1 + α·(T − T₀)]`,
    developmentDetailed: String.raw`**De la forma microscópica a la forma macroscópica.** Consideremos un conductor cilíndrico de longitud L y sección transversal uniforme A, sometido a una diferencia de potencial V entre sus extremos, con campo eléctrico uniforme en su interior E = V/L (esto vale exactamente para un conductor de sección constante en estado estacionario). Si la densidad de corriente también es uniforme, J = I/A. Sustituyendo en J = σE:

I/A = σ·(V/L)

Despejando V:

V = (L / (σA)) · I

El factor entre paréntesis se define como la **resistencia** del conductor:

**R = L / (σA) = ρ·L/A**

donde ρ = 1/σ es la **resistividad** del material. Con esta definición se recupera la forma habitual de la ley de Ohm:

**V = I·R**

**Materiales óhmicos y no óhmicos.** Un material es óhmico cuando R permanece constante para un amplio rango de V e I (la curva I–V es una recta que pasa por el origen). En los materiales no óhmicos (como los semiconductores de unión), R depende de V o de I, y la curva no es lineal.

**Dependencia con la temperatura.** En los metales, la resistividad crece aproximadamente en forma lineal con la temperatura en un rango moderado:

ρ(T) = ρ₀ · [1 + α(T − T₀)]

donde α es el coeficiente de temperatura de la resistividad. Este comportamiento es consistente con el modelo de Drude: al aumentar T, aumenta la agitación térmica de la red, disminuye el tiempo medio entre colisiones τ, y por lo tanto disminuye σ (aumenta ρ).`,
  },
  "resistor-associations": {
    developmentSummary: String.raw`Un conjunto de resistencias se puede reemplazar por una única **resistencia equivalente** que produce el mismo efecto.

**Serie — deducción de R_eq = Σ R:**
1. En serie, las resistencias están una tras otra en la misma rama, así que circula **la misma corriente I** por todas.
2. La tensión total es la suma de las caídas en cada una: V = V₁ + V₂ + … = I·R₁ + I·R₂ + …
3. Sacamos I de factor común: V = I·(R₁ + R₂ + …).
4. Comparando con V = I·R_eq, resulta R_eq = R₁ + R₂ + … + Rₙ.

**Paralelo — deducción de 1/R_eq = Σ 1/R:**
1. En paralelo, todas las resistencias están entre los mismos dos nodos, así que tienen **la misma tensión V**.
2. La corriente total se reparte y es la suma de las de cada rama: I = I₁ + I₂ + … = V/R₁ + V/R₂ + …
3. Sacamos V de factor común: I = V·(1/R₁ + 1/R₂ + …).
4. Comparando con I = V/R_eq, resulta 1/R_eq = 1/R₁ + 1/R₂ + … + 1/Rₙ.
5. Caso de dos resistencias: R_eq = R₁·R₂ / (R₁ + R₂).

Una **red mixta** se resuelve reduciendo por grupos (serie y paralelo) hasta una sola resistencia equivalente. De acá salen el **divisor de tensión** (serie) y el **divisor de corriente** (paralelo).

**Fórmulas:**
- Serie: R_eq = Σ R
- Paralelo: 1/R_eq = Σ (1/R) ; dos: R_eq = R₁·R₂/(R₁+R₂)`,
    developmentDetailed: String.raw`**Resistencias en serie.** Sean R₁, R₂, …, Rₙ conectadas una a continuación de otra, de modo que la misma corriente I circula por todas (no hay otro camino posible). La caída de tensión en cada una es Vᵢ = I·Rᵢ, y la tensión total aplicada al conjunto es la suma de las caídas parciales:

V = V₁ + V₂ + … + Vₙ = I·R₁ + I·R₂ + … + I·Rₙ = I·(R₁ + R₂ + … + Rₙ)

Comparando con V = I·R_eq, se concluye:

**R_eq = Σᵢ Rᵢ = R₁ + R₂ + … + Rₙ**

**Resistencias en paralelo.** Sean R₁, R₂, …, Rₙ conectadas entre los mismos dos nodos, de modo que todas tienen la misma diferencia de potencial V entre sus terminales. La corriente por cada una es Iᵢ = V/Rᵢ, y por conservación de la carga (ley de nodos), la corriente total que entra al conjunto se reparte entre las ramas:

I = I₁ + I₂ + … + Iₙ = V/R₁ + V/R₂ + … + V/Rₙ = V·(1/R₁ + 1/R₂ + … + 1/Rₙ)

Comparando con I = V/R_eq:

**1/R_eq = Σᵢ (1/Rᵢ)**

Para el caso particular de dos resistencias:

R_eq = R₁R₂ / (R₁ + R₂)

**Redes mixtas.** Cuando una red combina asociaciones serie y paralelo, se puede resolver identificando sucesivamente los subgrupos que cumplen la condición de serie o de paralelo, reemplazándolos por su equivalente, hasta reducir todo el circuito a una única resistencia equivalente entre los bornes de interés. Luego, aplicando la ley de Ohm sobre esa equivalente se obtiene la corriente (o tensión) total, y por retro-sustitución —recuperando las tensiones o corrientes en cada etapa de la reducción— se determinan las corrientes en las ramas originales.`,
  },
  "joule-emf": {
    developmentSummary: String.raw`**Ley de Joule — deducción de P = V·I = I²·R = V²/R:**
1. Cuando una carga dQ atraviesa una diferencia de potencial V, el campo realiza un trabajo dW = V·dQ (energía que la carga entrega, en la resistencia, en forma de calor).
2. La potencia es la energía por unidad de tiempo: P = dW/dt = V·(dQ/dt).
3. Como dQ/dt = I, queda P = V·I.
4. Usando la ley de Ohm (V = I·R) se obtienen las otras dos formas: P = I²·R (reemplazando V) y P = V²/R (reemplazando I).
5. La energía disipada en un tiempo t es W = P·t.

**Fuerza electromotriz (fem, ε) y resistencia interna:**
1. La fem es la energía que la fuente entrega por cada unidad de carga que impulsa; es lo que mantiene la diferencia de potencial. (No es una fuerza, a pesar del nombre.)
2. Toda fuente real tiene una **resistencia interna** r. Cuando circula corriente I, dentro de la fuente se pierde una caída I·r.
3. Aplicando la ley de mallas al lazo de la fuente, la tensión que queda disponible en los bornes es V = ε − I·r.
4. En circuito abierto (I = 0) no hay caída interna, así que V = ε. Cuanta más corriente entrega, más baja la tensión en bornes.

**Fórmulas:**
- P = V·I = I²·R = V²/R
- W = P·t
- Tensión en bornes: V = ε − I·r`,
    developmentDetailed: String.raw`**Deducción de la potencia disipada.** Consideremos un elemento de circuito (por ejemplo, una resistencia) con una diferencia de potencial V entre sus terminales, por el cual circula una corriente I. En un tiempo dt, una carga dQ = I·dt atraviesa el elemento. El trabajo que el campo eléctrico realiza sobre esa carga, al desplazarla a través de la diferencia de potencial V, es:

dW = V·dQ = V·I·dt

Este trabajo se disipa como energía térmica en la resistencia (efecto Joule). La potencia disipada es la rapidez con que se realiza ese trabajo:

**P = dW/dt = V·I**

Utilizando la ley de Ohm (V = IR) se obtienen las formas equivalentes:

P = I²R      (sustituyendo V = IR)
P = V²/R     (sustituyendo I = V/R)

La energía total disipada en un intervalo de tiempo t (con P constante) es W = P·t; en general, W = ∫ P dt.

**Fuerza electromotriz y resistencia interna.** La fem ε de una fuente se define como el trabajo por unidad de carga que la fuente realiza para impulsar la carga a través de su interior, en contra del campo electrostático que se opone (de ahí que en su interior se hable de una "fuerza" no electrostática, de origen químico, magnético, etc., según el tipo de fuente). No es una fuerza en sentido estricto, sino una energía por unidad de carga (su unidad es el volt).

Toda fuente real presenta una resistencia interna r asociada a su propia estructura. Al circular una corriente I por la fuente, la ley de mallas aplicada al lazo que contiene a la fuente da:

ε − I·r = V_bornes

es decir:

**V = ε − I·r**

Esta expresión muestra que la tensión disponible en los bornes decrece linealmente con la corriente entregada. Cuando I = 0 (circuito abierto), V = ε: la fem es la tensión medida sin carga conectada. La potencia total generada por la fuente es P_gen = εI; de ella, una fracción I²r se disipa en la resistencia interna y el resto, I·V = I(ε − Ir), se entrega al resto del circuito.`,
  },
  kirchhoff: {
    developmentSummary: String.raw`Las **leyes de Kirchhoff** permiten resolver circuitos que no se reducen solo con serie y paralelo (por ejemplo, con varias fuentes).

**Ley de nodos (LKC) — de dónde sale:**
1. En un nodo la carga no se acumula (régimen estacionario).
2. Por conservación de la carga, todo lo que entra por unidad de tiempo debe salir: Σ I_entran = Σ I_salen (o, con signos, la suma algebraica de corrientes en el nodo es cero).
3. Para un circuito de N nodos, solo N−1 ecuaciones de nodo son independientes: la del último nodo se puede obtener sumando las anteriores, así que no aporta información nueva.

**Ley de mallas (LKV) — de dónde sale:**
1. Se basa en la conservación de la energía: si una carga recorre una malla cerrada y vuelve al punto de partida, su energía potencial no cambió.
2. Eso significa que la suma de todas las subidas y bajadas de potencial a lo largo de la malla es cero: Σ V = 0.

**Método de resolución (paso a paso):**
1. Se asigna un sentido arbitrario a cada corriente incógnita.
2. Se plantean ecuaciones de nodo (LKC) y de malla (LKV) hasta tener tantas como incógnitas.
3. Convención al recorrer una malla: la caída R·I se toma **negativa** si el recorrido va a favor de la corriente y **positiva** si va en contra; una fuente aporta **+ε** si se pasa de su borne − al +, y **−ε** en el caso contrario.
4. Se resuelve el sistema. Si una corriente da negativa, su sentido real es el opuesto al que se supuso.

**Fórmulas:**
- Ley de nodos: Σ I = 0
- Ley de mallas: Σ V = 0
- En cada resistencia: V = I·R`,
    developmentDetailed: String.raw`**Ley de corrientes de Kirchhoff (LKC, ley de nodos).** Se deriva directamente de la ecuación de continuidad en régimen estacionario (Tema 2): en cualquier nodo de un circuito, la carga no se acumula, por lo que la corriente neta que entra debe ser igual a la que sale:

**Σ I_entran = Σ I_salen** (equivalentemente, Σ I = 0 con un criterio de signos)

Para un circuito con N nodos, solo N − 1 ecuaciones de nodo son linealmente independientes: la ecuación del N-ésimo nodo puede obtenerse como combinación lineal (de hecho, como la negativa de la suma) de las N − 1 restantes, por conservación global de la carga en todo el circuito.

**Ley de tensiones de Kirchhoff (LKV, ley de mallas).** Se deriva de la conservación de la energía (equivalentemente, del carácter conservativo del campo electrostático: la circulación de E a lo largo de un camino cerrado es nula). Si una carga de prueba recorre una malla cerrada del circuito y regresa a su punto de partida, el trabajo neto realizado sobre ella debe ser cero (su energía potencial no cambió). Esto se traduce en:

**Σ V = 0** a lo largo de toda malla cerrada

Para un circuito con b ramas y N nodos, el número de ecuaciones de malla independientes es b − (N − 1) (el número de "enlaces" respecto de un árbol de expansión del grafo del circuito).

**Procedimiento de resolución por corrientes de rama:**
1. Se asigna un sentido de referencia arbitrario a cada corriente de rama incógnita.
2. Se plantean N − 1 ecuaciones de nodo (LKC).
3. Se plantean b − (N − 1) ecuaciones de malla (LKV), recorriendo cada malla en un sentido elegido (por convención, horario). En cada elemento resistivo, la caída de tensión R·I se toma con signo negativo si el recorrido de la malla coincide con el sentido asumido de la corriente, y positivo si es opuesto. En cada fuente, se toma +ε si al recorrer la malla se pasa del borne negativo al positivo, y −ε en caso contrario.
4. Se resuelve el sistema lineal resultante (tantas ecuaciones como incógnitas). Si alguna corriente resulta negativa, el sentido real de esa corriente es el opuesto al asumido en el paso 1; la magnitud del valor obtenido sigue siendo correcta.`,
  },
  "rc-circuits": {
    developmentSummary: String.raw`> **Nota:** este tema **no se trabaja en el simulador** (la herramienta resuelve solo circuitos resistivos de corriente directa). Se incluye como **complemento teórico de la Unidad 4**.

Un **circuito RC** combina una resistencia y un capacitor. A diferencia de uno puramente resistivo, la corriente y la carga **no cambian de forma instantánea**: hay un **régimen transitorio** mientras el capacitor se carga o se descarga.

**Planteo (carga del capacitor):**
1. Al conectar una fuente ε en serie con R y C, aplicamos la ley de mallas: la fem se reparte entre la caída en la resistencia y la tensión del capacitor: ε = I·R + q/C.
2. La corriente es la rapidez con que se acumula carga en el capacitor: I = dq/dt.
3. Reemplazando queda una ecuación que relaciona q con su variación en el tiempo: ε = R·(dq/dt) + q/C.
4. La solución de esa ecuación (no la desarrollamos acá) es un crecimiento **exponencial** hacia el valor final Q_máx = C·ε. Es exponencial porque, a medida que el capacitor se carga, su tensión se opone cada vez más y la corriente disminuye.

**Constante de tiempo:**
- τ = R·C marca la rapidez del proceso. En t = τ, durante la carga el capacitor llega a ≈ 63 % de su carga máxima; durante la descarga cae a ≈ 37 % del valor inicial.

**Fórmulas:**
- Malla (carga): ε = R·(dq/dt) + q/C
- Constante de tiempo: τ = R·C
- Carga: q(t) = Q_máx·(1 − e^(−t/RC)), con Q_máx = C·ε
- Descarga: q(t) = Q₀·e^(−t/RC)
- Corriente: i(t) = I₀·e^(−t/RC)

---



---`,
    developmentDetailed: String.raw`> **Nota:** este tema **no se trabaja en el simulador** (la herramienta resuelve solo circuitos resistivos de corriente directa). Se incluye como **complemento teórico de la Unidad 4**.

**Carga del capacitor.** Consideremos una fuente de fem ε, una resistencia R y un capacitor de capacidad C conectados en serie, inicialmente descargado (q(0) = 0), con un interruptor que cierra el circuito en t = 0. Aplicando la ley de mallas en cualquier instante t > 0:

ε = I·R + q/C

donde q es la carga instantánea en el capacitor. Como la corriente es la rapidez de acumulación de carga, I = dq/dt, la ecuación de malla se convierte en una ecuación diferencial de primer orden para q(t):

ε = R·(dq/dt) + q/C

Reordenando:

dq/dt = ε/R − q/(RC) = (1/RC)·(εC − q)

Separando variables:

dq / (εC − q) = dt / (RC)

Integrando ambos miembros, con la condición inicial q(0) = 0:

∫₀^q dq' / (εC − q') = ∫₀^t dt' / (RC)

− ln[(εC − q)/(εC)] = t/(RC)

Despejando q(t):

**q(t) = εC · (1 − e^(−t/RC)) = Q_máx · (1 − e^(−t/RC))**, con Q_máx = εC

Derivando respecto del tiempo se obtiene la corriente de carga:

**i(t) = dq/dt = (ε/R) · e^(−t/RC) = I₀ · e^(−t/RC)**, con I₀ = ε/R

**Descarga del capacitor.** Si un capacitor cargado con carga inicial Q₀ se conecta a una resistencia R (sin fuente), la ley de mallas da 0 = I·R + q/C, con I = dq/dt (ahora q disminuye, por lo que I será negativa según el signo adoptado, indicando que la corriente circula en sentido de descarga):

R·(dq/dt) = − q/C   ⟹   dq/q = − dt/(RC)

Integrando con q(0) = Q₀:

**q(t) = Q₀ · e^(−t/RC)**

y la corriente de descarga resulta i(t) = |dq/dt| = (Q₀/RC)·e^(−t/RC) = I₀·e^(−t/RC).

**Constante de tiempo.** En ambos procesos aparece el parámetro τ = R·C, con unidades de tiempo (constante de tiempo del circuito). En t = τ:
- Carga: q(τ) = Q_máx·(1 − e⁻¹) ≈ 0,632·Q_máx (≈ 63 %).
- Descarga: q(τ) = Q₀·e⁻¹ ≈ 0,368·Q₀ (≈ 37 %).

τ cuantifica cuán rápido evoluciona el sistema: constantes de tiempo mayores (R o C más grandes) implican transitorios más lentos.

---`,
  },
};
