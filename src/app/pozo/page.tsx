import Link from 'next/link';
import type { Metadata } from 'next';
import { POZO_SECTIONS } from '@/lib/pozo-modules';
import { BUY, HAVE, MODULES, NETS, STEPS, buyTotal, rangeStepMm, soundSpeed } from '@/lib/pozo';
import WellEcho from './diagrams/WellEcho';
import { StepsProgress } from './BuildSteps';
import { Stat } from './ui';

export const metadata: Metadata = {
  title: 'LeGrow · Tapa de eco',
  description: 'Tapa acustica para medir el nivel de agua en pozos de monitoreo: principio, cableado, energia, piezas impresas y armado.',
};

const METRIC: Record<string, string> = {
  principio: `c = ${soundSpeed(20).toFixed(1)} m/s a 20 °C · ${rangeStepMm().toFixed(1)} mm por muestra`,
  senal: 'un reloj I2S · 2 microfonos',
  cableado: `${MODULES.length} modulos · ${NETS.length} senales · 4 rieles`,
  energia: 'LiPo → BAT · 5 V · 3V3',
  impresion: '7 piezas · 1 archivo .scad',
  armado: `${STEPS.length} pasos con prueba`,
  piezas: `${HAVE.length} en inventario · ${BUY.length} por comprar`,
  firmware: '6 comandos · WAV + CSV',
};

export default function PozoOverview() {
  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] items-center">
        <div className="space-y-5">
          <p className="text-lg text-gray-300 max-w-xl">
            Una tapa que escucha su propio eco. Toca un chirp hacia el agua, graba lo que vuelve y convierte el tiempo de vuelo en profundidad al
            agua, sin meter nada en el pozo.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Profundidad" value="d = c·t/2" sub="c corregida por temperatura y coples" />
            <Stat label="Por comprar" value={`$${buyTotal()}`} sub={`${BUY.length} items; el resto ya esta`} tone="text-orange-400" />
          </div>
          <StepsProgress />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <WellEcho />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Secciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {POZO_SECTIONS.map((s, i) => (
            <Link
              key={s.slug}
              href={`/pozo/${s.slug}`}
              className="group bg-gray-900 border border-gray-800 hover:border-sky-600 rounded-xl p-5 transition-colors flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="shrink-0 w-9 h-9 rounded-lg bg-sky-950 border border-sky-900/60 grid place-items-center text-sky-500 group-hover:text-sky-400 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d={s.icon} />
                  </svg>
                </span>
                <div>
                  <p className="text-[10px] font-mono text-gray-600">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="font-semibold text-gray-200 group-hover:text-sky-400 transition-colors leading-tight">{s.label}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500 flex-1">{s.blurb}</p>
              <p className="mt-4 pt-3 border-t border-gray-800 text-xs font-mono text-sky-500/90">{METRIC[s.slug]}</p>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-600 border-t border-gray-800 pt-6">
        Todo sale de <code className="text-gray-500">src/lib/pozo.ts</code>: cambiar un pin, una cota o una pieza ahi la cambia en todos los
        diagramas. La geometria impresa vive en <code className="text-gray-500">public/pozo/well-echo-cap.scad</code>.
      </p>
    </div>
  );
}
