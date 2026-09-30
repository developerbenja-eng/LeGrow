/**
 * Tapa de eco para pozos de monitoreo.
 *
 * Una sola fuente para la seccion /pozo: fisica, pines, cableado, geometria
 * impresa, piezas y pasos. Los diagramas se dibujan desde aqui, asi que un
 * pin cambiado en este archivo cambia en todos los dibujos a la vez.
 *
 * Los pines reflejan firmware/include/config.h del proyecto well-echo-cap y la
 * geometria refleja los valores por defecto de public/pozo/well-echo-cap.scad.
 */

// ============================================================
// Fisica
// ============================================================

export const FS = 48000;
export const CHIRP = { f0: 300, f1: 3500, ms: 20, level: 0.5 } as const;
export const REC = { preRollMs: 30, txLatencyMs: 120, maxDepthM: 60, minDepthM: 1, tailMs: 40 } as const;

/** Velocidad del sonido en aire seco, m/s. */
export const soundSpeed = (tC: number) => 331.3 * Math.sqrt(1 + tC / 273.15);

/** Primer modo transversal de un tubo: sobre esto el pulso rebota en las paredes y se ensucia. */
export const planeWaveLimitHz = (idMm: number, tC = 20) => (1.84 * soundSpeed(tC)) / (Math.PI * (idMm / 1000));

/** Cuanto avanza la profundidad por cada muestra a 48 kHz, en mm. */
export const rangeStepMm = (tC = 20) => ((soundSpeed(tC) / FS) / 2) * 1000;

/** Largo de la grabacion por disparo, ms. */
export const recordMs = () =>
  REC.preRollMs + REC.txLatencyMs + CHIRP.ms + ((2 * REC.maxDepthM) / soundSpeed(-10)) * 1000 + REC.tailMs;

export type Casing = { id: '2' | '4'; label: string; odMm: number; idMm: number; chirpTopHz: number };

export const CASINGS: readonly Casing[] = [
  { id: '2', label: '2" Sch 40', odMm: 60.3, idMm: 52.5, chirpTopHz: 3500 },
  { id: '4', label: '4" Sch 40', odMm: 114.3, idMm: 102.3, chirpTopHz: 1800 },
];

export const JOINT_SPACINGS = [
  { id: '10', label: '10 ft', m: 3.048 },
  { id: '20', label: '20 ft', m: 6.096 },
] as const;

// ============================================================
// Geometria impresa (valores por defecto del .scad, en mm)
// ============================================================

export const GEO = {
  fit: 0.4,
  spkD: 36.6,
  spkRim: 2.6,
  spkOpen: 31,
  flange: 84,
  flangeT: 6,
  skirtH: 40,
  skirtW: 3,
  spigotH: 12,
  spigotW: 2.4,
  portD: 2,
  portR: 20.9,
  micR: 26.5,
  micPcbD: 14.6,
  cableD: 4.6,
  cableR: 20.9,
  boltOff: 34,
  boltD: 3.4,
  boxIn: [190, 90, 50] as const,
  boxW: 2.4,
  floorOpen: 72,
  ventD: 12.3,
  podOd: 20,
  podLen: 34,
} as const;

export const boreR = (c: Casing) => c.idMm / 2 - GEO.fit - GEO.spigotW;

// ============================================================
// Cableado
// ============================================================

export type Bus = 'i2s' | 'i2c' | 'spi' | 'ow' | 'adc';
export type Rail = 'BAT' | '5V' | '3V3' | 'GND';

export const BUS: Record<Bus, { color: string; label: string }> = {
  i2s: { color: '#a78bfa', label: 'I2S audio' },
  i2c: { color: '#2dd4bf', label: 'I2C + despertar Notecard' },
  spi: { color: '#a3e635', label: 'SPI microSD' },
  ow: { color: '#fbbf24', label: '1-Wire temperatura' },
  adc: { color: '#fb923c', label: 'Medicion de bateria' },
};

