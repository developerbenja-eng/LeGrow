import Link from 'next/link';
import type { Metadata } from 'next';
import { LAB_MODULES, moduleOpen } from '@/lib/lab-modules';
import { LOG, SPECIES, bomTotal } from '@/lib/lab-data';
import { EFFICACY, TARGETS, TENTS, areaM2, dli, monthlyCost, ppfd, vpd } from '@/lib/photometry';

export const metadata: Metadata = {
  title: 'LeGrow · Laboratorio',
  description: 'Banco de pruebas hidroponico 2x2: luz, nutrientes, clima, materiales y bitacora.',
};

const RIG = { watts: 70, hours: 17, tent: TENTS.find((t) => t.id === '2x2')! };

export default function LabOverview() {
  const area = areaM2(RIG.tent);
  const ppfdLow = ppfd(RIG.watts, EFFICACY.low, area);
  const ppfdHigh = ppfd(RIG.watts, EFFICACY.high, area);
  const total = bomTotal();
  const openTotal = LOG.filter((e) => e.state === 'open').length;

  const stats = [
    { label: 'Huella', value: '2 × 2', sub: `${area.toFixed(3)} m² · 4 baldes` },
    { label: 'Luz', value: `${RIG.watts} W`, sub: `${RIG.hours} h · ${Math.round(ppfdLow)}–${Math.round(ppfdHigh)} PPFD` },
    { label: 'Costo mensual', value: `$${monthlyCost(RIG.watts, RIG.hours).toFixed(2)}`, sub: 'MLGW · Memphis' },
    { label: 'Inversion', value: `$${total.low}–${total.high}`, sub: 'contra $640 del plan original' },
  ];

  // One live figure per module, so the board reads as a dashboard and not a menu.
  const METRIC: Record<string, string> = {
    luz: `${Math.round(ppfdLow)}–${Math.round(ppfdHigh)} PPFD · DLI ${dli(ppfdHigh, RIG.hours).toFixed(1)}`,
    planta: `Seascape · ${SPECIES.filter((s) => s.verdict === 'out').length} especies descartadas`,
    nutrientes: '3 bombas · circuito cerrado',
    vpd: `${vpd(24, 40).toFixed(2)} kPa en la esquina legal`,
    rotacion: 'diseno cruzado · 2 carpas',
    materiales: `$${total.low}–${total.high}`,
    experimento: 'n = 3 · piso de ruido',
    bitacora: `${openTotal} abiertos · ${LOG.length - openTotal} decididos`,
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-green-400">{s.value}</p>
            <p className="text-xs text-gray-600">{s.sub}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-200">Modulos</h2>
          {openTotal > 0 && (
            <p className="text-xs text-amber-500">
              {openTotal} punto{openTotal === 1 ? '' : 's'} abierto{openTotal === 1 ? '' : 's'}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LAB_MODULES.map((m, i) => {
            const open = moduleOpen(m.slug);
            return (
              <Link
                key={m.slug}
                href={`/lab/${m.slug}`}
                className="group relative bg-gray-900 border border-gray-800 hover:border-green-600 rounded-xl p-5 transition-colors flex flex-col"
              >
                {!!open && (
                  <span className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-mono text-amber-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {open}
                  </span>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <span className="shrink-0 w-9 h-9 rounded-lg bg-green-950 border border-green-900/60 grid place-items-center text-green-500 group-hover:text-green-400 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d={m.icon} />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[10px] font-mono text-gray-600">{String(i + 1).padStart(2, '0')}</p>
                    <h3 className="font-semibold text-gray-200 group-hover:text-green-400 transition-colors leading-tight">
                      {m.label}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-500 flex-1">{m.blurb}</p>
                <p className="mt-4 pt-3 border-t border-gray-800 text-xs font-mono text-green-500/90">
                  {METRIC[m.slug]}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-600 border-t border-gray-800 pt-6">
        Todos los numeros se calculan en <code className="text-gray-500">src/lib/photometry.ts</code> a partir de las
        constantes de los informes 01-08. Objetivos vigentes: PPFD {TARGETS.ppfd[0]}–{TARGETS.ppfd[1]} µmol/m²/s · DLI{' '}
        {TARGETS.dli[0]}–{TARGETS.dli[1]} mol/m²/dia · VPD {TARGETS.vpd[0]}–{TARGETS.vpd[1]} kPa · pH {TARGETS.ph[0]}–
        {TARGETS.ph[1]}. Agregar un modulo es una entrada en{' '}
        <code className="text-gray-500">src/lib/lab-modules.ts</code>.
      </p>
    </div>
  );
}
