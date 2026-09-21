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
  category: 'controlador' | 'sensor' | 'control' | 'actuador' | 'energia' | 'pasivo' | 'banco';
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
    id: 'notecard-blues',
    name: 'Notecard celular sobre Notecarrier',
    brand: 'Blues',
    model: 'NOTE-NBNAN · NB-IoT/LTE-M + GPS',
    category: 'controlador',
    qty: 1,
    role: 'Conectividad celular — reportar sin depender del WiFi de la casa',
    specs: [
      ['Red', 'NB-IoT / LTE-M con GPS'],
      ['Interfaz', 'I2C o UART, API por JSON'],
      ['Consumo', 'microamperios en reposo'],
      ['Alimentacion', 'USB, LiPo por JST, o desde el host'],
      ['Conectores', 'QWIIC, ESLOV, u.FL para antena principal y GPS'],
    ],
    pins: [
      { name: 'SCL / SDA / GND', kind: 'signal', note: 'I2C hacia el ESP32 — el camino mas simple' },
      { name: 'TX / RX / GND', kind: 'signal', note: 'UART, alternativa al I2C' },
      { name: 'LIPO', kind: 'power', note: 'conector JST para celda unica — calza con la LiPo del inventario' },
      { name: 'QWIIC', kind: 'signal', note: 'I2C con conector, sin soldar' },
    ],
    gotchas: [
      'Es la pieza que mas cambia la arquitectura: el rig deja de depender del WiFi de la casa. Un corte de internet, o irse una semana, dejan de ser un punto ciego.',
      'No reemplaza al ESP32: el Notecard no corre nuestra logica, solo transporta datos. Se habla por I2C con una API JSON.',
      'Necesita antena en el conector u.FL MAIN. Sin antena no hay enlace, y la de GPS es aparte.',
      'El plan de datos viene prepagado con la tarjeta, pero conviene verificar cobertura NB-IoT/LTE-M en Memphis antes de apoyarse en el.',
      'Su conector LIPO calza directo con la celda que ya tenemos: Notecard + LiPo es un nodo que sobrevive un apagon por si solo.',
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
    id: 'bme280-gy',
    name: 'Sensor de temperatura, humedad y presion',
    model: 'GY-BME/BMP 280',
    category: 'sensor',
    qty: 1,
    role: 'Candidato a medir VPD — si resulta ser BME280 y no BMP280',
    specs: [
      ['Bus', 'I2C o SPI (6 pines)'],
      ['Direccion I2C', '0x76 o 0x77 segun SDO'],
      ['Alimentacion', '3.3 V'],
      ['Precision RH', '±3% (si es BME280)'],
      ['Precision temp', '±1 °C'],
    ],
    pins: [
      { name: 'VCC', kind: 'power', note: '3.3 V' },
      { name: 'GND', kind: 'gnd' },
      { name: 'SCL', kind: 'signal', note: 'reloj I2C' },
      { name: 'SDA', kind: 'signal', note: 'datos I2C' },
      { name: 'CSB', kind: 'signal', note: 'a VCC para forzar modo I2C' },
      { name: 'SDO', kind: 'signal', note: 'selecciona direccion: GND = 0x76, VCC = 0x77' },
    ],
    gotchas: [
      'VERIFICAR PRIMERO: estas placas moradas se venden marcadas "BME/BMP 280" y muy a menudo traen un BMP280, que NO mide humedad. Leer el chip ID por I2C: 0x60 es BME280, 0x58 es BMP280.',
      'Si es BME280 de verdad, cubre el VPD entero con mejor precision que el DHT11 — y el SCD41 del informe 03 pasa a ser opcional, porque su valor unico es el CO2 y ese objetivo ya sabemos que es inalcanzable sin fuente.',
      'Es de 3.3 V. No alimentarlo desde el riel de 5 V.',
    ],
  },
  {
    id: 'dht11-module',
    name: 'Modulo de temperatura y humedad DHT11',
    model: 'DHT11',
    category: 'sensor',
    qty: 1,
    role: null,
    specs: [
      ['Temperatura', '0 – 50 °C, ±2 °C'],
      ['Humedad', '20 – 90% RH, ±5%'],
      ['Bus', '1-wire propietario'],
      ['Muestreo', '1 lectura por segundo como maximo'],
    ],
    pins: [
      { name: '+', kind: 'power', note: '3.3 o 5 V' },
      { name: 'out', kind: 'signal', note: 'dato, el modulo ya trae la resistencia de pull-up' },
      { name: '−', kind: 'gnd' },
    ],
    gotchas: [
      'Es el menos preciso de las opciones de humedad: ±5% RH contra ±3% del BME280. Sobre un VPD objetivo de 0.8-1.2 kPa, ese error se nota.',
      'Su rango de humedad arranca en 20% y el nuestro es 40-60%, asi que sirve — pero sin margen abajo.',
      'Uso realista: respaldo, o medir el aire fuera de la carpa para comparar.',
    ],
  },
  {
    id: 'ms5837-pressure',
    name: 'Sensor de presion sumergible',
    model: 'MS5837 (02BA o 30BA)',
    category: 'sensor',
    qty: 1,
    role: 'Nivel del estanque por presion hidrostatica — mejor que el ultrasonico',
    specs: [
      ['Bus', 'I2C'],
      ['Alimentacion', '3.3 V'],
      ['Sumergible', 'si, el sensor va dentro del liquido'],
      ['Extra', 'entrega tambien temperatura del agua'],
    ],
    pins: [
      { name: 'VIN', kind: 'power', note: '3.3 V' },
      { name: 'GND', kind: 'gnd' },
      { name: 'SCL / SDA', kind: 'signal', note: 'I2C, se suma al bus existente' },
    ],
    gotchas: [
      'VERIFICAR LA VARIANTE: la placa viene marcada "02" y "30". El 02BA llega a 2 bar con resolucion de 0.16 mm de agua; el 30BA llega a 30 bar pero resuelve ~2 mm. Los dos sirven para un balde, el 02BA mucho mejor.',
      'Mide columna de agua directamente, asi que no le afectan la espuma ni la condensacion que sí arruinan al ultrasonico.',
      'Regala la temperatura del agua, que es justo el objetivo de 18-21 °C que definimos contra Pythium. Un sensor, dos variables.',
      'Es de 3.3 V. Y hay que referenciarlo a presion atmosferica: mide absoluto, asi que el nivel sale de restar la presion del aire.',
    ],
  },
  {
    id: 'hcsr04-ultrasonic',
    name: 'Sensor ultrasonico de distancia',
    model: 'HC-SR04',
    category: 'sensor',
    qty: 1,
    role: 'Nivel del estanque — medir sin contacto cuanta solucion queda',
    specs: [
      ['Rango', '2 cm – 4 m'],
      ['Resolucion', '~3 mm'],
      ['Alimentacion', '5 V'],
      ['Interfaz', 'Trig (pulso) + Echo (ancho de pulso)'],
    ],
    pins: [
      { name: 'Vcc', kind: 'power', note: '5 V' },
      { name: 'Trig', kind: 'signal', note: 'pulso de 10 µs para disparar la medicion' },
      { name: 'Echo', kind: 'signal', note: 'SALE A 5 V — divisor resistivo obligatorio hacia el ESP32' },
      { name: 'Gnd', kind: 'gnd' },
    ],
    gotchas: [
      'Echo entrega 5 V y el ESP32 tolera 3.3. Un divisor de 1k/2k o el sensor te quema la entrada.',
      'Esta version NO es estanca. Montado sobre un estanque cerrado y humedo se degrada; la version para eso es la JSN-SR04T.',
      'Mide al liquido desde arriba, asi que va en la tapa mirando hacia abajo, sin obstaculos ni espuma en el camino.',
      'Es el complemento del flotador, no su reemplazo: el flotador sigue siendo el corte duro por hardware.',
    ],
  },
  {
    id: 'tft-40-spi',
    name: 'Pantalla TFT tactil 4.0"',
    model: 'ILI9486/88 · 480×320 · V1.1',
    category: 'control',
    qty: 1,
    role: null,
    specs: [
      ['Resolucion', '480 × 320'],
      ['Bus', 'SPI'],
      ['Tactil', 'resistivo, controlador XPT2046 en SPI aparte'],
      ['Extra', 'ranura microSD propia, con su propio SPI'],
      ['Logica', '3.3 V'],
    ],
    pins: [
      { name: 'VCC / GND', kind: 'power' },
      { name: 'CS / RESET / DC-RS', kind: 'signal', note: 'control del display' },
      { name: 'SDI(MOSI) / SDO(MISO) / SCK', kind: 'signal', note: 'SPI del display' },
      { name: 'LED', kind: 'power', note: 'retroiluminacion' },
      { name: 'T_CLK / T_CS / T_DIN / T_DO / T_IRQ', kind: 'signal', note: 'tactil, SPI separado' },
      { name: 'SD_SCK / SD_MISO / SD_MOSI / SD_CS', kind: 'signal', note: 'la microSD de la propia pantalla' },
    ],
    gotchas: [
      'Es la pieza mas hambrienta de pines del inventario: display, tactil y microSD son tres grupos SPI. Pueden compartir bus, pero cada uno necesita su CS.',
      'Hace competencia al modulo microSD suelto y al OLED del informe 03: tres formas de ver datos y una sola de guardarlos. Hay que elegir, no acumular.',
      'Logica de 3.3 V, que calza con el ESP32 — pero muchas de estas placas no traen adaptacion de nivel, asi que no conectarla a nada de 5 V.',
      'En una carpa humeda una pantalla tactil resistiva abierta no dura. Si se usa, va fuera de la carpa junto al estanque.',
    ],
  },
  {
    id: 'lcd1602-i2c',
    name: 'Pantalla LCD 16×2 con adaptador I2C',
    model: 'LCD1602 + PCF8574',
    category: 'control',
    qty: 1,
    role: null,
    specs: [
      ['Formato', '16 caracteres × 2 lineas'],
      ['Bus', 'I2C gracias al adaptador'],
      ['Direccion', '0x27 o 0x3F segun el modulo'],
      ['Alimentacion', '5 V'],
    ],
    pins: [
      { name: 'VCC', kind: 'power', note: '5 V — el LCD no funciona bien a 3.3' },
      { name: 'GND', kind: 'gnd' },
      { name: 'SDA / SCL', kind: 'signal', note: 'I2C, se suma al bus que ya usan ADS1115 y BME280' },
    ],
    gotchas: [
      'Dos pines contra los catorce de la TFT. Para mostrar pH, EC y temperatura en el estanque es mas que suficiente.',
      'El LCD pide 5 V pero el ESP32 habla a 3.3. En la practica suele funcionar, aunque lo correcto es un adaptador de nivel en SDA y SCL.',
      'Verificar la direccion I2C con un escaneo: 0x27 y 0x3F son las dos comunes y no se puede adivinar.',
    ],
  },
  {
    id: 'pushbutton-tactile',
    name: 'Pulsador tactil con capuchon',
    category: 'pasivo',
    qty: 1,
    role: null,
    specs: [
      ['Tipo', 'tactil momentaneo, 4 patas'],
      ['Formato', '12 × 12 mm con capuchon'],
    ],
    pins: [
      { name: 'Par 1 / Par 2', kind: 'signal', note: 'las 4 patas son 2 pares internos; medir continuidad antes de soldar' },
    ],
    gotchas: [
      'Las cuatro patas son dos pares ya unidos por dentro. Cablear el par equivocado deja el boton siempre cerrado.',
      'Necesita antirrebote, por software o con un condensador. Sin eso, una pulsacion se lee como varias.',
      'Rol natural en este proyecto: reconocer una alarma del dosificador, o forzar una dosis manual.',
    ],
  },
  {
    id: 'microsd-module',
    name: 'Modulo lector de microSD',
    category: 'control',
    qty: 1,
    needed: 1,
    role: 'Registro local en CSV — el respaldo si se cae el WiFi',
    specs: [
      ['Bus', 'SPI'],
      ['Alimentacion', '5 V con regulador a bordo'],
      ['Tarjeta', 'microSD / TF'],
    ],
    pins: [
      { name: 'VCC', kind: 'power', note: '5 V, el modulo regula a 3.3 internamente' },
      { name: 'GND', kind: 'gnd' },
      { name: 'MISO / MOSI / SCK', kind: 'signal', note: 'SPI' },
      { name: 'CS', kind: 'signal', note: 'seleccion de chip, cualquier GPIO libre' },
    ],
    gotchas: [
      'El informe 03 ya lo pedia: registro local en CSV por si se cae el WiFi. Esta pieza le da un rol inmediato.',
      'SPI ocupa cuatro pines. Con el ESP32 clasico eso hay que cuadrarlo contra los que ya toman I2C y los reles.',
      'La deriva de reloj importa: si el ESP32 se reinicia sin hora, las filas quedan sin marca temporal util.',
    ],
  },
  {
    id: 'dfplayer-mini',
    name: 'Reproductor MP3 DFPlayer Mini',
    model: 'MP3-TF-16P V3.0',
    category: 'control',
    qty: 1,
    role: null,
    specs: [
      ['Control', 'UART a 9600 baudios'],
      ['Alimentacion', '3.2 – 5 V'],
      ['Medio', 'microSD con los audios'],
      ['Salida', 'altavoz directo o linea'],
    ],
    pins: [
      { name: 'VCC / GND', kind: 'power' },
      { name: 'RX / TX', kind: 'signal', note: 'UART; el RX pide resistencia de 1k en serie' },
      { name: 'SPK1 / SPK2', kind: 'signal', note: 'altavoz pequeno directo' },
    ],
    gotchas: [
      'No tiene rol obvio en un rig hidroponico — pero si uno bueno: alarma audible cuando el pH se sale de rango o una bomba falla. Un dosificador desatendido que puede gritar es mejor que uno mudo.',
      'Ocupa un UART. El ESP32 tiene de sobra; el ESP8266 no.',
    ],
  },
  {
    id: 'mt3608-boost',
    name: 'Elevador DC-DC ajustable',
    model: 'MT3608',
    category: 'energia',
    qty: 1,
    role: 'Eleva los 3.7 V de la LiPo a 5 V — cierra la cadena de energia portatil',
    specs: [
      ['Tipo', 'step-up (boost)'],
      ['Entrada', '2 – 24 V'],
      ['Salida', '5 – 28 V, ajustable por trimpot'],
      ['Corriente', '~2 A pico'],
    ],
    pins: [
      { name: 'VIN+ / VIN−', kind: 'power', note: 'desde OUT+/OUT− del TP4056' },
      { name: 'VOUT+ / VOUT−', kind: 'power', note: 'ajustar a 5.0 V ANTES de conectar nada' },
    ],
    gotchas: [
      'Ajustar la salida con el trimpot y medirla con multimetro antes de enchufarle el ESP32. Viene de fabrica en cualquier valor y puede salir a 20 V.',
      'Es elevador, no reductor: la salida siempre va a ser mayor que la entrada. No sirve para bajar de 12 V a 5 V.',
      'Con esto la cadena queda completa: LiPo → TP4056 (carga y proteccion) → MT3608 (a 5 V) → ESP32.',
    ],
  },
  {
    id: 'servo-sg90',
    name: 'Micro servo',
    model: 'SG90',
    category: 'actuador',
    qty: 1,
    role: null,
    specs: [
      ['Alimentacion', '4.8 – 6 V'],
      ['Control', 'PWM 50 Hz, pulso de 1 a 2 ms'],
      ['Recorrido', '~180°'],
      ['Torque', '~1.8 kg·cm'],
    ],
    pins: [
      { name: 'Marron', kind: 'gnd' },
      { name: 'Rojo', kind: 'power', note: '5 V, con su propia fuente' },
      { name: 'Naranjo', kind: 'signal', note: 'PWM desde el ESP32, 3.3 V basta' },
    ],
    gotchas: [
      'Candidato serio para la valvula: un servo sobre una llave de bola es la version barata de la valvula motorizada que discutimos, y funciona a presion cero.',
      'Pero hereda el problema que descarto la valvula de bola: al cortar la energia se queda donde estaba. Si queda abierta, inunda.',
      'El pico de arranque hunde el riel de 5 V. Alimentarlo aparte del ESP32 o los reinicios seran misteriosos.',
    ],
  },
  {
    id: 'dc-motor-freenove',
    name: 'Motor DC pequeno',
    brand: 'Freenove',
    category: 'actuador',
    qty: 1,
    role: null,
    specs: [
      ['Tipo', 'escobillas, eje liso'],
      ['Voltaje', '3 – 6 V tipico'],
    ],
    pins: [{ name: 'Dos terminales', kind: 'power', note: 'sin polaridad fija: invertirla cambia el sentido' }],
    gotchas: [
      'Sin rol claro. La agitacion del estanque ya la resuelve la piedra difusora, que ademas oxigena.',
      'Si alguna vez se usa, va con diodo flyback y fuente separada, igual que las peristalticas.',
    ],
  },
  {
    id: 'hw131-power',
    name: 'Fuente para protoboard',
    model: 'HW-131',
    category: 'banco',
    qty: 1,
    role: 'Rieles limpios de 3.3 V y 5 V en el banco',
    specs: [
      ['Entrada', 'USB-A o jack DC'],
      ['Salidas', '3.3 V y 5 V, seleccionables por jumper en cada riel'],
      ['Extra', 'interruptor y LED de encendido'],
    ],
    pins: [
      { name: 'Riel izquierdo', kind: 'power', note: 'jumper: 5V / OFF / 3.3V' },
      { name: 'Riel derecho', kind: 'power', note: 'independiente del izquierdo' },
      { name: 'Header central', kind: 'power', note: 'GND, 3.3 V y 5 V sueltos' },
    ],
    gotchas: [
      'Cada riel se configura por separado: uno a 3.3 y otro a 5 resuelve de una vez la mezcla de voltajes de este proyecto.',
      'Da poca corriente. Sirve para logica y sensores, no para bombas ni servos.',
      'Verificar la posicion de los jumpers ANTES de enchufar: es facil dejar un riel a 5 V con un BME280 de 3.3 encima.',
    ],
  },
  {
    id: 'breadboard-830',
    name: 'Protoboard de 830 puntos',
    category: 'banco',
    qty: 1,
    role: 'Montaje de prueba antes de soldar nada',
    specs: [
      ['Puntos', '830'],
      ['Rieles', '4 de alimentacion, 2 por lado'],
    ],
    gotchas: [
      'Los rieles de alimentacion de muchas protoboards estan partidos por la mitad. Verificar con continuidad antes de asumir que el riel llega entero.',
      'Las corrientes de las bombas no pasan por aqui: la protoboard es para la logica y las sondas.',
    ],
  },
  {
    id: 'buzzer',
    name: 'Zumbador',
    category: 'pasivo',
    qty: 1,
    role: 'Alarma audible del dosificador',
    specs: [
      ['Tipo', 'por confirmar: activo o pasivo'],
      ['Alimentacion', '3 – 5 V'],
      ['Terminales', '2'],
    ],
    pins: [{ name: '+ / −', kind: 'power', note: 'el activo tiene polaridad; el pasivo no' }],
    gotchas: [
      'Distinguir activo de pasivo antes de programar: conectado a corriente continua, el ACTIVO suena solo y el PASIVO queda mudo. El pasivo necesita una senal cuadrada, el activo solo encendido.',
      'Rol natural: la alarma audible que el dosificador necesita para no ser un sistema mudo. Con el pulsador para reconocerla, queda una interfaz local completa.',
    ],
  },
  {
    id: 'voice-recorder',
    name: 'Modulo grabador y reproductor de voz',
    model: 'YWD-AD142-F',
    category: 'control',
    qty: 1,
    role: null,
    specs: [
      ['Entrada', 'USB-C, microfono a bordo'],
      ['Salida', 'altavoz 8 Ω 0.5 W incluido'],
      ['Controles', 'botones PLAY y VOL, interruptor ON/OFF'],
      ['Alimentacion', 'USB o bateria por conector BAT'],
    ],
    pins: [
      { name: 'SP', kind: 'signal', note: 'conector del altavoz' },
      { name: 'BAT', kind: 'power', note: 'celda LiPo' },
      { name: 'PLAY / ON-OFF', kind: 'signal', note: 'pads para disparar desde fuera' },
    ],
    gotchas: [
      'Tercera opcion de alarma, junto al DFPlayer y el zumbador. Esta habla con voz grabada, que para un aviso concreto es mas claro que un pitido.',
      'Es un aparato cerrado: se dispara puenteando su boton PLAY, no por protocolo. Un transistor o un rele basta.',
      'Tres formas de hacer ruido y ninguna de ellas es necesaria todavia. Elegir una y guardar las otras.',
    ],
  },
  {
    id: 'pot-b10k',
    name: 'Potenciometro lineal 10 kΩ',
    model: 'B10K',
    category: 'pasivo',
    qty: 1,
    role: null,
    specs: [
      ['Resistencia', '10 kΩ'],
      ['Curva', 'B, lineal'],
      ['Terminales', '3'],
    ],
    pins: [
      { name: 'Extremos', kind: 'power', note: 'uno a 3.3 V, otro a GND' },
      { name: 'Central', kind: 'analog', note: 'cursor, hacia una entrada ADC' },
    ],
    gotchas: [
      'Da una entrada analogica de 0 a 3.3 V sin nada mas. Util para ajustar un setpoint a mano durante las pruebas.',
      'Tambien es la forma mas rapida de generar una tension conocida para verificar que el ADS1115 lee bien antes de conectarle una sonda.',
    ],
  },
  {
    id: 'led-5mm-green',
    name: 'LED verde 5 mm',
    category: 'pasivo',
    qty: 1,
    role: 'Indicador de estado',
    specs: [
      ['Diametro', '5 mm'],
      ['Caida', '~2.0 V'],
      ['Corriente', '10 – 20 mA'],
    ],
    pins: [
      { name: 'Anodo', kind: 'power', note: 'pata larga, al positivo' },
      { name: 'Catodo', kind: 'gnd', note: 'pata corta, al chaflan de la capsula' },
    ],
    gotchas: [
      'Siempre con resistencia en serie. A 3.3 V y 2.0 V de caida, 220 Ω dan unos 6 mA: visible y seguro para el GPIO.',
      'Sin resistencia el LED o el pin del ESP32 se van, y no siempre de inmediato.',
    ],
  },
  {
    id: 'resistors-220r',
    name: 'Resistencias 220 Ω',
    category: 'pasivo',
    qty: 20,
    role: 'Limitacion de corriente para LEDs',
    specs: [
      ['Valor', '220 Ω'],
      ['Tipo', 'pelicula metalica'],
      ['Codigo', 'rojo · rojo · negro · negro · marron'],
    ],
    gotchas: [
      'Sirven para LEDs, no para el divisor del HC-SR04. Ese Echo de 5 V a 3.3 pide algo como 1 kΩ y 2 kΩ, que no estan en el inventario.',
      'Tambien son la resistencia en serie que pide el RX del DFPlayer, aunque ahi lo habitual es 1 kΩ.',
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

export const CATEGORIES = ['controlador', 'sensor', 'actuador', 'control', 'energia', 'pasivo', 'banco'] as const;

export const partsIn = (category: Part['category']) => PARTS.filter((p) => p.category === category);

export const unassigned = () => PARTS.filter((p) => p.role === null);

/** Parts where the rig needs more units than we have on hand. */
export const short = () => PARTS.filter((p) => p.needed !== undefined && p.qty < p.needed);
