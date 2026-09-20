/**
 * The RJ11/RJ12 dimming bus on the LumaLight.
 *
 * It looks like Ethernet and is not: six contacts, not eight, and no network
 * of any kind behind it. It is an analogue or discrete control bus over
 * telephone cable, which is better news for us than a protocol would be.
 *
 * Both jacks on the fixture carry six gold contacts, so the cable has to be
 * 6P6C. A common 6P4C phone cord fits the socket and silently leaves pins 1
 * and 6 unconnected.
 */

import { FIXTURE } from '@/lib/photometry';

const FIX = { w: 104, h: 60, y: 46 };
const XS = [34, 166, 298];

function Fixture({ x, i }: { x: number; i: number }) {
  return (
    <g>
      <rect x={x} y={FIX.y} width={FIX.w} height={FIX.h} rx="6" fill="#111827" stroke="#4b5563" strokeWidth="1.5" />
      {/* Diode rows */}
      {[0, 1, 2].map((r) => (
        <g key={r}>
          {Array.from({ length: 7 }, (_, c) => (
            <circle key={c} cx={x + 16 + c * 12} cy={FIX.y + 14 + r * 9} r="2" fill={c % 3 === 0 ? '#fca5a5' : '#e5e7eb'} opacity="0.7" />
          ))}
        </g>
      ))}
      {/* In / out jacks */}
      <rect x={x + 10} y={FIX.y + FIX.h - 13} width="18" height="11" rx="2" fill="#1f2937" stroke="#6b7280" />
      <rect x={x + FIX.w - 28} y={FIX.y + FIX.h - 13} width="18" height="11" rx="2" fill="#1f2937" stroke="#6b7280" />
      <text x={x + FIX.w / 2} y={FIX.y - 6} textAnchor="middle" fontSize="9" className="fill-gray-500">
        luz {i + 1}
      </text>
    </g>
  );
}

export default function DimBus() {
  const link = (from: number, to: number) =>
    `M ${from + FIX.w - 19} ${FIX.y + FIX.h - 2} C ${from + FIX.w - 19} ${FIX.y + FIX.h + 18}, ${to + 19} ${FIX.y + FIX.h + 18}, ${to + 19} ${FIX.y + FIX.h - 2}`;

  return (
    <svg viewBox="0 0 680 330" className="w-full h-auto" role="img">
      <title>Bus de atenuacion RJ11 en cadena y jack de seis contactos</title>

      {/* Daisy chain */}
      {XS.map((x, i) => (
        <Fixture key={x} x={x} i={i} />
      ))}
      {[0, 1].map((i) => (
        <g key={i}>
          <path d={link(XS[i], XS[i + 1])} fill="none" stroke="#4b5563" strokeWidth="2.5" />
          {[0, 1].map((d) => (
            <circle key={d} r="3" cx="0" cy="0" fill="#4ade80">
              <animateMotion path={link(XS[i], XS[i + 1])} dur="3s" begin={`${i * 0.6 + d * 1.5}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      ))}

      {/* Ellipsis and chain limit */}
      <text x="434" y={FIX.y + 34} textAnchor="middle" fontSize="16" className="fill-gray-600">
        · · ·
      </text>
      <text x="434" y={FIX.y + 54} textAnchor="middle" fontSize="9" className="fill-gray-500">
        hasta {FIXTURE.daisyChainMax}
      </text>
      <path
        d={`M ${XS[2] + FIX.w - 19} ${FIX.y + FIX.h - 2} C ${XS[2] + FIX.w - 19} ${FIX.y + FIX.h + 18}, 470 ${FIX.y + FIX.h + 18}, 470 ${FIX.y + 30} L 498 ${FIX.y + 30}`}
        fill="none"
        stroke="#4b5563"
        strokeWidth="2.5"
        strokeDasharray="5 4"
      />

      {/* Controller: theirs or ours */}
      <rect x="498" y={FIX.y} width="148" height={FIX.h} rx="6" fill="#0b0f16" stroke="#4ade80" strokeWidth="1.6" />
      <text x="572" y={FIX.y + 22} textAnchor="middle" fontSize="10" className="fill-gray-400">
        GrowHub E42A
      </text>
      <text x="572" y={FIX.y + 36} textAnchor="middle" fontSize="9" className="fill-gray-600">
        o
      </text>
      <text x="572" y={FIX.y + 50} textAnchor="middle" fontSize="10" fontWeight="700" className="fill-green-400">
        nuestro ESP32
      </text>

      {/* ---- Magnified jack ---- */}
      <text x="50" y="158" fontSize="10" className="fill-gray-400" fontWeight="600">
        El jack: seis contactos = 6P6C
      </text>
      <rect x="50" y="170" width="212" height="96" rx="6" fill="#0b0f16" stroke="#6b7280" strokeWidth="1.6" />
      <rect x="126" y="162" width="60" height="10" rx="3" fill="#0b0f16" stroke="#6b7280" strokeWidth="1.4" />
      {Array.from({ length: 6 }, (_, i) => {
        const cx = 70 + i * 34;
        return (
          <g key={i}>
            <rect x={cx - 7} y="186" width="14" height="44" rx="2" fill="#d4af37" />
            <text x={cx} y="248" textAnchor="middle" fontSize="11" className="fill-gray-400" fontWeight="700">
              {i + 1}
            </text>
            <text x={cx} y="262" textAnchor="middle" fontSize="12" className="fill-amber-500" fontWeight="700">
              ?
            </text>
          </g>
        );
      })}
      <text x="156" y="284" textAnchor="middle" fontSize="9" className="fill-gray-600">
        funcion de cada pin sin documentar
      </text>

      {/* ---- Cable comparison ---- */}
      <text x="352" y="158" fontSize="10" className="fill-gray-400" fontWeight="600">
        La trampa del cable
      </text>
      {[
        { y: 176, label: '6P4C — cable de telefono comun', wired: [1, 2, 3, 4], tone: '#f87171' },
        { y: 236, label: '6P6C — el que necesitas', wired: [0, 1, 2, 3, 4, 5], tone: '#4ade80' },
      ].map((row) => (
        <g key={row.label}>
          <rect x="352" y={row.y} width="150" height="34" rx="4" fill="#111827" stroke={row.tone} strokeWidth="1.4" />
          {Array.from({ length: 6 }, (_, i) => {
            const on = row.wired.includes(i);
            return (
              <rect
                key={i}
                x={360 + i * 23}
                y={row.y + 8}
                width="15"
                height="18"
                rx="2"
                fill={on ? '#d4af37' : '#1f2937'}
                stroke={on ? 'none' : '#4b5563'}
                strokeDasharray={on ? undefined : '2 2'}
              />
            );
          })}
          <text x="516" y={row.y + 15} fontSize="9" className="fill-gray-400">
            {row.label.split('—')[0]}
          </text>
          <text x="516" y={row.y + 28} fontSize="9" className="fill-gray-600">
            {row.label.split('—')[1]}
          </text>
        </g>
      ))}
      <text x="352" y="292" fontSize="9" className="fill-gray-600">
        Un 6P4C entra en el jack y deja los pines 1 y 6 sin conectar, en silencio.
      </text>

      {/* Not-LAN note */}
      <text x="50" y="316" fontSize="10" className="fill-red-400" fontWeight="600">
        No es LAN
      </text>
      <text x="126" y="316" fontSize="10" className="fill-gray-500">
        — RJ45 tiene ocho contactos y lleva red. Esto tiene seis y lleva una senal de control.
      </text>
    </svg>
  );
}
