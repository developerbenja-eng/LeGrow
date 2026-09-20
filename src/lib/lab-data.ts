/**
 * Content that accumulates as the project moves.
 *
 * Kept out of the components so the overview board can count and summarise it
 * without importing any UI.
 */

/**
 * Species screened against the rig we actually designed: 3 buckets, 2x2 ft,
 * and — decisively — one shared recirculating reservoir, which means one pH
 * for everything in the tent. pH ranges are from report 07.
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

/**
 * Bill of materials, ordered by critical path rather than by category.
 *
 * tier 0 blocks planting the crowns, tier 1 is needed within the first six
 * weeks, tier 2 is the instrument layer the plants do not care about.
 */
export type BomItem = {
  item: string;
  tier: 0 | 1 | 2;
  source: 'online' | 'local';
  /** Actual price paid when ordered, otherwise an estimate range. */
  low: number;
  high: number;
  status: 'ordered' | 'pending';
  note?: string;
};

export const BOM: readonly BomItem[] = [
  // --- Ordered 2026-09-16 ---
  { item: 'VIVOSUN LumaLight 100W', tier: 0, source: 'online', low: 75.99, high: 75.99, status: 'ordered' },
  { item: 'Carpa MELONFARM 2x2x48"', tier: 0, source: 'online', low: 53.99, high: 53.99, status: 'ordered' },
  { item: 'Inline duct fan 4" + controlador', tier: 0, source: 'online', low: 19.99, high: 19.99, status: 'ordered', note: 'Sin filtro de carbon: es para olor y la frutilla no huele.' },
  { item: 'VIVOSUN Base A 4-0-1 + Base B 1-4-2, 8oz', tier: 0, source: 'online', low: 19.99, high: 19.99, status: 'ordered', note: 'Liquido, va directo a la peristaltica. 5x mas caro por galon que MasterBlend en polvo.' },
  { item: 'Buffers Biopharm 4.00 / 7.00 / 10.00', tier: 0, source: 'online', low: 26, high: 26, status: 'ordered', note: 'El de 10.00 no se usa: nuestro rango es 5.8-6.2.' },
  { item: 'Lapicero de pH precalibrado', tier: 0, source: 'online', low: 8.99, high: 8.99, status: 'ordered' },
  { item: 'HITOP air pump doble salida', tier: 1, source: 'online', low: 14.97, high: 14.97, status: 'ordered', note: 'Homogeneiza el estanque. Sin mezcla, las sondas leen un bolson local.' },
  { item: 'Athena CaMg', tier: 1, source: 'online', low: 16.99, high: 16.99, status: 'ordered', note: 'No dosificar por defecto: Base A ya trae calcio. Obligatorio si usas coco o agua lluvia.' },
  { item: 'Teyleten modulo pH (electrodo + PH-4502C)', tier: 2, source: 'online', low: 21.99, high: 21.99, status: 'ordered' },
  { item: 'HiLetgo ADS1115 x3', tier: 2, source: 'online', low: 11.89, high: 11.89, status: 'ordered', note: 'El ADC interno del ESP32 no es lo bastante bueno para accionar bombas.' },

  // --- Still to order ---
  { item: 'pH Down', tier: 0, source: 'online', low: 12, high: 18, status: 'pending', note: 'BLOQUEA. Los buffers calibran el instrumento; no corrigen la solucion.' },
  { item: 'Lapicero de TDS/EC', tier: 1, source: 'online', low: 12, high: 15, status: 'pending', note: 'Sin el no se puede hacer la comparacion de agua.' },
  { item: 'Tablero de reles 4 canales 5V (pack de 2)', tier: 2, source: 'online', low: 8.79, high: 8.79, status: 'pending' },
  { item: '3x bomba peristaltica 12V', tier: 2, source: 'online', low: 45, high: 60, status: 'pending' },
  { item: 'Fuente 12V 2A separada', tier: 2, source: 'online', low: 10, high: 12, status: 'pending' },
  { item: 'Sonda EC DFRobot SEN0451', tier: 2, source: 'online', low: 50, high: 70, status: 'pending', note: 'IP68 para inmersion continua y PT1000 integrado. El SEN0244 del informe 03 no sirve permanente.' },
  { item: '25x bare root Seascape', tier: 0, source: 'online', low: 28, high: 28, status: 'pending', note: 'Pedir recien cuando el rig cicle limpio. Sobran 22 para elegir 3 coronas emparejadas.' },

  // --- Local, same day ---
  { item: '3x balde 5 gal + tapas', tier: 0, source: 'local', low: 15, high: 24, status: 'pending' },
  { item: 'Medio inerte: perlita + coco', tier: 0, source: 'local', low: 15, high: 25, status: 'pending', note: 'NO la tierra Fox Farm del informe 04.' },
  { item: 'Tuberia, goteros y fittings de drenaje', tier: 0, source: 'local', low: 15, high: 25, status: 'pending' },
  { item: 'Estanque 5 gal + tapa', tier: 0, source: 'local', low: 5, high: 8, status: 'pending', note: 'Va FUERA de la carpa: luz sobre solucion = algas.' },
  { item: 'Bomba sumergible de aporte', tier: 0, source: 'local', low: 10, high: 20, status: 'pending', note: 'El informe 03 lista una peristaltica para regar. Las peristalticas son para dosificar.' },
  { item: 'Timer de enchufe', tier: 0, source: 'local', low: 10, high: 15, status: 'pending', note: '17h on / 7h off.' },
  { item: 'Ventilador clip', tier: 1, source: 'local', low: 15, high: 18, status: 'pending', note: 'Es el polinizador, no un accesorio de humedad.' },
];

