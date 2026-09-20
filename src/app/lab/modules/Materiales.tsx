import { BOM, bomBlocking, bomOrdered, bomPending, bomSum, type BomItem } from '@/lib/lab-data';

const TIERS = [
  { n: 0 as const, t: 'Sin esto no se puede plantar', d: 'Bloquea meter las coronas en los baldes.' },
  { n: 1 as const, t: 'Primeras seis semanas', d: 'El ventilador recien hace falta en floracion, semana 6-8.' },
  { n: 2 as const, t: 'La capa de instrumento', d: 'Es nuestro proyecto, pero las plantas no saben que existe.' },
];

function price(b: BomItem) {
  return b.low === b.high ? `$${b.low.toFixed(2)}` : `$${b.low}–${b.high}`;
}

function Row({ b }: { b: BomItem }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 border-t border-gray-800 first:border-t-0">
      <span className={`text-sm ${b.status === 'ordered' ? 'text-gray-500' : 'text-gray-200'}`}>
        {b.status === 'ordered' && <span className="text-green-600 mr-1.5">✓</span>}
        {b.item}
      </span>
      <span
        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
          b.source === 'local' ? 'text-sky-400 bg-sky-950/60' : 'text-gray-500 bg-gray-950'
        }`}
      >
        {b.source}
      </span>
      <span className="text-sm font-mono text-gray-400 ml-auto whitespace-nowrap">{price(b)}</span>
      {b.note && <p className="w-full text-xs text-gray-600 pr-16">{b.note}</p>}
    </div>
  );
}

export default function Materiales() {
  const ordered = bomOrdered();
  const pending = bomPending();
  const blocking = bomBlocking();
  const orderedSum = bomSum(ordered);
  const pendingOnline = bomSum(pending.filter((b) => b.source === 'online'));
  const pendingLocal = bomSum(pending.filter((b) => b.source === 'local'));

  return (
    <div className="space-y-8">
      {/* Blocking alert */}
      {blocking.length > 0 && (
        <div className="bg-gray-900 border border-red-800/60 rounded-xl p-5">
          <h3 className="font-semibold text-red-400 mb-2">
            {blocking.length} ítem{blocking.length === 1 ? '' : 's'} del camino critico sin pedir
          </h3>
          <ul className="space-y-1.5">
            {blocking.map((b) => (
              <li key={b.item} className="text-sm text-gray-300">
                <span className="font-semibold">{b.item}</span>
                {b.note && <span className="text-gray-500"> — {b.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { k: 'Pedido', v: `$${orderedSum.low.toFixed(2)}`, s: `${ordered.length} ítems · llega 18-19 sep`, tone: 'green' },
          { k: 'Falta online', v: `$${pendingOnline.low}–${pendingOnline.high}`, s: `${pending.filter((b) => b.source === 'online').length} ítems`, tone: 'amber' },
          { k: 'Falta local', v: `$${pendingLocal.low}–${pendingLocal.high}`, s: 'Home Depot, Lowe’s, Walmart', tone: 'sky' },
        ].map((c) => (
          <div key={c.k} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-500">{c.k}</p>
            <p
              className={`text-2xl font-bold ${
                c.tone === 'green' ? 'text-green-400' : c.tone === 'amber' ? 'text-amber-400' : 'text-sky-400'
              }`}
            >
              {c.v}
            </p>
            <p className="text-xs text-gray-600">{c.s}</p>
          </div>
        ))}
      </div>

      {/* By tier */}
      {TIERS.map((tier) => {
        const items = BOM.filter((b) => b.tier === tier.n);
        const sum = bomSum(items);
        return (
          <section key={tier.n}>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-xs font-mono text-green-500 bg-green-950 px-2 py-1 rounded">tier {tier.n}</span>
              <h3 className="text-sm font-semibold text-gray-300">{tier.t}</h3>
              <span className="text-xs font-mono text-gray-600 ml-auto">
                ${sum.low.toFixed(0)}–{sum.high.toFixed(0)}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3">{tier.d}</p>
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-2">
              {items.map((b) => (
                <Row key={b.item} b={b} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Corrections */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Tres errores del informe 04
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              t: 'La lista de insumos es de tierra',
              d: 'Especifica Fox Farm Ocean Forest y nutrientes Dr. Earth. En hidroponia va medio inerte y nutriente hidroponico completo — los de tierra vienen cortos en calcio, magnesio y micros porque asumen que el suelo los aporta.',
            },
            {
              t: 'Confunde dosificacion con riego',
              d: 'El informe 03 lista una peristaltica 12V para regar. Las peristalticas son para dosificar: bajo caudal, alta precision. Alimentar tres baldes con una seria desesperantemente lento.',
            },
            {
              t: 'No contempla medidores de mano',
              d: 'Solo lista las sondas para el ESP32. Depender de ellas el dia uno pone toda la electronica en el camino critico. Los lapiceros lo desacoplan, y los necesitas igual para calibrar las sondas contra algo.',
            },
          ].map((c) => (
            <div key={c.t} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h4 className="font-semibold text-gray-200 mb-2">{c.t}</h4>
              <p className="text-sm text-gray-500">{c.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
