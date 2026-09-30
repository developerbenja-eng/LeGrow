import PowerTree from '../diagrams/PowerTree';
import { Figure, Note } from '../ui';
import { MODULES, RAIL, type Rail } from '@/lib/pozo';

export default function Energia() {
  const loads = (r: Rail) => MODULES.filter((m) => m.power.some((p) => p.rail === r && p.pin !== 'GND' && !p.pin.startsWith('VIN−') && !p.pin.startsWith('OUT−')));

  return (
    <div className="space-y-8">
      <Figure
        title="Tres rieles desde una LiPo"
        caption="La corriente va de izquierda a derecha y de arriba abajo. Nada del riel de 3.3 V puede tocar 5 V: el BME280 y los INMP441 son piezas de 3.3 V."
        minWidth={720}
      >
        <PowerTree />
      </Figure>

      <div className="grid gap-4 md:grid-cols-3">
        {(['BAT', '5V', '3V3'] as Rail[]).map((r) => (
          <div key={r} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm font-semibold" style={{ color: RAIL[r].color }}>
              Riel {r}
            </p>
            <p className="text-xs text-gray-500 mb-3">{RAIL[r].label}</p>
            <ul className="space-y-1.5 text-sm">
              {loads(r).map((m) => {
                const p = m.power.find((x) => x.rail === r)!;
                return (
                  <li key={m.id} className="flex justify-between gap-3">
                    <span className="text-gray-300">{m.name}</span>
                    <span className="font-mono text-gray-500">{p.pin}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <Note tone="danger" title="Ajustar el MT3608 antes de que toque cualquier cosa">
        Estas placas suelen venir ajustadas muy por encima de 5 V. Alimentarla desde la bateria sin carga, girar el trimmer hasta que el
        multimetro marque 5.00 V en OUT, y recien entonces conectar el riel de 5 V.
      </Note>
      <Note title="El elevador no se apaga">
        El MT3608 no tiene pin de apagado, asi que drena la celda despacio aunque la ESP32 duerma. Sirve para el banco y para salidas cortas a
        terreno. La version de campo necesita un interruptor de carga que la ESP32 pueda cortar.
      </Note>
    </div>
  );
}
