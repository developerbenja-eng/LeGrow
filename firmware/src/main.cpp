/**
 * GrowBox - Indoor Berry Growing Monitor & Automation
 *
 * ESP32-based system for monitoring and automating an indoor
 * grow tent for strawberry (and future berry) production.
 *
 * Sensors:
 *   - SCD41: CO2 + Temperature + Humidity (I2C)
 *   - BH1750: Light intensity / PPFD estimation (I2C)
 *   - DS18B20: Soil temperature (OneWire)
 *   - Capacitive soil moisture sensors (Analog x3)
 *
 * Actuators:
 *   - 4-channel relay: Light, Exhaust Fan, Water Pump, Clip Fan
 *
 * Communication:
 *   - WiFi → MQTT → Next.js Dashboard
 *   - OLED display for local readings
 */

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <SensirionI2CScd4x.h>
#include <BH1750.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "config.h"

// ============================================
// Global Objects
// ============================================

// WiFi & MQTT
WiFiClient espClient;
PubSubClient mqtt(espClient);

// Sensors
SensirionI2CScd4x scd41;
BH1750 lightSensor;
OneWire oneWire(ONEWIRE_PIN);
DallasTemperature soilTempSensor(&oneWire);

// Display
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// ============================================
// Sensor Data Structure
// ============================================
struct SensorData {
    float airTemperature;     // °F
    float airHumidity;        // %
    uint16_t co2;             // ppm
    float lightLux;           // lux
    float lightPPFD;          // estimated µmol/m²/s
    float soilTemperature;    // °F
    float soilMoisture[3];    // % (calibrated 0-100)
    bool dataReady;
};

SensorData currentData;

// ============================================
// Timing
// ============================================
unsigned long lastSensorRead = 0;
unsigned long lastDisplayUpdate = 0;
unsigned long lastLogPublish = 0;
unsigned long lastPumpRun = 0;
bool pumpCooldown = false;

// ============================================
// Relay States
// ============================================
struct RelayStates {
    bool growLight = false;
    bool exhaustFan = false;
    bool waterPump = false;
    bool clipFan = false;
};

RelayStates relays;

// ============================================
// WiFi Connection
// ============================================
void setupWiFi() {
    Serial.print("Connecting to WiFi: ");
    Serial.println(WIFI_SSID);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected!");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nWiFi connection failed. Running in offline mode.");
    }
}

// ============================================
// MQTT Connection
// ============================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
    // Handle incoming MQTT commands from dashboard
    String message;
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }

    Serial.print("MQTT message [");
    Serial.print(topic);
    Serial.print("]: ");
    Serial.println(message);

    // Parse JSON commands
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, message);
    if (error) return;

    String command = doc["command"] | "";

    if (command == "light_on") setRelay(RELAY_GROW_LIGHT, true);
    else if (command == "light_off") setRelay(RELAY_GROW_LIGHT, false);
    else if (command == "fan_on") setRelay(RELAY_EXHAUST_FAN, true);
    else if (command == "fan_off") setRelay(RELAY_EXHAUST_FAN, false);
    else if (command == "pump_on") setRelay(RELAY_WATER_PUMP, true);
    else if (command == "pump_off") setRelay(RELAY_WATER_PUMP, false);
    else if (command == "water_now") triggerWatering();
}

void setupMQTT() {
    mqtt.setServer(MQTT_SERVER, MQTT_PORT);
    mqtt.setCallback(mqttCallback);
}

void reconnectMQTT() {
    if (WiFi.status() != WL_CONNECTED) return;
    if (mqtt.connected()) return;

    Serial.print("Connecting to MQTT...");
    String clientId = "growbox-" + String(random(0xffff), HEX);

    if (mqtt.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)) {
        Serial.println("connected!");
        mqtt.subscribe(MQTT_TOPIC_PREFIX "/command");
    } else {
        Serial.print("failed, rc=");
        Serial.println(mqtt.state());
    }
}

