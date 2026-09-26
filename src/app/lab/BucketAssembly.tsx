/**
 * Dutch bucket in cutaway, with the detail that makes it a Dutch bucket.
 *
 * The fitting is not a drain hole: it is a siphon elbow set above the floor,
 * so 2-5 cm of solution stays behind as a permanent reserve. That reserve is
 * what saves the roots when an irrigation cycle is missed, and it is the
 * difference between this and a pot with a hole in it.
 */

const B = { x: 150, top: 120, bot: 330, topW: 200, botW: 168 };
const MEDIA_TOP = B.top + 26;
const RESERVE_TOP = B.bot - 38;

const lx = (y: number) => {
  const t = (y - B.top) / (B.bot - B.top);
  return B.x + (B.topW - B.botW) / 2 * t;
};
const rx = (y: number) => B.x + B.topW - ((B.topW - B.botW) / 2) * t2(y);
function t2(y: number) {
  return (y - B.top) / (B.bot - B.top);
}

export default function BucketAssembly() {
  return (
    <svg viewBox="0 0 620 400" className="w-full h-auto" role="img">
      <title>Corte del Dutch bucket con el codo sifon y su reserva</title>
      <defs>
        <linearGradient id="sol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0e7490" stopOpacity="0.6" />
        </linearGradient>
        <clipPath id="bucketInner">
          <path d={`M ${lx(B.top)} ${B.top} L ${rx(B.top)} ${B.top} L ${rx(B.bot)} ${B.bot} L ${lx(B.bot)} ${B.bot} Z`} />
        </clipPath>
        <marker id="ar" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="#4ade80" />
        </marker>
      </defs>

      {/* Dripper */}
      <path d="M 210 44 H 268 V 86" fill="none" stroke="#4b5563" strokeWidth="5" strokeLinecap="round" />
      <text x="150" y="40" fontSize="10" className="fill-gray-400" fontWeight="600">
        gotero
      </text>
      <text x="150" y="53" fontSize="9" className="fill-gray-600">
        desplazado del centro
      </text>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="268" cy="92" r="3" fill="#22d3ee" opacity="0">
          <animate attributeName="cy" values="92;146" dur="1.6s" begin={`${i * 0.53}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" dur="1.6s" begin={`${i * 0.53}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Bucket shell */}
      <path
        d={`M ${lx(B.top)} ${B.top} L ${rx(B.top)} ${B.top} L ${rx(B.bot)} ${B.bot} L ${lx(B.bot)} ${B.bot} Z`}
        fill="#0b0f16"
        stroke="#6b7280"
        strokeWidth="2"
      />

      <g clipPath="url(#bucketInner)">
        {/* Media */}
        <rect x={B.x - 10} y={MEDIA_TOP} width={B.topW + 20} height={B.bot - MEDIA_TOP} fill="#1c2431" />
        {Array.from({ length: 70 }, (_, i) => {
          const gx = B.x + 12 + ((i * 47) % (B.topW - 24));
          const gy = MEDIA_TOP + 8 + ((i * 29) % (B.bot - MEDIA_TOP - 16));
          return (
            <circle key={i} cx={gx} cy={gy} r={i % 3 === 0 ? 3 : 2} fill={i % 3 === 0 ? '#e5e7eb' : '#4b5563'} opacity="0.55" />
          );
        })}
        {/* Retained reserve */}
        <rect x={B.x - 10} y={RESERVE_TOP} width={B.topW + 20} height={B.bot - RESERVE_TOP} fill="url(#sol)" />
        {/* Percolating droplets */}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={250 + i * 6} cy={MEDIA_TOP} r="2.4" fill="#22d3ee" opacity="0">
            <animate attributeName="cy" values={`${MEDIA_TOP};${RESERVE_TOP}`} dur="3.2s" begin={`${i}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.85;0.85;0" dur="3.2s" begin={`${i}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {/* Roots */}
        <g stroke="#a16207" strokeWidth="1.6" fill="none" opacity="0.9" strokeLinecap="round">
          <path d={`M 250 ${MEDIA_TOP} V ${RESERVE_TOP + 10}`} />
          <path d={`M 250 ${MEDIA_TOP + 34} q -34 26 -42 64`} />
          <path d={`M 250 ${MEDIA_TOP + 42} q 36 24 44 60`} />
          <path d={`M 250 ${MEDIA_TOP + 76} q -22 20 -26 40`} />
        </g>
      </g>

      {/* Crown + plant at the media surface */}
      <ellipse cx="250" cy={MEDIA_TOP} rx="19" ry="8" fill="#3f2d12" stroke="#a16207" strokeWidth="1.6" />
      <g stroke="#4ade80" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d={`M 250 ${MEDIA_TOP - 7} V ${MEDIA_TOP - 34}`} />
        <path d={`M 250 ${MEDIA_TOP - 28} q -22 -14 -32 -2`} />
        <path d={`M 250 ${MEDIA_TOP - 32} q 22 -15 32 -3`} />
      </g>
      <line x1={lx(MEDIA_TOP)} y1={MEDIA_TOP} x2={rx(MEDIA_TOP)} y2={MEDIA_TOP} stroke="#6b7280" strokeWidth="1.6" />
      <text x={rx(MEDIA_TOP) + 12} y={MEDIA_TOP - 4} fontSize="10" className="fill-gray-300" fontWeight="600">
        punto medio de la corona
      </text>
      <text x={rx(MEDIA_TOP) + 12} y={MEDIA_TOP + 10} fontSize="9" className="fill-gray-500">
        al nivel de la superficie
      </text>

      {/* Siphon elbow */}
      <path
        d={`M ${rx(RESERVE_TOP)} ${B.bot - 14} H 418 V ${RESERVE_TOP} H 400`}
        fill="none"
        stroke="#4ade80"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle r="4" cx="0" cy="0" fill="#22d3ee">
        <animateMotion
          path={`M ${rx(RESERVE_TOP)} ${B.bot - 14} H 418 V ${RESERVE_TOP} H 400`}
          dur="2.6s"
          repeatCount="indefinite"
        />
      </circle>
      <text x="432" y={RESERVE_TOP - 6} fontSize="11" className="fill-green-400" fontWeight="700">
        codo sifon
      </text>
      <text x="432" y={RESERVE_TOP + 8} fontSize="9" className="fill-gray-500">
        fija el nivel retenido
      </text>
      <text x="432" y={RESERVE_TOP + 21} fontSize="9" className="fill-gray-500">
        y drena el resto
      </text>

      {/* Reserve callout */}
      <g stroke="#22d3ee" strokeWidth="1.4">
        <line x1={lx(RESERVE_TOP) - 16} y1={RESERVE_TOP} x2={lx(RESERVE_TOP) - 16} y2={B.bot} strokeDasharray="3 2" />
        <line x1={lx(RESERVE_TOP) - 22} y1={RESERVE_TOP} x2={lx(RESERVE_TOP) - 10} y2={RESERVE_TOP} />
        <line x1={lx(B.bot) - 22} y1={B.bot} x2={lx(B.bot) - 10} y2={B.bot} />
      </g>
      <text x={lx(RESERVE_TOP) - 26} y={(RESERVE_TOP + B.bot) / 2} textAnchor="end" fontSize="11" className="fill-cyan-400" fontWeight="700">
        2–5 cm
      </text>
      <text x={lx(RESERVE_TOP) - 26} y={(RESERVE_TOP + B.bot) / 2 + 14} textAnchor="end" fontSize="9" className="fill-gray-500">
        reserva permanente
      </text>

      {/* Return */}
      <path d="M 418 340 V 368 H 96" fill="none" stroke="#374151" strokeWidth="5" strokeLinecap="round" markerEnd="url(#ar)" />
      <text x="150" y="384" fontSize="9" className="fill-gray-500">
        retorno al estanque, que va FUERA de la carpa
      </text>

      {/* Not a drain hole */}
      <text x="24" y="92" fontSize="10" className="fill-red-400" fontWeight="600">
        No es un agujero de desague
      </text>
      <text x="24" y="105" fontSize="9" className="fill-gray-500">
        Esa reserva es lo que salva la raiz si se pierde un riego.
      </text>
    </svg>
  );
}
