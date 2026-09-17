export default function Experimento() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-red-900/40 rounded-xl p-5">
          <h3 className="font-semibold text-red-400 mb-2">Lo que no funciona</h3>
          <p className="text-sm text-gray-400">
            Una planta con mas luz, otra con mas EC, una de control. Con una replica por condicion no hay forma de
            separar el efecto del tratamiento de la variacion natural entre plantas.
          </p>
        </div>
        <div className="bg-gray-900 border border-green-800/50 rounded-xl p-5">
          <h3 className="font-semibold text-green-400 mb-2">Lo que si</h3>
          <p className="text-sm text-gray-400">
            Las tres en condiciones identicas, midiendo cuanto difieren entre si. Eso da el{' '}
            <span className="text-gray-200 font-semibold">piso de ruido</span>: sin ese numero, ningun experimento
            futuro es interpretable, porque no sabras si un 15% de diferencia significa algo.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-gray-200 mb-4">Que registrar desde el dia cero</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: 'Por balde', d: 'Peso de fruta, numero de flores, estolones, fecha de cada evento fenologico.' },
            { t: 'Continuo', d: 'Temp, RH, VPD, CO2, PPFD, DLI acumulado. Un registro cada 5 minutos.' },
            { t: 'Por riego', d: 'EC y pH de entrada y de drenaje. La diferencia dice que consumio la planta.' },
            { t: 'Manual', d: 'Fotos a hora fija y misma posicion. Es el unico dato que no se puede reconstruir despues.' },
          ].map((c) => (
            <div key={c.t}>
              <p className="text-xs font-mono text-green-500 bg-green-950 px-2 py-1 rounded inline-block mb-2">{c.t}</p>
              <p className="text-sm text-gray-500">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
