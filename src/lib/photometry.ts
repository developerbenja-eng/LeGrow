/**
 * Photometry and environment math for LeGrow.
 *
 * Every number the UI shows should come from here, not from a hardcoded string.
 * Sources for the constants are the research reports in docs/reports/.
 */

const FT_TO_M = 0.3048;

/**
 * Fraction of emitted photons that actually land on the canopy.
 *
 * Derived from report 02: a 300W fixture at 2.8 umol/J dimmed to 60% (180W)
 * emits 504 umol/s and is specified to deliver 300-350 PPFD over a 3x3 tent
 * (0.836 m2), i.e. 251-293 umol/s on the canopy. That is 50-58% capture.
 */
export const CAPTURE_EFFICIENCY = 0.57;

/** MLGW residential rate, report 02. Roughly 38% below the US average. */
export const RATE_USD_PER_KWH = 0.1;

/** LEDs convert ~40-45% of input power to photons; the rest is heat. */
export const LIGHT_FRACTION = 0.43;

/**
 * The fixture actually bought, from VIVOSUN's own manual and product page.
 *
 * Note what is missing: VIVOSUN publishes neither PPF (umol/s) nor efficacy
 * (umol/J) for this light, which is why our own estimate is still the only
 * photon-based figure we have. The PPFD they do publish is a centre reading at
 * a stated height, not an average over the footprint, so it sits above our
 * area average without contradicting it.
 */
export const FIXTURE = {
  model: 'VSL-LL100',
  watts: 100,
  ppfdCentreAt12in: 521,
  panelIn: [12, 12, 2.4] as const,
  weightLb: 4.4,
  lifespanHours: 36000,
  ingress: 'IP65',
  daisyChainMax: 7,
  /** Discrete. The knob and the GrowHub both offer only these steps. */
  dimSteps: [25, 50, 75, 100] as const,
  spectrum: ['3000K', '5000K', '660nm', '750nm'] as const,
  publishedPpf: null,
  publishedEfficacy: null,
} as const;

const DAYS_PER_MONTH = 30.4;

/** Fixture efficacy in umol/J. Budget small fixtures vs. good ones (report 02). */
export const EFFICACY = { low: 2.2, high: 2.7 } as const;

export type Range = readonly [number, number];

/** Agronomic targets for day-neutral strawberry (report 07). */
export const TARGETS = {
  ppfd: [300, 350] as Range,
  dli: [17, 22] as Range,
  vpd: [0.8, 1.2] as Range,
  tempDayC: [20, 24] as Range,
  rh: [40, 60] as Range,
  co2: [800, 1200] as Range,
  ph: [5.8, 6.2] as Range,
  ec: [1.2, 1.8] as Range,
} as const;

export type Tent = {
  id: string;
  label: string;
  widthFt: number;
  depthFt: number;
  /** Geometric capacity: 5-gallon buckets are ~12in across, so floor(w) * floor(d). */
  buckets: number;
  /** What actually fits leaving room for tubing and your hands. */
  bucketsPractical: number;
  note: string;
};

export const TENTS: readonly Tent[] = [
  { id: '16x16', label: '16" x 16"', widthFt: 16 / 12, depthFt: 16 / 12, buckets: 1, bucketsPractical: 1, note: 'Un balde. Luz muy sobrada.' },
  { id: '2x2', label: '2 x 2 ft', widthFt: 2, depthFt: 2, buckets: 4, bucketsPractical: 3, note: 'Cuatro baldes caben pared a pared; tres dejan espacio para trabajar.' },
  { id: '2x4', label: '2 x 4 ft', widthFt: 2, depthFt: 4, buckets: 8, bucketsPractical: 6, note: 'El doble de area diluye la misma luz a la mitad.' },
  { id: '3x3', label: '3 x 3 ft', widthFt: 3, depthFt: 3, buckets: 9, bucketsPractical: 6, note: 'El plan original, en tierra.' },
];

