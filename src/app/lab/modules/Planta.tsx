import CrownDepth from '../CrownDepth';
import GenerationRotation from '../GenerationRotation';
import { SPECIES } from '@/lib/lab-data';
import { TARGETS } from '@/lib/photometry';

const PH_MIN = 4;
const PH_MAX = 7;
const BAR_W = 132;
const phX = (p: number) => ((p - PH_MIN) / (PH_MAX - PH_MIN)) * BAR_W;

function PhBar({ range, ok }: { range: [number, number]; ok: boolean }) {
  return (
    <svg viewBox={`0 0 ${BAR_W} 16`} width={BAR_W} height="16" className="shrink-0" role="img">
      <title>{`pH ${range[0]}-${range[1]}`}</title>
      <rect y="6" width={BAR_W} height="4" rx="2" fill="#1f2937" />
      {/* Strawberry reference band */}
      <rect
        x={phX(TARGETS.ph[0])}
        y="2"
        width={phX(TARGETS.ph[1]) - phX(TARGETS.ph[0])}
        height="12"
        rx="2"
        fill="#4ade80"
        opacity="0.18"
      />
      <rect
        x={phX(range[0])}
        y="4"
        width={Math.max(3, phX(range[1]) - phX(range[0]))}
        height="8"
        rx="3"
        fill={ok ? '#4ade80' : '#f87171'}
      />
    </svg>
  );
}

const LIKES = [
  { k: 'Temp dia', v: '20-24 °C', note: 'Sobre 29 °C deja de iniciar flores' },
  { k: 'Temp noche', v: '10-12 °C', note: 'Acepta hasta 18 °C, se paga en sabor' },
  { k: 'pH solucion', v: `${TARGETS.ph[0]}-${TARGETS.ph[1]}`, note: 'Fuera de rango: bloqueo de nutrientes' },
  { k: 'EC', v: `${TARGETS.ec[0]}-${TARGETS.ec[1]}`, note: 'La diferencia entrada/drenaje dice que consumio' },
  { k: 'PPFD', v: `${TARGETS.ppfd[0]}-${TARGETS.ppfd[1]}`, note: 'Bajo 300: sin fruta, crecimiento estirado' },
  { k: 'Humedad', v: `${TARGETS.rh[0]}-${TARGETS.rh[1]}%`, note: 'Sobre 70%: moho en la fruta' },
];

const BLOCKERS = [
  { t: 'Calor', d: 'Sobre 29 °C se detiene la iniciacion floral.' },
  { t: 'Nitrogeno alto', d: 'Manda la energia a hoja. El informe 07 lo lista como causa unica de "sin flores".' },
  { t: 'Luz bajo 300 PPFD', d: 'Da flores sin fruta, o nada.' },
];