// ============================================
// Relay Control
// ============================================
void setRelay(int pin, bool state) {
    // Relays are typically Active LOW
    digitalWrite(pin, state ? LOW : HIGH);

    switch (pin) {
        case RELAY_GROW_LIGHT: relays.growLight = state; break;
        case RELAY_EXHAUST_FAN: relays.exhaustFan = state; break;
        case RELAY_WATER_PUMP: relays.waterPump = state; break;
        case RELAY_CLIP_FAN: relays.clipFan = state; break;
    }

    Serial.print("Relay ");
    Serial.print(pin);
    Serial.print(state ? " ON" : " OFF");
    Serial.println();
}

void setupRelays() {
    pinMode(RELAY_GROW_LIGHT, OUTPUT);
    pinMode(RELAY_EXHAUST_FAN, OUTPUT);
    pinMode(RELAY_WATER_PUMP, OUTPUT);
    pinMode(RELAY_CLIP_FAN, OUTPUT);

    // Start with all relays OFF (HIGH for active-low)
    digitalWrite(RELAY_GROW_LIGHT, HIGH);
    digitalWrite(RELAY_EXHAUST_FAN, HIGH);
    digitalWrite(RELAY_WATER_PUMP, HIGH);
    digitalWrite(RELAY_CLIP_FAN, HIGH);
}

// ============================================
// Sensor Initialization
// ============================================
void setupSensors() {
    Wire.begin(I2C_SDA, I2C_SCL);

    // SCD41 (CO2 + Temp + Humidity)
    scd41.begin(Wire);
    uint16_t err = scd41.stopPeriodicMeasurement();
    if (err) {
        Serial.println("SCD41: Error stopping measurement");
    }
    err = scd41.startPeriodicMeasurement();
    if (err) {
        Serial.println("SCD41: Error starting measurement");
    } else {
        Serial.println("SCD41: Initialized OK");
    }

    // BH1750 (Light)
    if (lightSensor.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
        Serial.println("BH1750: Initialized OK");
    } else {
        Serial.println("BH1750: Error initializing");
    }

    // DS18B20 (Soil Temperature)
    soilTempSensor.begin();
    Serial.print("DS18B20: Found ");
    Serial.print(soilTempSensor.getDeviceCount());
    Serial.println(" sensor(s)");

    // Soil Moisture (Analog)
    analogReadResolution(12);  // 12-bit ADC (0-4095)
    pinMode(SOIL_MOISTURE_PIN_1, INPUT);
    pinMode(SOIL_MOISTURE_PIN_2, INPUT);
    pinMode(SOIL_MOISTURE_PIN_3, INPUT);
    Serial.println("Soil Moisture: Analog pins configured");
}

// ============================================
// Display Setup
// ============================================
void setupDisplay() {
    if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println("OLED: Initialized OK");
        display.clearDisplay();
        display.setTextSize(1);
        display.setTextColor(SSD1306_WHITE);
        display.setCursor(0, 0);
        display.println("GrowBox v1.0");
        display.println("Initializing...");
        display.display();
    } else {
        Serial.println("OLED: Error initializing");
    }
}

// ============================================
// Read All Sensors
// ============================================
void readSensors() {
    // --- SCD41: CO2, Temperature, Humidity ---
    uint16_t co2Raw;
    float tempC, humidity;
    bool scdReady = false;

    scd41.getDataReadyFlag(scdReady);
    if (scdReady) {
        uint16_t err = scd41.readMeasurement(co2Raw, tempC, humidity);
        if (!err) {
            currentData.co2 = co2Raw;
            currentData.airTemperature = (tempC * 9.0 / 5.0) + 32.0;  // Convert to °F
            currentData.airHumidity = humidity;
        }
    }

    // --- BH1750: Light Intensity ---
    float lux = lightSensor.readLightLevel();
    if (lux >= 0) {
        currentData.lightLux = lux;
        // Approximate PPFD from lux (conversion factor for white LEDs)
        // This is an estimate — proper PAR meter would be more accurate
        currentData.lightPPFD = lux * 0.0185;
    }

    // --- DS18B20: Soil Temperature ---
    soilTempSensor.requestTemperatures();
    float soilTempC = soilTempSensor.getTempCByIndex(0);
    if (soilTempC != DEVICE_DISCONNECTED_C) {
        currentData.soilTemperature = (soilTempC * 9.0 / 5.0) + 32.0;
    }

    // --- Capacitive Soil Moisture ---
    int pins[] = {SOIL_MOISTURE_PIN_1, SOIL_MOISTURE_PIN_2, SOIL_MOISTURE_PIN_3};
    for (int i = 0; i < 3; i++) {
        int raw = analogRead(pins[i]);
        // Map ADC reading to 0-100% (inverted — lower ADC = wetter)
        float moisture = map(raw, SOIL_MOISTURE_AIR_VALUE, SOIL_MOISTURE_WATER_VALUE, 0, 100);
        currentData.soilMoisture[i] = constrain(moisture, 0, 100);
    }

    currentData.dataReady = true;

    // Debug output
    Serial.println("--- Sensor Readings ---");
    Serial.printf("Air Temp: %.1f°F | Humidity: %.1f%% | CO2: %d ppm\n",
                  currentData.airTemperature, currentData.airHumidity, currentData.co2);
    Serial.printf("Light: %.0f lux (~%.0f PPFD) | Soil Temp: %.1f°F\n",
                  currentData.lightLux, currentData.lightPPFD, currentData.soilTemperature);
    Serial.printf("Soil Moisture: %.0f%% | %.0f%% | %.0f%%\n",
                  currentData.soilMoisture[0], currentData.soilMoisture[1], currentData.soilMoisture[2]);
}