export const RAIL: Record<Rail, { color: string; label: string }> = {
  BAT: { color: '#fb923c', label: 'Bateria 3.0-4.2 V' },
  '5V': { color: '#ef4444', label: '5 V' },
  '3V3': { color: '#f472b6', label: '3.3 V' },
  GND: { color: '#9ca3af', label: 'GND comun' },
};

/** Header J1 de la ESP32-S3-DevKitC-1, de arriba (lado antena) hacia abajo (lado USB). */
export const J1 = ['3V3', '3V3', 'RST', '4', '5', '6', '7', '15', '16', '17', '18', '8', '3', '46', '9', '10', '11', '12', '13', '14', '5V', 'GND'] as const;

export type Net = { name: string; gpio: number; bus: Bus; what: string };

export const NETS: readonly Net[] = [
  { name: 'VBAT', gpio: 4, bus: 'adc', what: 'Punto medio del divisor de bateria' },
  { name: 'BCLK', gpio: 5, bus: 'i2s', what: 'Reloj de bit, compartido por amp y microfonos' },
  { name: 'WS', gpio: 6, bus: 'i2s', what: 'Seleccion de canal izquierdo / derecho' },
  { name: 'DOUT', gpio: 7, bus: 'i2s', what: 'Audio de la ESP32 hacia el amplificador' },
  { name: 'DIN', gpio: 15, bus: 'i2s', what: 'Audio de ambos microfonos hacia la ESP32' },
  { name: 'SDA', gpio: 8, bus: 'i2c', what: 'Datos I2C' },
  { name: 'SCL', gpio: 9, bus: 'i2c', what: 'Reloj I2C' },
  { name: 'ATTN', gpio: 16, bus: 'i2c', what: 'El Notecard despierta a la ESP32 (opcional)' },
  { name: '1W', gpio: 14, bus: 'ow', what: 'Cadena de DS18B20' },
  { name: 'CS', gpio: 10, bus: 'spi', what: 'Seleccion de la microSD' },
  { name: 'MOSI', gpio: 11, bus: 'spi', what: 'Datos hacia la microSD' },
  { name: 'SCK', gpio: 12, bus: 'spi', what: 'Reloj SPI' },
  { name: 'MISO', gpio: 13, bus: 'spi', what: 'Datos desde la microSD' },
];

export const netByName = (n: string) => NETS.find((x) => x.name === n)!;

export type WModule = {
  id: string;
  name: string;
  sub: string;
  /** Id en src/lib/inventory.ts cuando la pieza ya esta en el inventario. */
  part?: string;
  where: string;
  power: readonly { pin: string; rail: Rail; note?: string }[];
  signals: readonly { pin: string; net: string; note?: string }[];
  /** Conexiones que no van a la ESP32 ni a un riel: parlante, antena, pines al aire. */
  extra?: readonly { pin: string; to: string; note?: string }[];
  note: string;
};

