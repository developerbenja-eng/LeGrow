import CrossoverTents from '../CrossoverTents';

const UNLOCKS = [
  {
    t: 'Vivero separado de produccion',
    d: 'Los dos roles quieren ajustes opuestos: un vivero enraizando estolones quiere PPFD bajo, humedad alta y nitrogeno alto. Una planta fructificando quiere lo contrario en las tres.',
    ok: true,
  },
  {
    t: 'Dos pH, dos especies',
    d: 'El candado era un estanque, un pH. Dos carpas son dos estanques. El mejor segundo candidato para 2x2 es tomate cherry Micro Tom: fruta en 45-55 dias desde semilla, con su propio EC de 2.0-3.5.',
    ok: true,
  },
  {
    t: 'Experimentacion A/B',
    d: 'Con una carpa nunca puedes probar una variable de ambiente, porque todas las plantas comparten el ambiente. Con dos, una queda de control y en la otra mueves un solo parametro.',
    ok: true,
  },
  {
    t: 'Dormancia — esto NO lo desbloquea',
    d: 'Frambuesa y mora piden 4-6 semanas a 0-7 °C. Eso es un refrigerador, no una carpa. Una segunda carpa no acerca ni un grado a cultivar frambuesas.',
    ok: false,
  },
];

const PHASES = [
  { when: 'Ahora', what: 'Carpa 1, tres Seascape identicas. Se mide el piso de ruido entre plantas.', cost: '$292–418' },
  { when: 'Mes 3-4', what: 'Carpa 2 como vivero, cuando los estolones pidan donde enraizar. Sin instrumentar.', cost: '$150–210' },
  { when: 'Mes ~12', what: 'Se instrumenta la carpa 2 identica a la 1 y se pasa a A/B cruzado.', cost: '+$100–120' },
];

export default function Rotacion() {
  return (
    <div className="space-y-8">
      <section>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <CrossoverTents />
        </div>
      </section>

      {/* The bias cancellation */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Por que hay que rotar el rol
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-red-900/40 rounded-xl p-5">
            <h4 className="font-semibold text-red-400 mb-2">El problema</h4>
            <p className="text-sm text-gray-400">
              Dos carpas nunca son identicas: distinta unidad de luz, distinta posicion en la pieza, distinto flujo de
              aire, distinta pared. Si el tratamiento vive siempre en la carpa A, el efecto de la carpa queda
              confundido con el efecto del tratamiento. Mides la carpa y crees que mides el tratamiento.
            </p>
          </div>
          <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5">
            <h4 className="font-semibold text-green-400 mb-2">La cancelacion</h4>
            <div className="font-mono text-xs space-y-1.5 text-gray-400">
              <p>
                Ciclo 1: A<span className="text-green-500">(trat)</span> − B<span className="text-gray-600">(ctrl)</span> ={' '}
                <span className="text-gray-200">efecto + sesgo</span>
              </p>
              <p>
                Ciclo 2: B<span className="text-green-500">(trat)</span> − A<span className="text-gray-600">(ctrl)</span> ={' '}
                <span className="text-gray-200">efecto − sesgo</span>
              </p>
              <p className="pt-1.5 border-t border-gray-800">
                Promedio → <span className="text-green-400 font-bold">efecto</span>
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              El sesgo de carpa se va por resta. Se llama diseno cruzado, y es exactamente lo que la palabra
              &quot;rotacion&quot; describe.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Paso previo obligatorio: correr las dos carpas en condiciones identicas para medir cuanto difieren entre si.
          Es el mismo piso de ruido del modulo de experimento, un nivel mas arriba. Sin ese numero no sabes si un 10%
          de diferencia es el tratamiento o es la carpa.
        </p>
      </section>

      {/* What it unlocks */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Que abre una segunda carpa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UNLOCKS.map((u) => (
            <div
              key={u.t}
              className={`bg-gray-900 border rounded-xl p-5 ${u.ok ? 'border-gray-800' : 'border-red-900/40'}`}
            >
              <h4 className={`font-semibold mb-2 ${u.ok ? 'text-gray-200' : 'text-red-400'}`}>{u.t}</h4>
              <p className="text-sm text-gray-500">{u.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cost fork */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">La bifurcacion de costo</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-800">
                <th className="p-4 font-medium">Rol de la carpa 2</th>
                <th className="p-4 font-medium">Necesita</th>
                <th className="p-4 font-medium text-right">Costo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="p-4 text-gray-200 font-semibold">Vivero</td>
                <td className="p-4 text-gray-500">Carpa, luz, ventilador, baldes. Medicion manual con lapicero de pH.</td>
                <td className="p-4 text-right font-mono text-green-400">$150–210</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-200 font-semibold">Experimento A/B</td>
                <td className="p-4 text-gray-500">
                  Lo anterior mas instrumentacion <span className="text-gray-300">identica</span> a la carpa 1. Si no
                  son iguales, no hay comparacion posible.
                </td>
                <td className="p-4 text-right font-mono text-amber-400">$250–330</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Un vivero no se mide, se cultiva. Esa es toda la diferencia entre las dos filas.
        </p>
      </section>

      {/* One controller */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Un solo ESP32 para las dos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">Dos buses I2C</h4>
            <p className="text-sm text-gray-500">
              El SCD41 tiene direccion fija 0x62, asi que dos chocan en el mismo bus. El ESP32 trae dos controladores
              I2C: uno por carpa y listo.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">Pines de sobra</h4>
            <p className="text-sm text-gray-500">
              ADC1 da 6 canales y hacen falta 4: dos pH y dos EC. En hidroponia no van sondas de humedad de sustrato,
              asi que los pines 32, 33 y 34 que hoy reserva config.h quedan libres justo para esto.
            </p>
          </div>
          <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5">
            <h4 className="font-semibold text-green-400 mb-2">Lo que de verdad importa</h4>
            <p className="text-sm text-gray-500">
              No son los $10 de ahorro: es <span className="text-gray-200">una sola base de tiempo</span>. Dos ESP32
              darian deriva de reloj entre los dos conjuntos de datos, y comparar series temporales desfasadas es una
              pesadilla que no vale la pena heredar.
            </p>
          </div>
        </div>
      </section>

      {/* Phasing */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Cuando comprarla</h3>
        <div className="space-y-2">
          {PHASES.map((p, i) => (
            <div key={p.when} className="flex gap-4 items-start bg-gray-900 border border-gray-800 rounded-xl p-4">
              <span className="text-xs font-mono text-green-500 bg-green-950 px-2 py-1 rounded shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-200">{p.when}</p>
                <p className="text-sm text-gray-500 mt-0.5">{p.what}</p>
              </div>
              <span className="text-sm font-mono text-gray-400 shrink-0">{p.cost}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Comprar la carpa 2 hoy la deja tres meses vacia. El disparador natural son los estolones: aparecen en semana
          4-6, pero conviene enraizarlos recien con la madre madura, lo que cae en el mes 3-4 — justo cuando entras en
          produccion continua y de pronto tienes clones sin donde ponerlos.
        </p>
      </section>
    </div>
  );
}
