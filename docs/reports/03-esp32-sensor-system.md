# ESP32 Sensor & Automation System Design

## Overview

This document describes a DIY monitoring and automation system for an indoor berry grow tent built around the ESP32 microcontroller. The system monitors environmental conditions (temperature, humidity, CO2, light, soil moisture, soil temperature, and optionally pH/EC) and automates watering, ventilation, and lighting. All sensor data is published over WiFi for dashboarding, alerting, and historical analysis.

The design prioritizes reliability, low cost, and extensibility. Every component can be sourced for under $100 total, and the system can be assembled on a breadboard before moving to a more permanent PCB or enclosure.

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    ESP32-S3                          │
│                                                     │
│  I2C Bus ─────┬── SCD41 (CO2 + Temp + Humidity)     │
│               ├── BH1750 (Light/Lux → PPFD est.)    │
│               └── SSD1306 OLED Display              │
│                                                     │
│  OneWire ─────── DS18B20 (Soil Temp Probe)          │
│                                                     │
│  ADC ─────────┬── Soil Moisture Sensor 1            │
│               ├── Soil Moisture Sensor 2            │
│               ├── Soil Moisture Sensor 3            │
│               └── (optional) pH Sensor              │
│                                                     │
│  GPIO ────────┬── Relay CH1 → Grow Light (on/off)   │
│               ├── Relay CH2 → Exhaust Fan (on/off)  │
│               ├── Relay CH3 → Water Pump (on/off)   │
│               └── Relay CH4 → Clip Fan (on/off)     │
│                                                     │
│  WiFi ────────── Home Assistant / MQTT / Dashboard   │
│                  → Phone alerts                     │
│                  → History graphs                   │
│                  → Remote control                   │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
Sensors → ESP32 → MQTT Broker → Dashboard / Home Assistant
                → OLED Display (local)
                → SD Card (local backup)
                → Automation Engine (on-device)
                      ↓
                Relay Module → Lights, Fans, Pump
