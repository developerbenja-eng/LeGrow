import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { POZO_SECTIONS, sectionBySlug, sectionNeighbours } from '@/lib/pozo-modules';
import Principio from '../sections/Principio';
import Senal from '../sections/Senal';
import Cableado from '../sections/Cableado';
import Energia from '../sections/Energia';
import Impresion from '../sections/Impresion';
import Armado from '../sections/Armado';
import Piezas from '../sections/Piezas';
import Firmware from '../sections/Firmware';

const VIEWS: Record<string, React.ComponentType> = {
  principio: Principio,
  senal: Senal,
  cableado: Cableado,
  energia: Energia,
  impresion: Impresion,
  armado: Armado,
  piezas: Piezas,
  firmware: Firmware,
};

type Props = { params: Promise<{ seccion: string }> };

export function generateStaticParams() {
  return POZO_SECTIONS.map((s) => ({ seccion: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seccion } = await params;
  const s = sectionBySlug(seccion);
  if (!s) return { title: 'LeGrow · Tapa de eco' };
  return { title: `Tapa de eco · ${s.label}`, description: s.blurb };
}

export default async function SectionPage({ params }: Props) {
  const { seccion } = await params;
  const s = sectionBySlug(seccion);
  const View = VIEWS[seccion];
  if (!s || !View) notFound();

  const { prev, next, index } = sectionNeighbours(seccion);

  return (
    <article>
      <div className="mb-8">
        <p className="text-xs font-mono text-gray-600 mb-2">
          {String(index + 1).padStart(2, '0')} / {String(POZO_SECTIONS.length).padStart(2, '0')}
        </p>
        <h2 className="text-2xl font-semibold text-gray-200">{s.label}</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-3xl">{s.blurb}</p>
      </div>

      <View />

      <nav className="flex justify-between gap-4 mt-12 pt-6 border-t border-gray-800">
        {prev ? (
          <Link
            href={`/pozo/${prev.slug}`}
            className="group flex-1 max-w-[48%] bg-gray-900 border border-gray-800 hover:border-sky-600 rounded-xl p-4 transition-colors"
          >
            <p className="text-xs text-gray-600">← Anterior</p>
            <p className="text-sm font-medium text-gray-300 group-hover:text-sky-400 transition-colors truncate">{prev.label}</p>
          </Link>
        ) : (
          <span className="flex-1 max-w-[48%]" />
        )}
        {next ? (
          <Link
            href={`/pozo/${next.slug}`}
            className="group flex-1 max-w-[48%] bg-gray-900 border border-gray-800 hover:border-sky-600 rounded-xl p-4 text-right transition-colors"
          >
            <p className="text-xs text-gray-600">Siguiente →</p>
            <p className="text-sm font-medium text-gray-300 group-hover:text-sky-400 transition-colors truncate">{next.label}</p>
          </Link>
        ) : (
          <span className="flex-1 max-w-[48%]" />
        )}
      </nav>
    </article>
  );
}
