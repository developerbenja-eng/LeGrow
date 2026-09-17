import BucketLoop from '../BucketLoop';

const CARDS = [
  {
    t: 'Por que hidroponia',
    d: 'En tierra no puedes saber que esta recibiendo la planta. En solucion, EC y pH son variables medibles y corregibles. Eso convierte el balde en instrumento.',
  },
  {
    t: 'Por que Dutch y no DWC',
    d: 'En DWC las raices viven sumergidas y la corona de la frutilla se pudre. El medio mantiene la corona seca y airea la raiz por capilaridad.',
  },
  {
    t: 'Por que tres bombas',
    d: 'Dosificar automatico necesita nutriente A, nutriente B y pH down por separado. El BOM del repo tiene una sola bomba, que solo sirve para regar.',
  },
];

export default function Nutrientes() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <BucketLoop />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CARDS.map((c) => (
          <div key={c.t} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-gray-200 mb-2">{c.t}</h3>
            <p className="text-sm text-gray-500">{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
