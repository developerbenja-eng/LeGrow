#ifndef CONFIG_H
#define CONFIG_H

// ============================================
// GrowBox ESP32 Configuration
// ============================================

// --- WiFi ---
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// --- MQTT (for dashboard communication) ---
#define MQTT_SERVER "YOUR_MQTT_SERVER"  // e.g., "192.168.1.100" or "mqtt.example.com"
#define MQTT_PORT 1883
#define MQTT_USER "growbox"
#define MQTT_PASSWORD "YOUR_MQTT_PASSWORD"
#define MQTT_TOPIC_PREFIX "growbox"

// --- Pin Definitions ---
// I2C Bus (shared by SCD41, BH1750, SSD1306)
#define I2C_SDA 21
#define I2C_SCL 22

// Analog Sensors (ADC1 only — ADC2 conflicts with WiFi)
#define SOIL_MOISTURE_PIN_1 32
#define SOIL_MOISTURE_PIN_2 33
#define SOIL_MOISTURE_PIN_3 34
#define PH_SENSOR_PIN 35  // Optional

// OneWire (DS18B20 soil temperature)
#define ONEWIRE_PIN 4
#define DS18B20_PULLUP_RESISTOR 4700  // 4.7kΩ pull-up required

// Relay Control (Active LOW)
#define RELAY_GROW_LIGHT 16
#define RELAY_EXHAUST_FAN 17
#define RELAY_WATER_PUMP 18
#define RELAY_CLIP_FAN 19

// --- Sensor Reading Intervals ---
#define SENSOR_READ_INTERVAL_MS 30000    // Read sensors every 30 seconds
#define LOG_INTERVAL_MS 3600000          // Log to SD/cloud every hour
#define DISPLAY_UPDATE_INTERVAL_MS 5000  // Update OLED every 5 seconds

// --- Optimal Ranges for Strawberries ---
// Temperature (Fahrenheit)
#define TEMP_DAY_MIN 60.0
#define TEMP_DAY_OPTIMAL_LOW 68.0
#define TEMP_DAY_OPTIMAL_HIGH 75.0
#define TEMP_DAY_MAX 85.0
#define TEMP_NIGHT_MIN 45.0
#define TEMP_NIGHT_OPTIMAL_LOW 50.0
#define TEMP_NIGHT_OPTIMAL_HIGH 54.0
#define TEMP_NIGHT_MAX 65.0
#define TEMP_FAN_TRIGGER 80.0
#define TEMP_ALERT_LOW 55.0

// Humidity (%)
#define HUMIDITY_MIN 30.0
#define HUMIDITY_OPTIMAL_LOW 40.0
#define HUMIDITY_OPTIMAL_HIGH 60.0
#define HUMIDITY_MAX 70.0
#define HUMIDITY_FAN_TRIGGER 70.0

// Soil Moisture (% — calibrated 0-100)
#define SOIL_MOISTURE_DRY 40.0        // Trigger watering
#define SOIL_MOISTURE_OPTIMAL_LOW 50.0
#define SOIL_MOISTURE_OPTIMAL_HIGH 70.0
#define SOIL_MOISTURE_WET 80.0        // Stop watering

// CO2 (ppm)
#define CO2_LOW 400.0
#define CO2_OPTIMAL_LOW 800.0
#define CO2_OPTIMAL_HIGH 1200.0
#define CO2_HIGH 2000.0

// --- Light Schedule ---
#define LIGHT_ON_HOUR 18    // 6:00 PM
#define LIGHT_ON_MINUTE 0
#define LIGHT_OFF_HOUR 8    // 8:00 AM
#define LIGHT_OFF_MINUTE 0

// --- Watering ---
#define PUMP_ON_DURATION_MS 10000    // Run pump for 10 seconds per watering
#define PUMP_COOLDOWN_MS 300000      // Wait 5 minutes before re-watering
#define PUMP_ALERT_TIMEOUT_MS 300000 // Alert if still dry after 5 minutes

// --- Soil Moisture Calibration ---
// Measure these with your specific sensor in air and water
#define SOIL_MOISTURE_AIR_VALUE 3500    // ADC reading in dry air
#define SOIL_MOISTURE_WATER_VALUE 1500  // ADC reading in water

#endif // CONFIG_H
