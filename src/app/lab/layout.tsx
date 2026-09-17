import Link from 'next/link';
import TabNav from './TabNav';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="max-w-6xl mx-auto px-6 pt-8 pb-5">
        <Link href="/" className="text-sm text-gray-500 hover:text-green-400 transition-colors">
          ← LeGrow
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-3">
          <h1 className="text-3xl font-bold text-green-400">Laboratorio</h1>
          <p className="text-sm text-gray-500">
            Banco de pruebas hidroponico 2x2 — aprender la planta y calibrar el instrumento antes de escalar.
          </p>
        </div>
      </header>

      <TabNav />

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
