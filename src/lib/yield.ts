/**
 * What "3-4 lb per plant" actually means, and where it comes from.
 *
 * Report 05 states 3-4 lb per plant per year without a source. Report 01's
 * table gives the same figure with no period at all. That number drives the
 * whole economic case, so it is worth separating what was measured from what
 * was claimed — and it turns out the measured figures are roughly half.
 *
 * Every estimate here carries its provenance and the period it was observed
 * over, because for a crop that fruits continuously the period is the number.
 */

const G_PER_LB = 453.592;
const WEEKS = 52;

/** kcal per pound of raw strawberry: 32 kcal/100 g. */
export const KCAL_PER_LB = 145;

/** Our rig. Three buckets, not the nine of the original 3x3 plan. */
export const PLANTS = 3;
export const FOOTPRINT_M2 = 0.37161;

export type Provenance = 'claimed' | 'measured' | 'commercial';

export type YieldEstimate = {
  id: string;
  label: string;
  provenance: Provenance;
  /** Grams per plant per week, the only unit that survives a continuous crop. */
  gPerPlantWeek: number;
  /** Over what window it was actually observed. */
  observed: string;
  note: string;
  source?: { label: string; url: string };
};

export const ESTIMATES: readonly YieldEstimate[] = [
  {
    id: 'repo-high',
    label: 'Informe 05 del repo',
    provenance: 'claimed',
    gPerPlantWeek: (4 * G_PER_LB) / WEEKS,
    observed: 'sin periodo observado',
    note: 'El informe 01 da la misma cifra sin periodo. Es el techo de lo que se afirma, no una medicion.',
  },
  {
    id: 'repo-low',
    label: 'Informe 05, extremo bajo',
    provenance: 'claimed',
    gPerPlantWeek: (3 * G_PER_LB) / WEEKS,
    observed: 'sin periodo observado',
    note: 'Es esta cifra la que sostiene el calculo economico del informe 04.',
  },
  {
    id: 'commercial-cea',
    label: 'CEA comercial, everbearing',
    provenance: 'commercial',
    // 12-15 kg/m2/año a ~12 plantas/m2 comerciales -> ~1.0-1.25 kg/planta/año.
    gPerPlantWeek: ((12.5 * 1000) / 12) / WEEKS,
    observed: 'anual, a densidad comercial',
    note: '12-15 kg/m2 al ano a unas 12 plantas/m2. Nuestra densidad es 8 plantas/m2, mas holgada.',
    source: {
      label: 'OSU — produccion de berries en ambiente controlado',
      url: 'https://u.osu.edu/indoorberry/environment/',
    },
  },
  {
    id: 'sare-best',
    label: 'SARE, mejor tratamiento',
    provenance: 'measured',
    gPerPlantWeek: 123.5 / 8,
    observed: '8 semanas, cosechando 3 veces por semana',
    note: '119-128 g por planta en 8 semanas con acuaponia mas acido fosforico. Es medicion, no afirmacion.',
    source: { label: 'SARE GNE18-169', url: 'https://projects.sare.org/project-reports/gne18-169/' },
  },
  {
    id: 'sare-hydro',
    label: 'SARE, hidroponia sintetica',
    provenance: 'measured',
    gPerPlantWeek: 78 / 8,
    observed: '8 semanas, cosechando 3 veces por semana',
    note: '78 g por planta en 8 semanas. Es el tratamiento mas parecido al nuestro.',
    source: { label: 'SARE GNE18-169', url: 'https://projects.sare.org/project-reports/gne18-169/' },
  },
];

/** Marketable fruit, as the SARE study defined it. Worth adopting verbatim. */
export const MARKETABLE = {
  colour: '80% de color rojo desarrollado',
  minGrams: 10,
  defects: 'sin deformidades',
} as const;

/** Research harvest cadence — never weekly, because ripeness sets the clock. */
export const HARVEST_CADENCE = {
  timesPerWeek: [2, 3] as const,
  note: 'Dos a tres veces por semana en los tres objetivos del estudio SARE.',
};

/**
 * Production is not linear. The SARE report found distinct cyclical fruiting,
 * week-to-week fluctuation and a trough at weeks six and seven, and concluded
 * that staggered plantings — not a single continuous plant — are what make
 * year-round supply.
 */
export const CYCLICAL = {
  troughWeeks: [6, 7] as const,
  remedy: 'escalonar plantaciones',
} as const;

export const perYearLb = (e: YieldEstimate) => (e.gPerPlantWeek * WEEKS) / G_PER_LB;
export const rigPerYearLb = (e: YieldEstimate) => perYearLb(e) * PLANTS;
export const rigPerWeekG = (e: YieldEstimate) => e.gPerPlantWeek * PLANTS;
export const rigKcalPerYear = (e: YieldEstimate) => rigPerYearLb(e) * KCAL_PER_LB;
/** Days of one adult's food, at 2000 kcal/day. */
export const rigFoodDays = (e: YieldEstimate) => rigKcalPerYear(e) / 2000;

/** A Seascape berry runs about this, so weekly grams convert to fruit count. */
export const BERRY_G = 20;
export const rigBerriesPerWeek = (e: YieldEstimate) => rigPerWeekG(e) / BERRY_G;

const measured = () => ESTIMATES.filter((e) => e.provenance === 'measured');

/** The honest band: from the weakest measured treatment to commercial practice. */
export function band() {
  const pool = ESTIMATES.filter((e) => e.provenance !== 'claimed');
  const lo = Math.min(...pool.map(rigPerYearLb));
  const hi = Math.max(...pool.map(rigPerYearLb));
  return { lo, hi };
}

/** How far the repo's claim sits above what was actually measured. */
export function claimOverMeasured() {
  const claim = ESTIMATES.find((e) => e.id === 'repo-high')!;
  const best = measured().reduce((a, b) => (a.gPerPlantWeek > b.gPerPlantWeek ? a : b));
  return claim.gPerPlantWeek / best.gPerPlantWeek;
}
