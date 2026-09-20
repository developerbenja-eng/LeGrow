import { WATER, roofAreaNeeded } from '@/lib/lab-data';
import { TARGETS } from '@/lib/photometry';

/** ppm on the 500 scale -> mS/cm. */
const ec = (ppm: number) => ppm / 500;

const SCALE = { x0: 110, x1: 570, max: 2.0 };
const ex = (v: number) => SCALE.x0 + (v / SCALE.max) * (SCALE.x1 - SCALE.x0);

const SOURCES = [
  { label: 'Llave (MLGW)', ppm: WATER.tap.tds, color: '#60a5fa', y: 54 },
  { label: 'Lluvia', ppm: WATER.rain.tdsHigh / 2, color: '#4ade80', y: 110 },
];

const PROTOCOL = [
  'Un litro de agua en un recipiente. Mide pH inicial.',
  'Agrega pH Down de 0.5 mL a la vez con jeringa. Revuelve, espera 30 s, mide.',
  'Anota mL acumulados contra pH.',
  'Para al llegar a 6.0. Ese total es tu carga de alcalinidad por litro.',
  'Multiplica por 19 L y tienes el consumo de acido por llenado de estanque.',
];

export default function Agua() {
  const roof = roofAreaNeeded();

  return (
    <div className="space-y-8">
      {/* EC budget */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">El presupuesto de EC</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <svg viewBox="0 0 620 190" className="w-full h-auto" role="img">
            <title>Cuanto del presupuesto de EC consume cada fuente de agua</title>

            {/* Target band */}
            <rect
              x={ex(TARGETS.ec[0])}
              y="30"
              width={ex(TARGETS.ec[1]) - ex(TARGETS.ec[0])}
              height="120"
              fill="#4ade80"
              opacity="0.08"
            />
            <text x={(ex(TARGETS.ec[0]) + ex(TARGETS.ec[1])) / 2} y="24" textAnchor="middle" fontSize="9" className="fill-green-500">
              objetivo {TARGETS.ec[0]}–{TARGETS.ec[1]}
            </text>

            {SOURCES.map((s) => {
              const v = ec(s.ppm);
              return (
                <g key={s.label}>
                  <text x={SCALE.x0 - 10} y={s.y + 20} textAnchor="end" fontSize="10" className="fill-gray-400" fontWeight="600">
                    {s.label}
                  </text>
                  {/* Full budget track */}
                  <rect x={SCALE.x0} y={s.y} width={SCALE.x1 - SCALE.x0} height="28" rx="4" fill="#111827" stroke="#374151" />
                  {/* What the source itself already occupies */}
                  <rect x={SCALE.x0} y={s.y} width={Math.max(3, ex(v) - SCALE.x0)} height="28" rx="4" fill={s.color} opacity="0.75" />
                  <text x={SCALE.x0 + 8} y={s.y + 18} fontSize="9" className="fill-gray-950" fontWeight="700">
                    {s.ppm > 20 ? `${v.toFixed(2)}` : ''}
                  </text>
                  <text x={ex(v) + 10} y={s.y + 18} fontSize="9" className="fill-gray-500">
                    {s.ppm} ppm · {v.toFixed(2)} mS/cm
                    {s.ppm > 20 ? ` · ${Math.round((v / TARGETS.ec[0]) * 100)}% del objetivo bajo` : ''}
                  </text>
                </g>
              );
            })}

            {/* Axis */}
            <line x1={SCALE.x0} y1="158" x2={SCALE.x1} y2="158" stroke="#4b5563" />
            {[0, 0.5, 1.0, 1.5, 2.0].map((v) => (
              <g key={v}>
                <line x1={ex(v)} y1="158" x2={ex(v)} y2="163" stroke="#6b7280" />
                <text x={ex(v)} y="176" textAnchor="middle" fontSize="9" className="fill-gray-500">
                  {v.toFixed(1)}
                </text>
              </g>
            ))}
            <text x={SCALE.x1} y="176" textAnchor="end" fontSize="9" className="fill-gray-600" dx="30">
              mS/cm
            </text>
          </svg>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          El agua de la llave ocupa {Math.round((ec(WATER.tap.tds) / TARGETS.ec[0]) * 100)}% del objetivo bajo antes de
          agregar un solo nutriente — notorio, no grave. Y buena parte de esos {WATER.tap.tds} ppm son calcio y magnesio,
          que la planta quiere igual.
        </p>
      </section>

      {/* Memphis water */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          El agua de Memphis es rara de buena
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { k: 'TDS', v: `${WATER.tap.tds} ppm`, s: `mediana del acuifero: ${WATER.tap.aquiferMedian} mg/L` },
            { k: 'Dureza', v: `${WATER.tap.hardness} ppm`, s: '2.6 granos/gal — blanda' },
            { k: 'Tipo', v: 'Ca-HCO₃', s: 'bicarbonato de calcio' },
            { k: 'PFAS', v: 'no detectados', s: 'cumple todo EPA' },
          ].map((c) => (
            <div key={c.k} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{c.k}</p>
              <p className="text-lg font-bold text-green-400">{c.v}</p>
              <p className="text-xs text-gray-600 mt-0.5">{c.s}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400">
            Las tres razones habituales para rechazar agua de la llave en hidroponia — dura, alcalina, con sodio —{' '}
            <span className="text-gray-200 font-semibold">practicamente no aplican aca</span>. El acuifero Memphis Sand
            filtra por capas alternadas de arcilla, arena y grava; es agua que cayo hace mas de 2000 anos. Es el mismo
            acuifero que estudia CAESER.
          </p>
        </div>
      </section>

      {/* Rain: pros and cons */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Lluvia: que gana y que pierde</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5">
            <h4 className="font-semibold text-green-400 mb-2">Gana</h4>
            <p className="text-sm text-gray-400">
              EC y alcalinidad cerca de cero — lienzo en blanco, el pH se queda donde lo pones sin pelear contra
              bicarbonatos. Es <span className="text-gray-200">agua RO gratis</span>. Y cero cloramina, que es el unico
              argumento fuerte a su favor aqui: el cloro se va solo con el difusor, la cloramina no.
            </p>
          </div>
          <div className="bg-gray-900 border border-red-900/40 rounded-xl p-5">
            <h4 className="font-semibold text-red-400 mb-2">Pierde</h4>
            <p className="text-sm text-gray-400">
              Todo lo que trae el techo: excrementos de aves, lixiviados de teja asfaltica, zinc de canaletas, cobre de
              tapajuntas, polvo y carga organica. En tierra lo amortigua el suelo; en un estanque recirculante{' '}
              <span className="text-gray-200">se acumula todo</span>. Y Pythium prospera sobre 22 °C — por eso el
              objetivo de agua es 18-21 °C.
            </p>
          </div>
        </div>
      </section>

      {/* Scale */}
      <section>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-gray-200 mb-2">La escala no es el problema</h3>
          <p className="text-sm text-gray-500">
            Memphis recibe ~{WATER.rainfallMm} mm al ano y el rig consume ~{WATER.demandLitresMonth} litros al mes.
            Superficie de techo necesaria:{' '}
            <span className="text-green-400 font-mono font-bold">{roof.toFixed(2)} m²</span>. No necesitas un sistema,
            necesitas un barril limpio y un desviador de primer flujo.
          </p>
        </div>
      </section>

      {/* Protocol */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          La medicion que decide: titracion de alcalinidad
        </h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
          <p className="text-sm text-gray-400 mb-4">
            Comparar EC y pH entre llave y lluvia no dice nada que no sepamos: la lluvia gana por quimica.{' '}
            <span className="text-gray-200 font-semibold">Lo que decide es cuanto pelea cada agua contra el pH Down</span>
            , porque eso se traduce directo en cuanto acido compras al ano y que tan quieto se queda el pH entre
            correcciones.
          </p>
          <ol className="space-y-2">
            {PROTOCOL.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-400">
                <span className="text-xs font-mono text-green-500 bg-green-950 px-2 py-0.5 rounded h-fit shrink-0">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="text-xs text-gray-600 mt-4">
            Sobre agua sola, no sobre solucion nutritiva: los nutrientes traen su propio tampon y ensucian la comparacion
            entre fuentes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">Dos muestras de lluvia, no una</h4>
            <p className="text-sm text-gray-500">
              Primer flujo (los primeros 2-3 litros de la bajada) y flujo posterior, por separado. Comparar las dos
              cuantifica <span className="text-gray-300">cuanto vale el desviador en este techo especifico</span>. Esa
              respuesta no esta en ningun paper. Anota el material del techo.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">Lo que no se puede medir con esto</h4>
            <p className="text-sm text-gray-500">
              Patogenos, metales del techo y carga organica necesitan laboratorio. El proxy crudo y gratis: deja una
              muestra en un frasco transparente a la luz una semana. Si se enturbia, cria biopelicula o huele, tienes
              carga organica.
            </p>
          </div>
        </div>
      </section>

      {/* Verdict */}
      <section>
        <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5">
          <h3 className="font-semibold text-green-400 mb-2">El primer estanque va con agua de la llave</h3>
          <p className="text-sm text-gray-400">
            Mismo razonamiento que todo lo demas: linea base con un insumo conocido. Si arrancas con lluvia y algo sale
            mal, no vas a poder separar si fue el agua, los nutrientes, la dosificacion o las plantas. Con dos semanas de
            datos de deriva de pH y consumo de EC, cambias a lluvia y{' '}
            <span className="text-gray-200 font-semibold">ves que cambia</span>. Eso si es un experimento.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Y hazlo por la razon correcta: en Memphis no es una mejora de calidad de agua, es{' '}
            <span className="text-gray-300">cerrar un ciclo</span>, que es la tesis del proyecto completo. Eso se
            defiende solo, sin fingir que el agua de MLGW es mala. No lo es.
          </p>
        </div>
      </section>
    </div>
  );
}
