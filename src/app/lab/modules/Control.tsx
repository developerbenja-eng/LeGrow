import DoserStateMachine from '../DoserStateMachine';

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
