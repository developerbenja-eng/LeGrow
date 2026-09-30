/**
 * Vista superior de la brida (cara que toca la caja), a escala 3.4 px/mm.
 * Muestra lo que hay que ubicar al montar: parlante, puerto, canal, placa del
 * mic A, paso del cable, pernos y lo que queda debajo (casing y spigot).
 */

import { CASINGS, GEO, boreR } from '@/lib/pozo';

const S = 3.4;
const CX = 190;
const CY = 190;
const C2 = CASINGS[0];
const p = (mm: number) => mm * S;

const ITEMS = [
  { color: '#f97316', label: `Asiento del parlante Ø${GEO.spkD}, abertura Ø${GEO.spkOpen}` },
  { color: '#a78bfa', label: `Puerto Ø${GEO.portD} a r ${GEO.portR}, canal de 1 mm hasta r ${GEO.micR}` },
  { color: '#c4b5fd', label: `Placa del mic A Ø${GEO.micPcbD}, cara sin componentes abajo` },
  { color: '#e5e7eb', label: `Paso del cable Ø${GEO.cableD} a r ${GEO.cableR}` },
  { color: '#9ca3af', label: `Pernos M3 en cuadro de ${GEO.boltOff * 2} mm` },
  { color: '#4b5563', label: `Debajo: casing Ø${C2.odMm}/${C2.idMm}, spigot Ø${(2 * boreR(C2)).toFixed(1)}` },
  { color: '#38bdf8', label: `Abertura del piso de la caja Ø${GEO.floorOpen}` },
] as const;

export default function FlangeTop() {
  const half = p(GEO.flange / 2);
  return (
    <svg viewBox="0 0 700 380" className="w-full h-auto" role="img">
      <title>Vista superior acotada de la brida con parlante, puerto, canal, placa del mic A, paso del cable y pernos</title>

      <rect x={CX - half} y={CY - half} width={2 * half} height={2 * half} rx={p(6)} fill="#1f2937" stroke="#9ca3af" />
      {/* Debajo */}
      <circle cx={CX} cy={CY} r={p(C2.odMm / 2)} fill="none" stroke="#4b5563" strokeDasharray="4 3" />
      <circle cx={CX} cy={CY} r={p(C2.idMm / 2)} fill="none" stroke="#4b5563" strokeDasharray="4 3" />
      <circle cx={CX} cy={CY} r={p(boreR(C2))} fill="none" stroke="#4b5563" strokeDasharray="2 3" />
      <circle cx={CX} cy={CY} r={p(GEO.floorOpen / 2)} fill="none" stroke="#38bdf8" strokeDasharray="6 4" opacity="0.7" />

      {/* Parlante */}
      <circle cx={CX} cy={CY} r={p(GEO.spkD / 2)} fill="#111827" stroke="#f97316" strokeWidth="1.6" />
      <circle cx={CX} cy={CY} r={p(GEO.spkOpen / 2)} fill="#030712" stroke="#f97316" strokeDasharray="3 2" />

      {/* Canal, puerto y mic A */}
      <rect x={CX + p(GEO.portR)} y={CY - p(GEO.portD / 2)} width={p(GEO.micR - GEO.portR)} height={p(GEO.portD)} fill="#a78bfa" opacity="0.6" />
      <circle cx={CX + p(GEO.portR)} cy={CY} r={p(GEO.portD / 2)} fill="#030712" stroke="#a78bfa" strokeWidth="1.4" />
      <circle cx={CX + p(GEO.micR)} cy={CY} r={p(GEO.micPcbD / 2)} fill="#a78bfa" fillOpacity="0.12" stroke="#c4b5fd" strokeDasharray="4 2" />

      {/* Cable */}
      <circle cx={CX - p(GEO.cableR)} cy={CY} r={p(GEO.cableD / 2)} fill="#030712" stroke="#e5e7eb" strokeWidth="1.4" />

      {/* Pernos */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sy) => <circle key={`${sx}${sy}`} cx={CX + sx * p(GEO.boltOff)} cy={CY + sy * p(GEO.boltOff)} r={p(GEO.boltD / 2)} fill="#030712" stroke="#9ca3af" />),
      )}

      {/* Tornillos mariposa (en la falda, debajo) */}
      {[0, 120, 240].map((a) => {
        const r = (a * Math.PI) / 180;
        const r0 = p(C2.odMm / 2 + GEO.fit + GEO.skirtW) + 4;
        return (
          <line key={a} x1={CX + Math.cos(r) * r0} y1={CY + Math.sin(r) * r0} x2={CX + Math.cos(r) * (r0 + 22)} y2={CY + Math.sin(r) * (r0 + 22)} stroke="#6b7280" strokeWidth="2" markerStart="url(#ft-a)" />
        );
      })}
      <defs>
        <marker id="ft-a" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 1 L10 5 L0 9 z" fill="#6b7280" />
        </marker>
      </defs>

      {/* Cota del lado */}
      <line x1={CX - half} y1={CY + half + 22} x2={CX + half} y2={CY + half + 22} stroke="#d1d5db" />
      <text x={CX} y={CY + half + 38} textAnchor="middle" fontSize="11" fontWeight="600" className="fill-gray-200">
        {GEO.flange} mm
      </text>

      {/* Leyenda */}
      {ITEMS.map((it, i) => (
        <g key={it.label}>
          <rect x="400" y={52 + i * 36} width="14" height="14" rx="3" fill={it.color} opacity="0.85" />
          <text x="422" y={63 + i * 36} fontSize="11" className="fill-gray-300">
            {it.label}
          </text>
        </g>
      ))}
      <text x="400" y="320" fontSize="10" className="fill-gray-500">
        Flechas: los 3 tornillos mariposa en la falda, a 120°.
      </text>
    </svg>
  );
}
