/**
 * Cadena de senal de un disparo. Lo que importa es la linea violeta: TX y RX
 * comparten BCLK y WS, asi que cada muestra grabada queda amarrada a la tocada.
 */

const INK = '#9ca3af';
const SOUND = '#f97316';
const WATER = '#38bdf8';
const CLK = '#a78bfa';

function Flow({ d, color = INK, marker = 'sc-a', width = 1.6 }: { d: string; color?: string; marker?: string; width?: number }) {
  return (
    <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray="7 5" markerEnd={`url(#${marker})`}>
      <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.2s" repeatCount="indefinite" />
    </path>
  );
}

function Box({ x, y, w, h = 46, title, sub, hot }: { x: number; y: number; w: number; h?: number; title: string; sub?: string; hot?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="7" fill="#111827" stroke={hot ? CLK : '#374151'} strokeWidth={hot ? 1.8 : 1.2} />
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

export default function SignalChain() {
  return (
    <svg viewBox="0 0 900 310" className="w-full h-auto" role="img">
      <title>
        La ESP32 manda el chirp por I2S al amplificador y al parlante; el sonido baja por el pozo y vuelve; mic A y mic B entran por el mismo
        I2S con el mismo reloj; la ESP32 correlaciona y guarda en la microSD o envia por el Notecard
      </title>
      <defs>
        {[
          ['sc-a', INK],
          ['sc-s', SOUND],
          ['sc-w', WATER],
        ].map(([id, c]) => (
          <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={c} />
          </marker>
        ))}
      </defs>

      <Box x={20} y={40} w={160} title="ESP32-S3 · I2S TX" sub="chirp 300–3500 Hz" />
      <Box x={240} y={40} w={140} title="MAX98357A" sub="clase D, 5 V" />
      <Box x={440} y={40} w={130} title="Parlante" sub="36 mm, cono abajo" />

      <rect x="650" y="30" width="120" height="240" rx="7" fill="#030712" stroke="#374151" />
      <rect x="651" y="234" width="118" height="35" fill={WATER} opacity="0.7" />
      <text x="710" y="52" textAnchor="middle" fontSize="12.5" fontWeight="600" className="fill-gray-200">
        aire del pozo
      </text>
      <Flow d="M690 70 V226" color={SOUND} marker="sc-s" width={2} />
      <Flow d="M730 226 V70" color={WATER} marker="sc-w" width={2} />
      <text x="784" y="140" fontSize="10.5" className="fill-gray-500">baja y</text>
      <text x="784" y="154" fontSize="10.5" className="fill-gray-500">rebota</text>

      <Box x={440} y={146} w={130} title="Mic A" sub="referencia · canal L" />
      <Box x={440} y={222} w={130} title="Mic B" sub="colgante · canal R" />
      <Box x={240} y={184} w={140} title="ESP32-S3 · I2S RX" sub="estereo, mismo reloj" hot />
      <Box x={20} y={184} w={160} title="Correlacion I/Q" sub="picos → c, profundidad" />
      <Box x={20} y={258} w={74} h={38} title="microSD" />
      <Box x={106} y={258} w={74} h={38} title="Notecard" />

      <Flow d="M180 63 H238" />
      <text x="209" y="55" textAnchor="middle" fontSize="10" className="fill-gray-500">DOUT</text>
      <Flow d="M380 63 H438" />
      <text x="409" y="55" textAnchor="middle" fontSize="10" className="fill-gray-500">+ / −</text>
      <Flow d="M570 63 H648" color={SOUND} marker="sc-s" width={2} />
      <text x="609" y="55" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={SOUND}>chirp</text>
      <Flow d="M505 86 V144" color={SOUND} marker="sc-s" width={2} />
      <text x="512" y="120" fontSize="10.5" fontWeight="600" fill={SOUND}>directo</text>
      <Flow d="M650 169 H572" color={WATER} marker="sc-w" width={2} />
      <text x="611" y="162" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={WATER}>ecos</text>
      <Flow d="M650 245 H572" color={WATER} marker="sc-w" width={2} />
      <text x="611" y="238" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={WATER}>ecos</text>
      <Flow d="M440 169 H410 V199 H382" />
      <Flow d="M440 245 H410 V215 H382" />
      <text x="396" y="266" textAnchor="middle" fontSize="10" className="fill-gray-500">SD → GPIO 15</text>
      <Flow d="M240 207 H182" />
      <text x="211" y="199" textAnchor="middle" fontSize="10" className="fill-gray-500">marcos</text>
      <Flow d="M57 230 V256" />
      <Flow d="M143 230 V256" />

      {/* El reloj compartido */}
      <path d="M100 86 V124 H310 V182" fill="none" stroke={CLK} strokeWidth="1.6" strokeDasharray="4 4" />
      <text x="112" y="117" fontSize="11" fontWeight="600" fill={CLK}>
        mismo BCLK + WS → muestra a muestra
      </text>
    </svg>
  );
}
