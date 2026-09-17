import { BOM, bomGroups, bomTotal } from '@/lib/lab-data';

export default function Materiales() {
  const total = bomTotal();
  const groups = bomGroups();

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {groups.map((g) => {
              const items = BOM.filter((b) => b.group === g);
              const sub = items.reduce((a, b) => ({ low: a.low + b.low, high: a.high + b.high }), { low: 0, high: 0 });
              return (
                <tr key={g} className="align-top border-t border-gray-800 first:border-t-0">
                  <td className="p-4 w-36">
                    <span className="text-xs font-mono text-green-500 bg-green-950 px-2 py-1 rounded">{g}</span>
                    <p className="text-xs text-gray-600 mt-2 font-mono">
                      ${sub.low}–{sub.high}
                    </p>
                  </td>
                  <td className="p-4">
                    {items.map((b) => (
                      <div key={b.item} className="flex justify-between gap-4 py-1">
                        <span className="text-gray-400">{b.item}</span>
                        <span className="text-gray-300 font-mono whitespace-nowrap">
                          {b.low === b.high ? `$${b.low}` : `$${b.low}–${b.high}`}
                        </span>
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
            <tr className="border-t border-gray-700 bg-gray-950/60">
              <td className="p-4" />
              <td className="p-4">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold text-gray-200">Total</span>
                  <span className="font-bold text-green-400 font-mono">
                    ${total.low}–{total.high}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5">
          <h3 className="font-semibold text-green-400 mb-2">Lo que se saca</h3>
          <p className="text-sm text-gray-400">
            Extractor inline con filtro de carbon, $100-120. El filtro existe para controlar olor — es herencia directa
            del cultivo de cannabis, y la frutilla no huele. Con 40W de calor a disipar, un ventilador clip basta.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-gray-200 mb-2">Lo que se agrega</h3>
          <p className="text-sm text-gray-400">
            Sondas de pH y EC, y dos bombas peristalticas extra. El plan original media el sustrato; este mide y
            corrige la solucion. Menos escala, mas instrumento.
          </p>
        </div>
      </div>
    </div>
  );
}