export const MODULES: readonly WModule[] = [
  {
    id: 'div',
    name: 'Divisor de bateria',
    sub: '2 x 100 kΩ',
    where: 'En la placa portadora, junto a la ESP32',
    power: [
      { pin: 'ARRIBA', rail: 'BAT', note: '100 kΩ desde OUT+ del TP4056' },
      { pin: 'ABAJO', rail: 'GND', note: '100 kΩ a GND' },
    ],
    signals: [{ pin: 'MEDIO', net: 'VBAT', note: '4.2 V se leen como 2.1 V, ADC1 con 11 dB' }],
    note: 'Consume unos 20 µA siempre. Aceptable en el prototipo; una placa futura lo puede cortar con un transistor.',
  },
  {
    id: 'amp',
    name: 'MAX98357A',
    sub: 'Amplificador I2S clase D',
    where: 'En la caja, cables cortos al parlante',
    power: [
      { pin: 'VIN', rail: '5V', note: '470 µF entre VIN y GND, pegado a la placa' },
      { pin: 'GND', rail: 'GND' },
    ],
    signals: [
      { pin: 'BCLK', net: 'BCLK' },
      { pin: 'LRC', net: 'WS' },
      { pin: 'DIN', net: 'DOUT' },
    ],
    extra: [
      { pin: '+ / −', to: 'Parlante 36 mm', note: 'Salida puente: ningun cable del parlante a GND' },
      { pin: 'GAIN', to: 'al aire', note: '9 dB. A GND para 12 dB' },
      { pin: 'SD', to: 'al aire', note: 'Reproduce la mezcla (L+R)/2' },
    ],
    note: 'El chirp va en los dos canales del marco estereo, asi la mezcla por defecto lo toca a nivel completo.',
  },
  {
    id: 'mica',
    name: 'INMP441 · mic A',
    sub: 'Referencia, canal izquierdo',
    where: 'Sobre la brida, tapando el canal del puerto de 2 mm',
    power: [
      { pin: 'VDD', rail: '3V3', note: 'Nunca 5 V' },
      { pin: 'GND', rail: 'GND' },
      { pin: 'L/R', rail: 'GND', note: 'Transmite en el canal izquierdo' },
    ],
    signals: [
      { pin: 'SCK', net: 'BCLK', note: 'Comparte el reloj con el amp' },
      { pin: 'WS', net: 'WS' },
      { pin: 'SD', net: 'DIN', note: 'Comparte la linea con el mic B' },
    ],
    note: 'Escucha el chirp al salir. Esa grabacion es el cero de tiempo de cada eco, asi que el retardo del DMA no importa.',
  },
  {
    id: 'micb',
    name: 'INMP441 · mic B',
    sub: 'Colgante, canal derecho',
    where: 'En la capsula colgante, 0.5 a 1 m bajo el mic A',
    power: [
      { pin: 'VDD', rail: '3V3', note: 'Por el cable colgante' },
      { pin: 'GND', rail: 'GND', note: 'Malla a GND solo en el extremo de la ESP32' },
      { pin: 'L/R', rail: '3V3', note: 'Puenteado en la capsula' },
    ],
    signals: [
      { pin: 'SCK', net: 'BCLK', note: '47 Ω en serie en el extremo de la ESP32' },
      { pin: 'WS', net: 'WS', note: '47 Ω en serie en el extremo de la ESP32' },
      { pin: 'SD', net: 'DIN' },
    ],
    note: 'Con 1 m de cable como maximo: el reloj de 3 MHz rebota en cables mas largos.',
  },
  {
    id: 'bme',
    name: 'BME / BMP280',
    sub: 'Temperatura y presion en la tapa',
    part: 'bme280-gy',
    where: 'En la caja, lejos del regulador',
    power: [
      { pin: 'VCC', rail: '3V3', note: 'No al riel de 5 V' },
      { pin: 'GND', rail: 'GND' },
      { pin: 'CSB', rail: '3V3', note: 'Fuerza modo I2C' },
      { pin: 'SDO', rail: '3V3', note: 'Direccion 0x77, deja 0x76 libre' },
    ],
    signals: [
      { pin: 'SDA', net: 'SDA' },
      { pin: 'SCL', net: 'SCL' },
    ],
    note: 'Leer el registro 0xD0 primero: 0x60 es BME280, 0x58 es BMP280 sin humedad. Los dos sirven para corregir la velocidad del sonido.',
  },
  {
    id: 'note',
    name: 'Notecard',
    sub: 'Sobre su Notecarrier',
    part: 'notecard-blues',
    where: 'En la caja, antena pegada bajo la tapa',
    power: [
      { pin: 'V+', rail: 'BAT', note: 'O el JST de LiPo del Notecarrier' },
      { pin: 'GND', rail: 'GND' },
    ],
    signals: [
      { pin: 'SDA', net: 'SDA', note: 'Sirve el cable Qwiic' },
      { pin: 'SCL', net: 'SCL' },
      { pin: 'ATTN', net: 'ATTN', note: 'Opcional' },
    ],
    extra: [{ pin: 'MAIN', to: 'Antena LTE u.FL', note: 'Obligatoria: sin antena no hay enlace' }],
    note: 'Direccion I2C 0x17. Solo transporta datos; la medicion corre en la ESP32.',
  },
  {
    id: 'ds',
    name: 'DS18B20 x 3',
    sub: 'Temperatura en la columna de aire',
    where: 'Soldados sobre el cable colgante',
    power: [
      { pin: 'VDD', rail: '3V3', note: 'Comparte el conductor rojo del colgante' },
      { pin: 'GND', rail: 'GND' },
      { pin: '4.7 kΩ', rail: '3V3', note: 'Una sola resistencia de DQ a 3V3, en el extremo de la ESP32' },
    ],
    signals: [{ pin: 'DQ', net: '1W', note: 'Los tres en el mismo hilo' }],
    note: 'Soldar los TO-92 a 0.3 m, a 0.6 m y en la capsula, y cubrir con termocontraible. Cada uno tiene un id unico de 64 bits: anotar cual es cual.',
  },
  {
    id: 'sd',
    name: 'Lector microSD',
    sub: 'WAV crudo + CSV por disparo',
    part: 'microsd-module',
    where: 'En la caja, con la ranura hacia la tapa',
    power: [
      { pin: 'VCC', rail: '5V', note: 'El modulo comun trae su regulador. Si el tuyo no, a 3V3' },
      { pin: 'GND', rail: 'GND' },
    ],
    signals: [
      { pin: 'CS', net: 'CS' },
      { pin: 'MOSI', net: 'MOSI' },
      { pin: 'SCK', net: 'SCK' },
      { pin: 'MISO', net: 'MISO' },
    ],
    note: 'FAT32, 32 GB o menos. Guardar cada eco crudo: son lo que se usa para afinar el detector de picos.',
  },
  {
    id: 'tp',
    name: 'TP4056',
    sub: 'Cargador con proteccion',
    part: 'tp4056-charger',
    where: 'En la caja, USB-C accesible al abrir la tapa',
    power: [
      { pin: 'OUT+', rail: 'BAT', note: 'Salida protegida de la bateria' },
      { pin: 'OUT−', rail: 'GND' },
    ],
    signals: [],
    extra: [
      { pin: 'B+ / B−', to: 'LiPo 1000 mAh', note: 'Aislar los cables pelados antes de soldar' },
      { pin: 'USB-C', to: 'cargador 5 V', note: 'Solo para cargar' },
    ],
    note: 'La LiPo nunca va directo a la carga: siempre por OUT del TP4056, que corta por sobre-descarga.',
  },
  {
    id: 'mt',
    name: 'MT3608',
    sub: 'Elevador a 5 V',
    part: 'mt3608-boost',
    where: 'En la caja, junto al TP4056',
    power: [
      { pin: 'VIN+', rail: 'BAT' },
      { pin: 'VIN−', rail: 'GND' },
      { pin: 'VOUT+', rail: '5V', note: 'Ajustar a 5.00 V antes de conectar' },
    ],
    signals: [],
    note: 'Estas placas suelen venir ajustadas muy por encima de 5 V. Con la bateria y sin carga, girar el trimmer hasta que el multimetro marque 5.00 V.',
  },
];