export default function Planta() {
  return (
    <div className="space-y-8">
      {/* Species screening */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Por que solo una especie
        </h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-800">
                <th className="p-3 font-medium">Especie</th>
                <th className="p-3 font-medium">pH</th>
                <th className="p-3 font-medium hidden sm:table-cell">Maceta</th>
                <th className="p-3 font-medium hidden md:table-cell">Frio</th>
                <th className="p-3 font-medium">Veredicto</th>
              </tr>
            </thead>
            <tbody>
              {SPECIES.map((s) => (
                <tr key={s.name} className="border-b border-gray-800 last:border-0 align-top">
                  <td className="p-3">
                    <p className={s.verdict === 'in' ? 'text-green-400 font-semibold' : 'text-gray-300'}>{s.name}</p>
                    <p className="text-xs text-gray-600 mt-1 max-w-md">{s.why}</p>
                  </td>
                  <td className="p-3">
                    <PhBar range={s.ph} ok={s.verdict === 'in'} />
                    <span className="text-xs font-mono text-gray-500">
                      {s.ph[0]}–{s.ph[1]}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 font-mono text-xs hidden sm:table-cell">{s.pot}</td>
                  <td className="p-3 text-gray-500 text-xs hidden md:table-cell">{s.chill}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded ${
                        s.verdict === 'in' ? 'text-green-500 bg-green-950' : 'text-gray-500 bg-gray-950'
                      }`}
                    >
                      {s.verdict === 'in' ? 'entra' : 'fuera'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          La banda verde tenue es el rango de la frutilla. Un estanque recirculante significa un solo pH para todo lo
          que hay dentro, y el arandano esta a un punto completo de distancia — en escala logaritmica, diez veces mas
          acido.
        </p>
      </section>

      {/* Crown anatomy */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">El error de un centimetro</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <CrownDepth />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            {
              t: 'La corona',
              d: 'Es un tallo comprimido, ni raiz ni hoja. Enterrada se pudre, expuesta se seca. El informe 05, paso 8: plantar con la corona al ras.',
            },
            {
              t: 'Raices superficiales',
              d: 'La mayoria vive en los primeros 15 cm. Por eso el Dutch bucket calza: no pide profundidad, pide oxigeno.',
            },
            {
              t: 'El ventilador es el polinizador',
              d: 'Autopolinizante pero necesita agitacion mecanica. Sin viento o pincel la polinizacion es parcial y la fruta sale deforme.',
            },
          ].map((c) => (
            <div key={c.t} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h4 className="font-semibold text-gray-200 mb-2">{c.t}</h4>
              <p className="text-sm text-gray-500">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What it likes */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Que le gusta</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LIKES.map((l) => (
            <div key={l.k} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{l.k}</p>
                <p className="text-sm font-mono font-bold text-green-400">{l.v}</p>
              </div>
              <p className="text-xs text-gray-600 mt-1.5">{l.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flowering */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Cuando hacerlas florecer</h3>
        <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5 mb-4">
          <p className="text-gray-300">
            No las haces florecer. <span className="text-green-400 font-semibold">Dejas de impedirselo.</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Dia-neutro significa que ignoran el fotoperiodo: no hay un interruptor de floracion como el 12/12 del
            cannabis. La planta esta intentando florecer todo el tiempo entre 4 y 29 °C. El trabajo es quitar los
            bloqueadores.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {BLOCKERS.map((b) => (
            <div key={b.t} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h4 className="font-semibold text-red-400 mb-2">{b.t}</h4>
              <p className="text-sm text-gray-500">{b.d}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h4 className="font-semibold text-gray-200 mb-2">La unica intervencion activa es la contraria</h4>
          <p className="text-sm text-gray-500">
            Semanas 1-4 post-trasplante: cortar todas las flores. Se sacrifica un mes de fruta para que la planta
            construya corona y raiz. En algo que va a producir 1-3 anos, es la mejor inversion del ciclo. El mejor
            momento de hacerlas florecer es la{' '}
            <span className="text-green-400 font-semibold">semana 5, y el acto es dejar de cortar</span>.
          </p>
        </div>
      </section>

      {/* Generational rotation */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Suministro constante sin agotar la planta
        </h3>
        <div className="bg-gray-900 border border-amber-800/50 rounded-xl p-5 mb-4">
          <p className="text-sm text-gray-300">
            <span className="text-amber-400 font-semibold">La produccion continua es el estres.</span> Una dia-neutro
            fructificando 12 meses no tiene periodo de recuperacion, y por eso dura 1-3 anos mientras una variedad de
            junio con su dormancia anual dura mucho mas. Pedir fruta constante y baja exigencia a la vez es pedir dos
            cosas incompatibles.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            La salida no es bajar la exigencia sino cambiar que cuenta como &quot;la planta&quot;:{' '}
            <span className="text-gray-200 font-semibold">el individuo es consumible, el clon es lo perenne.</span>
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <GenerationRotation />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">Por que desfasado</h4>
            <p className="text-sm text-gray-500">
              Reemplazar las tres a la vez dejaria el suministro en cero por un trimestre completo. Escalonando los
              reemplazos la curva combinada nunca toca fondo.
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="font-semibold text-gray-200 mb-2">El conflicto del estolon, resuelto</h4>
            <p className="text-sm text-gray-500">
              Los informes dicen a la vez &quot;cortalos para dar energia a la madre&quot; y &quot;usalos como plantas
              gratis&quot;. Se resuelve asignando roles: dos baldes en produccion con estolones cortados al aparecer,
              uno en modo vivero. El rol de vivero rota, y la que produce clones es tambien la que descansa.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