```

1. Sensors are read every 30 seconds.
2. Readings are displayed on the local OLED and logged to the SD card.
3. Readings are published to an MQTT broker over WiFi.
4. The dashboard (Next.js or Home Assistant) subscribes to MQTT topics for real-time display and historical graphing.
5. The on-device automation engine evaluates rules and triggers relays without depending on network connectivity.
6. Alerts are pushed to a phone via MQTT, Home Assistant notifications, or a custom webhook.

---

## Bill of Materials

### Core Controller

| Component | Model | Interface | Est. Cost |
|---|---|---|---|
| ESP32 Dev Board | ESP32-WROOM-32 or ESP32-S3 | -- | $6--10 |
| Breadboard + jumper wires | For prototyping | -- | $5--10 |
| USB-C power supply | 5V 2A minimum | -- | $5--8 |

### Environmental Sensors

| What It Measures | Sensor | Interface | Why This Sensor | Cost |
|---|---|---|---|---|
| Temp + Humidity + CO2 | SCD41 (Sensirion) | I2C | True photoacoustic CO2 measurement (not a VOC proxy). Also provides accurate temp and humidity. Range 400--5000 ppm. | $25--35 |
| Soil Moisture (x2--4) | Capacitive v1.2 | Analog (ADC) | Use CAPACITIVE, not resistive --- resistive probes corrode within weeks in moist soil. Triggers auto-watering. | $2--3 each |
| Light Intensity | BH1750 | I2C | 16-bit ambient light sensor. Lux readings can be converted to estimated PPFD with a calibration factor. | $3--5 |
| Soil Temperature | DS18B20 (waterproof) | OneWire | Stainless steel waterproof probe rated to 125 C. Goes directly into the soil for root zone monitoring. | $3--5 |
| pH (optional) | DFRobot Gravity Analog pH V2 | Analog (ADC) | Monitor runoff water pH. Requires periodic calibration with buffer solutions. | $30--40 |
| EC/TDS (optional) | DFRobot Gravity TDS | Analog (ADC) | Nutrient concentration in irrigation/runoff water. | $12--15 |

### Actuators

| What It Controls | Component | Interface | Function | Cost |
|---|---|---|---|---|
| Relay module | 4-channel 5V relay | GPIO | Switches mains-powered lights, fan, pump, and clip fan. Optocoupler-isolated. | $5--8 |
| Water pump | 12V DC peristaltic pump | Via relay | Auto-watering. Peristaltic pumps are self-priming and easy to dose. | $8--15 |
| Tubing | 6mm inner diameter silicone (10 ft) | -- | Routes water from reservoir to pots. Food-grade silicone resists algae. | $5--8 |
| Water reservoir | 5-gallon bucket with lid | -- | Holds pre-mixed nutrient water. Lid prevents evaporation and debris. | $5--8 |

### Display & Data Logging

| Component | Model | Interface | Function | Cost |
|---|---|---|---|---|
| OLED Display | SSD1306 0.96" or 1.3" | I2C | Shows real-time sensor readings at the tent without needing a phone. | $5--8 |
| SD Card module | Micro SD breakout | SPI | Local data logging as a CSV fallback if WiFi goes down. | $3--5 |

### Estimated Total Cost

| Category | Cost Range |
|---|---|
| Controller + power | $16--28 |
| Environmental sensors (core) | $35--51 |
| Soil moisture (x3) | $6--9 |
| Actuators (relay + pump + tubing + reservoir) | $23--39 |
| Display + SD | $8--13 |
| Optional (pH + EC) | $42--55 |
| **Total (without optional)** | **~$88--140** |
| **Total (with optional)** | **~$130--195** |

A practical starting build targeting the essentials comes in around **$98**.

---

## Sensor Details

### SCD41 -- CO2, Temperature, and Humidity

The SCD41 is a photoacoustic NDIR CO2 sensor made by Sensirion. Unlike cheaper eCO2 sensors (such as the CCS811 or SGP30) that estimate CO2 from volatile organic compounds, the SCD41 directly measures CO2 concentration using infrared absorption. This matters for a grow tent because plants actually consume CO2, and you want a real reading, not a proxy.

| Specification | Value |
|---|---|
| CO2 range | 400--5000 ppm |
| CO2 accuracy | +/- 40 ppm + 5% of reading |
| Temperature accuracy | +/- 0.8 C |
| Humidity accuracy | +/- 6% RH |
| I2C address | 0x62 |
| Supply voltage | 3.3V or 5V |
| Measurement interval | 5 seconds (periodic mode) |
| Library | `Sensirion I2C SCD4x` (Arduino) |

**Usage notes:**
- Allow 60 seconds of warm-up after power-on before trusting readings.
- The sensor performs automatic self-calibration (ASC) assuming it sees fresh outdoor air (~420 ppm) at least once per week. In a sealed tent this may not happen, so consider disabling ASC and performing manual calibration.
- The on-board temperature sensor reads slightly high due to self-heating. Apply a -2 C offset or rely on a separate temperature probe for precision.

### BH1750 -- Light Intensity

The BH1750 is a digital ambient light sensor that outputs readings in lux. While lux is a human-vision-weighted unit and not directly equivalent to PAR (Photosynthetically Active Radiation, measured in PPFD / micromol/m2/s), a reasonable conversion exists for specific light sources.

| Specification | Value |
|---|---|
| Range | 1--65535 lux |
| Resolution | 1 lux (high-res mode) |
| I2C address | 0x23 (ADDR pin LOW) or 0x5C (ADDR pin HIGH) |
| Supply voltage | 3.3V or 5V |
| Library | `BH1750` (Arduino) |

**Lux to PPFD conversion factors** (approximate):

| Light Source | Multiply Lux By |
|---|---|
| Sunlight | 0.0185 |
| White LED grow light | 0.0185 |
| Red/Blue LED (blurple) | 0.0135 |
| HPS | 0.0130 |

For a white LED grow light: `PPFD (approx) = lux x 0.0185`

This is an estimate. For precise PPFD, a quantum sensor (like an Apogee MQ-500) is needed, but those cost $300+. The BH1750 is good enough to verify that light is reaching the canopy and to detect lamp failures.

### Capacitive Soil Moisture Sensor v1.2

| Specification | Value |
|---|---|
| Output | Analog voltage (0--3.3V) |
| Supply voltage | 3.3V or 5V |
| Sensing method | Capacitive (no exposed metal contacts) |
| Recommended ADC pins | GPIO 32, 33, 34, 35 (ESP32 ADC1) |

**Critical: use capacitive, NOT resistive.** Resistive soil moisture sensors expose metal electrodes directly to wet soil. Electrolysis corrodes them within weeks. Capacitive sensors measure the dielectric constant of the soil through a PCB coating and last much longer.

**Calibration procedure:**

1. Read the raw ADC value with the sensor completely dry (in air). Record this as `DRY_VALUE` (typically ~3200--3500 on a 12-bit ADC).
2. Submerge the sensor up to the line in a glass of water. Record this as `WET_VALUE` (typically ~1400--1800).
3. Map the raw reading to a 0--100% scale:

```cpp
int moisture_pct = map(raw_adc, DRY_VALUE, WET_VALUE, 0, 100);
moisture_pct = constrain(moisture_pct, 0, 100);
```

**Placement:** Insert the sensor vertically into the pot so the sensing area is in the root zone (2--4 inches deep). Avoid pressing it directly against the pot wall.

### DS18B20 -- Soil Temperature

| Specification | Value |
|---|---|
| Range | -55 C to +125 C |
| Accuracy | +/- 0.5 C (from -10 C to +85 C) |
| Resolution | 9--12 bits (configurable) |
| Protocol | OneWire (single data pin, multiple sensors) |
| Pull-up | 4.7k ohm resistor from data to 3.3V |
| Library | `DallasTemperature` + `OneWire` (Arduino) |

The waterproof stainless steel probe version is essential for soil use. The bare TO-92 package will corrode. Each DS18B20 has a unique 64-bit address, so multiple sensors can share a single GPIO pin.

### 4-Channel Relay Module

| Specification | Value |
|---|---|
| Channels | 4 (independently controlled) |
| Trigger | Active LOW (common on most modules) |
| Control voltage | 3.3V compatible (with optocoupler) |
| Switching capacity | 10A @ 250VAC per channel |
| Isolation | Optocoupler between control and load side |

**Safety considerations:**
- Relays switch mains voltage (120V/240V AC). Use proper wiring practices: strain relief, insulated connections, and an enclosure.
- For the water pump (12V DC), the relay switches the pump's power supply, not mains directly.
- Never exceed the relay's rated current. A typical grow light draws 1--3A at 120V, well within the 10A rating.
- Consider adding a fuse on each relay output for additional protection.

---

## Wiring Guide

### Pin Assignment Summary

| ESP32 GPIO | Function | Connected To |
|---|---|---|
| GPIO 21 | I2C SDA | SCD41, BH1750, SSD1306 (shared bus) |
| GPIO 22 | I2C SCL | SCD41, BH1750, SSD1306 (shared bus) |
| GPIO 4 | OneWire Data | DS18B20 (with 4.7k pull-up to 3.3V) |
| GPIO 32 | ADC1 CH4 | Soil Moisture Sensor 1 |
| GPIO 33 | ADC1 CH5 | Soil Moisture Sensor 2 |
| GPIO 34 | ADC1 CH6 | Soil Moisture Sensor 3 |
| GPIO 35 | ADC1 CH7 | pH Sensor (optional) |
| GPIO 16 | Digital Out | Relay CH1 -- Grow Light |
| GPIO 17 | Digital Out | Relay CH2 -- Exhaust Fan |
| GPIO 18 | Digital Out | Relay CH3 -- Water Pump |
| GPIO 19 | Digital Out | Relay CH4 -- Clip Fan |
| GPIO 5 | SPI CS | SD Card module |
| GPIO 23 | SPI MOSI | SD Card module |
| GPIO 19* | SPI MISO | SD Card module (shared with Relay CH4 -- reassign one if using SD) |
| GPIO 18* | SPI CLK | SD Card module (shared with Relay CH3 -- reassign one if using SD) |

*Note: If using both the SD card module and 4-channel relay, reassign relay CH3 and CH4 to different GPIO pins (e.g., GPIO 25 and GPIO 26) to avoid SPI conflicts.*

### I2C Bus Wiring

All three I2C devices share the same two-wire bus. Each has a unique address so there are no conflicts.

```
ESP32 GPIO 21 (SDA) ──────┬── SCD41 SDA
                           ├── BH1750 SDA
                           └── SSD1306 SDA

