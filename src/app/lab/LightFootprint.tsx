'use client';

import { useMemo, useState } from 'react';
import {
  CAPTURE_EFFICIENCY,
  EFFICACY,
  TARGETS,
  TENTS,
  areaM2,
  ppf,
  rigSummary,
  type Tent,
  type Verdict,
} from '@/lib/photometry';

const PX_PER_FT = 58;
const PLANTED: number = 3;

const VERDICT_TEXT: Record<Verdict, string> = {
  ok: 'text-green-400',
  near: 'text-amber-400',
  off: 'text-red-400',
};

const VERDICT_RING: Record<Verdict, string> = {
  ok: 'border-green-600/50',
  near: 'border-amber-600/50',
  off: 'border-red-600/50',
};

/** Deterministic pseudo-random so SSR and client render identically. */
function prand(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function Readout({
  label,
  value,
  unit,
  sub,
  tone = 'ok',
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  tone?: Verdict;
}) {
  return (
    <div className={`bg-gray-900 border ${VERDICT_RING[tone]} rounded-xl p-4`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${VERDICT_TEXT[tone]}`}>
        {value}
        {unit && <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function LightFootprint() {
  const [tentId, setTentId] = useState('2x2');
  const [watts, setWatts] = useState(70);
  const [hours, setHours] = useState(17);

  const tent = useMemo<Tent>(() => TENTS.find((t) => t.id === tentId) ?? TENTS[1], [tentId]);
  const s = useMemo(() => rigSummary(tent, watts, hours), [tent, watts, hours]);

  // The fixture is a fixed physical object; only the tent changes size around it.
  const spanFt = Math.max(tent.widthFt, tent.depthFt);
  const tentPx = spanFt * PX_PER_FT;
  const cx = 190;
  const left = cx - tentPx / 2;
  const right = cx + tentPx / 2;
  const barHalf = Math.min(tentPx * 0.4, 46);
  const barY = 62;
  const floorY = 212;

  // Brightness of the cone tracks how close the canopy gets to target PPFD.
  const intensity = Math.min(1, s.ppfdHigh / TARGETS.ppfd[1]);

  const photons = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const startOffset = (prand(i) * 2 - 1) * barHalf;
        const endOffset = (prand(i + 90) * 2 - 1) * (tentPx / 2 - 6);
        return {
          x1: cx + startOffset,
          x2: cx + endOffset,
          dur: 1.9 + prand(i + 40) * 1.5,
          delay: prand(i + 170) * 2.6,
        };
      }),
    [barHalf, tentPx],
  );

  const cols = Math.max(1, Math.round(tent.widthFt));
  const rows = Math.max(1, Math.round(tent.depthFt));
  const topSpan = 150;
  const cell = topSpan / Math.max(cols, rows);
  const topW = cell * cols;
  const topH = cell * rows;
  const topX = 100 - topW / 2;
  const topY = 100 - topH / 2;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Carpa</p>
          <div className="flex flex-wrap gap-2">
            {TENTS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTentId(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  t.id === tentId
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">{tent.note}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              Potencia · <span className="text-green-400 font-mono">{watts} W</span>
            </span>
            <input
              type="range"
              min={30}
              max={160}
              step={5}
              value={watts}
              onChange={(e) => setWatts(Number(e.target.value))}
              className="w-full mt-2 accent-green-500"
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              Fotoperiodo · <span className="text-green-400 font-mono">{hours} h</span>
            </span>
            <input
              type="range"
              min={10}
              max={20}
              step={1}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full mt-2 accent-green-500"
            />
          </label>
        </div>
      </div>

      {/* Diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Corte lateral — el panel no cambia de tamano, la carpa si
          </p>
          <svg viewBox="0 0 380 240" className="w-full h-auto" role="img">
            <title>Distribucion de luz en corte lateral</title>
            <defs>
              <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ade80" stopOpacity={0.55 * intensity + 0.1} />
                <stop offset="100%" stopColor="#4ade80" stopOpacity={0.04} />
              </linearGradient>
              <clipPath id="tentClip">
                <rect x={left} y={30} width={tentPx} height={floorY - 30} />
              </clipPath>
            </defs>

            {/* Tent shell */}
            <rect
              x={left}
              y={30}
              width={tentPx}
              height={floorY - 30}
              fill="#0b0f16"
              stroke="#374151"
              strokeWidth="1.5"
              rx="3"
            />

            <g clipPath="url(#tentClip)">
              {/* Light cone */}
              <polygon
                points={`${cx - barHalf},${barY} ${cx + barHalf},${barY} ${right - 2},${floorY} ${left + 2},${floorY}`}
                fill="url(#cone)"
              />
              {/* Falling photons */}
              {photons.map((p, i) => (
                <circle key={i} r="1.7" fill="#86efac" opacity="0">
                  <animate
                    attributeName="cy"
                    values={`${barY};${floorY}`}
                    dur={`${p.dur}s`}
                    begin={`${p.delay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cx"
                    values={`${p.x1};${p.x2}`}
                    dur={`${p.dur}s`}
                    begin={`${p.delay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.95;0.7;0"
                    dur={`${p.dur}s`}
                    begin={`${p.delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </g>

            {/* LED bar */}
            <rect x={cx - barHalf} y={barY - 9} width={barHalf * 2} height="9" rx="2.5" fill="#1f2937" stroke="#4b5563" />
            {Array.from({ length: 7 }, (_, i) => (
              <circle
                key={i}
                cx={cx - barHalf + 6 + (i * (barHalf * 2 - 12)) / 6}
                cy={barY - 4.5}
                r="1.8"
                fill="#bbf7d0"
              >
                <animate
                  attributeName="opacity"
                  values="0.55;1;0.55"
                  dur="2.6s"
                  begin={`${i * 0.15}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
            <text x={cx} y={barY - 16} textAnchor="middle" className="fill-gray-500" fontSize="9">
              {watts}W
            </text>

            {/* Buckets on the floor */}
            {Array.from({ length: Math.min(tent.buckets, cols) }, (_, i) => {
              const n = Math.min(tent.buckets, cols);
              const bw = Math.min(26, (tentPx - 12) / n - 5);
              const step = (tentPx - 12) / n;
              const bx = left + 6 + step * i + step / 2;
              const planted = i < PLANTED;
              return (
                <g key={i}>
                  <path
                    d={`M ${bx - bw / 2} ${floorY - 24} L ${bx + bw / 2} ${floorY - 24} L ${bx + bw / 2 - 2.5} ${floorY} L ${bx - bw / 2 + 2.5} ${floorY} Z`}
                    fill={planted ? '#1f2937' : '#111827'}
                    stroke={planted ? '#4b5563' : '#374151'}
                  />
                  {planted && (
                    <g stroke="#4ade80" strokeWidth="1.4" fill="none" strokeLinecap="round">
                      <path d={`M ${bx} ${floorY - 24} V ${floorY - 34}`} />
                      <path d={`M ${bx} ${floorY - 31} q -7 -5 -10 -1`} />
                      <path d={`M ${bx} ${floorY - 33} q 7 -5 10 -1`} />
                    </g>
                  )}
                </g>
              );
            })}

            <line x1={left} y1={floorY} x2={right} y2={floorY} stroke="#4b5563" strokeWidth="1.5" />
            <text x={cx} y={floorY + 15} textAnchor="middle" className="fill-gray-500" fontSize="9">
              {spanFt.toFixed(2).replace(/\.?0+$/, '')} ft · {s.area.toFixed(3)} m²
            </text>
          </svg>
        </div>

        {/* Top-down footprint */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Planta — huella</p>
          <svg viewBox="0 0 200 200" className="w-full h-auto" role="img">
            <title>Huella de la carpa vista desde arriba</title>
            <defs>
              <radialGradient id="pool">
                <stop offset="0%" stopColor="#4ade80" stopOpacity={0.4 * intensity + 0.08} />
                <stop offset="70%" stopColor="#4ade80" stopOpacity={0.12 * intensity} />
                <stop offset="100%" stopColor="#4ade80" stopOpacity="0.02" />
              </radialGradient>
            </defs>
            <rect x={topX} y={topY} width={topW} height={topH} fill="#0b0f16" stroke="#374151" strokeWidth="1.5" rx="3" />
            <rect x={topX} y={topY} width={topW} height={topH} fill="url(#pool)" rx="3" />
            {Array.from({ length: cols * rows }, (_, i) => {
              const c = i % cols;
              const r = Math.floor(i / cols);
              const bx = topX + cell * c + cell / 2;
              const by = topY + cell * r + cell / 2;
              const planted = i < PLANTED;
              return (
                <g key={i}>
                  <circle
                    cx={bx}
                    cy={by}
                    r={Math.min(cell * 0.33, 20)}
                    fill={planted ? '#14532d' : '#111827'}
                    stroke={planted ? '#4ade80' : '#374151'}
                    strokeWidth="1.2"
                  />
                  {planted && (
                    <circle cx={bx} cy={by} r={Math.min(cell * 0.33, 20)} fill="none" stroke="#4ade80" strokeWidth="1">
                      <animate attributeName="opacity" values="0.7;0.15;0.7" dur="3s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
            <text x="100" y="188" textAnchor="middle" className="fill-gray-500" fontSize="9">
              {tent.buckets} balde{tent.buckets === 1 ? '' : 's'} · {PLANTED} plantado{PLANTED === 1 ? '' : 's'}
            </text>
          </svg>
        </div>
      </div>

      {/* Readouts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Readout
          label="PPFD en canopia"
          value={`${Math.round(s.ppfdLow)}–${Math.round(s.ppfdHigh)}`}
          unit="µmol/m²/s"
          sub={`objetivo ${TARGETS.ppfd[0]}–${TARGETS.ppfd[1]}`}
          tone={s.ppfdVerdict}
        />
        <Readout
          label="DLI diario"
          value={`${s.dliLow.toFixed(1)}–${s.dliHigh.toFixed(1)}`}
          unit="mol/m²/d"
          sub={`objetivo ${TARGETS.dli[0]}–${TARGETS.dli[1]}`}
          tone={s.dliVerdict}
        />
        <Readout
          label="Costo mensual"
          value={`$${s.cost.toFixed(2)}`}
          sub={`${s.kwh.toFixed(1)} kWh · MLGW`}
        />
        <Readout
          label="Calor a disipar"
          value={`${Math.round(s.heat)}`}
          unit="W"
          sub={s.heat < 60 ? 'ventilador clip basta' : 'requiere extractor'}
          tone={s.heat < 60 ? 'ok' : 'near'}
        />
      </div>

      {/* Calculation chain */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">
          Cadena de calculo — eficacia optimista ({EFFICACY.high} µmol/J)
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-3 font-mono text-sm">
          {[
            { v: `${watts} W`, l: 'consumo' },
            { v: `× ${EFFICACY.high}`, l: 'µmol/J' },
            { v: `${ppf(watts, EFFICACY.high).toFixed(0)} µmol/s`, l: 'PPF emitido' },
            { v: `× ${CAPTURE_EFFICIENCY}`, l: 'captura' },
            { v: `÷ ${areaM2(tent).toFixed(3)}`, l: 'm² huella' },
            { v: `${Math.round(s.ppfdHigh)} PPFD`, l: 'en canopia', hi: true },
            { v: `× ${hours} h`, l: 'fotoperiodo' },
            { v: `${s.dliHigh.toFixed(1)} DLI`, l: 'mol/m²/dia', hi: true },
          ].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-3">
              <div>
                <p className={step.hi ? 'text-green-400 font-semibold' : 'text-gray-300'}>{step.v}</p>
                <p className="text-[10px] text-gray-600 font-sans">{step.l}</p>
              </div>
              {i < arr.length - 1 && <span className="text-gray-700">→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