// ============================================================
// Cable colgante: 6 conductores con malla
// ============================================================

export const PENDANT = [
  { color: '#ef4444', name: 'Rojo', signal: '3V3', to: '3V3', note: 'Alimenta mic B y los tres DS18B20' },
  { color: '#1f2937', name: 'Negro', signal: 'GND', to: 'GND', note: 'Retorno comun' },
  { color: '#facc15', name: 'Amarillo', signal: 'BCLK', to: 'GPIO 5 via 47 Ω', note: 'Reloj de bit' },
  { color: '#22c55e', name: 'Verde', signal: 'WS', to: 'GPIO 6 via 47 Ω', note: 'Seleccion de canal' },
  { color: '#3b82f6', name: 'Azul', signal: 'SD', to: 'GPIO 15', note: 'Datos del mic B' },
  { color: '#f3f4f6', name: 'Blanco', signal: 'DQ', to: 'GPIO 14 + 4.7 kΩ a 3V3', note: '1-Wire de los DS18B20' },
] as const;

// ============================================================
// Pasos de armado
// ============================================================

export type Step = { phase: 'banco' | 'columna' | 'pozo'; what: string; pass: string; see: string };

export const STEPS: readonly Step[] = [
  { phase: 'banco', what: 'Imprimir el anillo de prueba y probarlo en un trozo de casing', pass: 'Entra a mano, sin juego y sin forzar. Si no, cambiar fit en 0.1 mm y reimprimir.', see: 'impresion' },
  { phase: 'banco', what: 'Ajustar el MT3608 a 5.00 V sin carga', pass: 'El multimetro marca 4.95-5.05 V en OUT antes de conectar nada.', see: 'energia' },
  { phase: 'banco', what: 'Flashear la ESP32-S3 y hacer parpadear el LED RGB', pass: 'El LED parpadea. Ya sabes cual USB-C es el puente UART y cual el USB nativo.', see: 'firmware' },
  { phase: 'banco', what: 'Conectar BME280 y Notecard, correr el escaneo I2C (comando i)', pass: 'Aparecen 0x77 y 0x17. El registro 0xD0 da 0x60 (BME280) o 0x58 (BMP280).', see: 'cableado' },
  { phase: 'banco', what: 'Conectar amp y parlante, tocar 1 kHz por I2S (comando t)', pass: 'Tono limpio, sin clics. Ningun cable del parlante toca GND.', see: 'cableado' },
  { phase: 'banco', what: 'Conectar el mic A, disparar el chirp y grabar a la vez (comando s)', pass: 'La grabacion muestra el chirp con el mismo desfase en cada disparo.', see: 'senal' },
  { phase: 'banco', what: 'Agregar el mic B (L/R a 3V3) y la microSD (comando l)', pass: 'Golpear cada mic mueve solo su columna. Los WAV abren en el PC.', see: 'cableado' },
  { phase: 'columna', what: 'Imprimir manga, caja, tapa, juntas y capsula; armar sobre la columna de PVC', pass: 'Dos tramos de 10 ft con un cople, agua a una profundidad medida con la sonda.', see: 'impresion' },
  { phase: 'columna', what: 'Encontrar el eco del cople y el del agua en la grabacion', pass: 'Pico del cople en 2L/c, pico del agua en 2d/c. La profundidad coincide con la sonda dentro de 3 cm.', see: 'principio' },
  { phase: 'columna', what: 'Correr con la LiPo y medir la corriente', pass: 'Anotar corriente activa y en reposo; eso fija el intervalo de reporte.', see: 'energia' },
  { phase: 'pozo', what: 'Enviar una Note con profundidad, velocidad del sonido y temperaturas', pass: 'La nota llega a Notehub con los valores correctos.', see: 'firmware' },
  { phase: 'pozo', what: 'Instalar en un pozo con Levelogger, 1 a 4 semanas', pass: 'Sonda al inicio y al final; la tapa sigue al Levelogger dentro de 1 cm despues de calibrar con los coples.', see: 'principio' },
];

