import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LAB_MODULES, moduleBySlug, moduleNeighbours } from '@/lib/lab-modules';
import LightFootprint from '../LightFootprint';
import Planta from '../modules/Planta';
import Nutrientes from '../modules/Nutrientes';
import Vpd from '../modules/Vpd';
import Rotacion from '../modules/Rotacion';
import Materiales from '../modules/Materiales';
import Experimento from '../modules/Experimento';
import Bitacora from '../modules/Bitacora';

/** Slug -> content. The registry owns the metadata; this owns the rendering. */
const VIEWS: Record<string, React.ComponentType> = {
  luz: LightFootprint,
  planta: Planta,
  nutrientes: Nutrientes,
  vpd: Vpd,
  rotacion: Rotacion,
  materiales: Materiales,
  experimento: Experimento,
  bitacora: Bitacora,
};

type Props = { params: Promise<{ module: string }> };

export function generateStaticParams() {
  return LAB_MODULES.map((m) => ({ module: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module: slug } = await params;
  const mod = moduleBySlug(slug);
  if (!mod) return { title: 'LeGrow · Laboratorio' };
  return { title: `LeGrow · ${mod.label}`, description: mod.blurb };
}

export default async function ModulePage({ params }: Props) {
  const { module: slug } = await params;
  const mod = moduleBySlug(slug);
  const View = VIEWS[slug];
  if (!mod || !View) notFound();

  const { prev, next, index } = moduleNeighbours(slug);

  return (
    <article>
      <div className="mb-6">
        <p className="text-xs font-mono text-gray-600 mb-2">
          {String(index + 1).padStart(2, '0')} / {String(LAB_MODULES.length).padStart(2, '0')}
        </p>
        <h2 className="text-2xl font-semibold text-gray-200">{mod.label}</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-3xl">{mod.blurb}</p>
      </div>

      <View />

      <nav className="flex justify-between gap-4 mt-10 pt-6 border-t border-gray-800">
        {prev ? (
          <Link
            href={`/lab/${prev.slug}`}
            className="group flex-1 max-w-[48%] bg-gray-900 border border-gray-800 hover:border-green-600 rounded-xl p-4 transition-colors"
          >
            <p className="text-xs text-gray-600">← Anterior</p>
            <p className="text-sm font-medium text-gray-300 group-hover:text-green-400 transition-colors truncate">
              {prev.label}
            </p>
          </Link>
        ) : (
          <span className="flex-1 max-w-[48%]" />
        )}
        {next ? (
          <Link
            href={`/lab/${next.slug}`}
            className="group flex-1 max-w-[48%] bg-gray-900 border border-gray-800 hover:border-green-600 rounded-xl p-4 text-right transition-colors"
          >
            <p className="text-xs text-gray-600">Siguiente →</p>
            <p className="text-sm font-medium text-gray-300 group-hover:text-green-400 transition-colors truncate">
              {next.label}
            </p>
          </Link>
        ) : (
          <span className="flex-1 max-w-[48%]" />
        )}
      </nav>
    </article>
  );
}
