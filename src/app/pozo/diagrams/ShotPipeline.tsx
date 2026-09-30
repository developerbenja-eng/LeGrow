/** Lo que hace el firmware en un disparo (comando s), etapa por etapa. */

import { FS, recordMs } from '@/lib/pozo';

const FRAMES = Math.round((recordMs() * FS) / 1000);
const KB = Math.round((FRAMES * 8) / 1024);

const STAGES = [
  { t: 'sensorsRead', sub: 'BME280 + 3 DS18B20', out: ['T columna', 'presion', 'VBAT'], time: '~0.8 s' },
  { t: 'audioShot', sub: 'drena, graba, chirp', out: [`${FRAMES.toLocaleString('es-CL')} marcos`, `${KB} KB PSRAM`], time: `${Math.round(recordMs())} ms` },
  { t: 'echoAnalyze', sub: 'envolvente I/Q', out: ['t0, t agua', 'c coples', 'c par'], time: '< 1 s' },
  { t: 'storage', sub: 'microSD', out: ['00042.wav', 'fila CSV'], time: '~0.2 s' },
  { t: 'reporte', sub: 'serial hoy', out: ['Notecard: etapa 2'], time: '', future: true },
] as const;

export default function ShotPipeline() {
  const W = 150;
  const GAP = 28;
  const X = (i: number) => 20 + i * (W + GAP);

  return (
    <svg viewBox="0 0 900 300" className="w-full h-auto" role="img">
      <title>Etapas de un disparo en el firmware: leer sensores, grabar, analizar, guardar y enviar</title>
      <defs>
        <marker id="sp-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#9ca3af" />
        </marker>
      </defs>

      {STAGES.map((s, i) => (
        <g key={s.t}>
          <rect x={X(i)} y="60" width={W} height="58" rx="8" fill="#0b1220" stroke={'future' in s ? '#4b5563' : '#38bdf8'} strokeWidth="1.4" strokeDasharray={'future' in s ? '5 4' : undefined} />
          <text x={X(i) + 12} y="84" fontSize="12.5" fontWeight="700" className="fill-gray-200" fontFamily="monospace">
            {'future' in s ? s.t : `${s.t}()`}
          </text>
          <text x={X(i) + 12} y="102" fontSize="10.5" className="fill-gray-500">
            {s.sub}
          </text>
          {s.time && (
            <text x={X(i) + W / 2} y="48" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#f97316">
              {s.time}
            </text>
          )}
          {s.out.map((o, k) => (
            <g key={o}>
              <rect x={X(i) + 8} y={138 + k * 26} width={W - 16} height="20" rx="4" fill="#111827" stroke="#374151" />
              <text x={X(i) + 16} y={152 + k * 26} fontSize="10.5" className="fill-gray-300">
                {o}
              </text>
            </g>
          ))}
          {i < STAGES.length - 1 && (
            <line x1={X(i) + W} y1="89" x2={X(i + 1) - 2} y2="89" stroke="#9ca3af" strokeWidth="1.6" markerEnd="url(#sp-a)" strokeDasharray="6 4">
              <animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite" />
            </line>
          )}
        </g>
      ))}

      {/* Nucleos */}
      <rect x={X(1)} y="236" width={W} height="44" rx="6" fill="#111827" stroke="#a78bfa" strokeDasharray="4 3" />
      <text x={X(1) + 10} y="254" fontSize="10.5" fontWeight="600" fill="#a78bfa">tarea chirp · core 0</text>
      <text x={X(1) + 10} y="270" fontSize="10" className="fill-gray-500">escribe el chirp al TX</text>
      <path d={`M${X(1) + W / 2} 236 V214`} stroke="#a78bfa" strokeDasharray="3 3" markerEnd="url(#sp-a)" />
      <text x={X(2)} y="258" fontSize="10.5" className="fill-gray-400">
        loop() corre en core 1. La tarea del chirp espera una notificacion y escribe
      </text>
      <text x={X(2)} y="273" fontSize="10.5" className="fill-gray-400">
        el chirp mientras el loop sigue leyendo el RX, asi nunca se pierde un marco.
      </text>
    </svg>
  );
}
