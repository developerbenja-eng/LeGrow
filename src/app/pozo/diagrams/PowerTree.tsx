/** Arbol de energia: de la LiPo a los tres rieles y a cada carga. */

import { RAIL } from '@/lib/pozo';

const INK = '#9ca3af';

function Box({ x, y, w, title, sub, hot }: { x: number; y: number; w: number; title: string; sub?: string; hot?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="46" rx="7" fill="#0b1220" stroke={hot ? '#fbbf24' : '#374151'} strokeWidth={hot ? 1.8 : 1.2} />
      <text x={x + 12} y={y + 20} fontSize="12.5" fontWeight="600" className="fill-gray-200">
        {title}
      </text>
      {sub && (
        <text x={x + 12} y={y + 36} fontSize="10.5" className="fill-gray-500">
          {sub}
        </text>
      )}
    </g>
  );
}

function Drop({ x, y1, y2, color = INK }: { x: number; y1: number; y2: number; color?: string }) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth="1.6" markerEnd="url(#pt-a)" />;
}

function Rail({ y, x1, x2, color, label }: { y: number; x1: number; x2: number; color: string; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth="4" strokeLinecap="round" />
      <circle r="4" fill="#fff" opacity="0.9">
        <animateMotion path={`M${x1} ${y} H${x2}`} dur="2.4s" repeatCount="indefinite" />
      </circle>
      <text x={x1 + 8} y={y - 8} fontSize="11" fontWeight="700" fill={color}>
        {label}
      </text>
    </g>
  );
}

export default function PowerTree() {
  return (
    <svg viewBox="0 0 900 380" className="w-full h-auto" role="img">
      <title>USB-C carga la LiPo por el TP4056; el riel de bateria alimenta el elevador MT3608, el divisor y el Notecarrier; el riel de 5 V alimenta la ESP32, el amplificador y la microSD; el regulador de la ESP32 hace 3.3 V para microfonos y sensores</title>
      <defs>
        <marker id="pt-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={INK} />
        </marker>
      </defs>

      <Box x={20} y={37} w={96} title="USB-C" sub="5 V, carga" />
      <line x1="116" y1="60" x2="158" y2="60" stroke={INK} strokeWidth="1.6" markerEnd="url(#pt-a)" />
      <Box x={160} y={37} w={140} title="TP4056" sub="carga + proteccion" />
      <Box x={160} y={140} w={140} title="LiPo 1000 mAh" sub="3.7 V · 3.7 Wh" />
      <line x1="230" y1="85" x2="230" y2="138" stroke={INK} strokeWidth="1.6" markerStart="url(#pt-a)" markerEnd="url(#pt-a)" />
      <text x="238" y="116" fontSize="10" className="fill-gray-500">B+ / B−</text>

      <line x1="300" y1="60" x2="330" y2="60" stroke={RAIL.BAT.color} strokeWidth="4" />
      <Rail y={60} x1={330} x2={880} color={RAIL.BAT.color} label="riel de bateria · OUT+ · 3.0–4.2 V" />

      <Drop x={445} y1={60} y2={112} />
      <Box x={380} y={114} w={130} title="MT3608" sub="ajustar a 5.00 V" hot />
      <Drop x={625} y1={60} y2={112} />
      <Box x={560} y={114} w={130} title="100k / 100k" sub="medio → GPIO 4" />
      <Drop x={810} y1={60} y2={112} />
      <Box x={740} y={114} w={140} title="Notecarrier V+" sub="Notecard 2.5–5.5 V" />

      <line x1="445" y1="160" x2="445" y2="206" stroke={RAIL['5V'].color} strokeWidth="4" />
      <Rail y={206} x1={330} x2={880} color={RAIL['5V'].color} label="riel 5 V" />
      <Drop x={405} y1={206} y2={246} color={RAIL['5V'].color} />
      <Box x={340} y={248} w={130} title="ESP32-S3 5V" sub="LDO de la placa" />
      <Drop x={575} y1={206} y2={246} color={RAIL['5V'].color} />
      <Box x={500} y={248} w={150} title="MAX98357A VIN" sub="+ 470 µF a GND" />
      <Drop x={745} y1={206} y2={246} color={RAIL['5V'].color} />
      <Box x={680} y={248} w={130} title="microSD VCC" sub="trae su LDO" />

      <line x1="405" y1="294" x2="405" y2="336" stroke={RAIL['3V3'].color} strokeWidth="4" />
      <Rail y={336} x1={405} x2={880} color={RAIL['3V3'].color} label="riel 3V3 → INMP441 x 2 · BME280 · DS18B20 · pull-up 4.7 kΩ" />

      <text x="20" y="250" fontSize="11" fontWeight="600" fill={RAIL.GND.color}>
        GND comun
      </text>
      <text x="20" y="266" fontSize="10" className="fill-gray-500">
        todas las tierras juntas:
      </text>
      <text x="20" y="280" fontSize="10" className="fill-gray-500">
        TP4056 OUT−, MT3608, ESP32,
      </text>
      <text x="20" y="294" fontSize="10" className="fill-gray-500">
        Notecarrier, modulos, malla
      </text>
    </svg>
  );
}
