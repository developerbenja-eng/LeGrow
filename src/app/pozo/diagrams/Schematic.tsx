'use client';

/**
 * Esquema completo: cada modulo con sus pines de alimentacion a la izquierda
 * (a los rieles) y sus senales a la derecha (a los carriles de bus y al
 * header J1). Todo sale de MODULES y NETS en src/lib/pozo.ts.
 */

import { useState } from 'react';
import { BUS, J1, MODULES, NETS, RAIL, type Rail } from '@/lib/pozo';
import ModuleCloseup from './ModuleCloseup';

const RAIL_X: Record<Rail, number> = { BAT: 22, '5V': 38, '3V3': 54, GND: 70 };
const MX0 = 96;
const MX1 = 322;
const HEAD = 42;
const ROW = 18;
const LANE0 = 352;
const LANE_STEP = 22;
const BX = 690;
const BW = 176;
const pinY = (i: number) => 92 + i * 28;
const rowY = (top: number, i: number) => top + HEAD + 4 + i * ROW;

const LAYOUT = (() => {
  let top = 40;
  return MODULES.map((m) => {
    const rows = Math.max(m.power.length, m.signals.length, 1);
    const h = HEAD + rows * ROW + 6;
    const box = { m, top, h };
    top += h + 14;
    return box;
  });
})();

const LAST = LAYOUT[LAYOUT.length - 1];
const BOTTOM = LAST.top + LAST.h;
const Y5V = BOTTOM + 24;
const YGND = BOTTOM + 40;
const HEIGHT = BOTTOM + 64;

const LANES = NETS.map((n, i) => ({ ...n, x: LANE0 + i * LANE_STEP, by: pinY(J1.indexOf(String(n.gpio) as (typeof J1)[number])) }));

type Conn = { mod: string; y: number };
const NET_CONN: Record<string, Conn[]> = {};
const RAIL_CONN: Record<Rail, Conn[]> = { BAT: [], '5V': [], '3V3': [], GND: [] };
for (const { m, top } of LAYOUT) {
  m.signals.forEach((s, i) => (NET_CONN[s.net] ??= []).push({ mod: m.id, y: rowY(top, i) }));
  m.power.forEach((p, i) => RAIL_CONN[p.rail].push({ mod: m.id, y: rowY(top, i) }));
}

function railPath(r: Rail) {
  const ys = RAIL_CONN[r].map((c) => c.y);
  const x = RAIL_X[r];
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  if (r === '3V3') return `M${x} ${hi} V24 H672 V${pinY(0)} H${BX}`;
  if (r === '5V') return `M${x} ${lo} V${Y5V} H656 V${pinY(20)} H${BX}`;
  if (r === 'GND') return `M${x} ${lo} V${YGND} H664 V${pinY(21)} H${BX}`;
  return `M${x} ${lo} V${hi}`;
}

