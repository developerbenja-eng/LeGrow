import fs from 'node:fs';
import path from 'node:path';
import Exploded from '../diagrams/Exploded';
import SleeveSection from '../diagrams/SleeveSection';
import FlangeTop from '../diagrams/FlangeTop';
import CodeBlock from '../CodeBlock';
import { Figure, Note, SectionHead } from '../ui';

const PRINTS = [
  { part: 'fit_ring', name: 'Anillo de prueba', mat: 'PETG', tone: 'text-green-400', how: 'Imprimir primero: una rebanada de 12 mm de la manga. Debe entrar al casing a mano, sin juego. Si no, cambiar fit en 0.1 mm y reimprimir.' },
  { part: 'sleeve', name: 'Manga', mat: 'ASA o PETG', tone: 'text-amber-400', how: 'Brida abajo, sin soportes; el asiento del parlante sale como un puente corto. 4 paredes, 30 % gyroid. Tres insertos M3 en los resaltes.' },
  { part: 'box', name: 'Caja', mat: 'ASA o PETG', tone: 'text-amber-400', how: 'Piso abajo. 3 paredes, 20 %. Mide 195 × 95 mm: entra en una cama de 220. Insertos en tapa, brida y portadora.' },
  { part: 'lid', name: 'Tapa', mat: 'ASA', tone: 'text-amber-400', how: 'Cara exterior abajo. ASA si va a quedar al sol. El venteo M12 se atornilla desde fuera.' },
  { part: 'gasket_lid · gasket_flange', name: 'Juntas', mat: 'TPU 95A', tone: 'text-cyan-400', how: '1.2 mm, 100 %, 20 mm/s. Sin TPU sirve cinta de espuma de celda cerrada.' },
  { part: 'pod · pod_cap', name: 'Capsula colgante', mat: 'PETG 0.12 mm', tone: 'text-green-400', how: 'La placa del mic B va con el agujero de sonido sobre el puerto de 2 mm. Sellar el borde con silicona. La capsula es ademas un reflector a profundidad conocida.' },
] as const;

export default function Impresion() {
  const scad = fs.readFileSync(path.join(process.cwd(), 'public', 'pozo', 'well-echo-cap.scad'), 'utf8');

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr] items-start">
        <Figure
          title="Vista explotada"
          caption="El casing, la manga y el colgante quedan quietos; las juntas, la caja y la tapa bajan hasta cerrar sobre la brida. El venteo de la tapa mantiene el pozo a presion atmosferica por el paso del cable y el puerto del mic."
        >
          <Exploded />
        </Figure>
        <div className="space-y-3">
          {PRINTS.map((p, i) => (
            <div key={p.part} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-gray-200">
                  <span className="text-xs font-mono text-gray-600 mr-2">{String(i + 1).padStart(2, '0')}</span>
                  {p.name}
                </h3>
                <span className={`text-[11px] font-mono uppercase tracking-wide ${p.tone}`}>{p.mat}</span>
              </div>
              <p className="text-xs font-mono text-gray-600 mt-0.5">PART = &quot;{p.part}&quot;</p>
              <p className="text-sm text-gray-400 mt-2">{p.how}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="space-y-4">
        <SectionHead kicker="Cotas" title="La manga sobre el casing, en corte">
          <p>
            El casing entra entre la falda y el spigot. El spigot centra la tapa desde dentro; la falda la sujeta desde fuera con tres
            tornillos mariposa de nylon.
          </p>
        </SectionHead>
        <Figure title='Corte por el eje · casing de 2" · escala 5 px/mm' minWidth={640}>
          <SleeveSection />
        </Figure>
        <Figure
          title="Brida vista desde arriba"
          caption="El mic A no cabe sobre el puerto: su placa pisaria el marco del parlante. Por eso el puerto baja en r 20.9 y un canal de 1 mm lo lleva hasta la placa, centrada en r 26.5."
          minWidth={640}
        >
          <FlangeTop />
        </Figure>
      </section>

      <section className="space-y-4">
        <SectionHead kicker="Archivo" title="well-echo-cap.scad">
          <p>
            Un archivo, todas las piezas. Elegir <code className="text-gray-300">PART</code>, renderizar con F6 y exportar el STL. Las lineas
            <code className="text-gray-300"> assert</code> detienen el render y dicen que choca si un parametro no cabe.
          </p>
        </SectionHead>
        <CodeBlock name="well-echo-cap.scad · OpenSCAD 2021.01+" code={scad} download="/pozo/well-echo-cap.scad" />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Note title="Nada de PLA en terreno">
          Una boca de pozo al sol pasa los 60 °C, donde el PLA empieza a deformarse y el ajuste se suelta. El PETG aguanta cerca de 75 °C; el ASA
          cerca de 95 °C y resiste UV.
        </Note>
        <Note tone="info" title="Medir antes de imprimir">
          Los valores por defecto suponen PVC 2&quot; Sch 40 (60.3 mm OD, 52.5 mm ID) y parlante de 36 mm. Para 4&quot; poner 114.3 / 102.3 y
          un parlante mas grande.
        </Note>
      </div>
    </div>
  );
}
