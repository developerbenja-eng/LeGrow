/**
 * Corte acotado de la manga sobre casing de 2": un plano por el eje, a escala
 * 5 px/mm. Todas las cotas salen de GEO, el mismo juego de valores del .scad.
 */

import { CASINGS, GEO, boreR } from '@/lib/pozo';

const S = 5;
const CX = 340;
const Y0 = 170; // cara superior de la brida
const C2 = CASINGS[0];
const x = (r: number) => CX + r * S;
const yF = Y0 + GEO.flangeT * S;
const BG = '#111827';
const PRINT = 'url(#ss-hatch)';

const R = {
  seat: GEO.spkD / 2,
  open: GEO.spkOpen / 2,
  bore: boreR(C2),
  spigotO: C2.idMm / 2 - GEO.fit,
  skirtI: C2.odMm / 2 + GEO.fit,
  skirtO: C2.odMm / 2 + GEO.fit + GEO.skirtW,
  casI: C2.idMm / 2,
  casO: C2.odMm / 2,
  half: GEO.flange / 2,
};

function HDim({ r1, r2, y, label, ext }: { r1: number; r2: number; y: number; label: string; ext?: number }) {
  return (
    <g>
      {ext !== undefined && (
        <>
          <line x1={x(r1)} y1={ext} x2={x(r1)} y2={y + 4} stroke="#6b7280" strokeDasharray="2 2" />
          <line x1={x(r2)} y1={ext} x2={x(r2)} y2={y + 4} stroke="#6b7280" strokeDasharray="2 2" />
        </>
      )}
      <line x1={x(r1)} y1={y} x2={x(r2)} y2={y} stroke="#d1d5db" markerStart="url(#ss-a)" markerEnd="url(#ss-a)" />
      <rect x={(x(r1) + x(r2)) / 2 - label.length * 3.4 - 4} y={y - 16} width={label.length * 6.8 + 8} height="13" fill={BG} />
      <text x={(x(r1) + x(r2)) / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="600" className="fill-gray-200">
        {label}
      </text>
    </g>
  );
}

function VDim({ xp, y1, y2, label, side = 'right' }: { xp: number; y1: number; y2: number; label: string; side?: 'left' | 'right' }) {
  return (
    <g>
      <line x1={xp} y1={y1} x2={xp} y2={y2} stroke="#d1d5db" markerStart="url(#ss-a)" markerEnd="url(#ss-a)" />
      <text x={side === 'right' ? xp + 6 : xp - 6} y={(y1 + y2) / 2 + 4} textAnchor={side === 'right' ? 'start' : 'end'} fontSize="11" fontWeight="600" className="fill-gray-200">
        {label}
      </text>
    </g>
  );
}

export default function SleeveSection() {
  const skirtBot = yF + GEO.skirtH * S;
  const spigotBot = yF + GEO.spigotH * S;
  const casBot = skirtBot + 60;
  const bossY = yF + (GEO.skirtH - 12) * S;

  return (
    <svg viewBox="0 0 720 530" className="w-full h-auto" role="img">
      <title>Corte acotado de la manga montada sobre casing de 2 pulgadas, con parlante, mic A, puerto y paso del cable</title>
      <defs>
        <pattern id="ss-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#4b5563" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#6b7280" strokeWidth="1.5" />
        </pattern>
        <marker id="ss-a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 1 L10 5 L0 9 z" fill="#d1d5db" />
        </marker>
      </defs>

      {/* Casing (se corta abajo) */}
      {[-1, 1].map((sd) => (
        <rect key={sd} x={Math.min(x(sd * R.casI), x(sd * R.casO))} y={yF} width={(R.casO - R.casI) * S} height={casBot - yF} fill="#1f2937" stroke="#6b7280" />
      ))}
      <path d={`M${x(-R.casO) - 6} ${casBot} l10 -6 l10 6 l10 -6`} fill="none" stroke="#6b7280" />
      <text x={x(R.casO) + 8} y={casBot - 6} fontSize="10" className="fill-gray-500">
        casing PVC
      </text>

      {/* Brida */}
      <rect x={x(-R.half)} y={Y0} width={GEO.flange * S} height={GEO.flangeT * S} fill={PRINT} stroke="#9ca3af" />
      {/* Falda y spigot */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <rect x={Math.min(x(sd * R.skirtI), x(sd * R.skirtO))} y={yF} width={GEO.skirtW * S} height={GEO.skirtH * S} fill={PRINT} stroke="#9ca3af" />
          <rect x={Math.min(x(sd * R.bore), x(sd * R.spigotO))} y={yF} width={GEO.spigotW * S} height={GEO.spigotH * S} fill={PRINT} stroke="#9ca3af" />
        </g>
      ))}
      {/* Resalte e inserto del tornillo mariposa (lado derecho) */}
      <rect x={x(R.skirtO)} y={bossY - 22} width="25" height="45" fill={PRINT} stroke="#9ca3af" />
      <rect x={x(R.skirtI) - 5} y={bossY - 10} width={(R.skirtO - R.skirtI) * S + 30} height="20" fill={BG} stroke="#9ca3af" />
      <text x={x(R.skirtO) + 32} y={bossY + 4} fontSize="10" className="fill-gray-400">
        inserto M3 + mariposa
      </text>

      {/* Huecos de la brida */}
      <rect x={x(-R.open)} y={Y0 - 1} width={GEO.spkOpen * S} height={GEO.flangeT * S + 2} fill={BG} />
      <rect x={x(-R.seat)} y={Y0 - 1} width={GEO.spkD * S} height={GEO.spkRim * S + 1} fill={BG} />
      <rect x={x(GEO.portR - GEO.portD / 2)} y={Y0 - 1} width={GEO.portD * S} height={GEO.flangeT * S + 2} fill={BG} />
      <rect x={x(GEO.portR)} y={Y0 - 1} width={(GEO.micR - GEO.portR) * S} height={5 + 1} fill={BG} />
      <rect x={x(-GEO.cableR - GEO.cableD / 2)} y={Y0 - 1} width={GEO.cableD * S} height={GEO.flangeT * S + 2} fill={BG} />

      {/* Parlante */}
      <rect x={x(-R.seat) + 1} y={Y0} width={GEO.spkD * S - 2} height={GEO.spkRim * S} fill="#374151" />
      <path d={`M${x(-16)} ${Y0} L${x(-8)} ${Y0 - 70} L${x(8)} ${Y0 - 70} L${x(16)} ${Y0} Z`} fill="#1f2937" stroke="#6b7280" />
      <rect x={x(-8)} y={Y0 - 110} width={16 * S} height="40" rx="3" fill="#4b5563" />
      <path d={`M${x(-14.5)} ${Y0 + 8} L${x(-3)} ${Y0 - 40} L${x(3)} ${Y0 - 40} L${x(14.5)} ${Y0 + 8}`} fill="none" stroke="#f97316" strokeWidth="2" />
      <text x={CX} y={Y0 - 118} textAnchor="middle" fontSize="11" fontWeight="600" className="fill-gray-300">
        parlante 36 mm · iman arriba, cono abajo
      </text>
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${x(-10)} ${spigotBot + 20 + i * 22} Q${CX} ${spigotBot + 30 + i * 22} ${x(10)} ${spigotBot + 20 + i * 22}`} fill="none" stroke="#f97316" strokeWidth="2" opacity={0.8 - i * 0.25}>
          <animate attributeName="opacity" values={`${0.8 - i * 0.25};0.1;${0.8 - i * 0.25}`} dur="1.4s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
        </path>
      ))}

      {/* Mic A */}
      <rect x={x(GEO.micR - GEO.micPcbD / 2)} y={Y0 - 8} width={GEO.micPcbD * S} height="8" fill="#a78bfa" />
      <rect x={x(GEO.micR) - 12} y={Y0 - 20} width="24" height="12" rx="2" fill="#6d28d9" />
      <line x1={x(GEO.micR) + 20} y1={Y0 - 14} x2={x(GEO.micR) + 70} y2={Y0 - 60} stroke="#a78bfa" />
      <text x={x(GEO.micR) + 74} y={Y0 - 62} fontSize="10.5" fontWeight="600" fill="#a78bfa">
        mic A sobre el canal
      </text>
      <text x={x(GEO.micR) + 74} y={Y0 - 49} fontSize="10" className="fill-gray-500">
        puerto r {GEO.portR} → canal → mic r {GEO.micR}
      </text>

      {/* Cable colgante */}
      <line x1={x(-GEO.cableR)} y1={Y0 - 60} x2={x(-GEO.cableR)} y2={casBot} stroke="#e5e7eb" strokeWidth={GEO.cableD * S * 0.7} opacity="0.35" />
      <text x={x(-GEO.cableR) - 8} y={Y0 - 64} textAnchor="end" fontSize="10" className="fill-gray-400">
        cable colgante Ø{GEO.cableD}
      </text>

      {/* Cotas */}
      <HDim r1={-R.half} r2={R.half} y={Y0 - 136 + 4} label={`${GEO.flange} brida`} ext={Y0} />
      <HDim r1={-R.open} r2={R.open} y={spigotBot + 100} label={`Ø${GEO.spkOpen} abertura`} ext={yF} />
      <HDim r1={-R.bore} r2={R.bore} y={spigotBot + 130} label={`Ø${(2 * R.bore).toFixed(1)} spigot`} ext={spigotBot} />
      <HDim r1={-R.casO} r2={R.casO} y={casBot + 22} label={`Ø${C2.odMm} casing OD`} />
      <VDim xp={x(-R.half) - 22} y1={Y0} y2={yF} label={`${GEO.flangeT}`} side="left" />
      <VDim xp={x(-R.half) - 22} y1={yF} y2={spigotBot} label={`${GEO.spigotH} spigot`} side="left" />
      <VDim xp={x(-R.half) - 64} y1={yF} y2={skirtBot} label={`${GEO.skirtH} falda`} side="left" />
      <text x={x(R.skirtI) + 2} y={skirtBot + 16} fontSize="10" className="fill-gray-400">
        holgura {GEO.fit} por lado
      </text>
      <text x={x(-R.seat)} y={Y0 + 44} fontSize="10" className="fill-gray-500">
        asiento Ø{GEO.spkD} × {GEO.spkRim}
      </text>
    </svg>
  );
}
