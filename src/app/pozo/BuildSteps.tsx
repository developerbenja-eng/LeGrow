'use client';

import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';
import { PHASE_LABEL, STEPS, type Step } from '@/lib/pozo';
import { sectionBySlug } from '@/lib/pozo-modules';

const KEY = 'pozo-steps';

// Progreso guardado en localStorage, leido como store externo para que el
// resumen y la lista de pasos se mantengan sincronizados.
const listeners = new Set<() => void>();

function readRaw() {
  try {
    return localStorage.getItem(KEY) ?? '{}';
  } catch {
    return '{}';
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', cb);
  };
}

export function useSteps() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => '{}');
  const done = useMemo<Record<number, boolean>>(() => {
    try {
      return JSON.parse(raw) ?? {};
    } catch {
      return {};
    }
  }, [raw]);

  const toggle = (i: number) => {
    const next = { ...done };
    if (next[i]) delete next[i];
    else next[i] = true;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    listeners.forEach((l) => l());
  };

  return { done, toggle, count: Object.keys(done).length };
}

export function StepsProgress() {
  const { done, count } = useSteps();
  const nextIdx = STEPS.findIndex((_, i) => !done[i]);
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-gray-500">Armado</p>
        <p className="text-xs font-mono text-gray-500">
          {count} / {STEPS.length}
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 mt-3 overflow-hidden">
        <div className="h-full bg-sky-500 transition-all" style={{ width: `${(count / STEPS.length) * 100}%` }} />
      </div>
      <p className="text-sm text-gray-300 mt-3">
        {nextIdx === -1 ? 'Todos los pasos listos.' : <>Sigue: {STEPS[nextIdx].what}</>}
      </p>
      <Link href="/pozo/armado" className="inline-block mt-3 text-xs font-mono text-sky-400 hover:text-sky-300">
        ir al orden de armado →
      </Link>
    </div>
  );
}

export default function BuildSteps() {
  const { done, toggle, count } = useSteps();
  const phases = [...new Set(STEPS.map((s) => s.phase))] as Step['phase'][];

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-gray-300">
            {count} de {STEPS.length} pasos
          </p>
          <p className="text-xs text-gray-600">se guarda en este navegador</p>
        </div>
        <div className="h-2 rounded-full bg-gray-800 mt-3 overflow-hidden flex">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 border-r border-gray-950 last:border-r-0 transition-colors ${done[i] ? 'bg-sky-500' : 'bg-gray-800'}`} />
          ))}
        </div>
      </div>

      {phases.map((ph) => (
        <section key={ph} className="space-y-2">
          <h3 className="text-[11px] font-mono uppercase tracking-widest text-sky-500">{PHASE_LABEL[ph]}</h3>
          <ol className="space-y-2">
            {STEPS.map((s, i) => {
              if (s.phase !== ph) return null;
              const id = `step-${i}`;
              const sec = sectionBySlug(s.see);
              return (
                <li
                  key={i}
                  className={`grid grid-cols-[auto_auto_1fr] gap-3 items-start bg-gray-900 border rounded-xl px-4 py-3 transition-colors ${
                    done[i] ? 'border-gray-800 opacity-70' : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <input id={id} type="checkbox" checked={!!done[i]} onChange={() => toggle(i)} className="mt-1 w-4 h-4 accent-sky-500" />
                  <span className="text-xs font-mono text-gray-600 pt-1 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <label htmlFor={id} className={`font-medium cursor-pointer ${done[i] ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                      {s.what}
                    </label>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="text-[10px] font-mono uppercase tracking-wide text-green-500 mr-2">Pasa si</span>
                      {s.pass}
                    </p>
                    {sec && (
                      <Link href={`/pozo/${sec.slug}`} className="inline-block mt-1 text-xs font-mono text-sky-400 hover:text-sky-300">
                        ver {sec.label.toLowerCase()} →
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