export const PHASE_LABEL: Record<Step['phase'], string> = {
  banco: 'En el banco',
  columna: 'En la columna de PVC',
  pozo: 'En un pozo real',
};

// ============================================================
// Piezas
// ============================================================

export type Have = { part: string; job: string };
export type Buy = { item: string; job: string; usd: number; optional?: boolean };

/** Lo que ya esta en src/lib/inventory.ts y cumple un rol en la tapa. */
export const HAVE: readonly Have[] = [
  { part: 'esp32-s3-devkitc', job: 'Controlador: I2S full duplex y PSRAM para las grabaciones' },
  { part: 'notecard-blues', job: 'Reporte celular desde el pozo' },
  { part: 'bme280-gy', job: 'Temperatura y presion en la tapa' },
  { part: 'microsd-module', job: 'WAV crudo y CSV de cada disparo' },
  { part: 'lipo-1000mah', job: 'Bateria' },
  { part: 'tp4056-charger', job: 'Carga y proteccion de la LiPo' },
  { part: 'mt3608-boost', job: 'Riel de 5 V' },
  { part: 'breadboard-830', job: 'Montaje de banco antes de soldar' },
  { part: 'hw131-power', job: 'Rieles limpios en el banco' },
  { part: 'voice-recorder', job: 'Donante de parlante: medir su diametro antes de comprar uno' },
];

