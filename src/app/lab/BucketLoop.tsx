/**
 * Animated cutaway of the Dutch bucket rig and its recirculating nutrient loop.
 *
 * Every component drawn here already exists in the report 03 bill of materials.
 * The only addition is going from one peristaltic pump to three, which is what
 * automatic dosing (nutrient A, nutrient B, pH down) actually requires.
 */

const TUBES = {
  doseA: 'M 52 112 C 52 150, 110 165, 132 202',
  doseB: 'M 108 112 C 108 155, 128 175, 140 202',
  dosePh: 'M 164 112 C 164 160, 156 180, 150 202',
  feed: 'M 246 280 L 300 280 C 330 280, 336 262, 336 236 L 336 96 C 336 84, 346 78, 360 78 L 496 78',
  drain: 'M 586 306 C 606 306, 612 316, 612 330 L 612 344 L 96 344 C 84 344, 80 336, 80 326 L 80 232',
} as const;

function Droplets({
  path,
  color,
  count,
  dur,
  r = 3,
}: {
  path: string;
  color: string;
  count: number;
  dur: number;
  r?: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} r={r} cx="0" cy="0" fill={color} opacity="0.9">
          <animateMotion
            path={path}
            dur={`${dur}s`}
            begin={`${(i * dur) / count}s`}
            repeatCount="indefinite"
            rotate="auto"
          />
        </circle>
      ))}
    </>
  );
}

