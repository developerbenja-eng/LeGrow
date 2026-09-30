/**
 * El cable colgante: seis conductores que llevan el mic B y los tres DS18B20.
 * Las resistencias van en el extremo de la ESP32, los sensores se sueldan a lo
 * largo del cable y el L/R del mic B se puentea a VDD dentro de la capsula.
 */

import { PENDANT } from '@/lib/pozo';

const Y0 = 112;
const DY = 17;
const cy = (i: number) => Y0 + i * DY;
const J0 = 282;
const J1 = 742;
const LEN = 0.75;
const dx = (m: number) => J0 + (m / LEN) * (J1 - J0);
const RED = 0;
const BLACK = 1;
const WHITE = 5;

function Resistor({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <rect x={x - 12} y={y - 5} width="24" height="10" rx="2" fill="#030712" stroke="#d1d5db" />
      <text x={x} y={y - 9} textAnchor="middle" fontSize="9" className="fill-gray-300">
        {label}
      </text>
    </g>
  );
}

function DsSensor({ x, n }: { x: number; n: number }) {
  const legs = [RED, BLACK, WHITE];
  return (
    <g>
      <path d={`M${x - 11} 70 A11 11 0 0 1 ${x + 11} 70 Z`} fill="#1f2937" stroke="#fbbf24" strokeWidth="1.2" />
      <text x={x} y="52" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#fbbf24">
        DS18B20 #{n}
      </text>
      {legs.map((c, i) => (
        <g key={c}>
          <line x1={x - 6 + i * 6} y1="70" x2={x - 6 + i * 6} y2={cy(c)} stroke={PENDANT[c].color === '#1f2937' ? '#6b7280' : PENDANT[c].color} strokeWidth="1.2" />
          <circle cx={x - 6 + i * 6} cy={cy(c)} r="2.6" fill={PENDANT[c].color === '#1f2937' ? '#9ca3af' : PENDANT[c].color} />
        </g>
      ))}
    </g>
  );
}

export default function PendantCable() {
  const stroke = (c: string) => (c === '#1f2937' ? '#6b7280' : c);
  return (
    <svg viewBox="0 0 900 320" className="w-full h-auto" role="img">
      <title>Cable colgante de seis conductores con resistencias en el extremo de la ESP32, dos DS18B20 soldados en el camino y la capsula con el mic B y el tercer DS18B20</title>

      {/* Extremo ESP32 */}
      <rect x="16" y="88" width="118" height="116" rx="7" fill="#0b1220" stroke="#374151" />
      <text x="24" y="80" fontSize="11" fontWeight="600" className="fill-gray-200">
        extremo ESP32
      </text>
      {PENDANT.map((p, i) => (
        <text key={p.name} x="126" y={cy(i) + 3.5} textAnchor="end" fontSize="10" className="fill-gray-300">
          {p.to.split(' ')[0] === 'GPIO' ? p.to.split(' ').slice(0, 2).join(' ') : p.to}
        </text>
      ))}

      {/* Conductores */}
      {PENDANT.map((p, i) => (
        <line key={p.name} x1="134" y1={cy(i)} x2={J1 + 36} y2={cy(i)} stroke={stroke(p.color)} strokeWidth="2.4" />
      ))}
      <Resistor x={170} y={cy(2)} label="47 Ω" />
      <Resistor x={170} y={cy(3) + 1} label="" />
      <text x="170" y={cy(3) + 16} textAnchor="middle" fontSize="9" className="fill-gray-300">
        47 Ω
      </text>
      {/* Pull-up 1-Wire */}
      <line x1="226" y1={cy(RED)} x2="226" y2={cy(WHITE)} stroke="#d1d5db" strokeWidth="1.2" />
      <rect x="221" y={cy(2) + 4} width="10" height="26" rx="2" fill="#030712" stroke="#d1d5db" />
      <circle cx="226" cy={cy(RED)} r="2.6" fill={PENDANT[RED].color} />
      <circle cx="226" cy={cy(WHITE)} r="2.6" fill={PENDANT[WHITE].color} />
      <text x="236" y={cy(3) + 4} fontSize="9" className="fill-gray-300">
        4.7 kΩ
      </text>

      {/* Chaqueta blindada */}
      <rect x={J0 - 12} y={Y0 - 16} width={J1 - J0 + 24} height={DY * 5 + 32} rx="16" fill="none" stroke="#6b7280" strokeWidth="1.6" strokeDasharray="6 3" />
      <text x={(J0 + J1) / 2} y={Y0 + DY * 5 + 36} textAnchor="middle" fontSize="10" className="fill-gray-500">
        cable blindado de 6 conductores · malla a GND solo en el extremo ESP32 · 1 m maximo
      </text>

      <DsSensor x={dx(0.3)} n={1} />
      <DsSensor x={dx(0.6)} n={2} />

      {/* Capsula */}
      <rect x={J1 + 36} y={Y0 - 26} width="106" height={DY * 5 + 52} rx="10" fill="#0b1220" stroke="#a78bfa" strokeWidth="1.5" />
      <text x={J1 + 89} y={Y0 - 34} textAnchor="middle" fontSize="11" fontWeight="600" fill="#a78bfa">
        capsula · mic B
      </text>
      {['VDD', 'GND', 'SCK', 'WS', 'SD', 'DQ #3'].map((l, i) => (
        <g key={l}>
          <circle cx={J1 + 36} cy={cy(i)} r="2.6" fill={stroke(PENDANT[i].color)} />
          <text x={J1 + 44} y={cy(i) + 3.5} fontSize="10" className="fill-gray-300">
            {l}
          </text>
        </g>
      ))}
      <path d={`M${J1 + 118} ${cy(RED)} V${cy(4) + 28} H${J1 + 96}`} fill="none" stroke={PENDANT[RED].color} strokeWidth="1.2" strokeDasharray="3 2" />
      <text x={J1 + 94} y={cy(4) + 31} textAnchor="end" fontSize="9" fill={PENDANT[RED].color}>
        L/R
      </text>
      <text x={J1 + 89} y={Y0 + DY * 5 + 42} textAnchor="middle" fontSize="9" className="fill-gray-500">
        L/R puenteado a VDD
      </text>

      {/* Distancias */}
      {[0, 0.3, 0.6, 0.75].map((m) => (
        <g key={m}>
          <line x1={dx(m)} y1="236" x2={dx(m)} y2="244" stroke="#6b7280" />
          <text x={dx(m)} y="258" textAnchor="middle" fontSize="10" className="fill-gray-400">
            {m === 0 ? 'boca de la tapa' : `${m} m`}
          </text>
        </g>
      ))}
      <line x1={dx(0)} y1="240" x2={dx(LEN)} y2="240" stroke="#374151" />

      {/* Corte */}
      <g transform="translate(70 272)">
        <circle r="22" fill="#030712" stroke="#6b7280" strokeDasharray="3 2" />
        {PENDANT.map((p, i) => {
          const a = (i / PENDANT.length) * 2 * Math.PI - Math.PI / 2;
          return <circle key={p.name} cx={Math.cos(a) * 12} cy={Math.sin(a) * 12} r="5" fill={p.color} stroke="#4b5563" />;
        })}
      </g>
      <text x="102" y="270" fontSize="10" className="fill-gray-400">
        corte: rojo 3V3 · negro GND · amarillo BCLK
      </text>
      <text x="102" y="284" fontSize="10" className="fill-gray-400">
        verde WS · azul SD · blanco DQ
      </text>
    </svg>
  );
}
