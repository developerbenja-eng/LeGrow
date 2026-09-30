/**
 * Filtro adaptado, con numeros reales: un eco con menos amplitud que el ruido
 * es invisible en la senal cruda y se vuelve el segundo pico mas alto despues
 * de correlacionar contra el chirp. Todo se calcula al renderizar.
 */

const N = 1400;
const L = 240;
const DIRECT = 100;
const ECHO = 880;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function build() {
  const ti = new Float64Array(L);
  const tq = new Float64Array(L);
  for (let i = 0; i < L; i++) {
    const t = i / L;
    const ph = 2 * Math.PI * (0.02 * i + 0.5 * 0.18 * L * t * t);
    const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
    ti[i] = Math.sin(ph) * w;
    tq[i] = Math.cos(ph) * w;
  }
  const r = rng(7);
  const x = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const u = Math.max(1e-9, r());
    const v = r();
    x[i] = 0.12 * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  for (let i = 0; i < L; i++) {
    x[DIRECT + i] += 1.0 * ti[i];
    x[ECHO + i] += 0.2 * ti[i];
  }
  const env = new Float64Array(N - L);
  for (let n = 0; n < N - L; n++) {
    let si = 0;
    let sq = 0;
    for (let k = 0; k < L; k++) {
      si += x[n + k] * ti[k];
      sq += x[n + k] * tq[k];
    }
    env[n] = Math.hypot(si, sq);
  }
  return { x, env };
}

const { x: RAW, env: ENV } = build();
const W = 820;
const X0 = 50;
const px = (i: number) => X0 + (i / N) * W;

function path(arr: Float64Array, y0: number, scale: number) {
  let d = '';
  for (let i = 0; i < arr.length; i += 1) d += `${d ? ' L' : 'M'}${px(i).toFixed(1)} ${(y0 - arr[i] * scale).toFixed(1)}`;
  return d;
}

export default function MatchedFilter() {
  const envMax = Math.max(...ENV);
  const envLog = Float64Array.from(ENV, (v) => Math.log10(Math.max(v / envMax, 1e-3)) + 3); // 0..3
  const echoPeak = ENV.slice(ECHO - 30, ECHO + 30).reduce((m, v) => Math.max(m, v), 0);
  const floor = Math.sqrt(ENV.slice(DIRECT + L + 20, ECHO - 60).reduce((s, v) => s + v * v, 0) / (ECHO - 60 - DIRECT - L - 20));

  return (
    <svg viewBox="0 0 900 330" className="w-full h-auto" role="img">
      <title>Senal cruda con un eco escondido en el ruido, y el mismo registro despues del filtro adaptado donde el eco aparece como un pico claro</title>

      <text x={X0} y="22" fontSize="11" fontWeight="600" className="fill-gray-300">
        1 · senal cruda del mic: el eco del agua esta ahi, mas bajo que los picos del ruido
      </text>
      <line x1={X0} y1="90" x2={X0 + W} y2="90" stroke="#1f2937" />
      <path d={path(RAW, 90, 50)} fill="none" stroke="#9ca3af" strokeWidth="0.8" />
      <rect x={px(ECHO)} y="40" width={px(ECHO + L) - px(ECHO)} height="100" fill="#38bdf8" opacity="0.08" stroke="#38bdf8" strokeDasharray="3 3" />
      <text x={px(ECHO + L / 2)} y="154" textAnchor="middle" fontSize="10" fill="#38bdf8">
        aqui esta el eco
      </text>
      <text x={px(DIRECT)} y="154" fontSize="10" fill="#f97316">
        directo
      </text>

      <text x={X0} y="186" fontSize="11" fontWeight="600" className="fill-gray-300">
        2 · envolvente I/Q del filtro adaptado (escala log): el eco queda {(20 * Math.log10(echoPeak / floor)).toFixed(0)} dB sobre el piso
      </text>
      <line x1={X0} y1="310" x2={X0 + W} y2="310" stroke="#1f2937" />
      <path d={path(envLog, 310, 36)} fill="none" stroke="#e5e7eb" strokeWidth="1.1" />
      <line x1={px(DIRECT)} y1="196" x2={px(DIRECT)} y2="310" stroke="#f97316" strokeDasharray="2 3" />
      <line x1={px(ECHO)} y1="196" x2={px(ECHO)} y2="310" stroke="#38bdf8" strokeDasharray="2 3" />
      <text x={px(DIRECT) + 6} y="208" fontSize="10" fill="#f97316">
        t0
      </text>
      <text x={px(ECHO) + 6} y="208" fontSize="10" fill="#38bdf8">
        eco: pico + parabola = posicion sub-muestra
      </text>
    </svg>
  );
}
