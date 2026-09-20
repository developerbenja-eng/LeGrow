import DoserStateMachine from '../DoserStateMachine';
import DimBus from '../DimBus';
import { FIXTURE } from '@/lib/photometry';

const BUS_TESTS = [
  {
    t: 'Continuidad, sin energia',
    d: 'Luz desenchufada, multimetro en continuidad, pin por pin entre un jack y el otro. Si todos pitan es bus de paso y los dos jacks son intercambiables. Si alguno no pita, entrada y salida son distintas.',
  },
  {
    t: 'Voltaje, con la perilla en EXT',
    d: 'Enchufada y en EXT, toma un pin de referencia y mide los otros cinco. Una entrada 0-10V se presenta cerca de 10V en circuito abierto.',
  },
  {
    t: 'Resistencia de 10 kΩ, no cortocircuito',
    d: 'Con seis pines, cortocircuitar a ciegas es imprudente. Si al poner 10 kΩ el voltaje se desploma, es entrada de atenuacion — alta impedancia y corriente limitada. Si no se mueve, es un riel de alimentacion y no se toca.',
  },
];

const STAGES = [
  { n: '0', t: 'Manual', d: 'Lapiceros de pH y EC, dosificacion a mano. Aprendes que hace tu solucion.', now: true },
  { n: '1', t: 'Solo monitoreo', d: 'pH, EC y temperatura de agua registrando. Cero actuacion. Dos semanas de datos.', now: false },
  { n: '2', t: 'Alertas', d: 'El sistema avisa que hay que dosificar. Dosificas tu, y comparas su juicio con el tuyo.', now: false },
  { n: '3', t: 'Lazo cerrado', d: 'Dosifica solo, con todos los topes de la maquina de estados.', now: false },
];

const TRAPS = [
  {
    t: 'Las sondas de pH y EC se interfieren',
    d: 'La de EC inyecta corriente alterna en la solucion y la de pH la lee como ruido. Se arregla gratis: alimenta la de EC solo durante su medicion y lee el pH con la EC apagada.',
  },
  {
    t: 'El lazo tiene mucho tiempo muerto',
    d: 'Echar acido a 19 litros no mueve la lectura por varios minutos. Un PID ingenuo sobrepasa feo. Dosis chica, espera larga, repite.',
  },
  {
    t: 'El error correlacionado con la accion',
    d: 'Si la bomba arranca y el riel de 5V cae, la lectura se mueve por culpa de la propia bomba. El filtro de mediana no lo cacha porque el error no es aleatorio. Por eso la fuente de las bombas va separada.',
  },
  {
    t: 'La sonda es consumible',
    d: 'Deriva y hay que recalibrarla cada 2-4 semanas con buffers. DFRobot declara >0.5 ano de vida util; en monitoreo 24/7 asume reemplazo anual. El conector BNC hace que reemplaces solo el electrodo.',
  },
];