ESP32 GPIO 22 (SCL) ──────┬── SCD41 SCL
                           ├── BH1750 SCL
                           └── SSD1306 SCL

3.3V ──────────────────────┬── SCD41 VCC
                           ├── BH1750 VCC
                           └── SSD1306 VCC

GND ───────────────────────┬── SCD41 GND
                           ├── BH1750 GND
                           └── SSD1306 GND
```

**I2C address map:**

| Device | Address |
|---|---|
| SCD41 | 0x62 |
| BH1750 | 0x23 |
| SSD1306 (128x64) | 0x3C |

If there are I2C issues, add 4.7k ohm pull-up resistors on SDA and SCL to 3.3V. Many breakout boards already include pull-ups; having too many in parallel can also cause problems. Use an I2C scanner sketch to verify all devices are detected.

### Analog Sensor Wiring

```
ESP32 GPIO 32 ── Soil Moisture Sensor 1 (AOUT)
ESP32 GPIO 33 ── Soil Moisture Sensor 2 (AOUT)
ESP32 GPIO 34 ── Soil Moisture Sensor 3 (AOUT)
ESP32 GPIO 35 ── pH Sensor (AOUT, optional)

3.3V ──────────── All sensor VCC pins
GND ───────────── All sensor GND pins
```

**Important ADC notes for ESP32:**
- Only use **ADC1** pins (GPIO 32--39) when WiFi is active. ADC2 (GPIO 0, 2, 4, 12--15, 25--27) conflicts with the WiFi radio and will return garbage readings.
- ESP32 ADC is 12-bit (0--4095) but is nonlinear at the extremes. Readings below ~100 mV and above ~3.1V are unreliable. Consider using the ESP32's built-in calibration or an external ADS1115 for better accuracy.
- For soil moisture sensors, the nonlinearity is acceptable since you only care about relative changes and thresholds.

### OneWire Wiring (DS18B20)

```
ESP32 GPIO 4 ──── DS18B20 Data (yellow wire)
                      │
                   4.7kΩ
                      │
