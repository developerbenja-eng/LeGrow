/**
 * Content that accumulates as the project moves.
 *
 * Kept out of the components so the overview board can count and summarise it
 * without importing any UI.
 */

export type BomItem = { group: string; item: string; low: number; high: number };

export const BOM: readonly BomItem[] = [
  { group: 'Cultivo', item: 'Luz LED ~70W', low: 50, high: 70 },
  { group: 'Cultivo', item: 'Carpa 2 x 2 ft', low: 50, high: 65 },
  { group: 'Cultivo', item: 'Ventilador clip', low: 15, high: 15 },
  { group: 'Cultivo', item: '3x Dutch bucket + medio + goteo', low: 30, high: 45 },
  { group: 'Cultivo', item: '3x planta Seascape (bare root)', low: 5, high: 10 },
  { group: 'Cultivo', item: 'Nutrientes A/B + buffers de pH', low: 30, high: 45 },
  { group: 'Medicion', item: 'ESP32 + SCD41 + BH1750 + OLED', low: 40, high: 60 },
  { group: 'Medicion', item: 'Sonda pH + sonda EC/TDS', low: 42, high: 55 },
  { group: 'Dosificacion', item: '3x bomba peristaltica + reles', low: 30, high: 53 },
];

export const bomTotal = () =>
  BOM.reduce((a, b) => ({ low: a.low + b.low, high: a.high + b.high }), { low: 0, high: 0 });

export const bomGroups = () => [...new Set(BOM.map((b) => b.group))];

/**
 * Species screened against the rig we actually designed: 3 buckets, 2x2 ft,
 * 70W, and — decisively — one shared recirculating reservoir, which means one
 * pH for everything in the tent. pH ranges are from report 07.
 */
export type Species = {
  name: string;
  ph: [number, number];
  pot: string;
  chill: string;
  verdict: 'in' | 'out';
  why: string;
};

export const SPECIES: readonly Species[] = [
  {
    name: 'Frutilla dia-neutro',
    ph: [5.8, 6.2],
    pot: '6-8 in',
    chill: 'ninguna',
    verdict: 'in',
    why: 'Unica especie sin dormancia. El calendario del informe 07 dice "Producing" los 12 meses.',
  },
  {
    name: 'Frambuesa',
    ph: [5.6, 6.2],
    pot: '5-10 gal',
    chill: '4-6 semanas a 0-7°C',
    verdict: 'out',
    why: 'Mide 4-6 ft. No cabe bajo una luz colgada a 2 ft, y la dormancia pide refrigerador.',
  },
  {
    name: 'Mora',
    ph: [5.5, 6.5],
    pot: '10-20 gal',
    chill: '4-8 semanas',
    verdict: 'out',
    why: 'Triple Crown tira canas de 10-15 ft y necesita espaldera.',
  },
  {
    name: 'Arandano',
    ph: [4.5, 5.0],
    pot: '5-10 gal',
    chill: '4-8 semanas',
    verdict: 'out',
    why: 'pH 4.5-5.0 contra 5.8-6.2 de la frutilla: diez veces mas acido. Imposible en un estanque compartido.',
  },
  {
    name: 'Cerezo',
    ph: [6.0, 7.0],
    pot: '15-20 gal',
    chill: '2-3 meses',
    verdict: 'out',
    why: 'Fuera de escala en todas las dimensiones.',
  },
];

export type LogEntry = { state: 'done' | 'open'; text: string; module?: string };

export const LOG: readonly LogEntry[] = [
  { state: 'done', text: 'Repo renombrado growbox → LeGrow: remoto, clon local y 36 referencias internas.' },
  {
    state: 'done',
    module: 'nutrientes',
    text: 'Hidroponia Dutch bucket en vez de tierra: EC y pH pasan a ser medibles y corregibles.',
  },
  {
    state: 'done',
    module: 'luz',
    text: 'Carpa 2x2 con 70W y 3 baldes. El panel no escala con la carpa, por eso 2x4 queda a oscuras.',
  },
  {
    state: 'done',
    module: 'materiales',
    text: 'Fuera el filtro de carbon: es herencia del cultivo de cannabis y la frutilla no huele. Ahorra $100-120.',
  },
  {
    state: 'done',
    module: 'experimento',
    text: 'Las 3 plantas corren en condiciones identicas para medir el piso de ruido, no para comparar tratamientos.',
  },
  {
    state: 'open',
    module: 'luz',
    text: '¿70W es presupuesto fijo o se estira a 100W? Es la diferencia entre DLI 14-17 y 21-25.',
  },
  {
    state: 'open',
    module: 'vpd',
    text: 'CO2: el objetivo es 800-1200 ppm y no hay fuente de CO2 en ningun BOM. Agregar fuente o borrar el objetivo.',
  },
  {
    state: 'open',
    module: 'vpd',
    text: 'Reemplazar los umbrales independientes de temp/RH del firmware por control sobre VPD.',
  },
  {
    state: 'open',
    module: 'luz',
    text: 'Torres verticales: 90 plantas/m2 contra 10-12. Invalidaria la eleccion de luminaria.',
  },
  {
    state: 'done',
    module: 'planta',
    text: 'Seascape dia-neutro como unica especie, por eliminacion fisica: un estanque significa un solo pH y el arandano esta a un punto completo de distancia.',
  },
  {
    state: 'done',
    module: 'planta',
    text: 'Cortar las primeras flores durante 4 semanas post-trasplante. Se sacrifica un mes de fruta para construir corona y raiz.',
  },
  {
    state: 'done',
    module: 'planta',
    text: 'El ventilador clip es el polinizador, no un accesorio de humedad. Sin agitacion mecanica la fruta sale deforme.',
  },
  {
    state: 'open',
    module: 'planta',
    text: 'La noche optima de 10-12°C no es alcanzable en Memphis sin refrigeracion activa, y no hay nada de eso en el BOM. Se acepta 18°C y se paga en sabor y cuaje.',
  },
  {
    state: 'done',
    module: 'rotacion',
    text: 'Un solo ESP32 para las dos carpas: dos buses I2C resuelven el choque de direccion del SCD41, y ADC1 tiene canales de sobra. Una sola base de tiempo.',
  },
  {
    state: 'done',
    module: 'rotacion',
    text: 'La carpa 2 se compra en el mes 3-4, cuando los estolones pidan donde enraizar. Antes de eso estaria vacia.',
  },
  {
    state: 'open',
    module: 'rotacion',
    text: '¿Carpa 2 como vivero barato ($150-210) o instrumentada identica para A/B cruzado ($250-330)?',
  },
  {
    state: 'open',
    module: 'rotacion',
    text: 'Antes de cualquier A/B hay que correr las dos carpas en condiciones identicas para medir cuanto difieren entre si.',
  },
  { state: 'open', text: 'Las 8 rutas /reports/* de la portada siguen devolviendo 404.' },
];

export const openCount = (moduleSlug?: string) =>
  LOG.filter((e) => e.state === 'open' && (moduleSlug ? e.module === moduleSlug : true)).length;
