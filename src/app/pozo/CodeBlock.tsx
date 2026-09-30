'use client';

import { useState } from 'react';

export default function CodeBlock({ name, code, download }: { name: string; code: string; download?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 1800);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-gray-800">
        <span className="text-xs font-mono text-gray-400">{name}</span>
        <div className="flex gap-2">
          {download && (
            <a
              href={download}
              download
              className="text-xs font-mono px-3 py-1 rounded-md border border-gray-700 text-gray-300 hover:border-sky-500 hover:text-sky-400 transition-colors"
            >
              Descargar
            </a>
          )}
          <button
            type="button"
            onClick={copy}
            className="text-xs font-mono px-3 py-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white transition-colors"
          >
            {state === 'copied' ? 'Copiado' : state === 'failed' ? 'Selecciona y copia' : 'Copiar'}
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-auto max-h-[480px] text-xs leading-relaxed font-mono text-gray-300">{code}</pre>
    </div>
  );
}
