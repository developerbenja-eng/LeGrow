/**
 * What was claimed against what was measured, in the one unit a continuous
 * crop survives: grams per plant per week.
 *
 * Two hues, not five: the data's job is a claimed/evidence split, not five
 * independent identities. #d97706 and #3b82f6 pass all six checks of the
 * palette validator against the dark card surface — lightness band, chroma
 * floor, CVD separation (dE 30.2 protan), normal-vision floor and contrast.
 * The green first tried against amber failed CVD at dE 5.7.
 */

import { ESTIMATES, perYearLb, type YieldEstimate } from '@/lib/yield';

const CLAIMED = '#d97706';
const EVIDENCE = '#3b82f6';

const PLOT = { x0: 206, x1: 596, y0: 46, barH: 24, pitch: 34, max: 40 };
const bx = (v: number) => PLOT.x0 + (v / PLOT.max) * (PLOT.x1 - PLOT.x0);

export default function YieldGap() {
  const rows: YieldEstimate[] = [...ESTIMATES].sort((a, b) => b.gPerPlantWeek - a.gPerPlantWeek);
  const height = PLOT.y0 + rows.length * PLOT.pitch + 54;

  return (
    <svg viewBox={`0 0 640 ${height}`} className="w-full h-auto" role="img">
      <title>Rendimiento afirmado contra medido, en gramos por planta por semana</title>

      {/* Legend — always present at two series */}
      <g fontSize="11">
        {[
          { c: CLAIMED, t: 'Afirmado, sin fuente' },
          { c: EVIDENCE, t: 'Medido o practica comercial' },
        ].map((l, i) => (
          <g key={l.t} transform={`translate(${206 + i * 176}, 16)`}>
            <rect width="11" height="11" rx="2.5" fill={l.c} />
            <text x="17" y="9.5" className="fill-gray-400">
              {l.t}
            </text>
          </g>
        ))}
      </g>

      {/* Recessive grid */}
      {[0, 10, 20, 30, 40].map((v) => (
        <line
          key={v}
          x1={bx(v)}
          y1={PLOT.y0 - 6}
          x2={bx(v)}
          y2={PLOT.y0 + rows.length * PLOT.pitch}
          stroke="#374151"
          strokeWidth="1"
        />
      ))}

      {rows.map((e, i) => {
        const y = PLOT.y0 + i * PLOT.pitch;
        const claimed = e.provenance === 'claimed';
        const w = bx(e.gPerPlantWeek) - PLOT.x0;
        return (
          <g key={e.id}>
            <text x={196} y={y + PLOT.barH / 2 + 4} textAnchor="end" fontSize="11.5" className="fill-gray-300">
              {e.label}
            </text>
            {/* 4px rounded data-end, square against the baseline */}
            <path
              d={`M ${PLOT.x0} ${y} H ${PLOT.x0 + w - 4} a4 4 0 0 1 4 4 V ${y + PLOT.barH - 4} a4 4 0 0 1 -4 4 H ${PLOT.x0} Z`}
              fill={claimed ? CLAIMED : EVIDENCE}
            />
            <text
              x={PLOT.x0 + w + 9}
              y={y + PLOT.barH / 2 + 4}
              fontSize="11.5"
              className="fill-gray-200"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {e.gPerPlantWeek.toFixed(1)}
            </text>
            <text x={PLOT.x0 + w + 52} y={y + PLOT.barH / 2 + 4} fontSize="10.5" className="fill-gray-500">
              {perYearLb(e).toFixed(1)} lb/ano
            </text>
          </g>
        );
      })}

      {/* Axis */}
      <line
        x1={PLOT.x0}
        y1={PLOT.y0 + rows.length * PLOT.pitch}
        x2={PLOT.x1}
        y2={PLOT.y0 + rows.length * PLOT.pitch}
        stroke="#4b5563"
        strokeWidth="1.2"
      />
      {[0, 10, 20, 30, 40].map((v) => (
        <text
          key={v}
          x={bx(v)}
          y={PLOT.y0 + rows.length * PLOT.pitch + 16}
          textAnchor="middle"
          fontSize="10"
          className="fill-gray-500"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {v}
        </text>
      ))}
      <text
        x={(PLOT.x0 + PLOT.x1) / 2}
        y={PLOT.y0 + rows.length * PLOT.pitch + 36}
        textAnchor="middle"
        fontSize="10.5"
        className="fill-gray-400"
      >
        gramos por planta por semana
      </text>
    </svg>
  );
}