// ============================================
// Automation Logic
// ============================================
void triggerWatering() {
    if (pumpCooldown) {
        Serial.println("Pump on cooldown, skipping water");
        return;
    }

    Serial.println("WATERING: Pump ON");
    setRelay(RELAY_WATER_PUMP, true);
    delay(PUMP_ON_DURATION_MS);
    setRelay(RELAY_WATER_PUMP, false);
    Serial.println("WATERING: Pump OFF");

    lastPumpRun = millis();
    pumpCooldown = true;
}

void runAutomation() {
    if (!currentData.dataReady) return;

    // --- Temperature Control ---
    if (currentData.airTemperature > TEMP_FAN_TRIGGER) {
        if (!relays.exhaustFan) {
            setRelay(RELAY_EXHAUST_FAN, true);
            Serial.println("AUTO: Fan ON (temp high)");
        }
    } else if (currentData.airTemperature < TEMP_DAY_OPTIMAL_HIGH && relays.exhaustFan) {
        // Only auto-off if humidity is also OK
        if (currentData.airHumidity < HUMIDITY_FAN_TRIGGER) {
            setRelay(RELAY_EXHAUST_FAN, false);
            Serial.println("AUTO: Fan OFF (temp normal)");
        }
    }

    // --- Humidity Control ---
    if (currentData.airHumidity > HUMIDITY_FAN_TRIGGER) {
        if (!relays.exhaustFan) {
            setRelay(RELAY_EXHAUST_FAN, true);
            Serial.println("AUTO: Fan ON (humidity high)");
        }
    }

    // --- CO2 Control ---
    if (currentData.co2 < CO2_LOW) {
        if (!relays.exhaustFan) {
            setRelay(RELAY_EXHAUST_FAN, true);
            Serial.println("AUTO: Fan ON (CO2 low, need fresh air)");
        }
    }

    // --- Soil Moisture / Watering ---
    // Check pump cooldown
    if (pumpCooldown && (millis() - lastPumpRun > PUMP_COOLDOWN_MS)) {
        pumpCooldown = false;
    }

    // Average soil moisture across sensors
    float avgMoisture = 0;
    for (int i = 0; i < 3; i++) {
        avgMoisture += currentData.soilMoisture[i];
    }
    avgMoisture /= 3.0;

    if (avgMoisture < SOIL_MOISTURE_DRY) {
        triggerWatering();
    }

    // --- Alerts (via MQTT) ---
    if (currentData.airTemperature < TEMP_ALERT_LOW) {
        publishAlert("Temperature too low: " + String(currentData.airTemperature, 1) + "°F");
    }
    if (currentData.airTemperature > TEMP_DAY_MAX) {
        publishAlert("Temperature too high: " + String(currentData.airTemperature, 1) + "°F");
    }
}