3.3V ─────────────────┘

3.3V ──── DS18B20 VCC (red wire)
GND ───── DS18B20 GND (black wire)
```

The 4.7k ohm pull-up resistor is required for reliable OneWire communication. Without it, readings will be intermittent or fail entirely.

### Relay Module Wiring

```
ESP32 GPIO 16 ── Relay IN1 (Grow Light)
ESP32 GPIO 17 ── Relay IN2 (Exhaust Fan)
ESP32 GPIO 18 ── Relay IN3 (Water Pump)
ESP32 GPIO 19 ── Relay IN4 (Clip Fan)

ESP32 5V (VIN) ── Relay VCC
ESP32 GND ─────── Relay GND
```

**Relay output side (high voltage, handle with care):**

Each relay has three output terminals: COM (common), NO (normally open), NC (normally closed). For devices you want OFF by default (which is everything in this system), wire between COM and NO:

```
Wall outlet HOT ── Relay COM
Relay NO ────────── Device HOT wire
Wall outlet NEUTRAL ── Device NEUTRAL wire (direct, not through relay)
```

When the relay energizes, COM connects to NO, completing the circuit and powering the device.

---

## Automation Logic

### Pseudocode

```
EVERY 30 SECONDS:
    READ all sensors:
        co2, air_temp, humidity ← SCD41
        lux ← BH1750
        soil_moisture[1..3] ← Capacitive sensors
        soil_temp ← DS18B20

    // --- Watering ---
    FOR EACH soil_moisture_sensor:
        IF soil_moisture < 40%:
            PUMP ON for 10 seconds
            LOG "Watered pot #X at {timestamp}"
            WAIT 5 minutes
            RE-READ soil moisture
            IF soil_moisture STILL < 40%:
                ALERT phone "Pot #X still dry after watering — check pump/reservoir"

    // --- Temperature Management ---
    IF air_temp > 80°F:
        EXHAUST FAN ON
        CLIP FAN ON
        IF air_temp > 80°F after 15 minutes:
            ALERT phone "Tent still hot — check ventilation"

    IF air_temp < 55°F:
        ALERT phone "Too cold for strawberries — {air_temp}°F"

    // --- Humidity Management ---
    IF humidity > 70%:
        EXHAUST FAN ON (prevent mold / botrytis)
        LOG "High humidity: {humidity}% — fan activated"

    IF humidity < 30%:
        LOG "Low humidity warning: {humidity}%"
        // Consider adding a humidifier to actuators

    // --- CO2 Management ---
    IF co2 < 400 ppm:
        EXHAUST FAN ON (bring in fresh air)
        LOG "Low CO2: {co2}ppm — fan activated"

    IF co2 > 2000 ppm:
        ALERT phone "CO2 dangerously high: {co2}ppm"
        EXHAUST FAN ON

    // --- Light Schedule ---
    LIGHT SCHEDULE (configurable via dashboard):
        ON at 6:00 AM → full brightness (or via dimmer PWM)
        DIM to 60% at 6:00 PM (simulating dusk, optional)
        OFF at 10:00 PM
        Total: 16 hours on / 8 hours off

        // Strawberries are long-day plants for vegetative growth
        // Reduce to 12h on / 12h off to trigger flowering

        OVERRIDE: manual on/off via phone or dashboard

    // --- Logging ---
    EVERY 60 SECONDS:
        UPDATE OLED display with current readings

    EVERY 5 MINUTES:
        PUBLISH all readings to MQTT
        WRITE readings to SD card (CSV)

    EVERY HOUR:
        PUSH summary to dashboard
