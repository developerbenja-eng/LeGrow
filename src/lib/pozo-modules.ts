/**
 * Registro de secciones de /pozo. Igual que lab-modules: la navegacion, el
 * resumen, las rutas estaticas y los enlaces anterior/siguiente salen de aqui.
 */

export type PozoSection = {
  slug: string;
  short: string;
  label: string;
  blurb: string;
  /** 24x24, dibujado con fill="none". */
  icon: string;
};

export const POZO_SECTIONS: readonly PozoSection[] = [
  {
    slug: 'principio',
    short: 'Principio',
    label: 'Como mide',
    blurb: 'Un chirp baja por el casing, rebota en cada cople y en el agua. El tiempo da la profundidad; los coples dan la velocidad del sonido.',
    icon: 'M12 3v18 M8 7c0 2 8 2 8 0 M7 12c0 2.5 10 2.5 10 0 M5 18h14',
  },
  {
    slug: 'senal',
    short: 'Senal',
    label: 'Cadena de senal',
    blurb: 'Un solo reloj I2S mueve el parlante y los dos microfonos. El mic A graba el chirp al salir, y ese es el cero de cada eco.',
    icon: 'M3 12h3l2-6 4 12 3-9 2 3h4',
  },
  {
    slug: 'cableado',
    short: 'Cableado',
    label: 'Cableado completo',
    blurb: 'Cada cable, de alimentacion y de senal, pin por pin. Todas las senales caen en el header J1 de la ESP32-S3.',
    icon: 'M4 6h4v4H4z M16 14h4v4h-4z M8 8h4v8h4',
  },
  {
    slug: 'energia',
    short: 'Energia',
    label: 'Energia',
    blurb: 'Tres rieles desde una LiPo: bateria, 5 V por el elevador, y 3.3 V del regulador de la placa. Todas las tierras son comunes.',
    icon: 'M13 2 4 14h7l-1 8 9-12h-7z',
  },
  {
    slug: 'impresion',
    short: 'Impresion 3D',
    label: 'Piezas impresas',
    blurb: 'Siete impresiones de un solo archivo parametrico. La manga centra la tapa sobre el casing y sostiene parlante y mic A.',
    icon: 'M4 20h16 M6 20V9l6-5 6 5v11 M9 20v-6h6v6',
  },
  {
    slug: 'armado',
    short: 'Armado',
    label: 'Orden de armado',
    blurb: 'Doce pasos, cada uno con su prueba. Cada paso agrega una sola cosa y demuestra que funciona antes de seguir.',
    icon: 'M9 5h11 M9 12h11 M9 19h11 M4 5l1 1 2-2 M4 12l1 1 2-2 M4 19l1 1 2-2',
  },
  {
    slug: 'piezas',
    short: 'Piezas',
    label: 'Piezas: lo que hay y lo que falta',
    blurb: 'Cruzado con el inventario de LeGrow. Lo que ya esta, con su foto; lo que hay que comprar, con precio.',
    icon: 'M4 7.5 L12 3.5 L20 7.5 V16.5 L12 20.5 L4 16.5 Z M4 7.5 L12 11.5 L20 7.5 M12 11.5 V20.5',
  },
  {
    slug: 'firmware',
    short: 'Firmware',
    label: 'Firmware',
    blurb: 'Que hace la ESP32 en cada disparo, los comandos por serial y lo que queda guardado en la microSD.',
    icon: 'M8 8l-4 4 4 4 M16 8l4 4-4 4 M14 5l-4 14',
  },
];

export const sectionBySlug = (slug: string) => POZO_SECTIONS.find((s) => s.slug === slug);

export function sectionNeighbours(slug: string) {
  const i = POZO_SECTIONS.findIndex((s) => s.slug === slug);
  return {
    prev: i > 0 ? POZO_SECTIONS[i - 1] : null,
    next: i >= 0 && i < POZO_SECTIONS.length - 1 ? POZO_SECTIONS[i + 1] : null,
    index: i,
  };
}
