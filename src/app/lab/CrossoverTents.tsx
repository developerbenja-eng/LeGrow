/**
 * Crossover design across two tents.
 *
 * Two tents are never identical — different fixture, position, airflow. If the
 * treatment always lives in tent A, the tent effect is confounded with the
 * treatment effect and cannot be separated. Alternating which tent carries the
 * treatment cancels the tent bias by subtraction.
 */

const TENT = { w: 150, h: 138, top: 116 };
const A_CX = 150;
const B_CX = 410;
const SWAP = B_CX - A_CX;

const KEY_TIMES = '0; 0.33; 0.42; 0.5; 0.83; 0.92; 1';
const DUR = '10s';

function Tent({ cx, label }: { cx: number; label: string }) {
  const x = cx - TENT.w / 2;
  const floorY = TENT.top + TENT.h;
  return (
    <g>
      <rect x={x} y={TENT.top} width={TENT.w} height={TENT.h} rx="4" fill="#0b0f16" stroke="#4b5563" strokeWidth="1.6" />
      {/* Light bar */}
      <rect x={cx - 42} y={TENT.top + 16} width="84" height="8" rx="2.5" fill="#1f2937" stroke="#6b7280" />
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={i} cx={cx - 34 + i * 17} cy={TENT.top + 20} r="1.8" fill="#bbf7d0">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Buckets */}
      {[-1, 0, 1].map((i) => {
        const bx = cx + i * 40;
        return (
          <g key={i}>
            <path
              d={`M ${bx - 14} ${floorY - 30} L ${bx + 14} ${floorY - 30} L ${bx + 11} ${floorY - 6} L ${bx - 11} ${floorY - 6} Z`}
              fill="#1f2937"
              stroke="#4b5563"
            />
            <g stroke="#4ade80" strokeWidth="1.4" fill="none" strokeLinecap="round">
              <path d={`M ${bx} ${floorY - 30} V ${floorY - 42}`} />
              <path d={`M ${bx} ${floorY - 39} q -8 -5 -11 -1`} />
              <path d={`M ${bx} ${floorY - 41} q 8 -5 11 -1`} />
            </g>
          </g>
        );
      })}
      <text x={cx} y={floorY + 20} textAnchor="middle" fontSize="12" className="fill-gray-300" fontWeight="700">
        {label}
      </text>
    </g>
  );
}

function Badge({ cx, label, tone, mirror }: { cx: number; label: string; tone: 'treat' | 'ctrl'; mirror: boolean }) {
  const s = mirror ? -1 : 1;
  const values = [
    '0 0',
    '0 0',
    `${s * (SWAP / 2)} ${mirror ? 26 : -26}`,
    `${s * SWAP} 0`,
    `${s * SWAP} 0`,
    `${s * (SWAP / 2)} ${mirror ? -26 : 26}`,
    '0 0',
  ].join('; ');

  const fill = tone === 'treat' ? '#14532d' : '#1f2937';
  const stroke = tone === 'treat' ? '#4ade80' : '#6b7280';
  const text = tone === 'treat' ? 'fill-green-400' : 'fill-gray-400';

  return (
    <g>
      <animateTransform
        attributeName="transform"
        type="translate"
        values={values}
        keyTimes={KEY_TIMES}
        dur={DUR}
        repeatCount="indefinite"
        calcMode="spline"
        keySplines="0 0 1 1; .4 0 .2 1; .4 0 .2 1; 0 0 1 1; .4 0 .2 1; .4 0 .2 1"
      />
      <rect x={cx - 56} y={56} width="112" height="28" rx="14" fill={fill} stroke={stroke} strokeWidth="1.6" />
      <text x={cx} y={74} textAnchor="middle" fontSize="11" fontWeight="700" className={text}>
        {label}
      </text>
    </g>
  );
}

export default function CrossoverTents() {
  return (
    <svg viewBox="0 0 560 310" className="w-full h-auto" role="img">
      <title>Diseno cruzado: el rol de tratamiento alterna entre las dos carpas</title>

      {/* Cycle label */}
      <g>
        <text x="280" y="28" textAnchor="middle" fontSize="12" fontWeight="700" className="fill-gray-300">
          Ciclo 1
          <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0; 0.42; 0.5; 0.92; 1" dur={DUR} repeatCount="indefinite" />
        </text>
        <text x="280" y="28" textAnchor="middle" fontSize="12" fontWeight="700" className="fill-gray-300">
          Ciclo 2
          <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0; 0.42; 0.5; 0.92; 1" dur={DUR} repeatCount="indefinite" />
        </text>
      </g>

      {/* Swap guides */}
      <path
        d={`M ${A_CX} 44 C ${A_CX + 70} 14, ${B_CX - 70} 14, ${B_CX} 44`}
        fill="none"
        stroke="#374151"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />
      <path
        d={`M ${B_CX} 96 C ${B_CX - 70} 126, ${A_CX + 70} 126, ${A_CX} 96`}
        fill="none"
        stroke="#374151"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />

      <Badge cx={A_CX} label="Tratamiento" tone="treat" mirror={false} />
      <Badge cx={B_CX} label="Control" tone="ctrl" mirror />

      <Tent cx={A_CX} label="Carpa A" />
      <Tent cx={B_CX} label="Carpa B" />

      <text x="280" y="296" textAnchor="middle" fontSize="10" className="fill-gray-500">
        El rol viaja; las carpas se quedan quietas.
      </text>
    </svg>
  );
}