```

### Watering Safety Guards

The water pump requires extra protection to prevent flooding:

1. **Maximum run time:** Never run the pump for more than 30 seconds continuously. If the soil moisture target is not met, wait and retry rather than running the pump indefinitely.
2. **Cooldown period:** After each watering event, wait at least 5 minutes before watering again. Water takes time to distribute through soil.
3. **Daily limit:** Cap total watering at a reasonable amount (e.g., 500 mL per pot per day). Track cumulative pump-on time.
4. **Dry reservoir detection:** If soil moisture does not increase after multiple watering attempts, assume the reservoir is empty and alert immediately.
5. **Overflow tray sensor (optional):** A simple float switch in the drip tray can cut the pump if water is pooling.

---

## Optimal Ranges for Strawberries

| Parameter | Min | Optimal | Max | Action if Out of Range |
|---|---|---|---|---|
| Air Temp (day) | 60 F | 68--75 F | 85 F | Fan on if > 80 F, alert if < 55 F |
| Air Temp (night) | 45 F | 50--54 F | 65 F | Alert if out of range |
| Humidity | 30% | 40--60% | 70% | Fan on if > 70% (Botrytis mold risk) |
| Soil Moisture | 40% | 50--70% | 85% | Pump on if < 40%, stop pump if > 80% |
| CO2 | 400 ppm | 800--1200 ppm | 2000 ppm | Fan for fresh air if < 400 ppm |
| Light (PPFD) | 200 umol/m2/s | 300--350 umol/m2/s | 500 umol/m2/s | Dim or brighten light accordingly |
| Soil Temp | 55 F | 60--70 F | 80 F | Monitor only (hard to actuate) |
| pH (runoff) | 5.5 | 5.8--6.2 | 6.5 | Manual adjustment with pH up/down |
| EC (runoff) | 0.8 mS/cm | 1.0--1.5 mS/cm | 2.0 mS/cm | Adjust nutrient concentration |

### Strawberry-Specific Notes

- **Photoperiod:** Strawberries are facultative long-day plants. Day-neutral varieties (like Albion, Seascape, San Andreas) fruit regardless of day length but still benefit from 14--16 hours of light for vigorous growth. Reduce to 12 hours to push flowering on June-bearing types.
- **Chill hours:** Many strawberry varieties need 200--800 hours below 45 F to break dormancy. Everbearing and day-neutral varieties have lower chill requirements. If growing from runners that have already been chilled, this is not a concern indoors.
- **Botrytis (gray mold):** The number one fungal threat to indoor strawberries. Triggered by high humidity (>70%), poor air circulation, and water sitting on fruit or flowers. The exhaust fan and clip fan automation directly combat this.
- **Pollination:** Indoors there are no wind or bees. Use a small paintbrush or electric toothbrush to vibrate flowers for pollination. A clip fan on low helps too.

### Blackberry and Raspberry Adjustments

If expanding to cane berries, adjust the following ranges:

| Parameter | Blackberry | Raspberry |
|---|---|---|
| Air Temp (day) | 70--85 F | 65--75 F |
| Light (PPFD) | 400--600 umol/m2/s | 300--500 umol/m2/s |
| Soil pH | 5.5--6.5 | 5.5--6.5 |
| Training | Espalier / trellis wire | Trellis wire, prune to 4--5 canes |

---

## Cannabis Growing Experience Translation

For growers coming from a cannabis background, many of the same techniques and monitoring principles apply to berry growing. The equipment is identical; only the parameters and training methods change.

| Cannabis Technique | Berry Equivalent | Notes |
|---|---|---|
| SCROG (Screen of Green) | Blackberry/raspberry espalier | Weave canes through a horizontal wire grid. Same concept: spread growth horizontally for even light distribution. |
| LST (Low Stress Training) | Tying canes to horizontal wires | Bend and tie new blackberry/raspberry canes to run horizontally along support wires. Increases fruit sites. |
| Topping for bushiness | Tip pruning (pinching) | Pinch the growing tips of cane berries to encourage lateral branching and more fruit sites. Same principle as topping. |
| SOG (Sea of Green) | Strawberry tower / vertical stack | Pack many small strawberry plants into a vertical column or tower. High density, small individual plants. |
| VPD charts | Same concept applies | Vapor Pressure Deficit matters for berry transpiration too. Target 0.8--1.2 kPa during vegetative growth. |
| pH/EC runoff testing | Identical practice | Same pH pens, same EC meters, same runoff testing methodology. Berry pH target is 5.8--6.2 vs cannabis 5.8--6.5. |
| Defoliation | Leaf thinning | Remove old, damaged, or shading leaves from strawberry crowns to improve airflow and light to fruit. |
| Flush before harvest | Not needed | Berries do not accumulate nutrients the way cannabis flower does. |

---

## Firmware Approach Options

### Option 1: Arduino IDE / PlatformIO (Custom C++)

Write custom firmware for full control. Best if you want to understand every line of code.

**Pros:** Complete control, no external dependencies at runtime, can optimize for low power.

**Cons:** More code to write and maintain, must implement MQTT/WiFi reconnection logic yourself.

**Key libraries:**
- `WiFi.h` -- ESP32 WiFi
- `PubSubClient` -- MQTT client
- `Wire.h` -- I2C
- `SensirionI2CScd4x` -- SCD41 driver
- `BH1750` -- light sensor
- `DallasTemperature` + `OneWire` -- DS18B20
- `Adafruit_SSD1306` -- OLED display
- `SD.h` -- SD card logging
- `ArduinoJson` -- JSON serialization for MQTT payloads
- `NTPClient` -- time sync for scheduling

### Option 2: ESPHome (YAML Configuration)

ESPHome compiles a custom firmware from a YAML configuration file. It integrates directly with Home Assistant and handles WiFi reconnection, OTA updates, and sensor publishing automatically.

**Pros:** Minimal code, automatic Home Assistant integration, OTA updates, well-tested sensor drivers.

**Cons:** Less flexibility for custom logic, depends on Home Assistant for dashboarding.

**Example ESPHome configuration snippet:**

```yaml
esphome:
  name: legrow
  platform: ESP32
  board: esp32dev

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

