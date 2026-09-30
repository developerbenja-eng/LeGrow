import Schematic from '../diagrams/Schematic';
import PendantCable from '../diagrams/PendantCable';
import CodeBlock from '../CodeBlock';
import { Figure, Note, SectionHead } from '../ui';
import { BUS, NETS, PENDANT } from '@/lib/pozo';

const PINS_H = `// Tapa de eco — ESP32-S3-DevKitC-1 (N16R8)
// Todas las senales en el header J1.

// I2S0 full duplex: amp y ambos mics comparten BCLK y WS
#define PIN_I2S_BCLK    5
#define PIN_I2S_WS      6
#define PIN_I2S_DOUT    7   // ESP32 -> MAX98357A DIN
#define PIN_I2S_DIN    15   // INMP441 A (L) + B (R) -> ESP32

// I2C: BME280 en 0x77 (SDO -> 3V3), Notecard en 0x17
#define PIN_I2C_SDA     8
#define PIN_I2C_SCL     9
#define PIN_NOTE_ATTN  16

// 1-Wire: cadena de DS18B20, pull-up de 4.7k a 3V3
#define PIN_ONEWIRE    14

// SPI microSD
#define PIN_SD_CS      10
#define PIN_SD_MOSI    11
#define PIN_SD_SCK     12
#define PIN_SD_MISO    13

// Bateria: divisor 100k / 100k, ADC1, 11 dB
#define PIN_VBAT_ADC    4

// LED RGB: GPIO 48 en DevKitC-1 v1.0, GPIO 38 en v1.1
#define PIN_RGB_LED    48`;

export default function Cableado() {
  return (
    <div className="space-y-10">
      <Schematic />

      <section className="space-y-4">
        <SectionHead kicker="Colgante" title="El cable que baja al pozo">
          <p>
            Seis conductores llevan el mic B y los tres sensores de temperatura. Las resistencias quedan arriba, en el extremo de la ESP32,
            donde no se mojan.
          </p>
        </SectionHead>
        <Figure title="Cable colgante de 6 conductores" minWidth={740}>
          <PendantCable />
        </Figure>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PENDANT.map((p) => (
            <div key={p.name} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
              <span className="w-3 h-8 rounded-sm shrink-0 border border-gray-700" style={{ background: p.color }} />
              <div className="min-w-0">
                <p className="text-sm text-gray-200">
                  {p.name} · <span className="font-mono">{p.signal}</span>
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {p.to} — {p.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHead kicker="Mapa de pines" title="Los 13 GPIO en uso" />
        <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2">GPIO</th>
                <th className="px-4 py-2">Senal</th>
                <th className="px-4 py-2">Bus</th>
                <th className="px-4 py-2">Que lleva</th>
              </tr>
            </thead>
            <tbody>
              {[...NETS]
                .sort((a, b) => a.gpio - b.gpio)
                .map((n) => (
                  <tr key={n.name} className="border-t border-gray-800">
                    <td className="px-4 py-2 font-mono text-gray-200">{n.gpio}</td>
                    <td className="px-4 py-2 font-mono font-semibold" style={{ color: BUS[n.bus].color }}>
                      {n.name}
                    </td>
                    <td className="px-4 py-2 text-gray-400">{BUS[n.bus].label}</td>
                    <td className="px-4 py-2 text-gray-400">{n.what}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <CodeBlock name="pins.h" code={PINS_H} />
        <Note title="Pines que no se tocan">
          GPIO 35, 36 y 37 van a la PSRAM octal del modulo N16R8. GPIO 0, 3, 45 y 46 son de arranque. GPIO 19 y 20 son el USB nativo. El mapa no
          usa ninguno.
        </Note>
      </section>
    </div>
  );
}