// ============================================
// MQTT Publishing
// ============================================
void publishSensorData() {
    if (!mqtt.connected()) return;

    JsonDocument doc;

    doc["air_temp_f"] = round(currentData.airTemperature * 10) / 10.0;
    doc["humidity"] = round(currentData.airHumidity * 10) / 10.0;
    doc["co2"] = currentData.co2;
    doc["light_lux"] = round(currentData.lightLux);
    doc["light_ppfd"] = round(currentData.lightPPFD);
    doc["soil_temp_f"] = round(currentData.soilTemperature * 10) / 10.0;
    doc["soil_moisture_1"] = round(currentData.soilMoisture[0]);
    doc["soil_moisture_2"] = round(currentData.soilMoisture[1]);
    doc["soil_moisture_3"] = round(currentData.soilMoisture[2]);
    doc["relay_light"] = relays.growLight;
    doc["relay_fan"] = relays.exhaustFan;
    doc["relay_pump"] = relays.waterPump;
    doc["relay_clip_fan"] = relays.clipFan;
    doc["uptime_ms"] = millis();

    char buffer[512];
    serializeJson(doc, buffer);

    mqtt.publish(MQTT_TOPIC_PREFIX "/sensors", buffer);
}

void publishAlert(String message) {
    if (!mqtt.connected()) return;

    JsonDocument doc;
    doc["alert"] = message;
    doc["timestamp"] = millis();

    char buffer[256];
    serializeJson(doc, buffer);

    mqtt.publish(MQTT_TOPIC_PREFIX "/alerts", buffer);
    Serial.print("ALERT: ");
    Serial.println(message);
}

// ============================================
// Display Update
// ============================================
void updateDisplay() {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(0, 0);

    // Line 1: Temperature & Humidity
    display.printf("T:%.0fF H:%.0f%% CO2:%d\n",
                   currentData.airTemperature,
                   currentData.airHumidity,
                   currentData.co2);

    // Line 2: Light
    display.printf("Light: %.0f PPFD\n", currentData.lightPPFD);

    // Line 3: Soil
    display.printf("Soil: %.0fF M:%.0f%%\n",
                   currentData.soilTemperature,
                   (currentData.soilMoisture[0] + currentData.soilMoisture[1] + currentData.soilMoisture[2]) / 3.0);

    // Line 4: Individual moisture
    display.printf("M: %.0f%% %.0f%% %.0f%%\n",
                   currentData.soilMoisture[0],
                   currentData.soilMoisture[1],
                   currentData.soilMoisture[2]);

    // Line 5: Relay states
    display.printf("L:%s F:%s P:%s C:%s\n",
                   relays.growLight ? "ON" : "off",
                   relays.exhaustFan ? "ON" : "off",
                   relays.waterPump ? "ON" : "off",
                   relays.clipFan ? "ON" : "off");

    // Line 6: WiFi status
    display.printf("WiFi:%s MQTT:%s",
                   WiFi.status() == WL_CONNECTED ? "OK" : "NO",
                   mqtt.connected() ? "OK" : "NO");

    display.display();
}

// ============================================
// Setup
// ============================================
void setup() {
    Serial.begin(115200);
    delay(1000);

    Serial.println();
    Serial.println("================================");
    Serial.println("  GrowBox v1.0");
    Serial.println("  Indoor Berry Monitor");
    Serial.println("================================");
    Serial.println();

    setupRelays();
    setupDisplay();
    setupSensors();
    setupWiFi();
    setupMQTT();

    Serial.println();
    Serial.println("Setup complete! Starting monitoring...");
    Serial.println();
}

// ============================================
// Main Loop
// ============================================
void loop() {
    // Maintain MQTT connection
    if (!mqtt.connected()) {
        reconnectMQTT();
    }
    mqtt.loop();

    unsigned long now = millis();

    // Read sensors at interval
    if (now - lastSensorRead >= SENSOR_READ_INTERVAL_MS) {
        readSensors();
        runAutomation();
        lastSensorRead = now;
    }

    // Update display at interval
    if (now - lastDisplayUpdate >= DISPLAY_UPDATE_INTERVAL_MS) {
        updateDisplay();
        lastDisplayUpdate = now;
    }

    // Publish sensor data at interval
    if (now - lastLogPublish >= LOG_INTERVAL_MS) {
        publishSensorData();
        lastLogPublish = now;
    }
}