i2c:
  sda: GPIO21
  scl: GPIO22

sensor:
  - platform: scd4x
    co2:
      name: "Grow Tent CO2"
    temperature:
      name: "Grow Tent Temperature"
    humidity:
      name: "Grow Tent Humidity"
    update_interval: 30s

  - platform: bh1750
    name: "Grow Tent Light"
    address: 0x23
    update_interval: 30s

  - platform: dallas_temp
    address: 0xXXXXXXXXXXXXXXXX
    name: "Soil Temperature"
    update_interval: 30s

  - platform: adc
    pin: GPIO32
    name: "Soil Moisture 1"
    update_interval: 30s
    filters:
      - calibrate_linear:
          - 3.3 -> 0.0
          - 1.4 -> 100.0
      - clamp:
          min_value: 0
          max_value: 100

switch:
  - platform: gpio
    pin: GPIO16
    name: "Grow Light"
    id: grow_light
  - platform: gpio
    pin: GPIO17
    name: "Exhaust Fan"
    id: exhaust_fan
  - platform: gpio
    pin: GPIO18
    name: "Water Pump"
    id: water_pump
  - platform: gpio
    pin: GPIO19
    name: "Clip Fan"
    id: clip_fan
```

### Option 3: MQTT + Custom Next.js Dashboard

Publish sensor readings to an MQTT broker (like Mosquitto) and build a custom Next.js dashboard that subscribes to the topics. This integrates directly with the legrow web application.

**Pros:** Full custom UI, integrates with the existing Next.js project, no Home Assistant dependency.

**Cons:** Must build and maintain the dashboard, need to run an MQTT broker.

**MQTT topic structure:**

```
legrow/sensors/co2          → 823
legrow/sensors/temperature  → 72.4
legrow/sensors/humidity     → 55.2
legrow/sensors/soil/1       → 62
legrow/sensors/soil/2       → 58
legrow/sensors/soil/3       → 71
legrow/sensors/soil_temp    → 65.1
legrow/sensors/light_lux    → 18500
legrow/sensors/light_ppfd   → 342
legrow/actuators/light      → ON
legrow/actuators/exhaust    → OFF
legrow/actuators/pump       → OFF
legrow/actuators/clipfan    → ON
legrow/commands/light       → ON/OFF (subscribe for remote control)
legrow/commands/pump        → ON/OFF
legrow/commands/exhaust     → ON/OFF
legrow/commands/clipfan     → ON/OFF
```

### Recommended Approach

**Start with ESPHome + Home Assistant** for fast initial setup and proven reliability. Then build the custom Next.js dashboard on top of MQTT as a second phase. ESPHome can publish to MQTT and Home Assistant simultaneously, so both systems can coexist.

---

## OLED Display Layout

The SSD1306 128x64 pixel display can show a compact summary of all critical readings. Cycle through multiple screens if needed.

### Screen 1: Environment

```
┌──────────────────────┐
│ LEGROW       12:34p │
│                      │
│ Temp    72.4°F       │
│ Humid   55.2%        │
│ CO2     823 ppm      │
│ Light   342 PPFD     │
└──────────────────────┘
```

### Screen 2: Soil

```
┌──────────────────────┐
│ SOIL          12:34p │
│                      │
│ Moist 1   62%  ████░ │
│ Moist 2   58%  ███░░ │
│ Moist 3   71%  ████░ │
│ Soil T    65.1°F     │
└──────────────────────┘
```

### Screen 3: Actuators

```
┌──────────────────────┐
│ CONTROL       12:34p │
│                      │
│ Light    ON   14h/16 │
│ Exhaust  OFF         │
│ Pump     OFF  (62%)  │
│ Clip Fan ON          │
└──────────────────────┘
```

---

## Where to Buy Sensors

| Source | Shipping Speed | Price Level | Best For |
|---|---|---|---|
| Amazon | 1--2 days (Prime) | Standard | Quick prototyping, need it now |
| AliExpress | 2--4 weeks | 40--60% cheaper | Bulk capacitive sensors, ESP32 boards, relay modules |
| Adafruit | 3--5 days | Premium | SCD41, BH1750 breakouts with excellent documentation and support |
| SparkFun | 3--5 days | Premium | Quality breakout boards, good tutorials |
| DFRobot | 1--2 weeks | Mid-range | pH and EC/TDS sensors specifically; their Gravity line is well-supported |
| Mouser/Digikey | 2--3 days | Varies | Specific ICs, precision resistors, connectors |

### Recommended Shopping List Strategy

1. **Order from Adafruit first:** SCD41 breakout, BH1750 breakout, SSD1306 OLED. These are the components where quality matters most, and Adafruit's breakout boards include proper voltage regulators, pull-ups, and documentation.
2. **Order from Amazon:** ESP32-S3 dev board, 4-channel relay module, breadboard and jumper wires, peristaltic pump, DS18B20 waterproof probe, USB-C power supply.
3. **Order from AliExpress (if patient):** Capacitive soil moisture sensors (buy 5--6, they are cheap and some may be duds), extra ESP32 boards as spares.
4. **Order from DFRobot (if using pH/EC):** Gravity Analog pH V2 kit and Gravity TDS sensor. These come with calibration solutions and proper BNC connectors.

---

## Dashboard Integration

### Option A: ESPHome + Home Assistant (Recommended Starting Point)

Home Assistant provides:
- Auto-discovery of ESPHome devices
- Historical graphs out of the box
- Automation engine for complex rules
- Mobile app with push notifications
- Lovelace dashboards with gauge cards, history graphs, and entity cards

### Option B: MQTT + Custom Next.js Dashboard (Full Control)

For the legrow Next.js project, the architecture would be:

```
ESP32 → MQTT Broker (Mosquitto) → Next.js API Route (MQTT subscriber)
                                       ↓
                                   Database (LibSQL/Turso)
                                       ↓
                                   Dashboard UI (React + Charts)
                                       ↓
                                   Push notifications (web push or webhook)
