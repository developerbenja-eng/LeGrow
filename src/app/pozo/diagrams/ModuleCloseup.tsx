/**
 * Primer plano de un modulo: cada pin, a donde va y por que. Mismos datos que
 * el esquema completo, dibujados uno por fila para cablear mirando la pantalla.
 */

import Image from 'next/image';
import { BUS, RAIL, netByName, type WModule } from '@/lib/pozo';

const ROW = 38;
const TOP = 56;

type Row = { pin: string; dest: string; color: string; note?: string; kind: 'rail' | 'net' | 'extra' };

export default function ModuleCloseup({ m }: { m: WModule }) {
  const rows: Row[] = [
    ...m.power.map((p) => ({ pin: p.pin, dest: `riel ${p.rail}`, color: RAIL[p.rail].color, note: p.note, kind: 'rail' as const })),
    ...m.signals.map((s) => {
      const n = netByName(s.net);
      return { pin: s.pin, dest: `GPIO ${n.gpio} · ${n.name}`, color: BUS[n.bus].color, note: s.note ?? n.what, kind: 'net' as const };
    }),
    ...(m.extra ?? []).map((x) => ({ pin: x.pin, dest: x.to, color: '#6b7280', note: x.note, kind: 'extra' as const })),
  ];
  const h = TOP + rows.length * ROW + 10;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-start gap-4 px-5 pt-4">
        {m.part && (
          <div className="relative w-20 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-950 border border-gray-800">
            <Image src={`/inventory/${m.part}.jpg`} alt={m.name} fill sizes="80px" className="object-contain" />
          </div>
        )}
        <div className="flex-1 min-w-[220px]">
          <h3 className="text-lg font-semibold text-gray-200">{m.name}</h3>
          <p className="text-sm text-gray-500">
            {m.sub} · {m.where}
          </p>
        </div>
        <span className={`text-[10px] font-mono px-2 py-1 rounded ${m.part ? 'text-green-400 bg-green-950' : 'text-orange-400 bg-orange-950/50'}`}>
          {m.part ? 'en inventario' : 'por comprar o armar'}
        </span>
      </div>

      <div className="overflow-x-auto px-3 py-3">
        <svg viewBox={`0 0 720 ${h}`} className="w-full h-auto min-w-[600px]" role="img">
          <title>{`Conexiones de ${m.name}, pin por pin`}</title>
          <rect x="20" y="20" width="150" height={h - 30} rx="8" fill="#0b1220" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="95" y="42" textAnchor="middle" fontSize="12" fontWeight="600" className="fill-gray-200">
            {m.name}
          </text>
          <text x="236" y="42" fontSize="10" className="fill-gray-500">va a</text>
          {rows.map((r, i) => {
            const y = TOP + i * ROW + 12;
            return (
              <g key={`${r.pin}-${i}`}>
                <text x="160" y={y + 4} textAnchor="end" fontSize="11.5" fontWeight="600" className="fill-gray-200">
                  {r.pin}
                </text>
                <circle cx="170" cy={y} r="3.4" fill={r.color} />
                <line x1="174" y1={y} x2="232" y2={y} stroke={r.color} strokeWidth="2.2" className={r.kind === 'extra' ? undefined : 'pozo-flow'} strokeDasharray={r.kind === 'extra' ? '3 3' : undefined} />
                <rect x="236" y={y - 11} width="170" height="22" rx="5" fill="#111827" stroke={r.color} strokeWidth="1.2" />
                <text x="246" y={y + 4} fontSize="11" fontWeight="600" fill={r.color}>
                  {r.dest}
                </text>
                {r.note && (
                  <text x="418" y={y + 4} fontSize="10.5" className="fill-gray-400">
                    {r.note}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="px-5 pb-4 text-sm text-gray-400 max-w-3xl">{m.note}</p>
    </div>
  );
}
