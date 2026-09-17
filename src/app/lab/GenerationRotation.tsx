/**
 * Staggered generational replacement across the three buckets.
 *
 * Day-neutral strawberry stays productive 1-3 years, and runners are free
 * clones. Replacing all three at once would drop supply to zero for a quarter;
 * offsetting the replacements keeps the combined curve from ever bottoming out.
 */

const M0 = 78;
const M1 = 620;
const MONTHS = 30;
const ROW_Y = [72, 116, 160];
const ROW_H = 26;
const REPLACE = [18, 22, 26];
const CURVE_TOP = 208;
const CURVE_BOTTOM = 282;

const xm = (m: number) => M0 + (m / MONTHS) * (M1 - M0);

/** Output of a single plant, months since it was planted. Schematic, not data. */
function plantYield(u: number): number {
  if (u < 2) return 0;
  if (u < 5) return (u - 2) / 3;
  if (u < 15) return 1;
  return Math.max(0.5, 1 - (u - 15) * 0.1);
}

function combined(t: number): number {
  return REPLACE.reduce((sum, r) => sum + plantYield(t < r ? t : t - r), 0) / REPLACE.length;
}

function Bar({ from, to, y, fill, label }: { from: number; to: number; y: number; fill: string; label?: string }) {
  const w = xm(to) - xm(from);
  if (w <= 0) return null;
  return (
    <g>
      <rect x={xm(from)} y={y} width={w} height={ROW_H} rx="3" fill={fill} />
      {label && w > 52 && (
        <text x={xm(from) + w / 2} y={y + ROW_H / 2 + 3.5} textAnchor="middle" fontSize="9" className="fill-gray-950" fontWeight="600">
          {label}
        </text>
      )}
    </g>
  );
}

export default function GenerationRotation() {
  const curve = Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * MONTHS;
    const v = combined(t);
    return `${xm(t)},${CURVE_BOTTOM - v * (CURVE_BOTTOM - CURVE_TOP)}`;
  });

  return (
    <svg viewBox="0 0 660 320" className="w-full h-auto" role="img">
      <title>Reemplazo generacional desfasado de los tres baldes</title>
      <defs>
        <linearGradient id="supply" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      <text x={M0} y="28" fontSize="11" className="fill-gray-300" fontWeight="600">
        Reemplazo desfasado — cada balde se renueva en un mes distinto
      </text>

      {/* Replacement guides */}
      {REPLACE.map((r) => (
        <line key={r} x1={xm(r)} y1="44" x2={xm(r)} y2={CURVE_BOTTOM} stroke="#4b5563" strokeWidth="1" strokeDasharray="3 4" />
      ))}

      {/* Bucket rows */}
      {REPLACE.map((r, i) => (
        <g key={i}>
          <text x={M0 - 10} y={ROW_Y[i] + ROW_H / 2 + 3.5} textAnchor="end" fontSize="10" className="fill-gray-400" fontWeight="600">
            Balde {String.fromCharCode(65 + i)}
          </text>
          {/* Generation 1 */}
          <Bar from={0} to={3} y={ROW_Y[i]} fill="#374151" />
          <Bar from={3} to={r - 3} y={ROW_Y[i]} fill="#22c55e" label="produccion" />
          <Bar from={r - 3} to={r} y={ROW_Y[i]} fill="#d97706" />
          {/* Generation 2, from a rooted runner */}
          <Bar from={r} to={r + 3} y={ROW_Y[i]} fill="#374151" />
          <Bar from={r + 3} to={MONTHS} y={ROW_Y[i]} fill="#16a34a" label="clon" />
          {/* Replacement marker */}
          <circle cx={xm(r)} cy={ROW_Y[i] + ROW_H / 2} r="5" fill="#030712" stroke="#f59e0b" strokeWidth="2">
            <animate attributeName="r" values="5;8;5" dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* Nursery role cycling between rows */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 0; 0 44; 0 44; 0 88; 0 88; 0 0"
          keyTimes="0; 0.28; 0.33; 0.61; 0.66; 0.94; 1"
          dur="12s"
          repeatCount="indefinite"
        />
        <rect x={M1 + 6} y={ROW_Y[0] + 4} width="32" height="18" rx="4" fill="#14532d" stroke="#4ade80" strokeWidth="1" />
        <text x={M1 + 22} y={ROW_Y[0] + 16.5} textAnchor="middle" fontSize="8" className="fill-green-400" fontWeight="700">
          vivero
        </text>
      </g>

      {/* Combined supply */}
      <text x={M0 - 10} y={CURVE_TOP + 4} textAnchor="end" fontSize="9" className="fill-gray-500">
        100%
      </text>
      <polygon points={`${xm(0)},${CURVE_BOTTOM} ${curve.join(' ')} ${xm(MONTHS)},${CURVE_BOTTOM}`} fill="url(#supply)" />
      <polyline points={curve.join(' ')} fill="none" stroke="#4ade80" strokeWidth="2" />
      <line x1={M0} y1={CURVE_BOTTOM} x2={M1} y2={CURVE_BOTTOM} stroke="#4b5563" strokeWidth="1.2" />
      <text x={M0 + 6} y={CURVE_TOP - 6} fontSize="10" className="fill-gray-400" fontWeight="600">
        Suministro combinado
      </text>

      {/* Playhead */}
      <line y1="44" y2={CURVE_BOTTOM} stroke="#86efac" strokeWidth="1.5" opacity="0.7">
        <animate attributeName="x1" values={`${xm(0)};${xm(MONTHS)}`} dur="12s" repeatCount="indefinite" />
        <animate attributeName="x2" values={`${xm(0)};${xm(MONTHS)}`} dur="12s" repeatCount="indefinite" />
      </line>

      {/* Month axis */}
      {[0, 6, 12, 18, 24, 30].map((m) => (
        <text key={m} x={xm(m)} y={CURVE_BOTTOM + 16} textAnchor="middle" fontSize="9" className="fill-gray-500">
          mes {m}
        </text>
      ))}

      {/* Legend */}
      <g transform="translate(78, 302)">
        {[
          { c: '#374151', l: 'establecimiento' },
          { c: '#22c55e', l: 'produccion' },
          { c: '#d97706', l: 'declive' },
          { c: '#16a34a', l: 'clon de estolon' },
        ].map((item, i) => (
          <g key={item.l} transform={`translate(${i * 130}, 0)`}>
            <rect width="10" height="10" rx="2" fill={item.c} />
            <text x="15" y="8.5" fontSize="9" className="fill-gray-500">
              {item.l}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