export const bomSum = (items: readonly BomItem[]) =>
  items.reduce((a, b) => ({ low: a.low + b.low, high: a.high + b.high }), { low: 0, high: 0 });

export const bomOrdered = () => BOM.filter((b) => b.status === 'ordered');
export const bomPending = () => BOM.filter((b) => b.status === 'pending');
export const bomBlocking = () => BOM.filter((b) => b.tier === 0 && b.status === 'pending');
export const bomTotal = () => bomSum(BOM);

export type LogEntry = { state: 'done' | 'open'; text: string; module?: string };

export const LOG: readonly LogEntry[] = [
  { state: 'done', text: 'Repo renombrado growbox → LeGrow: remoto, clon local y 36 referencias internas.' },
  {
    state: 'done',
    module: 'luz',
    text: 'Luz de 100W en vez de 70W. Dimeable puede bajar a 70W; 70W no puede subir. $1.55/mes de diferencia decide nada.',
  },
  {
    state: 'done',
    module: 'luz',
    text: 'Carpa 2x2x48". La altura alcanza justo: balde 15" + planta 10" deja ~20" de cuelgue, y lo que falte en trasplante se compensa atenuando.',
  },
  {
    state: 'done',
    module: 'luz',
    text: 'Tres baldes, no cuatro. Cuatro baldes de 12" en 24x24 son pared a pared, sin espacio para manguera ni manos.',
  },
  {
    state: 'done',
    module: 'nutrientes',
    text: 'Hidroponia Dutch bucket en vez de tierra: EC y pH pasan a ser medibles y corregibles.',
  },
  {
    state: 'done',
    module: 'nutrientes',
    text: 'El estanque va fuera de la carpa. Luz sobre solucion nutritiva produce algas, y medir sin abrir la carpa es mas comodo.',
  },
  {
    state: 'done',
    module: 'nutrientes',
    text: 'Nada de circulacion dentro del balde: el medio oxigena porque entre riegos se llena de aire. Circulacion va en el estanque, riego intermitente a los baldes.',
  },
  {
    state: 'done',
    module: 'materiales',
    text: 'Fuera el filtro de carbon: es herencia del cultivo de cannabis y la frutilla no huele. Ahorra $100-120.',
  },
  {
    state: 'done',
    module: 'materiales',
    text: 'Tres errores del informe 04: la lista de insumos es de tierra, confunde bomba de dosificacion con bomba de riego, y no contempla medidores de mano.',
  },
  {
    state: 'done',
    module: 'experimento',
    text: 'Las 3 plantas corren en condiciones identicas para medir el piso de ruido, no para comparar tratamientos.',
  },
  {
    state: 'done',
    module: 'planta',
    text: 'Seascape dia-neutro como unica especie, por eliminacion fisica: un estanque significa un solo pH y el arandano esta a un punto completo de distancia.',
  },
  {
    state: 'done',
    module: 'planta',
    text: 'Bare roots, no semilla. Seascape es un cultivar y no se reproduce fiel por semilla — y el piso de ruido solo significa algo si las tres plantas son clones.',
  },
  {
    state: 'done',
    module: 'planta',
    text: 'La ventana de marzo del informe 05 no es vinculante: hay bare roots en frio despachando en septiembre.',
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
    state: 'done',
    module: 'control',
    text: 'Construccion por etapas: manual → solo monitoreo → alertas → lazo cerrado. No se puede sintonizar un dosificador sin saber a que velocidad deriva el pH en este estanque.',
  },
  {
    state: 'done',
    module: 'control',
    text: 'pH Down diluido 1:4. A 3.5 mL/s una dosis de 1-2 mL es un pulso de medio segundo, irrepetible. Diluido pasa a 5-10 mL y 1.5-3 segundos.',
  },
  {
    state: 'done',
    module: 'control',
    text: 'Nunca dosificar A y B seguidas: el calcio concentrado con fosfatos y sulfatos precipita. Dosificar A, mezclar, dosificar B.',
  },
  {
    state: 'done',
    module: 'control',
    text: 'Un solo ESP32 para las dos carpas: dos buses I2C resuelven el choque de direccion del SCD41, y ADC1 tiene canales de sobra. Una sola base de tiempo.',
  },
  {
    state: 'done',
    module: 'agua',
    text: 'Agua de MLGW: 115 ppm de TDS, 44.7 ppm de dureza (blanda), sin PFAS. Las tres razones habituales para rechazar agua de la llave no aplican en Memphis.',
  },
  {
    state: 'done',
    module: 'agua',
    text: 'Primer estanque con agua de la llave para tener linea base con un insumo conocido. La lluvia entra despues, como variable medida.',
  },
  {
    state: 'done',
    module: 'rotacion',
    text: 'La carpa 2 se compra en el mes 3-4, cuando los estolones pidan donde enraizar. Antes de eso estaria vacia.',
  },

  {
    state: 'done',
    module: 'luz',
    text: 'Especificaciones reales del VSL-LL100: 521 µmol/m²/s de centro a 12", panel 12x12", IP65, 36.000 h, hasta 7 en cadena. No contradicen nuestro promedio de huella — el suyo es lectura de centro.',
  },
  {
    state: 'done',
    module: 'luz',
    text: 'La atenuacion es en cuatro pasos (25/50/75/100) y no continua. El GrowHub tampoco da continuo, solo los mismos escalones.',
  },
  {
    state: 'done',
    module: 'luz',
    text: 'VIVOSUN no publica PPF ni eficacia en µmol/J, ni en el manual ni en la ficha. Nuestra estimacion de 2.2-2.7 sigue siendo la unica cifra fotonica disponible.',
  },
  {
    state: 'done',
    module: 'control',
    text: 'El puerto de la luz no es LAN: RJ11/RJ12 de seis contactos, bus de control sobre cable de telefono. No hay red ni protocolo que hablar.',
  },
  {
    state: 'done',
    module: 'control',
    text: 'La perilla de la luminaria tiene que ir en EXT o el puerto se ignora. Si se encadenan varias, todas en EXT.',
  },

  // --- Open ---
  {
    state: 'open',
    module: 'control',
    text: 'Identificar los seis pines del bus con los tres tests antes de conectar nada: continuidad sin energia, voltaje en EXT, y 10 kΩ en vez de cortocircuito.',
  },
  {
    state: 'open',
    module: 'control',
    text: '¿El bus es 0-10V analogico o seleccion por cuatro lineas? Cuatro senales mas comun mas reserva explicarian los seis pines exactamente, pero la app dice "25%-100%" con guion.',
  },
  {
    state: 'open',
    module: 'control',
    text: 'Comprar cable 6P6C, no el 6P4C de telefono comun: entra igual en el jack y deja los pines 1 y 6 sin conectar.',
  },
  {
    state: 'open',
    module: 'control',
    text: 'Cerrar el lazo de DLI una vez identificado el bus: BH1750 integra el dia y la atenuacion corrige. Con cuatro escalones, el fotoperiodo queda de control fino.',
  },
  {
    state: 'open',
    module: 'materiales',
    text: 'FALTA pH Down en el pedido. Los buffers calibran el instrumento; no corrigen la solucion. Es el unico bloqueante que quedo fuera.',
  },
  {
    state: 'open',
    module: 'agua',
    text: 'Medir la titracion de alcalinidad de llave contra lluvia: mL de pH Down para bajar 1 L a pH 6.0. Ese numero decide todo.',
  },
  {
    state: 'open',
    module: 'agua',
    text: 'Juntar dos muestras de lluvia por separado, primer flujo y flujo posterior, para cuantificar cuanto vale el desviador en este techo.',
  },
  {
    state: 'open',
    module: 'agua',
    text: 'Verificar en el reporte de MLGW si usan cloro o cloramina. El cloro se va solo con la piedra difusora; la cloramina no.',
  },
  {
    state: 'open',
    module: 'control',
    text: 'Calibrar mL/s de cada peristaltica por separado durante la semana de prueba de fugas, y recalibrar mensual: el tubo se estira.',
  },
  {
    state: 'open',
    module: 'control',
    text: 'Quitar el jumper amarillo del tablero de reles: JD-VCC a 5V para las bobinas, VCC a 3.3V para los optoacopladores. Si no, el rele enciende y no apaga.',
  },
  {
    state: 'open',
    module: 'planta',
    text: 'La noche optima de 10-12°C no es alcanzable en Memphis sin refrigeracion activa, y no hay nada de eso en el BOM. Se acepta 18°C y se paga en sabor y cuaje.',
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
    module: 'rotacion',
    text: '¿Carpa 2 como vivero barato ($150-210) o instrumentada identica para A/B cruzado ($250-330)?',
  },
  {
    state: 'open',
    module: 'rotacion',
    text: 'Antes de cualquier A/B hay que correr las dos carpas en condiciones identicas para medir cuanto difieren entre si.',
  },
  {
    state: 'open',
    module: 'luz',
    text: 'Torres verticales: 90 plantas/m2 contra 10-12. Invalidaria la eleccion de luminaria.',
  },
  { state: 'open', text: 'Las 8 rutas /reports/* de la portada siguen devolviendo 404.' },
];

export const openCount = (moduleSlug?: string) =>
  LOG.filter((e) => e.state === 'open' && (moduleSlug ? e.module === moduleSlug : true)).length;

/** Published figures for Memphis municipal water (MLGW / Memphis Sand aquifer). */
export const WATER = {
  tap: { tds: 115, hardness: 44.7, aquiferMedian: 83 },
  /** Rainwater is effectively free RO: near-zero dissolved solids. */
  rain: { tdsLow: 0, tdsHigh: 10, phLow: 5.0, phHigh: 5.6 },
  /** Memphis annual rainfall, mm. */
  rainfallMm: 1370,
  /** Roughly what the rig drinks, litres per month. */
  demandLitresMonth: 70,
} as const;

/** Roof area needed to cover demand, m2. Collection efficiency ~85%. */
export const roofAreaNeeded = () =>
  (WATER.demandLitresMonth * 12) / (WATER.rainfallMm * 0.85);
