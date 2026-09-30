import WellEcho from '../diagrams/WellEcho';
import EchoSimulator from '../diagrams/EchoSimulator';
import PlaneWave from '../diagrams/PlaneWave';
import { Figure, Note, SectionHead, Stat } from '../ui';
import { rangeStepMm, soundSpeed } from '@/lib/pozo';

export default function Principio() {
  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">
        <Figure
          title="El eco dentro del casing"
          caption="La tapa toca un chirp de 20 ms hacia abajo. Cada cople del casing devuelve un eco chico; el agua devuelve el grande. El microfono los recibe en ese orden."
        >
          <WellEcho />
        </Figure>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Profundidad" value="d = c·t / 2" sub="t es ida y vuelta" />
            <Stat label="Sonido a 20 °C" value={`${soundSpeed(20).toFixed(1)} m/s`} sub="c = 331.3 √(1 + T/273.15)" />
            <Stat label="Paso por muestra" value={`${rangeStepMm().toFixed(1)} mm`} sub="a 48 kHz, antes de interpolar" />
            <Stat label="Sensibilidad" value="0.17 %/°C" sub="≈ 5 cm por °C a 30 m" tone="text-amber-400" />
          </div>
          <Note tone="info" title="Tres maneras de saber c">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <b className="text-gray-200">Temperatura</b>: BME280 en la tapa y tres DS18B20 en la columna de aire. Simple, pero el aire del
                pozo tiene gradiente.
              </li>
              <li>
                <b className="text-gray-200">Coples</b>: los ecos llegan cada 2L/c con L conocido (10 o 20 ft). Mide c en todo el camino.
              </li>
              <li>
                <b className="text-gray-200">Par de microfonos</b>: el pulso pasa del mic A al mic B en s/c. Mide c cerca de la boca.
              </li>
            </ul>
          </Note>
        </div>
      </div>

      <section className="space-y-4">
        <SectionHead kicker="Simulador" title="Como se ve el eco en tu pozo">
          <p>
            Mueve la profundidad y la temperatura real del aire, y fija lo que supone el firmware. Las tarjetas muestran cuanto se equivoca
            la lectura si solo usa esa suposicion, y cuantos coples quedan para corregirla.
          </p>
        </SectionHead>
        <EchoSimulator />
      </section>

      <section className="space-y-4">
        <SectionHead kicker="Techo del chirp" title="Por que el chirp no sube de 3.5 kHz en casing de 2 pulgadas" />
        <Figure
          title="Onda plana contra modo transversal"
          caption="Bajo la frecuencia de corte el sonido baja como un frente plano y el eco llega entero. Sobre ella rebota entre las paredes, llega por varios caminos y el pico se ensancha. Por eso el chirp de 2 pulgadas termina en 3.5 kHz y el de 4 pulgadas en 1.8 kHz."
          minWidth={560}
        >
          <PlaneWave />
        </Figure>
      </section>

      <Note title="Coples que casi no suenan">
        Los coples pegados de PVC dejan un escalon dentro del tubo y hacen buen eco. El casing de monitoreo con rosca al ras es liso por dentro,
        asi que sus uniones pueden quedar bajo el ruido. Si pasa, la profundidad sale igual de la temperatura, y el par de microfonos sigue
        midiendo c cerca de la boca.
      </Note>
    </div>
  );
}
