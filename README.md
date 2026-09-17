# LeGrow

Indoor berry growing system with ESP32 sensor monitoring and a Next.js dashboard.

## What Is This?

A complete indoor growing setup for strawberries (and eventually raspberries, blackberries, blueberries) using grow tents, LED lights, and DIY environmental monitoring. The ESP32 tracks temperature, humidity, CO2, light levels, and soil conditions — automating fans, lights, and watering.

## Project Structure

```
LeGrow/
├── src/                    # Next.js dashboard app
│   └── app/
│       ├── page.tsx        # Landing page with research links
│       └── dashboard/      # Live sensor monitoring (WIP)
├── firmware/               # ESP32 PlatformIO project
│   ├── platformio.ini      # Board & library config
│   ├── include/config.h    # WiFi, MQTT, pin assignments
│   └── src/main.cpp        # Sensor reading & automation logic
└── docs/reports/           # Research & planning docs
    ├── 01-species-guide.md
    ├── 02-grow-lights-guide.md
    ├── 03-esp32-sensor-system.md
    ├── 04-complete-shopping-list.md
    ├── 05-tent-setup-guide.md
    ├── 06-nursery-road-trip.md
    ├── 07-growing-conditions-reference.md
    └── 08-extension-strategies.md
```

## Tech Stack

**Dashboard**: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4

**Firmware**: ESP32 (PlatformIO/Arduino), MQTT, ArduinoJson

**Sensors**: SCD41 (CO2/temp/humidity), BH1750 (light), DS18B20 (soil temp), capacitive soil moisture

## Getting Started

### Dashboard

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Firmware

1. Install [PlatformIO](https://platformio.org/)
2. Copy `firmware/include/config.h` and fill in your WiFi/MQTT credentials
3. Connect your ESP32 and upload:

```bash
cd firmware
pio run --target upload
```

## Hardware Budget

| Category | Cost |
|----------|------|
| 3x3 Grow Tent + Fan + Light | ~$375-435 |
| Growing Supplies (plants, soil, pots) | ~$115-160 |
| ESP32 Sensor System | ~$98 |
| **Total** | **~$590-690** |

Monthly running cost: ~$12-18 (Memphis, TN electricity rates).

## First Grow: Seascape Strawberries

- **Light**: Mars Hydro FC-E3000 at ~300 PPFD, 16h on / 8h off
- **Temp**: 65-75°F (18-24°C)
- **Humidity**: 60-70%
- **First harvest**: 8-12 weeks from bare root planting

## License

MIT
