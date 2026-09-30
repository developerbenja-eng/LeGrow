/**
 * Corte animado del pozo: el chirp baja, cada cople devuelve un eco chico,
 * el agua devuelve el grande, y la traza del microfono los muestra en orden.
 *
 * Animacion SMIL: corre sin JavaScript y se ve completa en el primer cuadro
 * (la traza entera queda visible cuando el navegador no anima).
 */

const DUR = '5s';
const SOUND = '#f97316';
const WATER = '#38bdf8';

// Tiempos de ida y vuelta como fraccion del ciclo: bajada 0-40 %, subida 40-80 %.
// Un cople a distancia y del inicio pasa en f = 0.4 * y / 302 y su eco llega en 2f.
const START_Y = 48;
const WATER_Y = 350;
const JOINTS = [150, 230, 310];
const pass = (y: number) => (0.4 * (y - START_Y)) / (WATER_Y - START_Y);

function wave(peaks: { x: number; a: number }[], x0: number, x1: number, y0: number, scale: number) {
  let d = '';
  for (let x = x0; x <= x1; x += 0.7) {
    let y = 0;
    for (const p of peaks) {
      const u = (x - p.x) / 5;
      if (u > -3.5 && u < 3.5) y += p.a * Math.exp(-u * u) * Math.sin((2 * Math.PI * (x - p.x)) / 5.5);
    }
    d += `${d ? ' L' : 'M'}${x.toFixed(1)} ${(y0 - y * scale).toFixed(1)}`;
  }
  return d;
}

const TX0 = 262;
const TX1 = 560;
const tx = (frac: number) => TX0 + (frac / 0.8) * (TX1 - TX0 - 10);

