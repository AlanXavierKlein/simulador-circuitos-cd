# Circuitos CC

Simulador web interactivo de circuitos resistivos de corriente directa para el
trabajo práctico de Física II. La aplicación está construida con Next.js,
TypeScript, Tailwind CSS y shadcn/ui.

## Requisitos

- Node.js 20.9 o posterior
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

## Verificación de producción

```bash
npm run build
npm start
```

## Motor de cálculo

El motor implementa el método de corrientes de rama con ecuaciones KCL y KVL.
Usa `mathjs` únicamente para resolver el sistema lineal resultante.

Para ejecutar sus pruebas automáticas:

```bash
npm test
```

Para mostrar la comparación numérica de P8(a), P9 y P11:

```bash
npm run verify:engine
```
