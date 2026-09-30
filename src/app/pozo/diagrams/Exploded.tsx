'use client';

/**
 * Vista explotada: casing, manga y colgante quedan quietos; juntas, caja y
 * tapa bajan hasta cerrar sobre la brida al tocar "Armar".
 */

import { useState } from 'react';

const PRINT = '#374151';
const EDGE = '#9ca3af';
const TPU = '#0891b2';

const MOVES: Record<string, number> = { lid: 75, lidGasket: 53, box: 37, flangeGasket: 17 };

function Leader({ x1, y, text, sub, left }: { x1: number; y: number; text: string; sub?: string; left?: boolean }) {
  const x2 = left ? 176 : 360;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke="#6b7280" />
      <text x={left ? x2 - 4 : x2 + 4} y={y + 4} textAnchor={left ? 'end' : 'start'} fontSize="11" className="fill-gray-300">
        {text}
      </text>
      {sub && (
        <text x={left ? x2 - 4 : x2 + 4} y={y + 17} textAnchor={left ? 'end' : 'start'} fontSize="10" className="fill-gray-500">
          {sub}
        </text>
      )}
    </g>
  );
}

export default function Exploded() {
  const [assembled, setAssembled] = useState(false);
  const mv = (k: string) => ({
    transform: `translateY(${assembled ? MOVES[k] : 0}px)`,
    transition: 'transform 1s cubic-bezier(.6,0,.2,1)',
  });
  const labels = { opacity: assembled ? 0 : 1, transition: 'opacity .3s' };

  return (
    <div>
      <div className="flex justify-end px-2 pb-2">
        <button
          type="button"
          aria-pressed={assembled}
          onClick={() => setAssembled((a) => !a)}
          className="text-xs font-mono px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white transition-colors"
        >
          {assembled ? 'Explotar' : 'Armar'}
        </button>
      </div>
      <svg viewBox="0 0 640 640" className="w-full h-auto" role="img">
        <title>Vista explotada de la tapa: tapa con venteo, junta, caja de electronica, junta de brida, manga sobre el casing, y capsula colgante</title>
        <line x1="240" y1="30" x2="240" y2="186" stroke="#4b5563" strokeDasharray="3 4" style={labels} />

        {/* Casing */}
        <rect x="207" y="200" width="5" height="420" fill="#4b5563" />
        <rect x="268" y="200" width="5" height="420" fill="#4b5563" />
        <rect x="203" y="428" width="74" height="14" fill="#4b5563" />
        <rect x="212" y="580" width="56" height="40" fill="#38bdf8" opacity="0.8" />
        <Leader x1={277} y={435} text="cople: eco de calibracion" />
        <Leader x1={273} y={490} text='casing 2" Sch 40' />
        <text x="300" y="604" fontSize="11" fontWeight="600" fill="#38bdf8">
          agua
        </text>

        {/* Colgante */}
        <line x1="226" y1="197" x2="226" y2="520" stroke="#d1d5db" strokeWidth="1.6" />
        <rect x="222" y="300" width="8" height="10" rx="2" fill="#fbbf24" />
        <rect x="222" y="380" width="8" height="10" rx="2" fill="#fbbf24" />
        <rect x="217" y="520" width="18" height="30" rx="4" fill={PRINT} stroke={EDGE} />
        <rect x="219" y="544" width="14" height="3" fill="#a78bfa" />
        <Leader x1={222} y={305} text="DS18B20 soldados" sub="sobre el cable" left />
        <Leader x1={217} y={535} text="capsula colgante" sub="mic B, puerto abajo" left />

        {/* Manga */}
        <rect x="195" y="190" width="90" height="7" fill={PRINT} stroke={EDGE} />
        <rect x="202" y="197" width="4" height="43" fill={PRINT} stroke={EDGE} />
        <rect x="274" y="197" width="4" height="43" fill={PRINT} stroke={EDGE} />
        <rect x="213" y="197" width="3" height="13" fill={PRINT} stroke={EDGE} />
        <rect x="264" y="197" width="3" height="13" fill={PRINT} stroke={EDGE} />
        <rect x="197" y="224" width="5" height="9" fill={PRINT} stroke={EDGE} />
        <rect x="278" y="224" width="5" height="9" fill={PRINT} stroke={EDGE} />
        <rect x="232" y="172" width="16" height="18" rx="2" fill="#6b7280" />
        <rect x="222" y="189" width="36" height="3" fill="#6b7280" />
        <path d="M224 197 L256 197 L248 205 L232 205 Z" fill="#f97316" opacity="0.85" />
        <rect x="262" y="184" width="14" height="6" fill="#a78bfa" />
        <Leader x1={285} y={194} text="manga: brida + falda + spigot" />
        <Leader x1={283} y={228} text="tornillo mariposa M3 x 3" />
        <Leader x1={230} y={176} text="parlante, cono abajo" left />
        <Leader x1={195} y={203} text="mic A sobre el canal" sub="(a la derecha del parlante)" left />

        <g style={mv('flangeGasket')}>
          <rect x="195" y="170" width="90" height="3" fill={TPU} />
          <g style={labels}>
            <Leader x1={285} y={171} text="junta de brida · TPU" />
          </g>
        </g>

        <g style={mv('box')}>
          <rect x="130" y="90" width="220" height="60" rx="4" fill={PRINT} stroke={EDGE} />
          <rect x="133" y="90" width="214" height="57" fill="#111827" />
          <rect x="201" y="147" width="78" height="3" fill="#111827" />
          <rect x="146" y="126" width="4" height="21" fill={PRINT} />
          <rect x="190" y="126" width="4" height="21" fill={PRINT} />
          <rect x="142" y="122" width="56" height="4" fill="#15803d" />
          <rect x="148" y="114" width="44" height="7" fill="#15803d" />
          <rect x="142" y="100" width="40" height="6" fill="#15803d" opacity="0.75" />
          <rect x="290" y="134" width="50" height="10" rx="2" fill="#f59e0b" />
          <g style={labels}>
            <Leader x1={350} y={118} text="caja de electronica" sub="ESP32 + Notecard en portadora, LiPo en su bolsillo" />
          </g>
        </g>

        <g style={mv('lidGasket')}>
          <rect x="130" y="70" width="220" height="3" fill={TPU} />
          <g style={labels}>
            <Leader x1={350} y={71} text="junta de tapa · TPU" />
          </g>
        </g>

        <g style={mv('lid')}>
          <rect x="130" y="40" width="220" height="8" rx="2" fill={PRINT} stroke={EDGE} />
          <rect x="135" y="48" width="3" height="4" fill={PRINT} />
          <rect x="342" y="48" width="3" height="4" fill={PRINT} />
          <rect x="172" y="34" width="16" height="6" rx="1" fill="#9ca3af" />
          <g style={labels}>
            <Leader x1={350} y={44} text="tapa + venteo M12" />
          </g>
        </g>
      </svg>
    </div>
  );
}