export default function WellEcho() {
  const jointArrivals = JOINTS.map((y) => 2 * pass(y));
  const peaks = [{ x: TX0 + 6, a: 1 }, ...jointArrivals.map((f, i) => ({ x: tx(f), a: 0.3 - i * 0.04 })), { x: tx(0.8), a: 0.85 }];

  return (
    <svg viewBox="0 0 580 440" className="w-full h-auto" role="img">
      <title>Un pulso sale de la tapa, pasa tres coples que devuelven ecos chicos, rebota en el agua, y los ecos llegan uno a uno a la traza del microfono</title>

      {/* Suelo y acuifero */}
      <rect x="20" y="70" width="210" height="360" fill="#111827" />
      <rect x="20" y={WATER_Y} width="88" height={430 - WATER_Y} fill="#0c4a6e" opacity="0.45" />
      <rect x="160" y={WATER_Y} width="70" height={430 - WATER_Y} fill="#0c4a6e" opacity="0.45" />
      <line x1="20" y1="70" x2="230" y2="70" stroke="#4b5563" strokeWidth="1.4" />
      <text x="24" y="62" fontSize="10" className="fill-gray-500">suelo</text>

      {/* Casing */}
      <rect x="108" y="40" width="6" height="390" fill="#4b5563" />
      <rect x="154" y="40" width="6" height="390" fill="#4b5563" />
      <rect x="114" y="40" width="40" height="390" fill="#030712" />
      <rect x="114" y={WATER_Y} width="40" height={430 - WATER_Y} fill={WATER} opacity="0.8" />
      {JOINTS.map((y) => (
        <rect key={y} x="104" y={y - 3} width="60" height="7" fill="#6b7280" />
      ))}

      {/* Tapa */}
      <rect x="98" y="20" width="72" height="24" rx="3" fill="#e5e7eb" />
      <text x="134" y="36" textAnchor="middle" fontSize="11" fontWeight="700" fill="#030712">tapa</text>

      <line x1="164" y1={JOINTS[0]} x2="182" y2={JOINTS[0]} stroke="#6b7280" />
      <text x="186" y={JOINTS[0] - 2} fontSize="10" className="fill-gray-400">cople</text>
      <text x="186" y={JOINTS[0] + 10} fontSize="10" className="fill-gray-500">eco chico</text>
      <line x1="160" y1={WATER_Y} x2="182" y2={WATER_Y} stroke="#6b7280" />
      <text x="186" y={WATER_Y - 2} fontSize="10" fontWeight="700" fill={WATER}>agua</text>
      <text x="186" y={WATER_Y + 10} fontSize="10" className="fill-gray-500">eco grande</text>

      {/* Pulso de bajada */}
      <g>
        <path d={`M117 ${START_Y} Q134 ${START_Y + 9} 151 ${START_Y}`} fill="none" stroke={SOUND} strokeWidth="3" strokeLinecap="round" />
        <animateTransform attributeName="transform" type="translate" values={`0 0;0 ${WATER_Y - START_Y};0 ${WATER_Y - START_Y}`} keyTimes="0;0.4;1" dur={DUR} repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.399;0.4;1" dur={DUR} repeatCount="indefinite" />
      </g>

      {/* Eco del agua */}
      <g opacity="0">
        <path d={`M117 ${WATER_Y - 2} Q134 ${WATER_Y - 11} 151 ${WATER_Y - 2}`} fill="none" stroke={WATER} strokeWidth="3" strokeLinecap="round" />
        <animateTransform attributeName="transform" type="translate" values={`0 0;0 0;0 ${-(WATER_Y - START_Y)};0 ${-(WATER_Y - START_Y)}`} keyTimes="0;0.4;0.8;1" dur={DUR} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.399;0.4;0.799;0.8;1" dur={DUR} repeatCount="indefinite" />
      </g>

      {/* Ecos de los coples */}
      {JOINTS.map((y) => {
        const f = pass(y);
        const k = (v: number) => Math.min(0.999, Math.max(0.001, v)).toFixed(3);
        return (
          <g key={y} opacity="0">
            <path d={`M121 ${y + 2} Q134 ${y - 4} 147 ${y + 2}`} fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
            <animateTransform attributeName="transform" type="translate" values={`0 0;0 0;0 ${-(y - START_Y)};0 ${-(y - START_Y)}`} keyTimes={`0;${k(f)};${k(2 * f)};1`} dur={DUR} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0;0.85;0.5;0;0" keyTimes={`0;${k(f - 0.001)};${k(f)};${k(2 * f - 0.001)};${k(2 * f)};1`} dur={DUR} repeatCount="indefinite" />
          </g>
        );
      })}

      {/* Traza del microfono */}
      <text x={TX0} y="96" fontSize="11" className="fill-gray-400">lo que escucha el mic A</text>
      <line x1={TX0} y1="200" x2={TX1} y2="200" stroke="#1f2937" />
      <path d={wave(peaks, TX0, TX1, 200, 44)} fill="none" stroke="#e5e7eb" strokeWidth="1.3" />
      <text x={TX0} y="254" fontSize="10" className="fill-gray-500">directo</text>
      {jointArrivals.map((f, i) => (
        <text key={i} x={tx(f)} y="254" textAnchor="middle" fontSize="10" className="fill-gray-500">
          C{i + 1}
        </text>
      ))}
      <text x={tx(0.8)} y="272" textAnchor="end" fontSize="10" fontWeight="700" fill={WATER}>agua</text>
      <rect x={TX0 - 4} y="110" width={TX1 - TX0 + 12} height="170" className="fill-gray-900">
        <animateTransform attributeName="transform" type="translate" values={`0 0;${TX1 - TX0 + 12} 0;${TX1 - TX0 + 12} 0`} keyTimes="0;0.8;1" dur={DUR} repeatCount="indefinite" />
      </rect>
      <line x1={TX0} y1="298" x2={TX1} y2="298" stroke="#6b7280" markerEnd="url(#we-arrow)" />
      <defs>
        <marker id="we-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#6b7280" />
        </marker>
      </defs>
      <text x={TX0} y="316" fontSize="10" className="fill-gray-500">tiempo desde el chirp</text>

      <text x={TX0} y="360" fontSize="11" className="fill-gray-400">Los coples llegan a distancia conocida:</text>
      <text x={TX0} y="376" fontSize="11" className="fill-gray-400">miden la velocidad del sonido.</text>
      <text x={TX0} y="400" fontSize="11" className="fill-gray-400">El eco del agua da la profundidad.</text>
    </svg>
  );
}