export default function Control() {
  return (
    <div className="space-y-8">
      <section>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <DoserStateMachine />
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Ninguna transicion llega a DOSIS sin pasar por CORDURA y TOPES. Una burbuja en la membrana o un pico de ruido
          leido como una sola muestra, sin esas dos guardas, vacia el bidon de acido en el estanque durante la noche.
        </p>
      </section>

      {/* The dilution trick */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Por que el pH Down va diluido 1:4
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-red-900/40 rounded-xl p-5">
            <h4 className="font-semibold text-red-400 mb-2">Concentrado</h4>
            <p className="text-sm text-gray-400">
              Correccion tipica en 19 litros: <span className="font-mono text-gray-200">1–2 mL</span>. A 3.5 mL/s eso es
              un pulso de <span className="font-mono text-gray-200">0.3–0.6 s</span>. Entre el retardo del rele, el
              arranque del motor y su inercia, no hay forma de repetirlo dos veces igual.
            </p>
          </div>
          <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5">
            <h4 className="font-semibold text-green-400 mb-2">Diluido una parte en cuatro de agua destilada</h4>
            <p className="text-sm text-gray-400">
              La misma correccion pasa a <span className="font-mono text-gray-200">5–10 mL</span>, o{' '}
              <span className="font-mono text-gray-200">1.5–3 s</span> de pulso. Repetible, y con margen de error real
              para el controlador.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Los nutrientes A y B no tienen este problema: se dosifican en decenas de mL, donde el caudal alto ayuda.
        </p>
      </section>

      {/* A/B rule */}
      <section>
        <div className="bg-gray-900 border border-amber-800/50 rounded-xl p-5">
          <h3 className="font-semibold text-amber-400 mb-2">Nunca A y B seguidas</h3>
          <p className="text-sm text-gray-400">
            El calcio concentrado de la parte A encontrandose con los fosfatos y sulfatos de la B{' '}
            <span className="text-gray-200 font-semibold">precipita</span>: el estanque se pone lechoso y los nutrientes
            quedan fuera de solucion. Dosificas A → esperas que el difusor homogeneice unos minutos → dosificas B. Esa
            espera es la razon por la que el air pump no es opcional.
          </p>
        </div>
      </section>

      {/* Traps */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Las otras trampas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRAPS.map((t) => (
            <div key={t.t} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h4 className="font-semibold text-gray-200 mb-2">{t.t}</h4>
              <p className="text-sm text-gray-500">{t.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wiring */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Cableado</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-amber-800/50 rounded-xl p-5">
            <h4 className="font-semibold text-amber-400 mb-2">El jumper amarillo del tablero de reles</h4>
            <p className="text-sm text-gray-400">
              Quitalo. <span className="font-mono text-gray-300">JD-VCC → 5V</span> para las bobinas,{' '}
              <span className="font-mono text-gray-300">VCC → 3.3V</span> para los optoacopladores, GND del ESP32 a DC−.
              Si dejas todo a 5V, el rele enciende y no apaga: quedan 1.7V sobre el opto y sigue conduciendo. Son{' '}
              <span className="text-gray-200">activo-bajo</span>.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">ADS1115, no el ADC del ESP32</h4>
            <p className="text-sm text-gray-500">
              El ADC interno es no lineal, ruidoso y con error de hasta ±6%. El ADS1115 da 16 bits con referencia propia
              y a ganancia 2/3 lee hasta ±6.144V, asi que acepta salidas de 0-5V sin divisor.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">Diodos flyback</h4>
            <p className="text-sm text-gray-500">
              Un 1N4007 en paralelo con cada motor, catodo al positivo. El tablero protege sus propias bobinas, no el
              golpe inductivo de la bomba — ese arco se come los contactos del rele.
            </p>
          </div>
        </div>
      </section>

      {/* The light as an actuator */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          La luz como actuador — el bus RJ11
        </h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
          <DimBus />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-900 border border-red-900/40 rounded-xl p-5">
            <h4 className="font-semibold text-red-400 mb-2">No es LAN</h4>
            <p className="text-sm text-gray-400">
              Se parece a Ethernet y no lo es: seis contactos contra ocho, y nada de red detras. No hay IP, no hay
              protocolo que hablar. Es un bus de control sobre cable de telefono — mejor noticia para nosotros que si
              fuera red.
            </p>
          </div>
          <div className="bg-gray-900 border border-amber-800/50 rounded-xl p-5">
            <h4 className="font-semibold text-amber-400 mb-2">La perilla va en EXT</h4>
            <p className="text-sm text-gray-400">
              Sin eso el puerto se ignora y manda la perilla. Si se encadenan varias luces,{' '}
              <span className="text-gray-200">todas</span> tienen que estar en EXT.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">Cable de seis conductores</h4>
            <p className="text-sm text-gray-500">
              Un cable de telefono comun suele ser 6P4C: entra en el jack pero deja los pines 1 y 6 sin conectar. Si la
              senal esta en un extremo, no pasa nada y parece que algo esta roto.
            </p>
          </div>
        </div>

        {/* Two hypotheses */}
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Dos hipotesis abiertas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">A · Analogico 0-10V</h4>
            <p className="text-sm text-gray-500">
              Dos pines, senal continua. Es el estandar de la industria y hay gente manejando asi un Mars Hydro desde un
              ESP32. Requiere convertir el PWM de 3.3V a 0-10V, o un{' '}
              <span className="text-gray-300 font-mono">MCP4725</span> mas amplificacion — el complemento natural del
              ADS1115 que ya tenemos.
            </p>
          </div>
          <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5">
            <h4 className="font-semibold text-green-400 mb-2">B · Seleccion por pasos</h4>
            <p className="text-sm text-gray-400">
              VIVOSUN declara atenuacion en cuatro escalones — {FIXTURE.dimSteps.join('/')}% y OFF — y el GrowHub
              tampoco da continuo. Cuatro lineas de senal mas un comun mas una de reserva{' '}
              <span className="text-gray-200">explican los seis pines exactamente</span>. Si es esto, se controla con
              cuatro salidas digitales: sin DAC, sin amplificador, mas simple que la hipotesis A.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mb-4">
          La ambiguedad esta en el propio manual: para la app dice &quot;25%-100%&quot;, con guion, que podria significar
          continuo. Si la app da continuo, el bus lleva senal analogica y la perilla solo la cuantiza.
        </p>

        {/* Identification procedure */}
        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Identificar los pines antes de conectar nada
        </h4>
        <div className="space-y-2 mb-4">
          {BUS_TESTS.map((t, i) => (
            <div key={t.t} className="flex gap-3 items-start bg-gray-900 border border-gray-800 rounded-xl p-4">
              <span className="text-xs font-mono text-green-500 bg-green-950 px-2 py-1 rounded shrink-0">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-gray-200">{t.t}</p>
                <p className="text-sm text-gray-500 mt-0.5">{t.d}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mb-4">
          El pinout no esta estandarizado entre marcas y VIVOSUN no lo documenta, asi que meter voltaje a ciegas puede
          danar el driver. Los tres tests solo miden; no inyectan nada.
        </p>

        {/* What it unlocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5">
            <h4 className="font-semibold text-green-400 mb-2">Lo que desbloquea: el lazo de DLI</h4>
            <p className="text-sm text-gray-400">
              Con la luz atenuable desde el ESP32 deja de ser un insumo fijo y pasa a ser{' '}
              <span className="text-gray-200 font-semibold">un actuador</span>. Ahi el lazo cierra: el BH1750 mide PPFD,
              se integra el DLI acumulado del dia, y se ajusta para aterrizar en objetivo. Si la planta crece y sombrea,
              el sistema compensa solo.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Aunque sean cuatro escalones el lazo no se cae: la intensidad queda de control grueso y{' '}
              <span className="text-gray-300">el fotoperiodo de control fino</span>, porque el tiempo no esta
              cuantizado.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">Lo que no resuelve</h4>
            <p className="text-sm text-gray-500">
              Atenuar a cero normalmente no apaga: casi todos los drivers tienen un minimo. Para apagado real hay que
              cortar corriente con un rele. Y conviene dejar el timer mecanico puesto hasta que el lazo del ESP32 este
              probado — mismo criterio por etapas que el dosificador.
            </p>
          </div>
        </div>
      </section>

      {/* Stages */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Construccion por etapas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map((s) => (
            <div
              key={s.n}
              className={`bg-gray-900 border rounded-xl p-5 ${s.now ? 'border-green-700' : 'border-gray-800'}`}
            >
              <div className="flex items-baseline gap-2 mb-2">
                <span
                  className={`text-xs font-mono px-2 py-1 rounded ${
                    s.now ? 'text-green-500 bg-green-950' : 'text-gray-600 bg-gray-950'
                  }`}
                >
                  {s.n}
                </span>
                <h4 className={`font-semibold ${s.now ? 'text-green-400' : 'text-gray-200'}`}>{s.t}</h4>
              </div>
              <p className="text-sm text-gray-500">{s.d}</p>
              {s.now && <p className="text-[10px] font-mono text-green-600 mt-2">aqui estamos</p>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          El argumento de la etapa 1 es el mismo del piso de ruido: no se puede sintonizar un dosificador sin saber a
          que velocidad deriva el pH en este estanque, con esta agua y estas plantas. Construir el lazo cerrado primero
          es adivinar las constantes.
        </p>
      </section>

      {/* Calibration */}
      <section>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-gray-200 mb-2">Calibracion de las bombas, y no es opcional</h3>
          <p className="text-sm text-gray-500">
            Cada bomba entrega distinto y el tubo se estira con el uso. Correr 30 segundos hacia una probeta, medir,
            calcular mL/s, una tabla por canal. <span className="text-gray-300">Recalibrar mensual</span> y cambiar el
            tubo cada 6-12 meses, marcandole la fecha de instalacion. La semana en que el rig circule solo agua para
            cazar fugas es exactamente cuando hacer esto.
          </p>
        </div>
      </section>
    </div>
  );
}