export default function Schematic() {
  const [sel, setSel] = useState<string>('amp');
  const all = sel === 'all';
  const selMod = MODULES.find((m) => m.id === sel);

  const netOn = (net: string) => all || (NET_CONN[net] ?? []).some((c) => c.mod === sel);
  const railOn = (r: Rail) => all || RAIL_CONN[r].some((c) => c.mod === sel);
  const dim = (on: boolean) => (on ? 1 : 0.12);

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Mostrar el cableado de" className="flex flex-wrap gap-2">
        {[{ id: 'all', name: 'Todo' }, ...MODULES].map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={sel === m.id}
            onClick={() => setSel(m.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-colors ${
              sel === m.id ? 'bg-sky-600 border-sky-600 text-white' : 'border-gray-800 bg-gray-900 text-gray-400 hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 pt-4 text-xs font-mono text-gray-400">
          {Object.entries(RAIL).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className="inline-block w-4 h-1 rounded" style={{ background: v.color }} />
              {k}
            </span>
          ))}
          <span className="w-px bg-gray-800" />
          {Object.entries(BUS).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className="inline-block w-4 h-0.5 rounded" style={{ background: v.color }} />
              {v.label}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto p-3">
          <svg viewBox={`0 0 880 ${HEIGHT}`} className="w-full h-auto min-w-[760px]" role="img">
            <title>Esquema completo de la tapa de eco: rieles de alimentacion a la izquierda, modulos al centro, buses y header J1 de la ESP32-S3 a la derecha</title>

            {/* Rieles */}
            {(Object.keys(RAIL_X) as Rail[]).map((r) => (
              <path
                key={r}
                d={railPath(r)}
                fill="none"
                stroke={RAIL[r].color}
                strokeWidth="3"
                strokeLinejoin="round"
                opacity={dim(railOn(r))}
                className={!all && railOn(r) ? 'pozo-flow' : undefined}
              />
            ))}
            {(Object.keys(RAIL_X) as Rail[]).map((r) => (
              <text
                key={r}
                x={RAIL_X[r] + 3}
                y={HEIGHT - 4}
                transform={`rotate(-90 ${RAIL_X[r] + 3} ${HEIGHT - 4})`}
                fontSize="9"
                fontWeight="700"
                fill={RAIL[r].color}
              >
                {r}
              </text>
            ))}

            {/* Stubs de alimentacion */}
            {LAYOUT.map(({ m, top }) =>
              m.power.map((p, i) => {
                const y = rowY(top, i);
                const on = all || m.id === sel;
                return (
                  <g key={`${m.id}-p${i}`} opacity={dim(on)}>
                    <line x1={RAIL_X[p.rail]} y1={y} x2={MX0} y2={y} stroke={RAIL[p.rail].color} strokeWidth="1.6" />
                    <circle cx={RAIL_X[p.rail]} cy={y} r="3.2" fill={RAIL[p.rail].color} />
                  </g>
                );
              }),
            )}

            {/* Carriles de senal */}
            {LANES.map((n) => {
              const conns = NET_CONN[n.name] ?? [];
              const ys = conns.map((c) => c.y).concat(n.by);
              const d =
                conns.map((c) => `M${MX1} ${c.y} H${n.x}`).join(' ') +
                ` M${n.x} ${Math.min(...ys)} V${Math.max(...ys)} M${n.x} ${n.by} H${BX}`;
              const on = netOn(n.name);
              return (
                <g key={n.name} opacity={dim(on)}>
                  <path d={d} fill="none" stroke={BUS[n.bus].color} strokeWidth="2" strokeLinejoin="round" className={!all && on ? 'pozo-flow' : undefined} />
                  {conns.length > 1 && conns.map((c) => <circle key={c.y} cx={n.x} cy={c.y} r="3.2" fill={BUS[n.bus].color} />)}
                  <text x={n.x + 3} y={n.by - 4} fontSize="9" className="fill-gray-400">
                    {n.name}
                  </text>
                </g>
              );
            })}

            {/* Modulos */}
            {LAYOUT.map(({ m, top, h }) => {
              const on = all || m.id === sel;
              return (
                <g
                  key={m.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver cableado de ${m.name}`}
                  onClick={() => setSel(m.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSel(m.id);
                    }
                  }}
                  className="cursor-pointer focus:outline-none"
                  opacity={on ? 1 : 0.45}
                >
                  <rect x={MX0} y={top} width={MX1 - MX0} height={h} rx="7" fill="#0b1220" stroke={m.id === sel ? '#38bdf8' : '#374151'} strokeWidth={m.id === sel ? 1.8 : 1.1} />
                  <text x={MX0 + 10} y={top + 18} fontSize="12.5" fontWeight="600" className="fill-gray-200">
                    {m.name}
                  </text>
                  <text x={MX0 + 10} y={top + 33} fontSize="10" className="fill-gray-500">
                    {m.sub}
                  </text>
                  {m.power.map((p, i) => (
                    <text key={`p${i}`} x={MX0 + 8} y={rowY(top, i) + 3.5} fontSize="10.5" className="fill-gray-300">
                      {p.pin}
                      <tspan fill={RAIL[p.rail].color} fontSize="9.5">{` ${p.rail}`}</tspan>
                    </text>
                  ))}
                  {m.signals.map((s, i) => (
                    <g key={`s${i}`}>
                      <text x={MX1 - 8} y={rowY(top, i) + 3.5} textAnchor="end" fontSize="10.5" className="fill-gray-300">
                        {s.pin}
                      </text>
                      <circle cx={MX1} cy={rowY(top, i)} r="2.6" fill="#9ca3af" />
                    </g>
                  ))}
                  {m.power.map((_, i) => (
                    <circle key={`pd${i}`} cx={MX0} cy={rowY(top, i)} r="2.6" fill="#9ca3af" />
                  ))}
                </g>
              );
            })}

            {/* Placa */}
            <text x={BX} y={pinY(0) - 52} fontSize="12" fontWeight="600" className="fill-gray-200">
              ESP32-S3-DevKitC-1
            </text>
            <text x={BX} y={pinY(0) - 38} fontSize="10" className="fill-gray-500">
              header J1 · N16R8
            </text>
            <rect x={BX} y={pinY(0) - 28} width={BW} height={pinY(21) - pinY(0) + 56} rx="8" fill="#0b1220" stroke="#6b7280" strokeWidth="1.3" />
            {J1.map((p, i) => {
              const y = pinY(i);
              const lane = LANES.find((l) => String(l.gpio) === p);
              const isRail = p === '5V' || p === 'GND' || (p === '3V3' && i === 0);
              const label = /^\d+$/.test(p) ? `GPIO${p}` : p;
              const color = lane ? BUS[lane.bus].color : p === '5V' ? RAIL['5V'].color : p === 'GND' ? RAIL.GND.color : p === '3V3' && i === 0 ? RAIL['3V3'].color : '#4b5563';
              const note = p === '3' || p === '46' ? 'strap' : lane ? lane.name : isRail ? 'riel' : '';
              return (
                <g key={i}>
                  <circle cx={BX} cy={y} r="3.6" fill={color} />
                  <text x={BX + 12} y={y + 4} fontSize="10.5" fontWeight={lane || isRail ? 700 : 400} fill={lane || isRail ? '#e5e7eb' : '#6b7280'}>
                    {label}
                  </text>
                  {note && (
                    <text x={BX + BW - 10} y={y + 4} textAnchor="end" fontSize="9.5" fill={color}>
                      {note}
                    </text>
                  )}
                </g>
              );
            })}
            <text x={BX + BW / 2} y={pinY(21) + 22} textAnchor="middle" fontSize="9.5" className="fill-gray-500">
              USB-C ↓
            </text>
          </svg>
        </div>
        <p className="px-5 pb-4 text-sm text-gray-500">
          Un punto marca una union. Cables que se cruzan sin punto no estan conectados. Los rieles de 5 V y GND entran por la parte baja del
          header; 3V3 sale por arriba.
        </p>
      </div>

      {selMod ? (
        <ModuleCloseup m={selMod} />
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-sm text-gray-400">
          {MODULES.length} modulos, {NETS.length} cables de senal y 4 rieles. Toca un modulo para ver su detalle.
        </div>
      )}
    </div>
  );
}
