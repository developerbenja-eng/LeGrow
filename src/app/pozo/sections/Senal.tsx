import SignalChain from '../diagrams/SignalChain';
import ShotTimeline from '../diagrams/ShotTimeline';
import MatchedFilter from '../diagrams/MatchedFilter';
import { Figure, Note, SectionHead } from '../ui';
import { CHIRP, FS, recordMs } from '@/lib/pozo';

export default function Senal() {
  return (
    <div className="space-y-10">
      <Figure
        title="Un disparo, de la ESP32 al agua y de vuelta"
        caption="Cada flecha que se mueve lleva datos durante una medicion. La linea violeta es la decision de diseno: TX y RX comparten el reloj, asi que el tiempo no depende de cuando arranco el parlante."
        minWidth={720}
      >
        <SignalChain />
      </Figure>

      <section className="space-y-4">
        <SectionHead kicker="Tiempo" title={`Que pasa durante los ${Math.round(recordMs())} ms de un disparo`}>
          <p>
            El chirp se encola y sale cuando el DMA de salida termina de vaciar lo que tenia, entre 0 y 120 ms despues. Ese retardo no se
            conoce, y no hace falta: el mic A esta a un centimetro del parlante, asi que el instante en que lo oye es el cero de todos los ecos.
          </p>
        </SectionHead>
        <Figure title="Linea de tiempo de la grabacion" minWidth={720}>
          <ShotTimeline />
        </Figure>
      </section>

      <section className="space-y-4">
        <SectionHead kicker="Deteccion" title="Como aparece un eco que no se ve">
          <p>
            La ESP32 correlaciona la grabacion contra el chirp en fase y en cuadratura ({((CHIRP.ms * FS) / 1000).toFixed(0)} coeficientes cada
            uno). La raiz de la suma de cuadrados es la envolvente: un pico limpio por cada copia del chirp, sin la oscilacion de la portadora.
          </p>
        </SectionHead>
        <Figure title="Filtro adaptado sobre un registro simulado" minWidth={720}>
          <MatchedFilter />
        </Figure>
      </section>

      <Note tone="info" title="Orden de busqueda en el firmware">
        <ol className="list-decimal pl-5 space-y-1">
          <li>El pico mas alto del mic A es el pulso directo: t0.</li>
          <li>Se ignoran los ecos a menos de 1 m (el zumbido de la propia tapa).</li>
          <li>El pico mas alto despues de eso es el agua.</li>
          <li>Entre t0 y el agua, se buscan picos espaciados 2L/c ±6 %: la cadena de coples.</li>
          <li>En el mic B, el pico del pulso bajando da c por el par de microfonos.</li>
        </ol>
      </Note>
    </div>
  );
}
