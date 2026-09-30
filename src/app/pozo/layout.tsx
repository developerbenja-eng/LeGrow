import Link from 'next/link';
import PozoTabNav from './PozoTabNav';

export default function PozoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="max-w-6xl mx-auto px-6 pt-8 pb-5">
        <Link href="/" className="text-sm text-gray-500 hover:text-sky-400 transition-colors">
          ← LeGrow
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-3">
          <h1 className="text-3xl font-bold text-sky-400">Tapa de eco</h1>
          <p className="text-sm text-gray-500">
            Nivel de agua en pozos de monitoreo por eco acustico — prototipo v0 sobre casing de 2&quot; Sch 40.
          </p>
        </div>
      </header>

      <PozoTabNav />

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
