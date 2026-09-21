import Image from 'next/image';
import { CATEGORIES, PARTS, partsIn, short, unassigned, type Part } from '@/lib/inventory';

const KIND_TONE: Record<string, string> = {
  power: 'text-red-400 bg-red-950/50',
  gnd: 'text-gray-400 bg-gray-950',
  signal: 'text-green-400 bg-green-950',
  analog: 'text-sky-400 bg-sky-950/60',
  unknown: 'text-amber-400 bg-amber-950/50',
};

function PartCard({ p }: { p: Part }) {
  const isShort = p.needed !== undefined && p.qty < p.needed;
  return (
    <article className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] bg-gray-950 border-b border-gray-800">
        <Image
          src={`/inventory/${p.id}.jpg`}
          alt={p.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
        />
        <span className="absolute top-2 left-2 text-[10px] font-mono text-green-500 bg-green-950/90 px-2 py-1 rounded">
          {p.category}
        </span>
        <span
          className={`absolute top-2 right-2 text-[10px] font-mono px-2 py-1 rounded ${
            isShort ? 'text-amber-400 bg-amber-950/90' : 'text-gray-400 bg-gray-950/90'
          }`}
        >
          {p.qty}
          {p.needed !== undefined && ` / ${p.needed}`}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        <div>
          <h3 className="font-semibold text-gray-200 leading-tight">{p.name}</h3>
          <p className="text-xs text-gray-600 font-mono mt-0.5">
            {[p.brand, p.model].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>

        {/* Role */}
        <div className={`rounded-lg px-3 py-2 ${p.role ? 'bg-gray-950 border border-gray-800' : 'bg-amber-950/30 border border-amber-900/50'}`}>
          <p className="text-[10px] uppercase tracking-wide text-gray-600">Rol en el rig</p>
          <p className={`text-sm ${p.role ? 'text-gray-300' : 'text-amber-400'}`}>{p.role ?? 'Sin asignar'}</p>
        </div>

        {/* Specs */}
        <dl className="text-sm">
          {p.specs.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 py-1 border-t border-gray-800 first:border-t-0">
              <dt className="text-gray-500">{k}</dt>
              <dd className="text-gray-300 font-mono text-right">{v}</dd>
            </div>
          ))}
        </dl>

        {/* Pins */}
        {p.pins && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-600 mb-2">Interfaz electrica</p>
            <div className="space-y-1.5">
              {p.pins.map((pin, i) => (
                <div key={`${pin.name}-${i}`} className="flex flex-wrap items-baseline gap-2">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${KIND_TONE[pin.kind]}`}>
                    {pin.name}
                  </span>
                  {pin.note && <span className="text-xs text-gray-500 flex-1 min-w-0">{pin.note}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gotchas */}
        {p.gotchas && (
          <div className="mt-auto pt-3 border-t border-gray-800">
            <p className="text-[10px] uppercase tracking-wide text-gray-600 mb-2">Lo que hay que saber</p>
            <ul className="space-y-1.5">
              {p.gotchas.map((g, i) => (
                <li key={i} className="text-xs text-gray-500 flex gap-2">
                  <span className="text-amber-600 shrink-0">·</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Inventario() {
  const missing = short();
  const idle = unassigned();

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { k: 'Piezas', v: `${PARTS.length}`, s: 'fotografiadas' },
          { k: 'Faltan unidades', v: `${missing.length}`, s: missing.map((p) => `${p.needed! - p.qty}× ${p.model ?? p.name}`).join(' · ') || 'ninguna' },
          { k: 'Sin asignar', v: `${idle.length}`, s: idle.map((p) => p.name).join(' · ') || 'todo asignado' },
          { k: 'Categorias', v: `${CATEGORIES.length}`, s: CATEGORIES.join(' · ') },
        ].map((c) => (
          <div key={c.k} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-500">{c.k}</p>
            <p className="text-2xl font-bold text-green-400">{c.v}</p>
            <p className="text-xs text-gray-600 leading-tight mt-0.5">{c.s}</p>
          </div>
        ))}
      </div>

      {missing.length > 0 && (
        <div className="bg-gray-900 border border-amber-800/50 rounded-xl p-5">
          <h3 className="font-semibold text-amber-400 mb-2">Faltan unidades para el rig completo</h3>
          <ul className="space-y-1">
            {missing.map((p) => (
              <li key={p.id} className="text-sm text-gray-400">
                <span className="text-gray-200 font-semibold">
                  {p.needed! - p.qty}× {p.name}
                </span>{' '}
                — hay {p.qty}, el rig pide {p.needed}. {p.role}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Parts by category */}
      {CATEGORIES.map((cat) => {
        const items = partsIn(cat);
        if (items.length === 0) return null;
        return (
          <section key={cat}>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-xs font-mono text-green-500 bg-green-950 px-2 py-1 rounded">{cat}</span>
              <span className="text-xs text-gray-600">
                {items.length} pieza{items.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((p) => (
                <PartCard key={p.id} p={p} />
              ))}
            </div>
          </section>
        );
      })}

      <p className="text-xs text-gray-600 border-t border-gray-800 pt-6">
        Cada pieza lleva su interfaz electrica junto a la foto, para que un diagrama de conexion no tenga que suponer
        nada. Agregar piezas es una entrada en <code className="text-gray-500">src/lib/inventory.ts</code> y una foto
        procesada con <code className="text-gray-500">scripts/ingest-inventory.mjs</code>, que la reduce de camino al
        repo.
      </p>
    </div>
  );
}
