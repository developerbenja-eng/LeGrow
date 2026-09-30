'use client';

import { useMemo, useState } from 'react';
import { CASINGS, FS, JOINT_SPACINGS, planeWaveLimitHz, soundSpeed } from '@/lib/pozo';

const X0 = 44;
const X1 = 700;
const Y = 120;

function wavePath(peaks: { x: number; a: number }[]) {
  let d = '';
  for (let x = X0; x <= X1; x += 0.6) {
    let y = 0;
    for (const p of peaks) {
      const u = (x - p.x) / 4.5;
      if (u > -3.5 && u < 3.5) y += p.a * Math.exp(-u * u) * Math.sin((2 * Math.PI * (x - p.x)) / 5);
    }
    d += `${d ? ' L' : 'M'}${x.toFixed(1)} ${(Y - y * 70).toFixed(1)}`;
  }
  return d;
}

function Seg<T extends string>({ options, value, onChange, label }: { options: readonly { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-gray-800 bg-gray-950 p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={o.id === value}
          onClick={() => onChange(o.id)}
          className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
            o.id === value ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function EchoSimulator() {
  const [depth, setDepth] = useState(24);
  const [temp, setTemp] = useState(12);
  const [assumed, setAssumed] = useState(20);
  const [casingId, setCasingId] = useState<'2' | '4'>('2');
  const [jointId, setJointId] = useState<'10' | '20'>('20');

  const casing = CASINGS.find((c) => c.id === casingId)!;
  const L = JOINT_SPACINGS.find((j) => j.id === jointId)!.m;

  const sim = useMemo(() => {
    const c = soundSpeed(temp);
    const t = (2 * depth) / c;
    const err = depth * (soundSpeed(assumed) / c - 1);
    const firstJoint = Math.min(L, 4.2);
    const joints: { k: number; z: number; t: number }[] = [];
    for (let k = 0; firstJoint + k * L < depth - 0.3; k++) {
      const z = firstJoint + k * L;
      joints.push({ k: k + 1, z, t: (2 * z) / c });
    }
    const tmax = t * 1.1;
    const X = (tt: number) => X0 + (tt / tmax) * (X1 - X0);
    const peaks = [{ x: X(0) + 6, a: 1 }, ...joints.map((j) => ({ x: X(j.t), a: 0.3 * Math.exp(-0.05 * j.k) })), { x: X(t), a: Math.max(0.5, 0.9 * Math.exp(-depth / 250)) }];
    const ms = tmax * 1000;
    const step = [1, 2, 5, 10, 20, 50, 100, 200].find((s) => ms / s <= 8) ?? 200;
    const ticks: number[] = [];
    for (let m = 0; m <= ms; m += step) ticks.push(m);
    return { c, t, err, joints, X, path: wavePath(peaks), ticks, fmax: planeWaveLimitHz(casing.idMm, temp) };
  }, [depth, temp, assumed, L, casing.idMm]);

  const labelEvery = sim.joints.length > 10 ? Math.ceil(sim.joints.length / 10) : 1;
  const errCm = sim.err * 100;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="flex justify-between text-xs font-mono uppercase tracking-wide text-gray-500">
            Profundidad al agua <b className="text-gray-200 normal-case tabular-nums">{depth.toFixed(1)} m</b>
          </span>
          <input type="range" min={2} max={80} step={0.5} value={depth} onChange={(e) => setDepth(+e.target.value)} className="w-full accent-sky-500 mt-2" />
        </label>
        <label className="block">
          <span className="flex justify-between text-xs font-mono uppercase tracking-wide text-gray-500">
            Aire real en el casing <b className="text-gray-200 normal-case tabular-nums">{temp} °C</b>
          </span>
          <input type="range" min={-10} max={40} step={1} value={temp} onChange={(e) => setTemp(+e.target.value)} className="w-full accent-sky-500 mt-2" />
        </label>
        <label className="block">
          <span className="flex justify-between text-xs font-mono uppercase tracking-wide text-gray-500">
            Lo que supone el firmware <b className="text-gray-200 normal-case tabular-nums">{assumed} °C</b>
          </span>
          <input type="range" min={-10} max={40} step={1} value={assumed} onChange={(e) => setAssumed(+e.target.value)} className="w-full accent-orange-500 mt-2" />
        </label>
        <div>
          <p className="text-xs font-mono uppercase tracking-wide text-gray-500 mb-2">Casing</p>
          <Seg label="Casing" value={casingId} onChange={setCasingId} options={CASINGS.map((c) => ({ id: c.id, label: c.label }))} />
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-wide text-gray-500 mb-2">Largo de tramo</p>
          <Seg label="Largo de tramo" value={jointId} onChange={setJointId} options={JOINT_SPACINGS.map((j) => ({ id: j.id, label: j.label }))} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox="0 0 720 232" className="w-full h-auto min-w-[600px]" role="img">
          <title>Traza simulada: pulso directo, ecos de los coples y eco del agua</title>
          <line x1={X0} y1={Y} x2={X1} y2={Y} stroke="#1f2937" />
          <line x1={X0} y1="200" x2={X1} y2="200" stroke="#374151" />
          {sim.ticks.map((m) => (
            <g key={m}>
              <line x1={sim.X(m / 1000)} y1="200" x2={sim.X(m / 1000)} y2="205" stroke="#6b7280" />
              <text x={sim.X(m / 1000)} y="219" textAnchor="middle" fontSize="10" className="fill-gray-500">
                {m}
                {m === 0 ? ' ms' : ''}
              </text>
            </g>
          ))}
          {sim.joints.map((j, i) => (
            <g key={j.k}>
              <line x1={sim.X(j.t)} y1="30" x2={sim.X(j.t)} y2="180" stroke="#4b5563" strokeDasharray="3 4" />
              {i % labelEvery === 0 && (
                <text x={sim.X(j.t)} y="24" textAnchor="middle" fontSize="10" className="fill-gray-500">
                  C{j.k}
                </text>
              )}
            </g>
          ))}
          <line x1={sim.X(sim.t)} y1="30" x2={sim.X(sim.t)} y2="180" stroke="#38bdf8" strokeWidth="1.5" />
          <path d={sim.path} fill="none" stroke="#e5e7eb" strokeWidth="1.3" />
          <text x={X0} y="194" fontSize="10" className="fill-gray-500">directo</text>
          <text x={sim.X(sim.t) - 6} y="194" textAnchor="end" fontSize="10" fontWeight="700" fill="#38bdf8">
            agua {(sim.t * 1000).toFixed(1)} ms
          </text>
        </svg>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <Read label="velocidad del sonido real" value={`${sim.c.toFixed(1)} m/s`} />
        <Read label="ida y vuelta al agua" value={`${(sim.t * 1000).toFixed(2)} ms`} sub={`${Math.round(sim.t * FS).toLocaleString('es-CL')} muestras a 48 kHz`} />
        <Read
          label={`error si el firmware supone ${assumed} °C`}
          value={`${errCm >= 0 ? '+' : '−'}${Math.abs(errCm).toFixed(1)} cm`}
          tone={Math.abs(errCm) > 3 ? 'text-red-400' : 'text-green-400'}
        />
        <Read
          label="coples arriba del agua"
          value={String(sim.joints.length)}
          sub={sim.joints.length >= 2 ? 'suficientes para calibrar c' : 'hacen falta 2 para calibrar c'}
          tone={sim.joints.length >= 2 ? 'text-green-400' : 'text-amber-400'}
        />
        <Read label={`limite de onda plana, ${casing.label}`} value={`${(sim.fmax / 1000).toFixed(2)} kHz`} sub={`chirp hasta ${(casing.chirpTopHz / 1000).toFixed(1)} kHz`} />
        <Read label="paso de profundidad por muestra" value={`${(((sim.c / FS) / 2) * 1000).toFixed(2)} mm`} sub="antes de interpolar el pico" />
      </div>
    </div>
  );
}

function Read({ label, value, sub, tone = 'text-gray-100' }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2">
      <p className={`text-lg font-mono font-semibold tabular-nums ${tone}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="text-[11px] text-gray-600">{sub}</p>}
    </div>
  );
}
