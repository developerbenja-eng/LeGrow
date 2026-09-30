'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { POZO_SECTIONS } from '@/lib/pozo-modules';

const OVERVIEW_ICON = 'M4 5h6v6H4z M14 5h6v6h-6z M4 15h6v4H4z M14 15h6v4h-6z';

function Tab({ href, active, icon, label }: { href: string; active: boolean; icon: string; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-gray-800 text-sky-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={icon} />
      </svg>
      <span>{label}</span>
      {active && <span className="absolute -bottom-px left-3 right-3 h-0.5 rounded-full bg-sky-500" />}
    </Link>
  );
}

export default function PozoTabNav() {
  const path = usePathname().replace(/\/+$/, '');
  const current = path.split('/').pop() ?? '';
  const onOverview = path.endsWith('/pozo');

  return (
    <nav className="sticky top-0 z-20 bg-gray-950/85 backdrop-blur border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2">
          <Tab href="/pozo" active={onOverview} icon={OVERVIEW_ICON} label="Resumen" />
          <span className="w-px bg-gray-800 my-2 mx-1 shrink-0" aria-hidden />
          {POZO_SECTIONS.map((s) => (
            <Tab key={s.slug} href={`/pozo/${s.slug}`} active={!onOverview && current === s.slug} icon={s.icon} label={s.short} />
          ))}
        </div>
      </div>
    </nav>
  );
}