function Pump({ x, y, label, color }: { x: number; y: number; label: string; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="13" fill="#111827" stroke="#4b5563" strokeWidth="1.5" />
      <g style={{ transformOrigin: `${x}px ${y}px` }}>
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${x} ${y}`}
            to={`360 ${x} ${y}`}
            dur="2.4s"
            repeatCount="indefinite"
          />
          <circle cx={x} cy={y - 6} r="2.6" fill={color} />
          <circle cx={x + 5.2} cy={y + 3} r="2.6" fill={color} />
          <circle cx={x - 5.2} cy={y + 3} r="2.6" fill={color} />
        </g>
      </g>
      <text x={x} y={y + 26} textAnchor="middle" fontSize="8" className="fill-gray-500">
        {label}
      </text>
    </g>
  );
}

function Bottle({ x, label, color }: { x: number; label: string; color: string }) {
  return (
    <g>
      <rect x={x} y={34} width="40" height="56" rx="4" fill="#0b0f16" stroke="#4b5563" strokeWidth="1.5" />
      <rect x={x + 14} y={24} width="12" height="12" rx="2" fill="#1f2937" stroke="#4b5563" />
      <rect x={x + 4} y={58} width="32" height="28" rx="2" fill={color} opacity="0.35" />
      <line x1={x + 4} y1={58} x2={x + 36} y2={58} stroke={color} strokeWidth="1.5" opacity="0.8" />
      <text x={x + 20} y={106} textAnchor="middle" fontSize="9" className="fill-gray-400" fontWeight="600">
        {label}
      </text>
    </g>
  );
}

export default function BucketLoop() {
  return (
    <svg viewBox="0 0 680 360" className="w-full h-auto" role="img">
      <title>Dutch bucket con dosificacion automatica de nutrientes en circuito cerrado</title>
      <defs>
        <linearGradient id="solution" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0.55" />
        </linearGradient>
        <clipPath id="tankClip">
          <rect x="72" y="212" width="172" height="106" rx="4" />
        </clipPath>
        <clipPath id="bucketClip">
          <path d="M 436 158 L 586 158 L 572 312 L 450 312 Z" />
        </clipPath>
      </defs>

      {/* ---- Tubing ---- */}
      <g fill="none" strokeLinecap="round">
        <path d={TUBES.doseA} stroke="#374151" strokeWidth="4" />
        <path d={TUBES.doseB} stroke="#374151" strokeWidth="4" />
        <path d={TUBES.dosePh} stroke="#374151" strokeWidth="4" />
        <path d={TUBES.feed} stroke="#374151" strokeWidth="6" />
        <path d={TUBES.drain} stroke="#374151" strokeWidth="5" strokeDasharray="1 0" />
      </g>

      {/* ---- Dosing bottles + peristaltic pumps ---- */}
      <Bottle x={32} label="A" color="#4ade80" />
      <Bottle x={88} label="B" color="#60a5fa" />
      <Bottle x={144} label="pH−" color="#fbbf24" />
      <Pump x={52} y={112} label="" color="#4ade80" />
      <Pump x={108} y={112} label="" color="#60a5fa" />
      <Pump x={164} y={112} label="" color="#fbbf24" />
      <text x="108" y="146" textAnchor="middle" fontSize="9" className="fill-gray-500">
        3× bomba peristaltica
      </text>

      <Droplets path={TUBES.doseA} color="#4ade80" count={3} dur={4.2} r={2.6} />
      <Droplets path={TUBES.doseB} color="#60a5fa" count={3} dur={4.6} r={2.6} />
      <Droplets path={TUBES.dosePh} color="#fbbf24" count={2} dur={5.4} r={2.6} />

      {/* ---- Reservoir ---- */}
      <rect x="72" y="212" width="172" height="106" rx="4" fill="#0b0f16" stroke="#4b5563" strokeWidth="1.5" />
      <g clipPath="url(#tankClip)">
        <rect x="72" y="244" width="172" height="74" fill="url(#solution)" />
        <path
          d="M 72 246 q 21 -5 43 0 t 43 0 t 43 0 t 43 0 v 20 H 72 Z"
          fill="#22d3ee"
          opacity="0.28"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; -43 0; 0 0"
            dur="5s"
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* EC + pH probes */}
      {[
        { x: 196, label: 'EC', color: '#a78bfa' },
        { x: 222, label: 'pH', color: '#fbbf24' },
      ].map((p) => (
        <g key={p.label}>
          <rect x={p.x} y="190" width="9" height="96" rx="3" fill="#1f2937" stroke={p.color} strokeWidth="1.2" />
          <circle cx={p.x + 4.5} cy="282" r="3.4" fill={p.color}>
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x={p.x + 4.5} y="184" textAnchor="middle" fontSize="8" className="fill-gray-400" fontWeight="600">
            {p.label}
          </text>
        </g>
      ))}
      <text x="130" y="334" textAnchor="middle" fontSize="9" className="fill-gray-500">
        estanque 5 gal · solucion
      </text>

      {/* ---- Feed pump ---- */}
      <Pump x={286} y={280} label="bomba de aporte" color="#22d3ee" />
      <Droplets path={TUBES.feed} color="#22d3ee" count={7} dur={5} />

      {/* ---- Drip emitter ---- */}
      <path d="M 496 72 L 512 72 L 512 96" fill="none" stroke="#4b5563" strokeWidth="4" strokeLinecap="round" />
      <text x="530" y="78" fontSize="9" className="fill-gray-500">
        goteo
      </text>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="512" cy="100" r="2.8" fill="#22d3ee" opacity="0">
          <animate attributeName="cy" values="100;176" dur="1.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" dur="1.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* ---- Strawberry plant ---- */}
      <g stroke="#4ade80" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M 511 158 V 126" />
        <path d="M 511 138 q -20 -14 -30 -3" />
        <path d="M 511 132 q 20 -15 30 -4" />
        <path d="M 511 146 q -24 -6 -32 6" />
        <path d="M 511 150 q 24 -7 32 5" />
      </g>
      <g>
        <circle cx="540" cy="152" r="6.5" fill="#dc2626" />
        <path d="M 540 145 l -5 -4 h 10 z" fill="#4ade80" />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 2.5; 0 0"
          dur="4s"
          repeatCount="indefinite"
        />
      </g>

      {/* ---- Dutch bucket cutaway ---- */}
      <path d="M 436 158 L 586 158 L 572 312 L 450 312 Z" fill="#0b0f16" stroke="#4b5563" strokeWidth="1.5" />
      <g clipPath="url(#bucketClip)">
        <rect x="436" y="176" width="150" height="136" fill="#1c2431" />
        {/* perlite / coco media */}
        {Array.from({ length: 54 }, (_, i) => {
          const gx = 448 + ((i * 37) % 126);
          const gy = 184 + ((i * 53) % 120);
          return <circle key={i} cx={gx} cy={gy} r={i % 3 === 0 ? 2.6 : 1.7} fill={i % 3 === 0 ? '#e5e7eb' : '#4b5563'} opacity="0.55" />;
        })}
        {/* roots */}
        <g stroke="#a16207" strokeWidth="1.3" fill="none" opacity="0.85" strokeLinecap="round">
          <path d="M 511 178 V 268" />
          <path d="M 511 200 q -22 18 -28 48" />
          <path d="M 511 206 q 24 16 30 46" />
          <path d="M 511 232 q -16 16 -18 34" />
          <path d="M 511 240 q 18 12 20 30" />
        </g>
        {/* percolating solution */}
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={470 + i * 27} cy="180" r="2" fill="#22d3ee" opacity="0">
            <animate attributeName="cy" values="180;300" dur="3.4s" begin={`${i * 0.85}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.8;0.8;0" dur="3.4s" begin={`${i * 0.85}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {/* drain layer */}
        <rect x="436" y="296" width="150" height="16" fill="#0e7490" opacity="0.4" />
      </g>
      <text x="511" y="330" textAnchor="middle" fontSize="9" className="fill-gray-500">
        Dutch bucket · corona seca, raiz oxigenada
      </text>

      {/* ---- Drain back to reservoir ---- */}
      <Droplets path={TUBES.drain} color="#0891b2" count={6} dur={6} />
      <text x="330" y="338" textAnchor="middle" fontSize="9" className="fill-gray-500">
        retorno — circuito cerrado
      </text>
    </svg>
  );
}
