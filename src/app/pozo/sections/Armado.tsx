import BuildSteps from '../BuildSteps';
import { Note } from '../ui';

export default function Armado() {
  return (
    <div className="space-y-8">
      <BuildSteps />
      <Note tone="info" title="Validacion en terreno">
        La sonda de nivel es la verdad de cada sesion: una lectura al inicio y otra al final, desde la misma marca de tope de casing que usa la
        tapa. El Levelogger da la serie continua para comparar; compensarlo con barometro y anclarlo a la sonda.
      </Note>
    </div>
  );
}
