/**
 * Physical parts on hand.
 *
 * The point of this registry is not to list what we own — it is to record the
 * electrical interface of each piece, so that when a wiring diagram gets drawn
 * nothing in it has to be assumed. Pin names, voltages, currents and the
 * failure modes that bite live here, next to a photo of the actual object.
 *
 * Photos go in public/inventory/<id>.jpg via scripts/ingest-inventory.mjs.
 */

export type PinKind = 'power' | 'gnd' | 'signal' | 'analog' | 'unknown';

export type Pin = {
  name: string;
  kind: PinKind;
  note?: string;
};

export type Part = {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  category: 'controlador' | 'actuador' | 'control' | 'sensor' | 'energia';
  /** Units confirmed on hand. */
  qty: number;
  /** How many the rig needs, when that is already decided. */
  needed?: number;
  specs: readonly (readonly [string, string])[];
  pins?: readonly Pin[];
  /** Assigned job in the rig, or null when still unallocated. */
  role: string | null;
  gotchas?: readonly string[];
};

export const PARTS: readonly Part[] = [
  {
    id: 'esp32-devkit-v1',
    name: 'ESP32 DevKit V1',
    model: 'ESP-WROOM-32 · CP2102',
    category: 'controlador',
    qty: 1,
    role: 'Candidato a controlador principal — es el que asume config.h hoy',
    specs: [
      ['MCU', 'ESP32 dual core, 240 MHz'],
      ['Puente USB', 'Silicon Labs CP2102, USB-C'],
      ['Pines', '30'],
      ['ADC utiles', 'ADC1: GPIO 32-39'],
      ['I2C', '2 controladores por hardware'],
    ],
    pins: [
      { name: '3V3 / VIN / GND', kind: 'power', note: 'VIN acepta 5 V, 3V3 sale del regulador' },
      { name: 'GPIO 32, 33', kind: 'analog', note: 'ADC1, entrada y salida' },
      { name: 'GPIO 34-39', kind: 'analog', note: 'ADC1 pero SOLO entrada, sin pull-up interno' },
      { name: 'GPIO 21, 22', kind: 'signal', note: 'I2C por defecto: SDA y SCL' },
    ],
    gotchas: [
      'ADC2 queda inutilizable con WiFi encendido. Todo lo analogico va a ADC1.',
      'GPIO 34-39 son solo entrada. Sirven para sondas, no para mandar nada.',
      'Su ADC interno es no lineal y ruidoso: por eso las sondas pasan por el ADS1115.',
      'Es el unico de los tres cuyo mapa de pines coincide con el firmware que ya existe en el repo.',
    ],
  },
  {
    id: 'esp32-s3-devkitc',
    name: 'ESP32-S3 DevKitC-1',
    model: 'ESP32-S3-WROOM-1 N16R8',
    category: 'controlador',
    qty: 1,
    role: 'Candidato a controlador principal — el mas capaz de los tres',
    specs: [
      ['MCU', 'ESP32-S3 dual core, 240 MHz'],
      ['Memoria', '16 MB flash · 8 MB PSRAM'],
      ['USB', '2 × USB-C: uno nativo OTG, uno puente UART'],
      ['ADC utiles', 'ADC1: GPIO 1-10'],
      ['Extra', 'LED RGB direccionable a bordo'],
    ],
    pins: [
      { name: '3V3 / 5V / GND', kind: 'power' },
      { name: 'GPIO 1-10', kind: 'analog', note: 'ADC1, los unicos seguros con WiFi' },
      { name: 'GPIO libres', kind: 'signal', note: 'la matriz permite mapear I2C a casi cualquier pin' },
      { name: 'BOOT / RST', kind: 'signal', note: 'botones fisicos' },
    ],
    gotchas: [
      'Los dos USB-C no son equivalentes: uno es el puente UART y el otro el USB nativo del chip. Enchufar el equivocado confunde el flasheo.',
      'El mapa de pines NO coincide con el config.h actual: migrar significa reescribir las definiciones.',
      'Mas GPIO, mas RAM y USB nativo. Si el proyecto crece a dos carpas, es el que sobra de holgura.',
    ],
  },
  {
    id: 'esp8266-board',
    name: 'Placa ESP8266',
    model: 'ESP8266MOD (ESP-12)',
    category: 'controlador',
    qty: 1,
    role: null,
    specs: [
      ['MCU', 'ESP8266, un solo nucleo'],
      ['USB', 'micro-USB'],
      ['ADC', '1 solo canal (A0)'],
      ['GPIO utiles', '~9'],
    ],
    pins: [
      { name: 'A0', kind: 'analog', note: 'el unico ADC de toda la placa' },
      { name: '3V3 / 5V / GND', kind: 'power' },
      { name: 'GPIO 4, 5', kind: 'signal', note: 'I2C habitual en ESP8266' },
    ],
    gotchas: [
      'Un solo ADC. Necesitamos pH y EC como minimo, asi que queda descartado como controlador principal.',
      'Con el ADS1115 por I2C el limite del ADC deja de importar — pero sigue teniendo menos GPIO y un solo nucleo.',
      'Uso realista: nodo remoto de una sola medicion, o control de la segunda carpa si algun dia se separa.',
    ],
  },
  {
    id: 'tp4056-charger',
    name: 'Cargador de LiPo con proteccion',
    model: 'TP4056 · V107',
    category: 'energia',
    qty: 1,
    role: 'Carga de la bateria LiPo',
    specs: [
      ['Entrada', 'micro-USB, 5 V'],
      ['Carga', '4.2 V CC/CV, celda unica'],
      ['Corriente', 'fijada por Rprog, tipico 1 A'],
      ['Salidas', 'B+ / B− a la celda, OUT+ / OUT− a la carga'],
    ],
    pins: [
      { name: 'B+ / B−', kind: 'power', note: 'a la celda: rojo a B+, negro a B−' },
      { name: 'OUT+ / OUT−', kind: 'power', note: 'a la carga, pasando por la proteccion' },
    ],
    gotchas: [
      'Parece llevar proteccion (DW01 + doble MOSFET junto a B+/B−) — verificar los chips antes de confiar en ella.',
      'Usar OUT+/OUT− para alimentar, nunca B+/B− directo: saltarse la proteccion es el punto de todo el modulo.',
      '1 A sobre una celda de 1000 mAh es carga a 1C. Aceptable, pero no la dejes cargando sin vigilancia.',
    ],
  },
  {
    id: 'usb-a-breakout',
    name: 'Adaptador USB-A hembra a bornera',
    category: 'energia',
    qty: 1,
    role: null,
    specs: [
      ['Conector', 'USB-A hembra'],
      ['Salida', 'bornera de 4 tornillos'],
      ['Señales', 'VBUS · D− · D+ · GND'],
    ],
    pins: [
      { name: 'VBUS', kind: 'power', note: '+5 V' },
      { name: 'GND', kind: 'gnd' },
      { name: 'D− / D+', kind: 'signal', note: 'datos, probablemente sin uso aqui' },
    ],
    gotchas: [
      'Candidato natural: sacar 5 V limpios de un cargador USB para las bobinas de los reles, separado del riel del ESP32.',
      'Un cargador USB corriente da 5 V pero poca corriente. Las bombas de 12 V siguen necesitando su propia fuente.',
    ],
  },
  {
    id: 'pump-kamoer-nkp',
    name: 'Bomba peristaltica de dosificacion',
    brand: 'Kamoer',
    model: 'NKP-DC-S10B',
    category: 'actuador',
    qty: 1,
    needed: 3,
    role: 'Dosificacion — nutriente A, nutriente B y pH down',
    specs: [
      ['Voltaje', '12 V DC'],
      ['Potencia', '5 W (~420 mA)'],
      ['Caudal', '5.2 – 90 mL/min'],
      ['Tubo', '3 mm ID × 5 mm OD, silicona'],
      ['Cabezal', 'desmontable a presion'],
      ['Sentido', 'reversible'],
    ],
    pins: [
      { name: 'M+', kind: 'power', note: 'terminal de motor' },
      { name: 'M−', kind: 'power', note: 'invertir para cambiar el sentido' },
    ],
    gotchas: [
      'A 90 mL/min son 1.5 mL/s: una correccion de 1-2 mL es un pulso de 0.7-1.3 s. Con el pH down diluido 1:4 pasa a 3-7 s, que ya es comodo.',
      'Diodo flyback 1N4007 en paralelo con el motor, catodo al positivo.',
      'Fuente de 12 V separada, nunca del riel del ESP32.',
      'Con rele solo hay encendido y apagado. El sentido reversible necesita puente H.',
      'Recalibrar mL/s cada mes: el tubo se estira. Cambiarlo cada 6-12 meses.',
    ],
  },
  {
    id: 'relay-4ch-5v',
    name: 'Tablero de reles, 4 canales',
    model: 'SRD-05VDC-SL-C (SONGLE)',
    category: 'control',
    qty: 1,
    needed: 1,
    role: 'Conmutacion — 3 peristalticas y la bomba de aporte',
    specs: [
      ['Canales', '4'],
      ['Bobina', '5 V DC'],
      ['Contactos', '10 A 250 VAC · 10 A 30 VDC'],
      ['Aislamiento', 'optoacoplado'],
      ['Logica', 'activo-bajo'],
    ],
    pins: [
      { name: 'DC+', kind: 'power', note: '5 V para las bobinas' },
      { name: 'DC−', kind: 'gnd', note: 'comun con el GND del ESP32' },
      { name: 'IN1–IN4', kind: 'signal', note: 'LOW enciende el rele' },
      { name: 'VCC / JD-VCC', kind: 'power', note: 'jumper amarillo: quitarlo y separar rieles' },
      { name: 'COM / NO / NC', kind: 'power', note: 'lado conmutado, lleva los 12 V de las bombas' },
    ],
    gotchas: [
      'Quitar el jumper amarillo: JD-VCC a 5 V para las bobinas, VCC a 3.3 V para los optoacopladores. Si queda todo a 5 V el rele enciende y no apaga.',
      'Activo-bajo: digitalWrite(pin, LOW) enciende. Inicializar en HIGH o arranca con todo corriendo.',
      'El tablero lleva diodo para sus propias bobinas, no para el motor de la bomba.',
      'Hay una marca "high" serigrafiada en el PCB — verificar si es un selector de logica antes de cablear.',
    ],
  },
  {
    id: 'ph-electrode-bnc',
    name: 'Electrodo de pH, cuerpo largo',
    category: 'sensor',
    qty: 1,
    needed: 1,
    role: 'Medicion de pH en el estanque',
    specs: [
      ['Conector', 'BNC'],
      ['Rango', '0 – 14 pH'],
      ['Bulbo', 'vidrio'],
      ['Almacenamiento', 'capuchon con solucion'],
    ],
    pins: [
      { name: 'BNC centro', kind: 'analog', note: 'senal del bulbo, impedancia altisima' },
      { name: 'BNC malla', kind: 'gnd', note: 'referencia' },
    ],
    gotchas: [
      'Nunca dejarlo secar. Si se seca, se muere.',
      'Recalibrar cada 2-4 semanas con los buffers de 4.01 y 7.00.',
      'Vida util declarada sobre 0.5 ano; en monitoreo continuo, asumir reemplazo anual.',
      'El BNC es estandar: el electrodo es el consumible y la placa se conserva.',
    ],
  },
  {
    id: 'ph-board-4502c',
    name: 'Placa acondicionadora de pH',
    model: 'PH-4502C',
    category: 'control',
    qty: 1,
    needed: 1,
    role: 'Acondicionamiento de la sonda de pH hacia el ADS1115',
    specs: [
      ['Entrada', 'BNC'],
      ['Alimentacion', '5 V'],
      ['Salida PO', '0 – 5 V analogico'],
      ['Ajustes', '2 trimpots: offset y umbral'],
    ],
    pins: [
      { name: 'To', kind: 'analog', note: 'salida de temperatura, sin compensar internamente' },
      { name: 'Do', kind: 'signal', note: 'salida digital por umbral, no la usamos' },
      { name: 'Po', kind: 'analog', note: 'la que importa: pH analogico' },
      { name: 'G', kind: 'gnd', note: 'tierra analogica' },
      { name: 'G', kind: 'gnd', note: 'tierra de alimentacion' },
      { name: 'V+', kind: 'power', note: '5 V' },
    ],
    gotchas: [
      'La salida de 0-5 V excede la referencia de 3.3 V del ADC del ESP32. Va por el ADS1115, no al pin directo.',
      'Esta referenciada a su propio 5 V: si el riel cae cuando arranca una bomba, la lectura se mueve con ella. Error correlacionado con la accion, que el filtro de mediana no cacha.',
      'Verificar el orden del header contra la serigrafia antes de cablear.',
    ],
  },
  {
    id: 'lipo-1000mah',
    name: 'Bateria LiPo 1000 mAh',
    brand: 'MakerHawk',
    category: 'energia',
    qty: 1,
    role: null,
    specs: [
      ['Quimica', 'Li-Po recargable'],
      ['Nominal', '3.7 V'],
      ['Capacidad', '1000 mAh · 3.7 Wh'],
      ['Terminales', 'cables pelados y estanados, sin conector'],
    ],
    pins: [
      { name: 'Rojo', kind: 'power', note: '+3.7 V' },
      { name: 'Negro', kind: 'gnd', note: '−' },
    ],
    gotchas: [
      'Los cables vienen desnudos y estanados. Aislarlos antes de guardarla: un corto en LiPo es fuego, no una chispa.',
      'El cargador ya esta en el inventario: el TP4056 es exactamente lo que esta celda necesita.',
      'Necesita cargador con proteccion (tipo TP4056). No cargar sin vigilancia.',
      '3.7 V no alimenta 5 V directo: o entra por la entrada LiPo del ESP32 si la tiene, o pasa por un elevador.',
      'Candidato natural: respaldo para que el registro no se corte en un apagon.',
    ],
  },
];

export const CATEGORIES = ['controlador', 'sensor', 'control', 'actuador', 'energia'] as const;

export const partsIn = (category: Part['category']) => PARTS.filter((p) => p.category === category);

export const unassigned = () => PARTS.filter((p) => p.role === null);

/** Parts where the rig needs more units than we have on hand. */
export const short = () => PARTS.filter((p) => p.needed !== undefined && p.qty < p.needed);