```

**Implementation steps:**
1. Run Mosquitto MQTT broker (Docker or native install).
2. Create a Next.js API route or background worker that subscribes to `legrow/#` topics.
3. On each message, write the reading to the database with a timestamp.
4. Build dashboard pages with time-series charts (e.g., using Recharts or Chart.js).
5. Add WebSocket or Server-Sent Events for real-time updates to the UI.
6. Implement alert rules in the API layer: check thresholds and send push notifications.

### Option C: Blynk (Mobile-First, Quick Setup)

Blynk provides a mobile app with drag-and-drop widgets. Good for a quick prototype but limited customization. The free tier supports one device with limited data points.

### Option D: Grafana + InfluxDB (Data Nerd Option)

If you want powerful time-series visualization:
1. ESP32 publishes to MQTT.
2. Telegraf (or a bridge script) subscribes to MQTT and writes to InfluxDB.
3. Grafana dashboards query InfluxDB for beautiful, customizable graphs.

This is overkill for a single grow tent but scales well if you expand to multiple tents or want sophisticated alerting with Grafana's built-in alert manager.

---

## Power and Safety Considerations

### Power Budget

| Component | Current Draw (typical) |
|---|---|
| ESP32 (WiFi active) | 150--240 mA |
| SCD41 | 18 mA (during measurement) |
| BH1750 | 0.12 mA |
| DS18B20 | 1.5 mA |
| Capacitive moisture (x3) | 5 mA each |
| SSD1306 OLED | 20 mA |
| Relay module coils (x4) | 70 mA each (280 mA max) |
| SD card module | 50--100 mA (during write) |
| **Total (worst case)** | **~600--700 mA** |

