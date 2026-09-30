/**
 * Linea de tiempo de un disparo. La cola TX tiene largo variable, por eso el
 * cero no es el momento en que se encola el chirp sino cuando el mic A lo oye.
 */

import { CHIRP, MODULES, REC, recordMs, soundSpeed } from '@/lib/pozo';

const X0 = 40;
const X1 = 860;
const TOTAL = recordMs();
const x = (ms: number) => X0 + (ms / TOTAL) * (X1 - X0);

// Ejemplo: la cola TX tardo 70 ms esta vez, agua a 24 m con aire a 12 °C.
const LAT = 70;
const T0 = REC.preRollMs + LAT;
const C = soundSpeed(12);
const ECHO = T0 + ((2 * 24) / C) * 1000;
const ECHO_MAX = REC.preRollMs + REC.txLatencyMs + CHIRP.ms + ((2 * REC.maxDepthM) / soundSpeed(-10)) * 1000;
const SPACING = 0.75;
const DT_AB = (SPACING / C) * 1000;

function Marker({ at, y, label, sub, color = '#9ca3af', anchor = 'start' }: { at: number; y: number; label: string; sub?: string; color?: string; anchor?: 'start' | 'end' | 'middle' }) {
  return (
    <g>
      <line x1={x(at)} y1="96" x2={x(at)} y2={y - 14} stroke={color} strokeDasharray="2 3" />
      <text x={x(at)} y={y} textAnchor={anchor} fontSize="10.5" fontWeight="600" fill={color}>
        {label}
      </text>
      {sub && (
        <text x={x(at)} y={y + 13} textAnchor={anchor} fontSize="10" className="fill-gray-500">
          {sub}
        </text>
      )}
    </g>
  );
}

export default function ShotTimeline() {
  const micB = MODULES.find((m) => m.id === 'micb');
  return (
    <svg viewBox="0 0 900 330" className="w-full h-auto" role="img">
      <title>Linea de tiempo de un disparo de {Math.round(TOTAL)} ms: pre-roll, cola de transmision, chirp, ventana de ecos</title>
      <defs>
        <pattern id="st-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#111827" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#374151" strokeWidth="3" />
        </pattern>
      </defs>

      <text x={X0} y="28" fontSize="11" className="fill-gray-400">
        grabacion completa: {Math.round(TOTAL)} ms · {Math.round((TOTAL * 48000) / 1000).toLocaleString('es-CL')} marcos estereo en PSRAM
      </text>

      {/* Barra */}
      <rect x={x(0)} y="50" width={x(REC.preRollMs) - x(0)} height="30" fill="#1f2937" />
      <rect x={x(REC.preRollMs)} y="50" width={x(T0) - x(REC.preRollMs)} height="30" fill="url(#st-hatch)" />
      <rect x={x(T0)} y="50" width={x(T0 + CHIRP.ms) - x(T0)} height="30" fill="#f97316" />
      <rect x={x(T0 + CHIRP.ms)} y="50" width={x(ECHO_MAX) - x(T0 + CHIRP.ms)} height="30" fill="#0c4a6e" opacity="0.6" />
      <rect x={x(ECHO_MAX)} y="50" width={x(TOTAL) - x(ECHO_MAX)} height="30" fill="#1f2937" />
      <rect x={x(0)} y="50" width={x(TOTAL) - x(0)} height="30" fill="none" stroke="#374151" />

      <text x={x(REC.preRollMs / 2)} y="69" textAnchor="middle" fontSize="9.5" className="fill-gray-400">pre</text>
      <text x={(x(REC.preRollMs) + x(T0)) / 2} y="69" textAnchor="middle" fontSize="9.5" className="fill-gray-300">cola TX</text>
      <text x={(x(T0 + CHIRP.ms) + x(ECHO_MAX)) / 2} y="69" textAnchor="middle" fontSize="10" className="fill-sky-300">
        ventana de ecos: hasta {REC.maxDepthM} m a −10 °C
      </text>

      {/* Cursor */}
      <line x1={x(0)} y1="44" x2={x(0)} y2="86" stroke="#e5e7eb" strokeWidth="2">
        <animateTransform attributeName="transform" type="translate" values={`0 0;${X1 - X0} 0`} dur="6s" repeatCount="indefinite" />
      </line>

      {/* Traza del mic A */}
      <line x1={X0} y1="120" x2={X1} y2="120" stroke="#1f2937" />
      <text x={X0} y="108" fontSize="10" className="fill-gray-500">mic A</text>
      <path d={`M${x(T0)} 120 l2 -22 l2 40 l2 -34 l2 26 l2 -10`} fill="none" stroke="#e5e7eb" strokeWidth="1.3" />
      <path d={`M${x(ECHO)} 120 l2 -9 l2 16 l2 -12 l2 8`} fill="none" stroke="#38bdf8" strokeWidth="1.3" />

      <Marker at={0} y={160} label="empieza a grabar" sub="drena el DMA" />
      <Marker at={REC.preRollMs} y={200} label="se encola el chirp" sub={`tras ${REC.preRollMs} ms`} />
      <Marker at={T0} y={240} label="t0: el mic A lo oye" sub={`esta vez ${LAT} ms de cola`} color="#f97316" />
      <Marker at={ECHO} y={160} label="eco del agua" sub="24 m, aire a 12 °C" color="#38bdf8" />
      <Marker at={TOTAL} y={200} label="fin" sub={`${Math.round(TOTAL)} ms`} anchor="end" />

      {/* Zoom del par de mics */}
      <g transform="translate(560 214)">
        <rect width="300" height="100" rx="6" fill="#030712" stroke="#374151" />
        <text x="12" y="18" fontSize="10.5" fontWeight="600" className="fill-gray-300">
          zoom: 0-4 ms desde t0
        </text>
        {[
          { y: 44, label: 'mic A', at: 0 },
          { y: 76, label: 'mic B', at: DT_AB },
        ].map((r) => {
          const px = 70 + (r.at / 4) * 210;
          return (
            <g key={r.label}>
              <line x1="70" y1={r.y} x2="280" y2={r.y} stroke="#1f2937" />
              <text x="12" y={r.y + 4} fontSize="10" className="fill-gray-500">{r.label}</text>
              <path d={`M${px} ${r.y} l2 -12 l2 22 l2 -18 l2 12`} fill="none" stroke="#f97316" strokeWidth="1.3" />
            </g>
          );
        })}
        <line x1="70" y1="54" x2={70 + (DT_AB / 4) * 210} y2="54" stroke="#a78bfa" markerEnd="url(#st-a)" />
        <defs>
          <marker id="st-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" fill="#a78bfa" />
          </marker>
        </defs>
        <text x={78 + (DT_AB / 4) * 210} y="58" fontSize="10" fill="#a78bfa">
          {DT_AB.toFixed(2)} ms = {SPACING} m / c
        </text>
        <text x="12" y="94" fontSize="9.5" className="fill-gray-600">
          {micB?.where}
        </text>
      </g>
    </svg>
  );
}