/**
 * Vertical stack of the rig, in inches. A 5-gallon bucket eats 15 inches
 * before anything living starts, which is what makes tent height tight.
 */
export const STACK = {
  tentHeight: 48,
  bucket: 15,
  plant: 10,
  hardware: 3,
  /** Report 05 hang distances by stage. */
  hang: { transplant: [24, 30] as Range, vegetative: [18, 24] as Range, fruiting: [12, 18] as Range },
} as const;

/** Distance available between the fixture and the canopy, inches. */
export function hangRoom(tentHeightIn: number = STACK.tentHeight): number {
  return tentHeightIn - STACK.hardware - (STACK.bucket + STACK.plant);
}

export function areaM2(tent: Pick<Tent, 'widthFt' | 'depthFt'>): number {
  return tent.widthFt * FT_TO_M * tent.depthFt * FT_TO_M;
}

/** Total photon output of the fixture, umol/s. */
export function ppf(watts: number, efficacy: number): number {
  return watts * efficacy;
}

/** Photon flux density landing on the canopy, umol/m2/s. */
export function ppfd(
  watts: number,
  efficacy: number,
  area: number,
  capture: number = CAPTURE_EFFICIENCY,
): number {
  return (ppf(watts, efficacy) * capture) / area;
}

/** Daily light integral, mol/m2/day. This is what the plant actually receives. */
export function dli(ppfdValue: number, hours: number): number {
  return (ppfdValue * hours * 3600) / 1e6;
}

export function monthlyKwh(watts: number, hours: number): number {
  return (watts / 1000) * hours * DAYS_PER_MONTH;
}

export function monthlyCost(watts: number, hours: number, rate: number = RATE_USD_PER_KWH): number {
  return monthlyKwh(watts, hours) * rate;
}

/** Waste heat the tent has to shed, in watts. Drives whether you need an inline fan. */
export function heatWatts(watts: number): number {
  return watts * (1 - LIGHT_FRACTION);
}

/** Saturation vapour pressure, kPa (Tetens equation). */
export function svp(tempC: number): number {
  return 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/**
 * Vapour pressure deficit, kPa.
 *
 * This is the number that matters, not temperature and humidity separately.
 * Report 03 names a 0.8-1.2 kPa target but report 07 and the firmware both
 * threshold temp and RH independently, which lets the system sit inside every
 * individual limit while being far outside the VPD target.
 */
export function vpd(tempC: number, rhPercent: number): number {
  return svp(tempC) * (1 - rhPercent / 100);
}

export function inRange(value: number, [min, max]: Range): boolean {
  return value >= min && value <= max;
}

/** How far outside a range a value sits, as a fraction. 0 when inside. */
export function rangeMiss(value: number, [min, max]: Range): number {
  if (value < min) return (min - value) / min;
  if (value > max) return (value - max) / max;
  return 0;
}

export type Verdict = 'ok' | 'near' | 'off';

export function verdict(value: number, range: Range): Verdict {
  const miss = rangeMiss(value, range);
  if (miss === 0) return 'ok';
  return miss <= 0.15 ? 'near' : 'off';
}

/** Everything the lab page needs for one (tent, watts, photoperiod) combination. */
export function rigSummary(tent: Tent, watts: number, hours: number) {
  const area = areaM2(tent);
  const ppfdLow = ppfd(watts, EFFICACY.low, area);
  const ppfdHigh = ppfd(watts, EFFICACY.high, area);

  return {
    area,
    ppfdLow,
    ppfdHigh,
    dliLow: dli(ppfdLow, hours),
    dliHigh: dli(ppfdHigh, hours),
    kwh: monthlyKwh(watts, hours),
    cost: monthlyCost(watts, hours),
    heat: heatWatts(watts),
    /** Judge on the optimistic end: this is the best the fixture could do. */
    ppfdVerdict: verdict(ppfdHigh, TARGETS.ppfd),
    dliVerdict: verdict(dli(ppfdHigh, hours), TARGETS.dli),
  };
}