A 5V 2A USB power supply provides ample headroom. The peristaltic pump runs on its own 12V supply, switched by the relay.

### Safety Checklist

- [ ] All mains wiring (120V/240V) done with properly rated wire and connectors
- [ ] Relay module enclosed in a project box; no exposed mains terminals
- [ ] GFCI outlet used for all mains-powered equipment (water + electricity)
- [ ] Water pump has a maximum run-time safeguard in firmware
- [ ] Drip tray under all pots; no water near electronics
- [ ] ESP32 and sensor board elevated above pot level (shelf or mounted to tent pole)
- [ ] Smoke detector in the room
- [ ] Fire extinguisher accessible

### Failure Modes and Mitigations

| Failure | Impact | Mitigation |
|---|---|---|
| WiFi disconnect | No remote monitoring or alerts | On-device automation continues independently; SD card logs locally; auto-reconnect logic |
| Sensor failure (bad reading) | Incorrect automation trigger | Validate readings against sane ranges; ignore obviously wrong values (e.g., -127 C from DS18B20 means disconnected) |
| Pump stuck ON | Flooding | Maximum run-time guard (30s hard limit); daily volume cap; overflow tray sensor |
| Relay stuck ON | Fan/light stays on | Not dangerous for fan/light; for pump, see above. Watchdog timer reboots ESP32 if main loop stalls. |
| Power outage | Everything stops | Battery backup (optional UPS) for ESP32 only; grow light and fans restart when power returns |
| SD card full | No local logging | Rotate logs (delete oldest file when card is >80% full); alert when space is low |

---

## Next Steps

1. **Order components** -- Start with the core sensor kit (ESP32, SCD41, BH1750, capacitive moisture sensors, DS18B20, relay module, OLED).
2. **Breadboard prototype** -- Wire everything on a breadboard and verify each sensor individually with simple test sketches.
3. **Flash ESPHome** -- Create the YAML config and connect to Home Assistant for immediate monitoring.
4. **Calibrate sensors** -- Calibrate soil moisture sensors (dry/wet readings), verify CO2 baseline, and confirm light sensor readings against known conditions.
5. **Build automation rules** -- Start with watering automation (most impactful), then add fan control and light scheduling.
6. **Build the dashboard** -- Integrate MQTT into the Next.js legrow app for a custom monitoring UI.
7. **Enclosure and permanent wiring** -- Move from breadboard to a soldered perfboard or custom PCB. Mount in a weatherproof enclosure.
