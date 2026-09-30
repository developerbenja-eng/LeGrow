/**
 * Por que el chirp tiene techo: bajo el primer modo transversal la onda baja
 * plana y el eco sale nitido; sobre el, rebota en las paredes y se ensucia.
 */

import { CASINGS, CHIRP, planeWaveLimitHz } from '@/lib/pozo';

const F_MAX = 5000;
const BX0 = 360;
const BX1 = 660;
const fx = (f: number) => BX0 + (f / F_MAX) * (BX1 - BX0);

export default function PlaneWave() {
  return (
    <svg viewBox="0 0 680 300" className="w-full h-auto" role="img">
      <title>Comparacion: onda plana bajo el limite y onda rebotando sobre el limite, con la banda del chirp para casing de 2 y 4 pulgadas</title>

      {/* Dos tubos */}
      {[
        { x: 40, label: 'bajo el limite', sub: 'frentes planos, eco nitido', ok: true },
        { x: 190, label: 'sobre el limite', sub: 'rebota y se ensucia', ok: false },
      ].map((p) => (
        <g key={p.x}>
          <rect x={p.x} y="30" width="6" height="210" fill="#4b5563" />
          <rect x={p.x + 86} y="30" width="6" height="210" fill="#4b5563" />
          {p.ok
            ? [60, 95, 130, 165, 200].map((y, i) => (
                <line key={y} x1={p.x + 10} y1={y} x2={p.x + 82} y2={y} stroke="#f97316" strokeWidth="2.5" opacity={1 - i * 0.14}>
                  <animate attributeName="opacity" values={`${1 - i * 0.14};0.25;${1 - i * 0.14}`} dur="1.6s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
                </line>
              ))
            : (
                <polyline
                  points={`${p.x + 10},44 ${p.x + 82},74 ${p.x + 10},104 ${p.x + 82},134 ${p.x + 10},164 ${p.x + 82},194 ${p.x + 10},224`}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                >
                  <animate attributeName="stroke-dashoffset" values="0;-40" dur="1.2s" repeatCount="indefinite" />
                </polyline>
              )}
          <text x={p.x + 46} y="262" textAnchor="middle" fontSize="11" fontWeight="600" fill={p.ok ? '#4ade80' : '#f87171'}>
            {p.label}
          </text>
          <text x={p.x + 46} y="278" textAnchor="middle" fontSize="10" className="fill-gray-500">
            {p.sub}
          </text>
        </g>
      ))}

      {/* Barras de frecuencia */}
      <text x={BX0} y="40" fontSize="11" className="fill-gray-400">
        f = 1.84 · c / (π · D)
      </text>
      {CASINGS.map((c, i) => {
        const y = 80 + i * 70;
        const lim = planeWaveLimitHz(c.idMm);
        return (
          <g key={c.id}>
            <text x={BX0} y={y - 8} fontSize="11" fontWeight="600" className="fill-gray-300">
              {c.label} · ID {c.idMm} mm
            </text>
            <rect x={BX0} y={y} width={BX1 - BX0} height="18" rx="3" fill="#111827" stroke="#1f2937" />
            <rect x={fx(CHIRP.f0)} y={y + 3} width={fx(c.chirpTopHz) - fx(CHIRP.f0)} height="12" rx="2" fill="#f97316" opacity="0.8" />
            <line x1={fx(lim)} y1={y - 4} x2={fx(lim)} y2={y + 24} stroke="#f87171" strokeWidth="2" />
            <text x={fx(lim) + 4} y={y + 36} fontSize="10" fill="#f87171">
              limite {(lim / 1000).toFixed(2)} kHz
            </text>
            <text x={fx(CHIRP.f0)} y={y + 36} fontSize="10" className="fill-gray-500">
              chirp {CHIRP.f0}–{c.chirpTopHz} Hz
            </text>
          </g>
        );
      })}
      {[0, 1000, 2000, 3000, 4000, 5000].map((f) => (
        <g key={f}>
          <line x1={fx(f)} y1="236" x2={fx(f)} y2="241" stroke="#6b7280" />
          <text x={fx(f)} y="254" textAnchor="middle" fontSize="10" className="fill-gray-500">
            {f / 1000} kHz
          </text>
        </g>
      ))}
      <line x1={BX0} y1="236" x2={BX1} y2="236" stroke="#374151" />
    </svg>
  );
}
