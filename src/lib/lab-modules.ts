/**
 * Registry of lab modules.
 *
 * This is the single place to add a new section. Navigation, the overview
 * board, the static routes and the prev/next links are all generated from it,
 * so adding content never means touching layout code.
 *
 * Metadata only — no React — so both server and client components can read it.
 */

import { openCount } from './lab-data';

export type LabModule = {
  slug: string;
  /** Tab label. Keep it to one word where possible. */
  short: string;
  /** Full heading shown inside the module. */
  label: string;
  blurb: string;
  /** 24x24 stroke path, drawn with fill="none". */
  icon: string;
};

export const LAB_MODULES: readonly LabModule[] = [
  {
    slug: 'luz',
    short: 'Luz',
    label: 'Luz y huella',
    blurb:
      'El panel de 70W es un objeto fisico de tamano fijo. Al agrandar la carpa los mismos fotones se reparten en mas area y el PPFD cae.',
    icon: 'M4 12 L12 4 L20 12 Z M9 16v2 M12 15v3 M15 16v2',
  },
  {
    slug: 'planta',
    short: 'Planta',
    label: 'La planta',
    blurb:
      'Que especie, por que solo una, y que quiere la planta. El rig decide la especie antes que el gusto: un estanque significa un solo pH.',
    icon: 'M12 21 V9 M12 14 C7.5 14 5.5 10.5 5.5 7 c4.5 0 6.5 2.5 6.5 7 M12 12 c0-4.5 2-7 6.5-7 0 3.5-2 7-6.5 7',
  },
  {
    slug: 'nutrientes',
    short: 'Nutrientes',
    label: 'Circuito de nutrientes',
    blurb:
      'Dutch bucket en circuito cerrado: corona seca, raiz oxigenada, y solucion totalmente controlada. Casi todo ya esta en el BOM del informe 03.',
    icon: 'M12 3 C12 3 5 11 5 15 a7 7 0 0 0 14 0 C19 11 12 3 12 3 Z',
  },
  {
    slug: 'vpd',
    short: 'VPD',
    label: 'VPD y clima',
    blurb:
      'El repo fija temperatura y humedad por separado, y aparte nombra un objetivo de VPD. Las dos especificaciones casi no se cruzan.',
    icon: 'M4 20 V4 M4 20 H20 M7.5 16.5 h3 v-4 h-3 z M13.5 16.5 h3 v-8 h-3 z',
  },
  {
    slug: 'rotacion',
    short: 'Rotacion',
    label: 'Rotacion de carpas',
    blurb:
      'Dos carpas son dos ambientes. Lo que se rota no son las plantas sino el rol de cada carpa, y eso cancela el sesgo entre ellas.',
    icon: 'M3 12 a9 9 0 0 1 15.5-6.2 M21 12 a9 9 0 0 1-15.5 6.2 M18.5 5.8 V2.2 M18.5 5.8 h-3.6 M5.5 18.2 V21.8 M5.5 18.2 h3.6',
  },
  {
    slug: 'experimento',
    short: 'Experimento',
    label: 'Diseno experimental',
    blurb:
      'Con n=3 no se comparan tratamientos. Lo que si se puede medir es el piso de ruido, y sin ese numero nada posterior es interpretable.',
    icon: 'M9 3v6l-5 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3 M8 3h8',
  },
  {
    slug: 'materiales',
    short: 'Materiales',
    label: 'Lista de materiales',
    blurb: 'Menos escala que el plan original, mas instrumentacion. El filtro de carbon sale del presupuesto.',
    icon: 'M4 6h16 M4 12h16 M4 18h10',
  },
  {
    slug: 'bitacora',
    short: 'Bitacora',
    label: 'Bitacora',
    blurb: 'Lo decidido y lo que sigue abierto, con el modulo al que pertenece cada punto.',
    icon: 'M4 6h2 m4 0h10 M4 12h2 m4 0h10 M4 18h2 m4 0h10',
  },
];

export const moduleBySlug = (slug: string) => LAB_MODULES.find((m) => m.slug === slug);

/** Open questions attached to a module, used for the dot on its tab. */
export const moduleOpen = (slug: string) => openCount(slug);

export function moduleNeighbours(slug: string) {
  const i = LAB_MODULES.findIndex((m) => m.slug === slug);
  return {
    prev: i > 0 ? LAB_MODULES[i - 1] : null,
    next: i >= 0 && i < LAB_MODULES.length - 1 ? LAB_MODULES[i + 1] : null,
    index: i,
  };
}
