import YieldGap from '../YieldGap';
import {
  BERRY_G,
  CYCLICAL,
  ESTIMATES,
  HARVEST_CADENCE,
  KCAL_PER_LB,
  MARKETABLE,
  PLANTS,
  band,
  claimOverMeasured,
  rigBerriesPerWeek,
  rigFoodDays,
  rigPerWeekG,
  rigPerYearLb,
} from '@/lib/yield';

const sare = ESTIMATES.find((e) => e.id === 'sare-hydro')!;
const best = ESTIMATES.find((e) => e.id === 'sare-best')!;

export default function Rendimiento() {
  const { lo, hi } = band();

  return (
    <div className="space-y-8">
      {/* The question */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-gray-200 mb-2">&quot;3-4 libras por planta&quot; — ¿en qué periodo?</h3>
        <p className="text-sm text-gray-400">
          El informe 05 dice <span className="text-gray-200">per year</span>. El informe 01 da la misma cifra sin
          periodo alguno. Y el informe 04 construye toda la economia del proyecto sobre ella.
        </p>
        <p className="text-sm text-gray-500 mt-3">
          Pero &quot;por ano&quot; es una unidad extrana para algo que fructifica continuo: nadie cosecha una
          dia-neutro una vez y la pesa. Esa cifra es la suma de muchas cosechas pequenas, casi seguro de ensayos con
          temporada definida y despues anualizada. Vale separar lo medido de lo afirmado.
        </p>
      </div>

      {/* The chart */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Afirmado contra medido</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <YieldGap />
        </div>
        <div className="bg-gray-900 border border-amber-800/50 rounded-xl p-5 mt-4">
          <p className="text-sm text-gray-300">
            La cifra del repo es{' '}
            <span className="text-amber-400 font-semibold">{claimOverMeasured().toFixed(1)}× el mejor resultado
            medido</span> que encontramos. No es que este mal: es que no tiene fuente ni periodo, y la evidencia
            disponible queda sistematicamente por debajo.
          </p>
        </div>
      </section>

      {/* Provenance table */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">De donde sale cada numero</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-800">
                <th className="p-3 font-medium">Estimacion</th>
                <th className="p-3 font-medium">Observado sobre</th>
              </tr>
            </thead>
            <tbody>
              {ESTIMATES.map((e) => (
                <tr key={e.id} className="border-b border-gray-800 last:border-0 align-top">
                  <td className="p-3">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-gray-200">{e.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          e.provenance === 'claimed'
                            ? 'text-amber-400 bg-amber-950/60'
                            : e.provenance === 'measured'
                              ? 'text-blue-400 bg-blue-950/60'
                              : 'text-gray-400 bg-gray-950'
                        }`}
                      >
                        {e.provenance}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{e.note}</p>
                    {e.source && (
                      <a
                        href={e.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-green-400 transition-colors"
                      >
                        {e.source.label} →
                      </a>
                    )}
                  </td>
                  <td className="p-3 text-gray-400 text-xs whitespace-nowrap">{e.observed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* What it means for our rig */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Y nuestro rig tiene {PLANTS} plantas, no nueve
        </h3>
        <div className="bg-gray-900 border border-red-900/40 rounded-xl p-5 mb-4">
          <p className="text-sm text-gray-300">
            Las 27-36 lb del informe 04 son para <span className="text-gray-200 font-semibold">nueve</span> plantas, el
            plan original en 3x3. Ese numero se ha venido arrastrando y no corresponde a lo que construimos.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { k: 'Banda honesta', v: `${lo.toFixed(1)}–${hi.toFixed(1)}`, s: 'lb/ano, 3 plantas' },
            {
              k: 'Por semana',
              v: `${rigPerWeekG(sare).toFixed(0)}–${rigPerWeekG(best).toFixed(0)} g`,
              s: 'entre las tres',
            },
            {
              k: 'En fruta',
              v: `${rigBerriesPerWeek(sare).toFixed(1)}–${rigBerriesPerWeek(best).toFixed(1)}`,
              s: `frutillas/semana · ~${BERRY_G} g c/u`,
            },
            {
              k: 'En calorias',
              v: `${rigFoodDays(sare).toFixed(1)}–${rigFoodDays(best).toFixed(1)}`,
              s: 'dias de comida al ano',
            },
          ].map((c) => (
            <div key={c.k} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{c.k}</p>
              <p className="text-xl font-bold text-green-400 leading-tight">{c.v}</p>
              <p className="text-xs text-gray-600 mt-0.5">{c.s}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          A {KCAL_PER_LB} kcal por libra. No son tazones de frutillas: son unas pocas cada semana, para siempre. Eso
          sigue siendo el resultado correcto del proyecto — pero es bueno saberlo antes y no despues.
        </p>
      </section>

      {/* Not linear */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          La produccion no es lineal, y eso cambia el plan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-amber-800/50 rounded-xl p-5">
            <h4 className="font-semibold text-amber-400 mb-2">Lo que encontro el estudio</h4>
            <p className="text-sm text-gray-400">
              Fructificacion <span className="text-gray-200">ciclica</span>, con fluctuacion de semana a semana y una
              caida marcada en las semanas {CYCLICAL.troughWeeks.join(' y ')}. Una dia-neutro no produce una linea
              plana: pulsa.
            </p>
          </div>
          <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5">
            <h4 className="font-semibold text-green-400 mb-2">Su recomendacion coincide con la nuestra</h4>
            <p className="text-sm text-gray-400">
              Escalonar plantaciones para sostener el suministro, en vez de esperar salida continua de una sola planta.
              Es la rotacion generacional que ya disenamos — pero en otra escala de tiempo:{' '}
              <span className="text-gray-200">semanas, no meses</span>. Continuo es una propiedad del sistema, no de la
              planta.
            </p>
          </div>
        </div>
      </section>

      {/* How to measure */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Como se mide de verdad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">La cadencia la pone la fruta</h4>
            <p className="text-sm text-gray-500">
              {HARVEST_CADENCE.timesPerWeek[0]}-{HARVEST_CADENCE.timesPerWeek[1]} veces por semana, que es lo que usaron
              los tres objetivos del estudio. La medicion semanal del resto de variables es calendario; la cosecha no.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">Que cuenta como comercial</h4>
            <p className="text-sm text-gray-500">
              {MARKETABLE.colour}, <span className="text-gray-300">≥ {MARKETABLE.minGrams} g</span> y{' '}
              {MARKETABLE.defects}. Adoptar ese criterio verbatim hace que nuestros numeros sean comparables con los
              suyos.
            </p>
          </div>
          <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5">
            <h4 className="font-semibold text-green-400 mb-2">El resultado es una curva</h4>
            <p className="text-sm text-gray-400">
              Pesar cada cosecha con fecha y balde. De ahi sale todo: gramos por semana en media movil, acumulado, y{' '}
              <span className="text-gray-200">cuando la tasa empieza a caer</span> — que es el dato del que depende el
              escalonamiento, y que un numero anual esconde por completo.
            </p>
          </div>
        </div>
      </section>

      {/* Seascape risk */}
      <section>
        <div className="bg-gray-900 border border-red-900/40 rounded-xl p-5">
          <h3 className="font-semibold text-red-400 mb-2">Un riesgo nuevo sobre Seascape</h3>
          <p className="text-sm text-gray-400">
            En ese mismo estudio Seascape <span className="text-gray-200">tendio al mayor rendimiento total</span> — lo
            que respalda nuestra eleccion. Pero fue{' '}
            <span className="text-gray-200 font-semibold">descartada mas adelante</span> por forma, textura y
            maduracion anormales a temperaturas altas.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Eso conecta con un pendiente que ya teniamos: la noche optima de 10-12 °C no es alcanzable en Memphis sin
            refrigeracion activa. Seascape rinde mas y tolera menos el calor. Las dos cosas juntas son un riesgo real
            para la calidad de la fruta, no para la supervivencia de la planta.
          </p>
        </div>
      </section>
    </div>
  );
}
