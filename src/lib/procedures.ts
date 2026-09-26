/**
 * Procedures, in the order they get done.
 *
 * Written to be followed with hands busy: each step is one action, the traps
 * are marked rather than buried in prose, and every procedure says what to
 * photograph so the guide fills with pictures of this rig rather than someone
 * else's.
 *
 * Sources are linked, never embedded — a public page carrying other people's
 * figures is a licensing problem, and our own photos document better anyway.
 */

export type Step = {
  do: string;
  /** Marked when getting this wrong costs a plant, a probe, or the run. */
  warn?: boolean;
  why?: string;
};

export type Procedure = {
  id: string;
  title: string;
  phase: 'hoy' | 'montaje' | 'arranque' | 'operacion' | 'instrumentacion';
  /** Rough hands-on time. */
  time: string;
  blurb: string;
  needs?: readonly string[];
  steps: readonly Step[];
  /** What to shoot, so the guide ends up illustrated with this rig. */
  photos?: readonly string[];
  sources?: readonly { label: string; url: string }[];
  /** Lab module with the reasoning behind this procedure. */
  module?: string;
};

export const PHASES = [
  { id: 'hoy', label: 'Hoy', note: 'Las plantas ya estan aqui y tienen reloj.' },
  { id: 'montaje', label: 'Montaje', note: 'Armar el rig. Nada vivo todavia.' },
  { id: 'arranque', label: 'Arranque', note: 'Agua sola primero, plantas despues.' },
  { id: 'operacion', label: 'Operacion', note: 'Lo que se repite cada semana.' },
  { id: 'instrumentacion', label: 'Instrumentacion', note: 'No bloquea cultivar.' },
] as const;

