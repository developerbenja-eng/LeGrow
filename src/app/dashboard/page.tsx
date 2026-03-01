export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-green-400 mb-2">Live Dashboard</h1>
        <p className="text-gray-500 mb-8">Real-time sensor data from ESP32 (coming soon — connect via MQTT)</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Air Temperature', value: '--°F', target: '68-75°F', icon: '🌡' },
            { label: 'Humidity', value: '--%', target: '40-60%', icon: '💧' },
            { label: 'CO2', value: '-- ppm', target: '800-1200 ppm', icon: '🌬' },
            { label: 'Light (PPFD)', value: '-- µmol', target: '300-350 µmol/m²/s', icon: '☀' },
            { label: 'Soil Moisture', value: '--%', target: '50-70%', icon: '🌱' },
            { label: 'Soil Temperature', value: '--°F', target: '60-70°F', icon: '🌍' },
          ].map((sensor) => (
            <div key={sensor.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{sensor.icon}</span>
                <span className="text-sm text-gray-500">{sensor.label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-300">{sensor.value}</p>
              <p className="text-xs text-gray-600 mt-1">Target: {sensor.target}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Grow Light', state: 'OFF' },
            { label: 'Exhaust Fan', state: 'OFF' },
            { label: 'Water Pump', state: 'OFF' },
            { label: 'Clip Fan', state: 'OFF' },
          ].map((relay) => (
            <div key={relay.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">{relay.label}</p>
              <p className="text-lg font-bold text-gray-600 mt-1">{relay.state}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
