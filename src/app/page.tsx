import Link from 'next/link';

const reports = [
  { id: '01', title: 'Species Guide', description: 'Berry & fruit varieties for indoor growing', href: '/reports/species-guide' },
  { id: '02', title: 'Grow Lights Guide', description: 'LED technology, spectrum, and product recommendations', href: '/reports/grow-lights' },
  { id: '03', title: 'ESP32 Sensor System', description: 'Monitoring & automation architecture design', href: '/reports/sensor-system' },
  { id: '04', title: 'Shopping List', description: 'Complete bill of materials with costs', href: '/reports/shopping-list' },
  { id: '05', title: 'Tent Setup Guide', description: 'Step-by-step build and configuration', href: '/reports/tent-setup' },
  { id: '06', title: 'Nursery Road Trip', description: 'Boone, NC → Memphis, TN plant shopping guide', href: '/reports/nursery-road-trip' },
  { id: '07', title: 'Growing Conditions', description: 'Temperature, humidity, light, and nutrient reference', href: '/reports/growing-conditions' },
  { id: '08', title: 'Extension Strategies', description: 'Year-round production and scaling plans', href: '/reports/extension-strategies' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-green-400 mb-2">GrowBox</h1>
          <p className="text-lg text-gray-400">Indoor Berry Growing System — Research, Monitoring & Automation</p>
          <div className="mt-4 flex gap-4">
            <Link href="/dashboard" className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors">
              Live Dashboard
            </Link>
            <a href="https://github.com/developerbenja-eng/growbox" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
              GitHub
            </a>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Setup Cost', value: '~$640', sub: 'one-time' },
            { label: 'Monthly Cost', value: '~$12', sub: 'Memphis, TN' },
            { label: 'First Harvest', value: '8-12 wks', sub: 'from transplant' },
            { label: 'Annual Yield', value: '27-36 lbs', sub: '9 plants' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-green-400">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Research Reports */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-200">Research Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {reports.map((report) => (
            <Link
              key={report.id}
              href={report.href}
              className="bg-gray-900 border border-gray-800 hover:border-green-600 rounded-xl p-5 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xs font-mono text-green-500 bg-green-950 px-2 py-1 rounded">{report.id}</span>
                <div>
                  <h3 className="font-semibold text-gray-200 group-hover:text-green-400 transition-colors">{report.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Tech Stack */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-200">Tech Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-blue-400 mb-2">Dashboard</h3>
            <p className="text-sm text-gray-400">Next.js 15 + React 19 + TypeScript + Tailwind CSS 4</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-yellow-400 mb-2">Firmware</h3>
            <p className="text-sm text-gray-400">ESP32 + Arduino/PlatformIO + MQTT + Sensors (SCD41, BH1750, DS18B20)</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-purple-400 mb-2">Hardware</h3>
            <p className="text-sm text-gray-400">Mars Hydro FC-E3000 + 3x3 Tent + AC Infinity T4 + Auto-watering</p>
          </div>
        </div>
      </div>
    </main>
  );
}
