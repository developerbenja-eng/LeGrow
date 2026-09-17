/**
 * Temperature x humidity map coloured by VPD.
 *
 * Reports 07 and the firmware threshold temperature and humidity separately.
 * Report 03 separately names a 0.8-1.2 kPa VPD target. This chart shows that
 * those two specifications barely overlap: the accepted box (20-24C, 40-60% RH)
 * intersects the VPD target only in a thin sliver around 20-22C at 50-60% RH.
 */

import { TARGETS, svp, vpd } from '@/lib/photometry';

const T_MIN = 18;
const T_MAX = 26;
const RH_MIN = 30;
const RH_MAX = 75;

const PLOT = { x: 62, y: 28, w: 430, h: 232 };

const T_STEPS = 16;
const RH_STEPS = 18;

const xForTemp = (t: number) => PLOT.x + ((t - T_MIN) / (T_MAX - T_MIN)) * PLOT.w;
const yForRh = (r: number) => PLOT.y + ((RH_MAX - r) / (RH_MAX - RH_MIN)) * PLOT.h;

/** RH at which a given temperature produces a given VPD. */
const rhForVpd = (t: number, target: number) => 100 * (1 - target / svp(t));

function colorFor(v: number): { fill: string; opacity: number } {
  if (v < 0.6) return { fill: '#1e40af', opacity: 0.55 };
  if (v < 0.8) return { fill: '#2563eb', opacity: 0.4 };
  if (v <= 1.2) return { fill: '#16a34a', opacity: 0.6 };
  if (v <= 1.5) return { fill: '#d97706', opacity: 0.45 };
  if (v <= 2.0) return { fill: '#ea580c', opacity: 0.5 };
  return { fill: '#dc2626', opacity: 0.55 };
}

const CORNERS = [
  { t: 20, rh: 60, anchor: 'end' as const, dx: -8, dy: 14 },
  { t: 24, rh: 60, anchor: 'start' as const, dx: 8, dy: 14 },
  { t: 20, rh: 40, anchor: 'end' as const, dx: -8, dy: -6 },
  { t: 24, rh: 40, anchor: 'start' as const, dx: 8, dy: -6 },
];

