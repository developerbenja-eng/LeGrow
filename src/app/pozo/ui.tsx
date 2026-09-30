/** Piezas de interfaz compartidas por las secciones de /pozo. */

export function Figure({
  title,
  caption,
  legend,
  minWidth,
  children,
  id,
  aside,
}: {
  title: string;
  caption?: React.ReactNode;
  legend?: readonly { color: string; label: string; dashed?: boolean }[];
  /** Ancho minimo del dibujo en px; en pantallas angostas el dibujo se desplaza de lado. */
  minWidth?: number;
  children: React.ReactNode;
  id?: string;
  aside?: React.ReactNode;
}) {
  return (
    <figure id={id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
        <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
        {aside}
      </div>
      {legend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 pt-2 text-xs font-mono text-gray-400">
          {legend.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block w-4 h-0.5 rounded"
                style={
                  l.dashed
                    ? { backgroundImage: `repeating-linear-gradient(90deg, ${l.color} 0 4px, transparent 4px 7px)` }
                    : { background: l.color }
                }
              />
              {l.label}
            </span>
          ))}
        </div>
      )}
      <div className="overflow-x-auto px-3 py-4">
        <div style={minWidth ? { minWidth } : undefined}>{children}</div>
      </div>
      {caption && <figcaption className="px-5 pb-4 text-sm text-gray-500 max-w-3xl">{caption}</figcaption>}
    </figure>
  );
}

export function Note({ tone = 'warn', title, children }: { tone?: 'warn' | 'info' | 'danger'; title: string; children: React.ReactNode }) {
  const t = {
    warn: 'border-amber-900/60 bg-amber-950/30 text-amber-400',
    info: 'border-sky-900/60 bg-sky-950/30 text-sky-400',
    danger: 'border-red-900/60 bg-red-950/30 text-red-400',
  }[tone];
  return (
    <div className={`border rounded-xl px-4 py-3 ${t}`}>
      <p className="text-sm font-semibold">{title}</p>
      <div className="text-sm text-gray-400 mt-1">{children}</div>
    </div>
  );
}

export function Stat({ label, value, sub, tone = 'text-sky-400' }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold font-mono tabular-nums ${tone}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600">{sub}</p>}
    </div>
  );
}

export function SectionHead({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-mono uppercase tracking-widest text-sky-500">{kicker}</p>
      <h3 className="text-lg font-semibold text-gray-200 mt-1">{title}</h3>
      {children && <div className="text-sm text-gray-400 mt-1 space-y-2">{children}</div>}
    </div>
  );
}

/** Flecha reutilizable para diagramas; cada SVG la define con su propio id. */
export function ArrowDefs({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill={color} />
    </marker>
  );
}