export const PROCEDURES: readonly Procedure[] = [
  {
    id: 'recibir',
    title: 'Recibir y triar los bare roots',
    phase: 'hoy',
    time: '30 min',
    module: 'planta',
    blurb:
      'Llegan dormantes en bolsa sellada y humeda. Esa combinacion cria moho en dias, y las hojas palidas que traen crecieron a oscuras gastando reservas.',
    needs: ['Recipiente con agua', 'Bolsa limpia y refrigerador si no se planta hoy'],
    steps: [
      { do: 'Abrir la bolsa apenas llega. No dejarla cerrada "hasta mañana".', warn: true, why: 'Sellada, humeda y tibia es un cultivo de moho.' },
      { do: 'Pelar el crecimiento muerto alrededor de cada corona.', why: 'Debajo aparece si la corona esta firme o blanda.' },
      { do: 'Triar una por una: firme = viva; blanda, negra o con olor = fuera.', why: 'De 25 es normal perder algunas.' },
      { do: 'Si se planta hoy: remojar SOLO las raices 1-2 horas. La corona fuera del agua.', warn: true },
      { do: 'Si NO se planta hoy: bolsa suelta, medio apenas humedo, refrigerador a 1-4 °C.', why: 'Las devuelve a dormancia y detiene el reloj por semanas.' },
      { do: 'No dejarlas sobre el mesón esperando que el rig este listo.', warn: true },
    ],
    photos: [
      'La bolsa como llego, antes de abrir',
      'Una corona antes y despues de pelarle lo muerto',
      'Las descartadas junto a las sanas, para tener el criterio por escrito',
    ],
  },
  {
    id: 'seleccionar',
    title: 'Elegir las tres coronas del experimento',
    phase: 'hoy',
    time: '15 min',
    module: 'experimento',
    blurb:
      'El piso de ruido solo significa algo si las tres plantas arrancan lo mas parecidas posible. Tener 25 para plantar 3 es la ventaja, no el desperdicio.',
    steps: [
      { do: 'Separar las sanas y ordenarlas por tamaño de corona.' },
      { do: 'Elegir las TRES mas parecidas entre si, no las tres mas grandes.', warn: true, why: 'Lo que se busca es varianza inicial baja, no vigor maximo.' },
      { do: 'Pesarlas si hay balanza, y anotar los tres pesos.', why: 'Es el dato base contra el que se compara todo despues.' },
      { do: 'Marcar cada balde A, B y C, y anotar que corona fue a cual.' },
      { do: 'Las 22 restantes: vasos con tierra en una ventana, como dice el vivero.', why: 'Linea de respaldo gratis, y un punto de comparacion tierra contra solucion.' },
    ],
    photos: ['Las tres elegidas juntas con una regla o moneda de escala', 'La balanza con cada peso'],
  },
  {
    id: 'enjuagar-medio',
    title: 'Enjuagar el medio',
    phase: 'montaje',
    time: '20 min',
    module: 'nutrientes',
    blurb: 'La perlita suelta polvo de silice fina. Respirarlo es malo y enturbia la solucion desde el primer dia.',
    steps: [
      { do: 'Enjuagar la perlita en un colador hasta que el agua salga clara.', warn: true },
      { do: 'Humedecerla ANTES de manipularla en seco, para no levantar polvo.', warn: true },
      { do: 'Si se mezcla con coco, hidratar el coco aparte y escurrirlo.' },
      { do: 'Mezclar 70% perlita / 30% coco, o perlita sola.', why: 'El coco retiene mas agua; la perlita sola perdona menos pero airea mejor.' },
    ],
    photos: ['El agua de enjuague al principio y al final'],
  },
  {
    id: 'armar-balde',
    title: 'Armar el Dutch bucket',
    phase: 'montaje',
    time: '45 min',
    module: 'nutrientes',
    blurb:
      'El fitting correcto no es un desague simple: es un codo sifon que deja 2-5 cm de solucion en el fondo como reserva permanente.',
    needs: ['3 baldes 5 gal', 'Fittings de drenaje tipo codo', 'Medio enjuagado', 'Tuberia y goteros'],
    steps: [
      { do: 'Perforar el lateral del balde a la altura del codo, no el fondo.' },
      { do: 'Montar el codo sifon de modo que retenga 2-5 cm en el fondo.', why: 'Esa reserva es lo que salva las raices si falla un riego.' },
      { do: 'Llenar con medio hasta unos 5 cm del borde.' },
      { do: 'Poner el gotero arriba, desplazado del centro.', why: 'Evita empozar justo sobre la corona.' },
      { do: 'Conectar el drenaje al retorno hacia el estanque.' },
      { do: 'El estanque va FUERA de la carpa.', warn: true, why: 'Luz sobre solucion nutritiva produce algas.' },
    ],
    photos: ['El codo montado, visto desde dentro y desde fuera', 'Un balde en corte o a medio llenar', 'El layout de los tres baldes dentro de la carpa'],
    sources: [
      { label: 'Bato bucket para frutilla en interior', url: 'https://strawberryplants.org/bato-dutch-bucket-indoor-growing/' },
      { label: 'Armado paso a paso (Instructables)', url: 'https://www.instructables.com/Dutch-Bucket-Hydroponics/' },
    ],
  },
  {
    id: 'colgar-luz',
    title: 'Colgar y ajustar la luz',
    phase: 'montaje',
    time: '30 min',
    module: 'luz',
    blurb:
      'La carpa de 48" deja 20" de cuelgue una vez puestos el balde y la planta. Lo que falte de distancia en trasplante se compensa atenuando.',
    steps: [
      { do: 'Colgar el panel con las poleas, centrado sobre los baldes.' },
      { do: 'Poner la perilla en EXT solo cuando vayamos a controlarla por el bus. Mientras tanto, en manual.', why: 'En EXT sin controlador conectado, la perilla no manda.' },
      { do: 'Arrancar atenuada al 50% las primeras semanas.', why: '20" de cuelgue es menos que los 24-30" que pide el trasplante; atenuar equivale a alejar.' },
      { do: 'Timer a 17 h encendido / 7 h apagado.' },
      { do: 'Subir al 100% cuando la planta este establecida.' },
    ],
    photos: ['La luz colgada con los baldes debajo', 'La perilla, para dejar registradas sus posiciones'],
  },
  {
    id: 'calibrar-ph',
    title: 'Calibrar el lapicero de pH',
    phase: 'arranque',
    time: '15 min',
    module: 'agua',
    blurb: 'Dos puntos con 4.01 y 7.00. El buffer de 10.00 del pack no se usa: nuestro rango operativo es 5.8-6.2.',
    needs: ['Buffers 4.01 y 7.00', 'Vasos pequeños', 'Agua destilada'],
    steps: [
      { do: 'Servir una porcion pequeña de buffer en un vaso aparte.' },
      { do: 'NUNCA devolver buffer usado a la botella.', warn: true, why: 'Contamina el resto y la calibracion queda mintiendo.' },
      { do: 'Calibrar en 7.00, enjuagar con destilada, calibrar en 4.01.' },
      { do: 'Enjuagar entre medicion y medicion, siempre con destilada.' },
      { do: 'Recalibrar cada 2-4 semanas.', why: 'El electrodo deriva; una sonda descalibrada es peor que ninguna.' },
    ],
    photos: ['Los tres buffers y el pen', 'La lectura en cada punto'],
  },
  {
    id: 'titracion',
    title: 'Titracion de alcalinidad: llave contra lluvia',
    phase: 'arranque',
    time: '45 min',
    module: 'agua',
    blurb:
      'Comparar EC y pH entre fuentes no dice nada que no sepamos. Lo que decide es cuanto pelea cada agua contra el pH Down.',
    needs: ['pH Down', 'Jeringa', 'Recipiente de 1 L', 'Lapicero de pH'],
    steps: [
      { do: 'Un litro de agua de la llave. Medir pH inicial.' },
      { do: 'Agregar pH Down de 0.5 mL a la vez. Revolver, esperar 30 s, medir.' },
      { do: 'Anotar mL acumulados contra pH hasta llegar a 6.0.' },
      { do: 'Repetir con agua lluvia: una muestra de primer flujo y otra posterior.', why: 'La diferencia entre las dos cuantifica cuanto vale el desviador en tu techo.' },
      { do: 'Hacerlo sobre agua sola, no sobre solucion nutritiva.', warn: true, why: 'Los nutrientes traen su propio tampon y ensucian la comparacion.' },
      { do: 'Multiplicar el total por 19 L: ese es el consumo de acido por llenado.' },
    ],
    photos: ['La serie de vasos con el gradiente de color si usas indicador', 'La planilla de mL contra pH'],
  },
  {
    id: 'solucion',
    title: 'Preparar la solucion nutritiva',
    phase: 'arranque',
    time: '20 min',
    module: 'control',
    blurb: 'El orden importa. Calcio concentrado encontrandose con fosfatos precipita, y lo que precipita ya no alimenta.',
    needs: ['Base A y Base B', 'pH Down', 'Lapicero de pH y de EC'],
    steps: [
      { do: 'Llenar el estanque con agua y medir su EC base.', why: 'Los ~0.23 mS/cm del agua de MLGW ya ocupan parte del presupuesto.' },
      { do: 'Agregar la Base A. Dejar mezclar con el difusor unos minutos.' },
      { do: 'NUNCA agregar B inmediatamente despues de A.', warn: true, why: 'Precipita: el estanque se pone lechoso y los nutrientes salen de solucion.' },
      { do: 'Agregar la Base B. Mezclar de nuevo.' },
      { do: 'Medir EC y ajustar hasta 1.2-1.8 mS/cm.' },
      { do: 'Ajustar pH a 5.8-6.2 con pH Down, de a poco.' },
      { do: 'Medir otra vez al dia siguiente.', why: 'La solucion se mueve sola en las primeras horas.' },
    ],
    photos: ['Las botellas A y B', 'Las lecturas de EC y pH finales'],
  },
  {
    id: 'ciclar',
    title: 'Ciclar el rig con agua sola',
    phase: 'arranque',
    time: '3-5 dias',
    module: 'control',
    blurb:
      'Las fugas en un sistema recirculante son la falla clasica del dia uno. Es infinitamente mejor encontrarlas con agua que con plantas dentro.',
    steps: [
      { do: 'Llenar y hacer circular solo agua con nutrientes, sin plantas.' },
      { do: 'Revisar cada junta, el codo de cada balde y el retorno.' },
      { do: 'Dejar correr 3-5 dias midiendo pH cada dia.', why: 'Eso da la velocidad de deriva, que es lo que despues sintoniza el dosificador.' },
      { do: 'Verificar que el difusor mantiene la solucion homogenea.' },
      { do: 'Aprovechar esta ventana para calibrar las bombas peristalticas en seco.' },
      { do: 'No plantar hasta que tres dias seguidos den lo mismo.', warn: true },
    ],
    photos: ['El rig corriendo vacio', 'La planilla de pH por dia'],
  },
  {
    id: 'plantar',
    title: 'Plantar',
    phase: 'arranque',
    time: '30 min',
    module: 'planta',
    blurb:
      'La corona es un tallo comprimido. Enterrada se pudre, expuesta se seca, y el margen entre las dos cosas es de un centimetro.',
    steps: [
      { do: 'Remojar solo las raices 1-2 horas antes.' },
      { do: 'Abrir un hueco en el medio y abanicar las raices hacia abajo, sin doblarlas.', why: 'Raices dobladas hacia arriba es el error D de la figura de OSU.' },
      { do: 'Ubicar el PUNTO MEDIO de la corona a nivel de la superficie.', warn: true, why: 'Mitad enterrada, mitad expuesta. Las extensiones universitarias coinciden en esto; el folleto del vivero dice "solo las raices", que queda mas superficial.' },
      { do: 'Rellenar sin compactar y sin tapar la corona.' },
      { do: 'Montar levemente el medio para que el agua escurra lejos de la corona.' },
      { do: 'Regar y verificar que el drenaje sale por el codo.' },
      { do: 'Anotar fecha y hora. Es la semana 0 del cronograma.' },
    ],
    photos: [
      'Una corona en la mano antes de plantar, con las raices abiertas',
      'El nivel final de la corona contra la superficie, de perfil',
      'Los tres baldes plantados, mismo encuadre que vas a repetir cada semana',
    ],
    sources: [
      { label: 'OSU Extension — figura de profundidad correcta e incorrecta', url: 'https://extension.oregonstate.edu/catalog/ec-1307-growing-strawberries-your-home-garden' },
      { label: 'UMN Extension — centro de la corona a nivel del suelo', url: 'https://extension.umn.edu/fruit/growing-strawberries-home-garden' },
      { label: 'UMD Extension — media corona bajo la superficie', url: 'https://extension.umd.edu/resource/growing-strawberries-home-garden' },
      { label: 'UMN — como crece la planta de frutilla', url: 'https://extension.umn.edu/strawberry-farming/how-strawberry-plants-grow' },
    ],
  },
  {
    id: 'flores',
    title: 'Quitar las flores las primeras cuatro semanas',
    phase: 'operacion',
    time: '5 min por semana',
    module: 'planta',
    blurb:
      'La unica intervencion activa del ciclo es la contraria a lo que uno quiere hacer: sacrificar un mes de fruta para construir corona y raiz.',
    steps: [
      { do: 'Semanas 1 a 4: cortar toda flor que aparezca.', warn: true },
      { do: 'Semana 5: dejar de cortar. Ese es el momento de hacerlas florecer.' },
      { do: 'Semanas 4-6: decidir por balde si los estolones se cortan o se enraizan.', why: 'Dos baldes en produccion con estolones cortados, uno en modo vivero.' },
    ],
    photos: ['Las primeras flores antes de cortarlas', 'El primer estolon'],
  },
  {
    id: 'registro',
    title: 'Registro semanal',
    phase: 'operacion',
    time: '15 min por semana',
    module: 'experimento',
    blurb: 'Sin esto no hay experimento, solo un huerto. La foto a hora fija es el unico dato que no se puede reconstruir despues.',
    steps: [
      { do: 'Foto de cada balde, misma hora, mismo encuadre, misma distancia.', warn: true },
      { do: 'Contar hojas, flores, frutos y estolones por balde.' },
      { do: 'pH y EC de entrada y de drenaje.', why: 'La diferencia entre las dos dice que consumio la planta.' },
      { do: 'Temperatura del agua y del aire.' },
      { do: 'Peso de fruta cosechada, por balde.' },
      { do: 'Anotar cualquier cosa rara aunque parezca irrelevante.' },
    ],
    photos: ['La serie semanal completa es, en si misma, el resultado'],
  },
  {
    id: 'bus-rj11',
    title: 'Identificar los pines del bus RJ11',
    phase: 'instrumentacion',
    time: '30 min',
    module: 'control',
    blurb:
      'Seis contactos sin documentar. Los tres tests solo miden: ninguno inyecta nada hasta saber que hay ahi.',
    needs: ['Multimetro', 'Cable RJ11 sacrificable', 'Resistencia de 10 kΩ'],
    steps: [
      { do: 'Luz DESENCHUFADA: continuidad pin por pin entre los dos jacks.', why: 'Si todos pitan es bus de paso y los jacks son intercambiables.' },
      { do: 'Enchufada y con la perilla en EXT: medir cada pin contra una referencia.' },
      { do: 'Buscar un par cerca de 10 V en circuito abierto.' },
      { do: 'Probar con 10 kΩ, NO con cortocircuito.', warn: true, why: 'Con seis pines, uno puede ser un riel de alimentacion. Si el voltaje se desploma es entrada de atenuacion; si no se mueve, no tocarlo.' },
      { do: 'Usar cable de 6 conductores, no el de telefono comun de 4.', warn: true },
    ],
    photos: ['El jack ampliado con los contactos visibles', 'El multimetro en cada medicion'],
  },
  {
    id: 'calibrar-bombas',
    title: 'Calibrar las bombas peristalticas',
    phase: 'instrumentacion',
    time: '30 min',
    module: 'control',
    blurb: 'Cada bomba entrega distinto y el tubo se estira con el uso. Sin tabla por canal, el dosificador dosifica a ciegas.',
    needs: ['Probeta o jeringa graduada', 'Fuente de 12 V'],
    steps: [
      { do: 'Correr cada bomba 30 segundos hacia una probeta.' },
      { do: 'Medir el volumen y calcular mL/s. Una tabla por canal.' },
      { do: 'Diluir el pH Down 1:4 con agua destilada en un bidon de trabajo.', warn: true, why: 'A 1.5 mL/s una correccion de 1-2 mL es un pulso de menos de un segundo, irrepetible. Diluido pasa a 3-7 s.' },
      { do: 'Recalibrar cada mes y cambiar el tubo cada 6-12 meses.' },
      { do: 'Marcarle al tubo la fecha de instalacion.' },
    ],
    photos: ['La probeta con el volumen de 30 s', 'La tabla de mL/s por canal'],
  },
];

export const byPhase = (phase: Procedure['phase']) => PROCEDURES.filter((p) => p.phase === phase);

export const warnCount = () =>
  PROCEDURES.reduce((n, p) => n + p.steps.filter((s) => s.warn).length, 0);

export const photoCount = () =>
  PROCEDURES.reduce((n, p) => n + (p.photos?.length ?? 0), 0);
