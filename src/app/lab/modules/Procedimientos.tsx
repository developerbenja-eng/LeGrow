import CrownDepth from '../CrownDepth';
import BucketAssembly from '../BucketAssembly';
import { PHASES, PROCEDURES, byPhase, photoCount, warnCount, type Procedure } from '@/lib/procedures';
import { moduleBySlug } from '@/lib/lab-modules';
import Link from 'next/link';

/** Diagrams that belong inside a specific procedure. */
const FIGURES: Record<string, React.ComponentType> = {
  'armar-balde': BucketAssembly,
  plantar: CrownDepth,
};

const PHASE_TONE: Record<string, string> = {
  hoy: 'border-green-700',
  montaje: 'border-gray-800',
  arranque: 'border-gray-800',
  operacion: 'border-gray-800',
  instrumentacion: 'border-gray-800',
};

function ProcedureCard({ p }: { p: Procedure }) {
  const Figure = FIGURES[p.id];
  const mod = p.module ? moduleBySlug(p.module) : undefined;

  return (
    <article className={`bg-gray-900 border rounded-xl p-5 ${PHASE_TONE[p.phase]}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
        <h3 className="font-semibold text-gray-200">{p.title}</h3>
        <span className="text-[10px] font-mono text-gray-500 bg-gray-950 px-2 py-0.5 rounded">{p.time}</span>
        {mod && (
          <Link
            href={`/lab/${mod.slug}`}
            className="text-[10px] font-mono text-gray-500 hover:text-green-400 bg-gray-950 border border-gray-800 px-2 py-0.5 rounded transition-colors ml-auto"
          >
            por que → {mod.short}
          </Link>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-4">{p.blurb}</p>

      {p.needs && (
        <p className="text-xs text-gray-600 mb-4">
          <span className="uppercase tracking-wide">Necesitas:</span> {p.needs.join(' · ')}
        </p>
      )}

      {Figure && (
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-3 mb-4">
          <Figure />
        </div>
      )}

      <ol className="space-y-2 mb-4">
        {p.steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded h-fit shrink-0 ${
                s.warn ? 'text-amber-400 bg-amber-950/60' : 'text-green-500 bg-green-950'
              }`}
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className={`text-sm ${s.warn ? 'text-gray-200' : 'text-gray-400'}`}>{s.do}</p>
              {s.why && <p className="text-xs text-gray-600 mt-0.5">{s.why}</p>}
            </div>
          </li>
        ))}
      </ol>

      {p.photos && (
        <div className="border-t border-gray-800 pt-3 mb-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-600 mb-2">Fotografiar</p>
          <ul className="space-y-1">
            {p.photos.map((ph, i) => (
              <li key={i} className="text-xs text-gray-500 flex gap-2">
                <span className="text-sky-600 shrink-0">▢</span>
                {ph}
              </li>
            ))}
          </ul>
        </div>
      )}

      {p.sources && (
        <div className="border-t border-gray-800 pt-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-600 mb-2">Fuentes</p>
          <ul className="space-y-1">
            {p.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-green-400 transition-colors"
                >
                  {s.label} →
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export default function Procedimientos() {
  return (
    <div className="space-y-10">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { k: 'Procedimientos', v: `${PROCEDURES.length}`, s: `${PHASES.length} fases` },
          { k: 'Pasos criticos', v: `${warnCount()}`, s: 'marcados en ambar' },
          { k: 'Fotos por tomar', v: `${photoCount()}`, s: 'llenan esta guia' },
          { k: 'Hoy', v: `${byPhase('hoy').length}`, s: 'las plantas ya estan aqui' },
        ].map((c) => (
          <div key={c.k} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-500">{c.k}</p>
            <p className="text-2xl font-bold text-green-400">{c.v}</p>
            <p className="text-xs text-gray-600">{c.s}</p>
          </div>
        ))}
      </div>

      {/* Image policy */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-gray-200 mb-2">Sobre las imagenes</h3>
        <p className="text-sm text-gray-500">
          Los diagramas de esta guia son nuestros, dibujados contra este rig. Las figuras ajenas se{' '}
          <span className="text-gray-300">enlazan, no se embeben</span>: una pagina publica que carga figuras de otros
          es un problema de licencia, y ademas una foto del balde real documenta mejor que una foto del balde de otro.
        </p>
        <p className="text-sm text-gray-500 mt-3">
          Por eso cada procedimiento trae su lista de que fotografiar. Esas fotos entran por{' '}
          <code className="text-gray-500">scripts/ingest-inventory.mjs</code>, igual que las del inventario, y son las
          que van a ilustrar esto.
        </p>
      </div>

      {/* Procedures by phase */}
      {PHASES.map((phase) => {
        const items = byPhase(phase.id);
        if (items.length === 0) return null;
        return (
          <section key={phase.id}>
            <div className="flex items-baseline gap-3 mb-1">
              <span
                className={`text-xs font-mono px-2 py-1 rounded ${
                  phase.id === 'hoy' ? 'text-green-400 bg-green-950' : 'text-gray-500 bg-gray-950'
                }`}
              >
                {phase.label}
              </span>
              <span className="text-xs text-gray-600">
                {items.length} procedimiento{items.length === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-4">{phase.note}</p>
            <div className="space-y-4">
              {items.map((p) => (
                <ProcedureCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        );
      })}

      <p className="text-xs text-gray-600 border-t border-gray-800 pt-6">
        Un paso en ambar es uno donde equivocarse cuesta una planta, una sonda o la corrida entera. Agregar un
        procedimiento es una entrada en <code className="text-gray-500">src/lib/procedures.ts</code>; si le corresponde
        un diagrama, una linea en el mapa <code className="text-gray-500">FIGURES</code>.
      </p>
    </div>
  );
}
