import type { Metadata } from "next";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BookOpenCheck,
  Cable,
  ChartNoAxesCombined,
  CircleHelp,
  CircuitBoard,
  Gauge,
  Laptop,
  Lightbulb,
  RotateCcw,
  SlidersHorizontal,
  Waypoints,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Cómo usar la web" };

const sectionClass =
  "scroll-mt-24 rounded-3xl border border-slate-800 bg-slate-950/65 p-5 sm:p-7";
const headingClass = "text-xl font-semibold text-white sm:text-2xl";
const paragraphClass = "mt-3 text-sm leading-7 text-slate-300 sm:text-base";

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4 text-sm leading-6 text-cyan-50/85">
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-cyan-300" />
      <p>{children}</p>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/55 p-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] font-mono text-sm font-semibold text-cyan-200">
        {number}
      </span>
      <div>
        <h3 className="font-semibold text-slate-100">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">{children}</p>
      </div>
    </li>
  );
}

export default function HelpPage() {
  const sections = [
    { href: "#navegacion", icon: <Waypoints className="size-4" />, label: "Navegación" },
    { href: "#modo-guia", icon: <BookOpenCheck className="size-4" />, label: "Modo guía" },
    { href: "#instrumentos", icon: <Gauge className="size-4" />, label: "Instrumentos" },
    { href: "#teoria", icon: <Lightbulb className="size-4" />, label: "Teoría" },
    { href: "#constructor", icon: <CircuitBoard className="size-4" />, label: "Constructor" },
    { href: "#resultados", icon: <ChartNoAxesCombined className="size-4" />, label: "Resultados" },
    { href: "#ayudas", icon: <CircleHelp className="size-4" />, label: "Ayudas y problemas" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <header className="relative isolate overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.09] via-slate-950 to-slate-950 p-6 shadow-2xl shadow-cyan-950/15 sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-16 -z-10 size-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <p className="app-kicker">Ayuda · Circuitos CC</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Cómo usar toda la web
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
          Recorré los ejercicios, probá cómo cambian los circuitos y armá una red
          propia. Esta guía explica qué hace cada sección y cómo leer sus
          resultados.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/guia"
            className="app-button-primary inline-flex min-h-11 items-center gap-2 px-4 text-sm"
          >
            <BookOpenCheck className="size-4" /> Ir a los problemas
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="#recorrido"
            className="app-button-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm"
          >
            Ver el recorrido <ArrowDown className="size-4" />
          </a>
        </div>
      </header>

      <nav
        id="recorrido"
        aria-label="Índice de la guía"
        className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {sections.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-4 text-sm text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-100"
          >
            <span className="text-cyan-300">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-5">
        <section id="navegacion" className={sectionClass}>
          <div className="flex items-center gap-3">
            <span className="app-icon size-11"><Waypoints className="size-5" /></span>
            <div><p className="app-kicker">01 · Empezar</p><h2 className={headingClass}>Navegación y recorrido recomendado</h2></div>
          </div>
          <p className={paragraphClass}>La barra superior aparece en todas las pantallas. Desde ahí podés volver al inicio o entrar a Modo guía, Constructor, Teoría y Ayuda. En pantallas pequeñas, abrí el menú con el botón de las tres líneas.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <article className="app-surface-inset p-4"><h3 className="font-semibold text-cyan-100">Quiero resolver un ejercicio</h3><p className="mt-2 text-sm leading-6 text-slate-400">Entrá en <Link className="text-cyan-200 underline underline-offset-4" href="/guia">Modo guía</Link>, elegí el problema y abrí su simulación.</p></article>
            <article className="app-surface-inset p-4"><h3 className="font-semibold text-cyan-100">Quiero repasar un tema</h3><p className="mt-2 text-sm leading-6 text-slate-400">Entrá en <Link className="text-cyan-200 underline underline-offset-4" href="/teoria">Teoría</Link> y abrí el tema que te interese.</p></article>
            <article className="app-surface-inset p-4"><h3 className="font-semibold text-cyan-100">Quiero probar mi propio circuito</h3><p className="mt-2 text-sm leading-6 text-slate-400">Abrí <Link className="text-cyan-200 underline underline-offset-4" href="/constructor">Constructor</Link>. Para arrastrar y conectar con precisión, usá una computadora.</p></article>
          </div>
        </section>

        <section id="modo-guia" className={sectionClass}>
          <div className="flex items-center gap-3">
            <span className="app-icon size-11"><BookOpenCheck className="size-5" /></span>
            <div><p className="app-kicker">02 · Ejercicios</p><h2 className={headingClass}>Resolver con Modo guía</h2></div>
          </div>
          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            <Step number="1" title="Elegí un problema">En /guia, tocá una tarjeta para desplegar el enunciado y la figura. Seleccioná Resolver para abrirlo.</Step>
            <Step number="2" title="Revisá la explicación">En el ejercicio, consultá el resumen teórico y Cómo usar. Algunos problemas tienen más de un caso de estudio.</Step>
            <Step number="3" title="Explorá el circuito">El dibujo interactivo se puede desplazar arrastrando el fondo y acercar o alejar con la rueda o los controles del canvas.</Step>
            <Step number="4" title="Probá otros valores">En Parámetros, editá el campo numérico, usá los botones o mové el deslizador. El cálculo y las animaciones se actualizan automáticamente.</Step>
          </ol>
          <p className={paragraphClass}>Los problemas P8, P9 y P11 muestran redes eléctricas. P12 permite diseñar un amperímetro con shunt Ayrton y P13 un voltímetro de tres escalas. En los ejercicios de instrumentos, cambiá rg, Ig y las escalas en el panel Datos.</p>
          <Tip>Restablecer valores vuelve a los datos originales del ejercicio. Si cambiaste parámetros, la resolución de cátedra sigue mostrando el desarrollo original; el resultado del simulador sí refleja los valores actuales.</Tip>
        </section>

        <section id="instrumentos" className={sectionClass}>
          <div className="flex items-center gap-3">
            <span className="app-icon size-11"><Gauge className="size-5" /></span>
            <div><p className="app-kicker">03 · P12 y P13</p><h2 className={headingClass}>Diseñar amperímetro y voltímetro</h2></div>
          </div>
          <p className={paragraphClass}>En el problema 12 configurás la resistencia del galvanómetro (rg), su corriente de fondo de escala (Ig) y las tres escalas de corriente. En el problema 13 ingresás los mismos datos del galvanómetro y las escalas de tensión.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <article className="app-surface-inset p-4"><SlidersHorizontal className="size-5 text-cyan-300" /><h3 className="mt-3 font-semibold text-slate-100">Editá los datos</h3><p className="mt-2 text-sm leading-6 text-slate-400">Escribí valores positivos respetando las unidades que aparecen junto a cada campo.</p></article>
            <article className="app-surface-inset p-4"><Activity className="size-5 text-lime-300" /><h3 className="mt-3 font-semibold text-slate-100">Leé el cálculo</h3><p className="mt-2 text-sm leading-6 text-slate-400">Las resistencias R1, R2 y R3 se recalculan al instante y el esquema acompaña las escalas ingresadas.</p></article>
            <article className="app-surface-inset p-4"><RotateCcw className="size-5 text-amber-300" /><h3 className="mt-3 font-semibold text-slate-100">Volvé al enunciado</h3><p className="mt-2 text-sm leading-6 text-slate-400">Usá Restablecer valores para recuperar los datos originales del problema.</p></article>
          </div>
        </section>

        <section id="teoria" className={sectionClass}>
          <div className="flex items-center gap-3">
            <span className="app-icon size-11"><Lightbulb className="size-5" /></span>
            <div><p className="app-kicker">04 · Contenidos</p><h2 className={headingClass}>Estudiar en Teoría</h2></div>
          </div>
          <p className={paragraphClass}>La página Teoría reúne corriente eléctrica y densidad de corriente, continuidad, ley de Ohm y resistividad, asociaciones de resistencias, ley de Joule y fuerza electromotriz, leyes de Kirchhoff y circuitos RC. Abrí un tema para leer su desarrollo. Cuando haya un video asociado, podés abrirlo desde el propio contenido.</p>
          <Tip>El tema de circuitos RC es complementario: el simulador actual está pensado para circuitos resistivos de corriente continua y no resuelve circuitos RC.</Tip>
        </section>

        <section id="constructor" className={sectionClass}>
          <div className="flex items-center gap-3">
            <span className="app-icon size-11"><CircuitBoard className="size-5" /></span>
            <div><p className="app-kicker">05 · Laboratorio libre</p><h2 className={headingClass}>Construir un circuito propio</h2></div>
          </div>
          <p className={paragraphClass}>El constructor permite combinar resistencias, fuentes de tensión, fuentes de corriente y nodos de unión. Está optimizado para computadoras de escritorio o pantallas grandes.</p>
          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            <Step number="1" title="Agregá elementos">Hacé clic en una pieza de la paleta o arrastrala al canvas. También podés empezar con Cargar ejemplo.</Step>
            <Step number="2" title="Conectá con nodos">Conectá cada terminal del componente a un nodo de unión. No se conectan componentes directamente entre sí; cada terminal admite un cable.</Step>
            <Step number="3" title="Editá propiedades">Seleccioná un elemento para cambiar su etiqueta o valor. Las propiedades permiten ajustar orientación y elegir el nodo de tierra; también podés rotar un componente seleccionado con R.</Step>
            <Step number="4" title="Completá una red válida">Conectá los dos terminales de cada componente a nodos distintos y cerrá una malla. El indicador de progreso y los mensajes del constructor ayudan a encontrar conexiones pendientes.</Step>
          </ol>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <article className="app-surface-inset p-4"><h3 className="font-semibold text-cyan-100">Moverse por el canvas</h3><p className="mt-2 text-sm leading-6 text-slate-400">Arrastrá el fondo para desplazarte y usá la rueda o los controles para acercar o alejar.</p></article>
            <article className="app-surface-inset p-4"><h3 className="font-semibold text-cyan-100">Guardar y cargar</h3><p className="mt-2 text-sm leading-6 text-slate-400">Los botones Guardar y Cargar conservan una copia local del circuito en el navegador que estás usando.</p></article>
            <article className="app-surface-inset p-4"><h3 className="font-semibold text-cyan-100">Borrar o reiniciar</h3><p className="mt-2 text-sm leading-6 text-slate-400">Seleccioná una pieza o cable y usá Borrar elemento o Supr/Delete. Limpiar canvas elimina el diseño actual; Cargar ejemplo crea uno nuevo.</p></article>
          </div>
          <Tip>La primera unión se crea como tierra. Podés cambiar la referencia seleccionando otro nodo y eligiendo Usar como tierra en Propiedades. Una red sin conexiones suficientes puede mostrar un aviso en lugar de resultados.</Tip>
        </section>

        <section id="resultados" className={sectionClass}>
          <div className="flex items-center gap-3">
            <span className="app-icon size-11"><ChartNoAxesCombined className="size-5" /></span>
            <div><p className="app-kicker">06 · Interpretar</p><h2 className={headingClass}>Leer resultados y desarrollo</h2></div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <article className="app-surface-inset p-4"><h3 className="font-semibold text-cyan-100">Resultados</h3><p className="mt-2 text-sm leading-6 text-slate-400">El panel muestra las lecturas principales del ejercicio o las corrientes de rama. Abrí Otras magnitudes para consultar corrientes, tensiones, caídas y potencias. En los circuitos que tienen varios nodos, también podés elegir los dos nodos de referencia para calcular su diferencia de potencial.</p></article>
            <article className="app-surface-inset p-4"><h3 className="font-semibold text-cyan-100">Paso a paso</h3><p className="mt-2 text-sm leading-6 text-slate-400">Abrí el desarrollo de Kirchhoff para ver las corrientes de referencia, ecuaciones de nodo (KCL), ecuaciones de malla (KVL), sistema y solución.</p></article>
          </div>
          <Tip>Las flechas indican el sentido de referencia. Si una corriente calculada aparece negativa, la corriente real circula en el sentido contrario a esa flecha.</Tip>
        </section>

        <section id="ayudas" className={sectionClass}>
          <div className="flex items-center gap-3">
            <span className="app-icon size-11"><CircleHelp className="size-5" /></span>
            <div><p className="app-kicker">07 · Ayuda contextual</p><h2 className={headingClass}>Atajos y solución de problemas</h2></div>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li className="flex gap-3"><CircleHelp className="mt-1 size-4 shrink-0 text-cyan-300" /><span>En las pantallas del simulador, los ejercicios y el constructor, abrí <strong className="text-slate-100">Cómo usar</strong> para ver instrucciones específicas de esa sección. En el constructor también hay videos cortos.</span></li>
            <li className="flex gap-3"><Laptop className="mt-1 size-4 shrink-0 text-cyan-300" /><span>Si estás en un teléfono y el constructor no aparece, abrilo desde una computadora o una pantalla más grande.</span></li>
            <li className="flex gap-3"><Cable className="mt-1 size-4 shrink-0 text-cyan-300" /><span>Si el circuito no se puede resolver, revisá que las conexiones estén completas, que los terminales vayan a nodos distintos y que exista una malla cerrada. El mensaje de error da más información sobre el problema.</span></li>
            <li className="flex gap-3"><SlidersHorizontal className="mt-1 size-4 shrink-0 text-cyan-300" /><span>Si los resultados no coinciden con el enunciado después de hacer cambios, restablecé los valores para volver al caso original.</span></li>
          </ul>
        </section>
      </div>

      <footer className="mt-7 flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:flex-row sm:items-center sm:p-6">
        <div><p className="font-semibold text-white">¿Listo para empezar?</p><p className="mt-1 text-sm text-slate-400">Elegí un ejercicio o probá el laboratorio libre.</p></div>
        <div className="flex flex-wrap gap-3">
          <Link href="/guia" className="app-button-primary inline-flex min-h-11 items-center gap-2 px-4 text-sm"><BookOpenCheck className="size-4" /> Modo guía</Link>
          <Link href="/constructor" className="app-button-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm"><CircuitBoard className="size-4" /> Constructor</Link>
        </div>
      </footer>
    </section>
  );
}
