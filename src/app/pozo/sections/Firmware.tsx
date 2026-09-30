import ShotPipeline from '../diagrams/ShotPipeline';
import { Figure, Note, SectionHead } from '../ui';
import { COMMANDS, CSV_COLUMNS, CHIRP, REC } from '@/lib/pozo';

const CONFIG = [
  { k: 'MIC_A_TO_TOC_M', v: '0.00', what: 'Altura del mic A sobre la marca de tope de casing. La sonda mide desde esa misma marca.' },
  { k: 'MIC_SPACING_M', v: '0.75', what: 'Mic A a mic B, medido sobre el cable colgante.' },
  { k: 'JOINT_SPACING_M', v: '6.096', what: '20 ft. Para tramos de 10 ft: 3.048.' },
  { k: 'CHIRP_F1_HZ', v: String(CHIRP.f1), what: '2" de casing. Para 4": 1800.' },
  { k: 'MIC_A_SLOT', v: '0', what: 'Si la prueba de golpe (l) muestra el mic A a la derecha, poner 1.' },
  { k: 'MAX_DEPTH_M', v: String(REC.maxDepthM), what: 'Fija el largo de la grabacion.' },
] as const;

export default function Firmware() {
  return (
    <div className="space-y-10">
      <Figure
        title="Un disparo en el firmware"
        caption="Cada etapa deja un dato para la siguiente. Los tiempos son estimados; el comando s imprime los reales de cada disparo. La correlacion es la parte pesada."
        minWidth={760}
      >
        <ShotPipeline />
      </Figure>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <SectionHead kicker="Serial · 115200" title="Comandos" />
          <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
            {COMMANDS.map((c) => (
              <div key={c.key} className="flex items-center gap-4 px-4 py-3">
                <kbd className="w-8 h-8 grid place-items-center rounded-md bg-gray-950 border border-gray-700 font-mono text-sky-400">{c.key}</kbd>
                <p className="flex-1 text-sm text-gray-300">{c.what}</p>
                <span className="text-[10px] font-mono text-gray-600">paso {c.step}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHead kicker="config.h" title="Antes del primer disparo real" />
          <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
            {CONFIG.map((c) => (
              <div key={c.k} className="px-4 py-3">
                <p className="font-mono text-sm">
                  <span className="text-gray-200">{c.k}</span> <span className="text-sky-400">{c.v}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{c.what}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="space-y-3">
        <SectionHead kicker="microSD" title="shots.csv: una fila por disparo">
          <p>Cada fila apunta a su WAV crudo en /shots. Las columnas con _m son metros bajo el tope de casing.</p>
        </SectionHead>
        <div className="flex flex-wrap gap-1.5">
          {CSV_COLUMNS.map((c) => (
            <span key={c} className="text-xs font-mono px-2 py-1 rounded bg-gray-900 border border-gray-800 text-gray-300">
              {c}
            </span>
          ))}
        </div>
      </section>

      <Note tone="info" title="Donde vive el codigo">
        El firmware es un proyecto PlatformIO aparte (well-echo-cap/firmware, Arduino core 3.x via pioarduino) con una herramienta de Python que
        grafica los WAV y corre una autoprueba sobre pozos sinteticos. En Windows, fijar PLATFORMIO_CORE_DIR=C:\pio: algunas rutas del core
        superan los 260 caracteres.
      </Note>
    </div>
  );
}
