import Image from 'next/image';
import Link from 'next/link';
import { PARTS } from '@/lib/inventory';
import { BUY, HAVE, HAVE_FIELD, buyTotal } from '@/lib/pozo';
import { Stat } from '../ui';

export default function Piezas() {
  const have = HAVE.map((h) => ({ ...h, p: PARTS.find((x) => x.id === h.part) })).filter((h) => h.p);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="En inventario" value={String(have.length)} sub="piezas de LeGrow con rol en la tapa" tone="text-green-400" />
        <Stat label="Por comprar" value={String(BUY.length)} sub={`${BUY.filter((b) => b.optional).length} opcional`} tone="text-orange-400" />
        <Stat label="Costo" value={`$${buyTotal()}`} sub={`$${buyTotal(false)} sin opcionales`} />
        <Stat label="Contra comercial" value="3-6x" sub="mas barato que sonico + telemetria" tone="text-gray-200" />
      </div>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-semibold text-gray-200">Ya en el inventario</h3>
          <Link href="/lab/inventario" className="text-xs font-mono text-sky-400 hover:text-sky-300">
            ver inventario completo →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {have.map(({ p, job }) => (
            <div key={p!.id} className="flex gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-950 border border-gray-800">
                <Image src={`/inventory/${p!.id}.jpg`} alt={p!.name} fill sizes="80px" className="object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 leading-tight">{p!.name}</p>
                <p className="text-[11px] font-mono text-gray-600 truncate">{p!.model ?? '—'}</p>
                <p className="text-xs text-gray-400 mt-1">{job}</p>
              </div>
            </div>
          ))}
          {HAVE_FIELD.map((f) => (
            <div key={f.item} className="flex gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="w-20 h-20 shrink-0 rounded-lg bg-gray-950 border border-gray-800 grid place-items-center text-sky-500">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M12 3v18 M8 21h8 M9 7h6 M9 11h6 M9 15h6" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 leading-tight">{f.item}</p>
                <p className="text-[11px] font-mono text-gray-600">equipo de campo</p>
                <p className="text-xs text-gray-400 mt-1">{f.job}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">Por comprar</h3>
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2">Pieza</th>
                <th className="px-4 py-2">Para que</th>
                <th className="px-4 py-2 text-right">USD</th>
              </tr>
            </thead>
            <tbody>
              {BUY.map((b) => (
                <tr key={b.item} className="border-t border-gray-800">
                  <td className="px-4 py-2 text-gray-200">
                    {b.item}
                    {b.optional && <span className="ml-2 text-[10px] font-mono text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded">si falta</span>}
                  </td>
                  <td className="px-4 py-2 text-gray-400">{b.job}</td>
                  <td className="px-4 py-2 text-right font-mono tabular-nums text-gray-300">${b.usd}</td>
                </tr>
              ))}
              <tr className="border-t border-gray-700">
                <td className="px-4 py-3 font-semibold text-gray-200">Total</td>
                <td className="px-4 py-3 text-gray-500">precios tipicos por unidad; varian por vendedor</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-sky-400">${buyTotal()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
