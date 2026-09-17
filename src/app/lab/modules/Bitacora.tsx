import Link from 'next/link';
import { LOG } from '@/lib/lab-data';
import { moduleBySlug } from '@/lib/lab-modules';

export default function Bitacora() {
  const open = LOG.filter((e) => e.state === 'open');
  const done = LOG.filter((e) => e.state === 'done');

  return (
    <div className="space-y-8">
      {[
        { title: 'Abierto', entries: open, tone: 'amber' as const },
        { title: 'Decidido', entries: done, tone: 'gray' as const },
      ].map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            {group.title}{' '}
            <span className="text-gray-600 font-normal font-mono">({group.entries.length})</span>
          </h3>
          <div className="space-y-2">
            {group.entries.map((entry, i) => {
              const mod = entry.module ? moduleBySlug(entry.module) : undefined;
              return (
                <div
                  key={i}
                  className={`flex gap-3 items-start bg-gray-900 border rounded-xl p-4 ${
                    group.tone === 'amber' ? 'border-amber-900/40' : 'border-gray-800'
                  }`}
                >
                  <span className={`mt-0.5 text-sm ${group.tone === 'amber' ? 'text-amber-500' : 'text-green-500'}`}>
                    {group.tone === 'amber' ? '○' : '✓'}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm ${group.tone === 'amber' ? 'text-gray-300' : 'text-gray-400'}`}>
                      {entry.text}
                    </p>
                    {mod && (
                      <Link
                        href={`/lab/${mod.slug}`}
                        className="inline-block mt-2 text-xs font-mono text-gray-500 hover:text-green-400 bg-gray-950 border border-gray-800 px-2 py-0.5 rounded transition-colors"
                      >
                        {mod.short} →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
