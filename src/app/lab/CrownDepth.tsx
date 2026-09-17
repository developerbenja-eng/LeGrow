/**
 * The one-centimetre error.
 *
 * The strawberry crown is a compressed stem, not root and not leaf. Report 05
 * step 8 says "plant crown at soil level". Buried it rots, exposed it dries.
 * This is the single most common way a strawberry planting fails.
 */

const SURFACE = 112;
const BOTTOM = 226;
const PANEL_W = 200;

type PanelProps = {
  x: number;
  /** Crown offset from the media surface. Positive is buried. */
  offset: number;
  title: string;
  verdict: string;
  tone: 'bad' | 'good';
};

const TONE = {
  bad: { stroke: '#f87171', text: 'fill-red-400', halo: '#f87171' },
  good: { stroke: '#4ade80', text: 'fill-green-400', halo: '#4ade80' },
} as const;

function Panel({ x, offset, title, verdict, tone }: PanelProps) {
  const cx = x + PANEL_W / 2;
  const crownY = SURFACE + offset;
  const t = TONE[tone];
  const buried = offset > 0;

  return (
    <g>
      {/* Media */}
      <rect x={x + 18} y={SURFACE} width={PANEL_W - 36} height={BOTTOM - SURFACE} fill="#1c2431" />
      {Array.from({ length: 22 }, (_, i) => (
        <circle
          key={i}
          cx={x + 26 + ((i * 41) % (PANEL_W - 52))}
          cy={SURFACE + 8 + ((i * 37) % (BOTTOM - SURFACE - 14))}
          r={i % 3 === 0 ? 2.4 : 1.6}
          fill={i % 3 === 0 ? '#e5e7eb' : '#4b5563'}
          opacity="0.5"
        />
      ))}

      {/* Roots */}
      <g stroke="#a16207" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.9">
        <path d={`M ${cx} ${crownY + 5} V ${crownY + 62}`} />
        <path d={`M ${cx} ${crownY + 18} q -20 16 -24 42`} />
        <path d={`M ${cx} ${crownY + 22} q 20 14 24 40`} />
      </g>

      {/* Crown */}
      <ellipse cx={cx} cy={crownY} rx="17" ry="7.5" fill="#3f2d12" stroke="#a16207" strokeWidth="1.6" />

      {/* Leaves */}
      <g stroke="#4ade80" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d={`M ${cx} ${crownY - 6} V ${crownY - 30}`} />
        <path d={`M ${cx} ${crownY - 24} q -18 -12 -26 -2`} />
        <path d={`M ${cx} ${crownY - 28} q 18 -13 26 -3`} />
        <path d={`M ${cx} ${crownY - 14} q -22 -5 -28 6`} />
      </g>

      {/* When buried, media covers the crown */}
      {buried && (
        <>
          <rect x={x + 18} y={SURFACE} width={PANEL_W - 36} height={offset + 10} fill="#1c2431" opacity="0.92" />
          {Array.from({ length: 7 }, (_, i) => (
            <circle key={i} cx={x + 30 + i * 24} cy={SURFACE + 6 + ((i * 13) % 12)} r="2.2" fill="#4b5563" opacity="0.7" />
          ))}
        </>
      )}

      {/* Media surface */}
      <line x1={x + 18} y1={SURFACE} x2={x + PANEL_W - 18} y2={SURFACE} stroke="#6b7280" strokeWidth="1.6" />

      {/* Status halo on the crown */}
      <circle cx={cx} cy={crownY} r="20" fill="none" stroke={t.halo} strokeWidth="1.6">
        <animate attributeName="r" values="20;34;20" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.85;0;0.85" dur="2.6s" repeatCount="indefinite" />
      </circle>

      {/* Depth callout */}
      {offset !== 0 && (
        <g stroke={t.stroke} strokeWidth="1.2">
          <line x1={x + 30} y1={SURFACE} x2={x + 30} y2={crownY} strokeDasharray="3 2" />
          <line x1={x + 26} y1={SURFACE} x2={x + 34} y2={SURFACE} />
          <line x1={x + 26} y1={crownY} x2={x + 34} y2={crownY} />
        </g>
      )}

      <text x={cx} y={30} textAnchor="middle" fontSize="12" fontWeight="700" className={t.text}>
        {title}
      </text>
      <text x={cx} y={BOTTOM + 22} textAnchor="middle" fontSize="10" className="fill-gray-500">
        {verdict}
      </text>
    </g>
  );
}

export default function CrownDepth() {
  return (
    <svg viewBox="0 0 620 262" className="w-full h-auto" role="img">
      <title>Profundidad de plantacion de la corona de frutilla</title>
      <Panel x={0} offset={20} title="Muy profunda" verdict="La corona se pudre" tone="bad" />
      <Panel x={210} offset={0} title="Al ras" verdict="Correcto" tone="good" />
      <Panel x={420} offset={-22} title="Muy alta" verdict="La corona se seca" tone="bad" />
      <text x="310" y="52" textAnchor="middle" fontSize="10" className="fill-gray-600">
        La corona es un tallo comprimido — ni raiz ni hoja. El margen es de un centimetro.
      </text>
    </svg>
  );
}
