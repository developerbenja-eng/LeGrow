'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LAB_MODULES, moduleOpen } from '@/lib/lab-modules';

function Tab({
  href,
  active,
  icon,
  label,
  open,
}: {
  href: string;
  active: boolean;
  icon?: string;
  label: string;
  open?: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-gray-800 text-green-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
      }`}
    >
      {icon ? (
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={icon} />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 5h6v6H4z M14 5h6v6h-6z M4 15h6v4H4z M14 15h6v4h-6z" />
        </svg>
      )}
      <span>{label}</span>
      {!!open && (
        <span
          className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500"
          title={`${open} punto${open === 1 ? '' : 's'} abierto${open === 1 ? '' : 's'}`}
        />
      )}
      {active && <span className="absolute -bottom-px left-3 right-3 h-0.5 rounded-full bg-green-500" />}
    </Link>
  );
}

export default function TabNav() {
  const pathname = usePathname();
  const current = pathname.replace(/\/+$/, '').split('/').pop() ?? '';
  const onOverview = pathname.replace(/\/+$/, '').endsWith('/lab');

  return (
    <nav className="sticky top-0 z-20 bg-gray-950/85 backdrop-blur border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2">
          <Tab href="/lab" active={onOverview} label="Resumen" />
          <span className="w-px bg-gray-800 my-2 mx-1 shrink-0" aria-hidden />
          {LAB_MODULES.map((m) => (
            <Tab
              key={m.slug}
              href={`/lab/${m.slug}`}
              active={!onOverview && current === m.slug}
              icon={m.icon}
              label={m.short}
              open={moduleOpen(m.slug)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
