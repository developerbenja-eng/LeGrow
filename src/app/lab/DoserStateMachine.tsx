/**
 * State machine for the pH doser, with its safety rails drawn as guards.
 *
 * An unbounded dosing loop is the one part of this project that can kill all
 * three plants overnight: a bubble on the membrane or a noise spike reads as
 * "too alkaline", the pump fires, and nobody is watching. Every transition
 * out of EVALUAR is a guard that has to pass before any pump turns on.
 */

const NODE = { x: 130, w: 210, h: 46 };
const CX = NODE.x + NODE.w / 2;

const STATES = [
  { y: 96, title: 'MUESTREO', rule: 'N lecturas → mediana' },
  { y: 164, title: 'CORDURA', rule: '3.0 < pH < 9.0' },
  { y: 232, title: 'EVALUAR', rule: '¿fuera de 5.8–6.2?' },
  { y: 300, title: 'TOPES', rule: 'dosis max · intervalo · tope diario' },
  { y: 368, title: 'DOSIS', rule: 'un pulso, nunca dos' },
  { y: 436, title: 'MEZCLA', rule: '15–30 min con difusor' },
];

/** Closed loop: MUESTREO down to MEZCLA, then back up the left side. */
const LOOP =
  'M 235 96 V 482 C 235 494, 226 498, 214 498 H 92 C 78 498, 72 490, 72 476 V 100 C 72 86, 80 82, 92 82 H 214 C 226 82, 235 86, 235 96 Z';

function Node({
  y,
  title,
  rule,
  tone = 'normal',
}: {
  y: number;
  title: string;
  rule: string;
  tone?: 'normal' | 'entry' | 'fault' | 'act';
}) {
  const style = {
    normal: { fill: '#111827', stroke: '#4b5563', text: 'fill-gray-200' },
    entry: { fill: '#0b0f16', stroke: '#6b7280', text: 'fill-gray-400' },
    fault: { fill: '#2a0e0e', stroke: '#f87171', text: 'fill-red-400' },
    act: { fill: '#14532d', stroke: '#4ade80', text: 'fill-green-400' },
  }[tone];

  return (
    <g>
      <rect x={NODE.x} y={y} width={NODE.w} height={NODE.h} rx="8" fill={style.fill} stroke={style.stroke} strokeWidth="1.6" />
      <text x={CX} y={y + 20} textAnchor="middle" fontSize="12" fontWeight="700" className={style.text}>
        {title}
      </text>
      <text x={CX} y={y + 35} textAnchor="middle" fontSize="9" className="fill-gray-500">
        {rule}
      </text>
    </g>
  );
}

function Guard({ from, label, toY, color }: { from: number; label: string; toY: number; color: string }) {
  const x0 = NODE.x + NODE.w;
  return (
    <g>
      <path
        d={`M ${x0} ${from + NODE.h / 2} H 392 C 404 ${from + NODE.h / 2}, 408 ${from + NODE.h / 2 - 8}, 408 ${from + NODE.h / 2 - 20} V ${toY + 30} C 408 ${toY + 18}, 400 ${toY + 14}, 388 ${toY + 14} H ${x0}`}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeDasharray="4 3"
      />
      <text x={416} y={(from + toY) / 2 + 30} fontSize="9" className="fill-gray-500">
        {label}
      </text>
    </g>
  );
}

export default function DoserStateMachine() {
  return (
    <svg viewBox="0 0 660 520" className="w-full h-auto" role="img">
      <title>Maquina de estados del dosificador de pH con sus topes de seguridad</title>

      {/* Loop path */}
      <path d={LOOP} fill="none" stroke="#374151" strokeWidth="2" />

      {/* Travelling token */}
      <circle r="5" cx="0" cy="0" fill="#4ade80">
        <animateMotion path={LOOP} dur="14s" repeatCount="indefinite" />
      </circle>
      <circle r="5" cx="0" cy="0" fill="none" stroke="#4ade80" strokeWidth="1.5">
        <animateMotion path={LOOP} dur="14s" repeatCount="indefinite" />
        <animate attributeName="r" values="5;13;5" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
      </circle>

      {/* Entry */}
      <Node y={28} title="ESPERA" rule="intervalo minimo entre ciclos" tone="entry" />
      <path d={`M ${CX} 74 V 92`} stroke="#4b5563" strokeWidth="1.6" fill="none" markerEnd="url(#tip)" />

      <defs>
        <marker id="tip" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#4b5563" />
        </marker>
      </defs>

      {/* Guards that exit the loop */}
      <Guard from={164} label="sonda muerta" toY={164} color="#f87171" />
      <Guard from={232} label="en rango → espera" toY={28} color="#4ade80" />
      <Guard from={300} label="tope alcanzado → espera" toY={28} color="#fbbf24" />

      {/* Fault state */}
      <rect x="440" y="150" width="180" height="74" rx="8" fill="#2a0e0e" stroke="#f87171" strokeWidth="1.6" />
      <text x="530" y="176" textAnchor="middle" fontSize="12" fontWeight="700" className="fill-red-400">
        FALLA
      </text>
      <text x="530" y="192" textAnchor="middle" fontSize="9" className="fill-gray-400">
        alerta, y NO dosificar
      </text>
      <text x="530" y="208" textAnchor="middle" fontSize="9" className="fill-gray-500">
        negarse es la accion segura
      </text>
      <circle cx="530" cy="150" r="5" fill="none" stroke="#f87171" strokeWidth="1.5">
        <animate attributeName="r" values="5;14;5" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0;0.9" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* Main states */}
      {STATES.map((s, i) => (
        <Node key={s.title} {...s} tone={i === 4 ? 'act' : 'normal'} />
      ))}

      <text x="72" y="70" fontSize="9" className="fill-gray-600">
        vuelve a medir, no a dosificar
      </text>
    </svg>
  );
}
