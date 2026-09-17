import VpdMap from '../VpdMap';
import { TARGETS, svp, vpd } from '@/lib/photometry';

/** RH window that produces an in-target VPD at a given temperature. */
function rhWindow(tempC: number): [number, number] {
  const s = svp(tempC);
  return [100 * (1 - TARGETS.vpd[1] / s), 100 * (1 - TARGETS.vpd[0] / s)];
}

const ROWS = [20, 22, 24, 26];

export default function Vpd() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <VpdMap />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-amber-800/50 rounded-xl p-5">
          <h3 className="font-semibold text-amber-400 mb-2">Las dos especificaciones no se cruzan</h3>
          <p className="text-sm text-gray-400">
            El rectangulo rojo es lo que el informe 07 declara aceptable. La banda verde punteada es donde el VPD cae
            en objetivo. Se tocan solo en una franja delgada alrededor de 20-22°C con 50-60% de humedad. En la esquina
            24°C / 40% — legal segun cada umbral individual — el VPD llega a{' '}
            <span className="text-red-400 font-semibold font-mono">{vpd(24, 40).toFixed(2)} kPa</span>, un{' '}
            {Math.round((vpd(24, 40) / TARGETS.vpd[1] - 1) * 100)}% por encima del limite.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Corregirlo es puro software: el SCD41 ya entrega temperatura y humedad, y el VPD sale de la ecuacion de
            Tetens. Cero hardware nuevo.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-gray-200 mb-3">Humedad necesaria por temperatura</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="pb-2 font-medium">Temp</th>
                <th className="pb-2 font-medium">RH para VPD en objetivo</th>
                <th className="pb-2 font-medium">RH que permite el informe</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {ROWS.map((t) => {
                const [lo, hi] = rhWindow(t);
                const overlaps = lo <= TARGETS.rh[1] && hi >= TARGETS.rh[0];
                return (
                  <tr key={t} className="border-t border-gray-800">
                    <td className="py-2 text-gray-300">{t}°C</td>
                    <td className={`py-2 ${overlaps ? 'text-gray-300' : 'text-red-400 font-semibold'}`}>
                      {Math.round(lo)}–{Math.round(hi)}%
                    </td>
                    <td className="py-2 text-gray-600">
                      {TARGETS.rh[0]}–{TARGETS.rh[1]}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-600 mt-3 font-sans">
            De 24°C hacia arriba el rango de humedad permitido hace matematicamente imposible un VPD correcto.
          </p>
        </div>
      </div>
    </div>
  );
}