export default function VpdMap() {
  const cellW = PLOT.w / T_STEPS;
  const cellH = PLOT.h / RH_STEPS;

  const cells = Array.from({ length: T_STEPS * RH_STEPS }, (_, i) => {
    const ti = i % T_STEPS;
    const ri = Math.floor(i / T_STEPS);
    const t = T_MIN + (ti + 0.5) * ((T_MAX - T_MIN) / T_STEPS);
    const rh = RH_MAX - (ri + 0.5) * ((RH_MAX - RH_MIN) / RH_STEPS);
    return { i, x: PLOT.x + ti * cellW, y: PLOT.y + ri * cellH, ...colorFor(vpd(t, rh)) };
  });

  // Contour of the VPD target band, clipped to the plot.
  const bandTemps = Array.from({ length: 33 }, (_, i) => T_MIN + (i * (T_MAX - T_MIN)) / 32);
  const bandTop = bandTemps.map((t) => `${xForTemp(t)},${yForRh(rhForVpd(t, TARGETS.vpd[0]))}`);
  const bandBottom = [...bandTemps]
    .reverse()
    .map((t) => `${xForTemp(t)},${yForRh(rhForVpd(t, TARGETS.vpd[1]))}`);

  const boxX = xForTemp(TARGETS.tempDayC[0]);
  const boxW = xForTemp(TARGETS.tempDayC[1]) - boxX;
  const boxY = yForRh(TARGETS.rh[1]);
  const boxH = yForRh(TARGETS.rh[0]) - boxY;

  return (
    <svg viewBox="0 0 560 320" className="w-full h-auto" role="img">
      <title>Mapa de VPD: temperatura contra humedad relativa</title>
      <defs>
        <clipPath id="plotClip">
          <rect x={PLOT.x} y={PLOT.y} width={PLOT.w} height={PLOT.h} />
        </clipPath>
      </defs>

      {/* Heat map */}
      <g clipPath="url(#plotClip)">
        {cells.map((c) => (
          <rect key={c.i} x={c.x} y={c.y} width={cellW + 0.5} height={cellH + 0.5} fill={c.fill} opacity={c.opacity} />
        ))}

        {/* VPD target band */}
        <polygon
          points={[...bandTop, ...bandBottom].join(' ')}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeDasharray="5 3"
        >
          <animate attributeName="stroke-dashoffset" values="0;-16" dur="1.6s" repeatCount="indefinite" />
        </polygon>
      </g>

      {/* The repo's accepted box */}
      <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="none" stroke="#f87171" strokeWidth="2" />
      <text x={boxX + boxW / 2} y={boxY - 7} textAnchor="middle" fontSize="9" className="fill-red-400" fontWeight="600">
        caja &quot;aceptable&quot; del informe 07
      </text>

      {/* Corner probes */}
      {CORNERS.map((c) => {
        const v = vpd(c.t, c.rh);
        const ok = v >= TARGETS.vpd[0] && v <= TARGETS.vpd[1];
        return (
          <g key={`${c.t}-${c.rh}`}>
            <circle cx={xForTemp(c.t)} cy={yForRh(c.rh)} r="5" fill={ok ? '#4ade80' : '#f87171'} stroke="#030712" strokeWidth="1.5" />
            {!ok && (
              <circle cx={xForTemp(c.t)} cy={yForRh(c.rh)} r="5" fill="none" stroke="#f87171" strokeWidth="1.5">
                <animate attributeName="r" values="5;13;5" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0;0.9" dur="2.2s" repeatCount="indefinite" />
              </circle>
            )}
            <text
              x={xForTemp(c.t) + c.dx}
              y={yForRh(c.rh) + c.dy}
              textAnchor={c.anchor}
              fontSize="10"
              fontWeight="700"
              className={ok ? 'fill-green-400' : 'fill-red-400'}
            >
              {v.toFixed(2)} kPa
            </text>
          </g>
        );
      })}

      {/* Axes */}
      <rect x={PLOT.x} y={PLOT.y} width={PLOT.w} height={PLOT.h} fill="none" stroke="#4b5563" strokeWidth="1.2" />
      {[18, 20, 22, 24, 26].map((t) => (
        <g key={t}>
          <line x1={xForTemp(t)} y1={PLOT.y + PLOT.h} x2={xForTemp(t)} y2={PLOT.y + PLOT.h + 4} stroke="#6b7280" />
          <text x={xForTemp(t)} y={PLOT.y + PLOT.h + 16} textAnchor="middle" fontSize="9" className="fill-gray-500">
            {t}°C
          </text>
        </g>
      ))}
      {[30, 40, 50, 60, 70].map((r) => (
        <g key={r}>
          <line x1={PLOT.x - 4} y1={yForRh(r)} x2={PLOT.x} y2={yForRh(r)} stroke="#6b7280" />
          <text x={PLOT.x - 8} y={yForRh(r) + 3} textAnchor="end" fontSize="9" className="fill-gray-500">
            {r}%
          </text>
        </g>
      ))}
      <text x={PLOT.x + PLOT.w / 2} y={PLOT.y + PLOT.h + 32} textAnchor="middle" fontSize="10" className="fill-gray-400">
        Temperatura del aire
      </text>
      <text
        x={16}
        y={PLOT.y + PLOT.h / 2}
        textAnchor="middle"
        fontSize="10"
        className="fill-gray-400"
        transform={`rotate(-90 16 ${PLOT.y + PLOT.h / 2})`}
      >
        Humedad relativa
      </text>

      {/* Legend */}
      <g transform={`translate(${PLOT.x}, 296)`}>
        {[
          { c: '#2563eb', l: '< 0.8 muy humedo' },
          { c: '#16a34a', l: '0.8–1.2 objetivo' },
          { c: '#d97706', l: '1.2–1.5' },
          { c: '#dc2626', l: '> 2.0 estres' },
        ].map((item, i) => (
          <g key={item.l} transform={`translate(${i * 112}, 0)`}>
            <rect width="11" height="11" rx="2" fill={item.c} opacity="0.7" />
            <text x="16" y="9.5" fontSize="9" className="fill-gray-500">
              {item.l}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