/** Equipo de campo que no esta en el inventario electronico. */
export const HAVE_FIELD = [
  { item: 'Solinst Levelogger', job: 'Referencia continua para comparar' },
  { item: 'Sonda de nivel (cinta electrica)', job: 'La verdad de cada sesion' },
  { item: 'Impresora 3D', job: 'Manga, caja, tapa, juntas y capsula' },
] as const;

export const BUY: readonly Buy[] = [
  { item: 'INMP441, pack de 3', job: 'Mic A, mic B y uno de repuesto', usd: 10 },
  { item: 'MAX98357A', job: 'Mueve el parlante con el mismo reloj que los mics', usd: 6 },
  { item: 'Parlante 36 mm, 4-8 Ω, 2-3 W', job: 'Entra en la manga de 2"', usd: 5 },
  { item: 'Cable blindado de 6 conductores, 3 m', job: 'Colgante: 3V3, GND, BCLK, WS, SD, 1-Wire', usd: 8 },
  { item: 'DS18B20 TO-92 x 3', job: 'Temperatura a lo largo del colgante', usd: 5 },
  { item: 'Resistencias: 4.7 kΩ, 100 kΩ x 2, 47 Ω x 2', job: 'Pull-up 1-Wire, divisor, amortiguacion I2S', usd: 6 },
  { item: 'Electrolitico 470 µF 10 V', job: 'Reserva del amplificador', usd: 1 },
  { item: 'Insertos M3 termofijos + tornillos M3', job: 'Caja, tapa, brida, portadora', usd: 12 },
  { item: 'Tornillos mariposa M3 de nylon x 3', job: 'Sujetan la manga sin marcar el casing', usd: 5 },
  { item: 'Venteo M12 ePTFE', job: 'Deja salir aire, no agua', usd: 4 },
  { item: 'Antena LTE u.FL', job: 'Puerto MAIN del Notecard, si no tienes', usd: 8, optional: true },
  { item: 'Filamento ASA o PETG + TPU 95A', job: '~350 g de ASA/PETG y ~20 g de TPU', usd: 40 },
  { item: 'PVC 2" Sch 40: 2 tramos de 10 ft, cople, tapon', job: 'Columna de prueba con un cople real', usd: 30 },
];

export const buyTotal = (includeOptional = true) =>
  BUY.filter((b) => includeOptional || !b.optional).reduce((s, b) => s + b.usd, 0);

// ============================================================
// Firmware
// ============================================================

export const COMMANDS = [
  { key: 'i', what: 'Escaneo I2C y lectura de sensores', step: 4 },
  { key: 't', what: 'Tono de 1 kHz por 2 s', step: 5 },
  { key: 'l', what: 'Niveles de los mics por 5 s: golpear cada uno', step: 7 },
  { key: 's', what: 'Un disparo: chirp, grabar, analizar, guardar', step: 6 },
  { key: 'a', what: 'Disparos automaticos cada 60 s, on/off', step: 9 },
  { key: 'b', what: 'Voltaje de bateria', step: 10 },
] as const;

export const CSV_COLUMNS = [
  'shot', 'uptime_s', 'air_c', 'rh_pct', 'hpa', 'ds1_c', 'ds2_c', 'ds3_c', 'vbat_v', 'temp_used_c',
  'c_temp_mps', 't0a_ms', 't_water_ms', 'depth_temp_m', 'n_joints', 'c_joint_mps', 'depth_joint_m',
  'c_pair_mps', 'snr_db', 'status',
] as const;
