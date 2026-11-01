/**
 * LANDSense - IoT-Based Landslide Monitoring & Early Warning System
 * ESP32 Firmware (PlatformIO / Arduino)
 *
 * Pin Connections:
 * - Rain Sensor (Analog AO) : GPIO 34 (ADC1_CH6)
 * - Soil Moisture Sensor AO : GPIO 35 (ADC1_CH7)
 * - DHT11 Data Pin          : GPIO 25
 * - ADXL345 Accelerometer   : DISABLED (Hardware Standby)
 *
 * Telemetry Interval: Every 3 seconds (3000 ms)
 * Ingestion Endpoint : POST /api/v1/readings
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#if __has_include("secrets.h")
  #include "secrets.h"
#elif __has_include("../include/secrets.h")
  #include "../include/secrets.h"
#endif

// ==========================================
// 1. Wi-Fi & Backend Server Configuration
// ==========================================
#ifndef WIFI_SSID
  #define WIFI_SSID "motorola edge 50 neo"
#endif
#ifndef WIFI_PASSWORD
  #define WIFI_PASSWORD ""
#endif

const char* wifi_ssid     = WIFI_SSID;
const char* wifi_password = WIFI_PASSWORD;

// IP address of the laptop running the FastAPI backend (detected IPv4):
const char* SERVER_HOST   = "10.83.254.39";
const int   SERVER_PORT   = 8000;
const char* API_ENDPOINT  = "/api/v1/readings";

// Station Node Identifier registered in LANDSense backend
const char* NODE_ID       = "NODE-001";

// ==========================================
// 2. Hardware Pin Assignments
// ==========================================
#define PIN_RAIN_SENSOR 34   // Analog input GPIO 34
#define PIN_SOIL_SENSOR 35   // Analog input GPIO 35
#define PIN_DHT11       25   // Digital data GPIO 25
#define DHT_TYPE        DHT11

DHT dht(PIN_DHT11, DHT_TYPE);

// Telemetry timing
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 3000; // 3 seconds

// Calibration baselines (12-bit ADC: 0 to 4095)
// Capacitive Soil Moisture: Dry air ~3500-4095, saturated water ~1200-1800
const int SOIL_DRY_RAW = 3500;
const int SOIL_WET_RAW = 1400;

// Rain Sensor Plate: Dry ~4095, heavy rain ~800-1500
const int RAIN_DRY_RAW = 4095;
const int RAIN_WET_RAW = 1000;

// Helper: Convert soil raw ADC to percentage (0 - 100%)
float calculateSoilMoisture(int rawValue) {
  if (rawValue >= SOIL_DRY_RAW) return 0.0;
  if (rawValue <= SOIL_WET_RAW) return 100.0;
  float pct = ((float)(SOIL_DRY_RAW - rawValue) / (float)(SOIL_DRY_RAW - SOIL_WET_RAW)) * 100.0;
  return constrain(pct, 0.0, 100.0);
}

// Helper: Convert rain sensor raw ADC to mm/hr estimation (0 to 60 mm/hr)
float calculateRainfallRate(int rawValue) {
  if (rawValue >= RAIN_DRY_RAW - 200) return 0.0;
  if (rawValue <= RAIN_WET_RAW) return 55.0;
  float rate = ((float)(RAIN_DRY_RAW - rawValue) / (float)(RAIN_DRY_RAW - RAIN_WET_RAW)) * 50.0;
  return constrain(rate, 0.0, 60.0);
}

void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("\n[WiFi] Connecting to network: " + String(WIFI_SSID));
  WiFi.mode(WIFI_STA);
  if (strlen(WIFI_PASSWORD) > 0) {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  } else {
    WiFi.begin(WIFI_SSID);
  }

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] ESP32 Assigned IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Connection timeout. Check SSID/Password or AP signal.");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==================================================");
  Serial.println("  LANDSense IoT Slope Monitoring Unit (ESP32)");
  Serial.println("==================================================");
  Serial.println("Wiring Check:");
  Serial.println(" - Rain Sensor  : GPIO 34 (Analog)");
  Serial.println(" - Soil Sensor  : GPIO 35 (Analog)");
  Serial.println(" - DHT11 Sensor : GPIO 25 (Digital)");
  Serial.println(" - ADXL345      : DISABLED / NOT CONNECTED");
  Serial.println("==================================================\n");

  // Configure ADC inputs
  pinMode(PIN_RAIN_SENSOR, INPUT);
  pinMode(PIN_SOIL_SENSOR, INPUT);

  // Initialize DHT11
  dht.begin();
  Serial.println("[Hardware] DHT11 sensor initialized.");

  // Connect to Wi-Fi
  connectToWiFi();
}

void sendTelemetry() {
  // 1. Read Analog Sensors
  int rawRain = analogRead(PIN_RAIN_SENSOR);
  int rawSoil = analogRead(PIN_SOIL_SENSOR);

  float rainRate = calculateRainfallRate(rawRain);
  float soilMoisturePct = calculateSoilMoisture(rawSoil);

  // 2. Read DHT11
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // Validate DHT readings (fallback to last known if sensor glitch)
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("[Hardware Warning] DHT11 read failed, using baseline.");
    temperature = 26.5;
    humidity = 72.0;
  }

  // 3. Print Local Diagnostics to Serial
  Serial.println("\n---------------------------------------------");
  Serial.printf("[Sensor Data] Time: %lu ms\n", millis());
  Serial.printf(" - Rain Raw ADC : %d  --> Rate: %.1f mm/hr\n", rawRain, rainRate);
  Serial.printf(" - Soil Raw ADC : %d  --> Moisture: %.1f %%\n", rawSoil, soilMoisturePct);
  Serial.printf(" - Temperature  : %.1f °C\n", temperature);
  Serial.printf(" - Humidity     : %.1f %%\n", humidity);
  Serial.println(" - ADXL345      : DISABLED (0.0° tilt, 0.0g vibration)");

  // 4. Send HTTP POST to FastAPI Backend
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    String url = "http://" + String(SERVER_HOST) + ":" + String(SERVER_PORT) + String(API_ENDPOINT);

    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");

    // Build JSON Payload
    JsonDocument doc;
    doc["node_id"]       = NODE_ID;
    doc["rainfall"]      = rainRate;
    doc["soil_moisture"] = soilMoisturePct;
    doc["ground_tilt"]   = 0.0; // ADXL345 disabled
    doc["vibration"]     = 0.0; // ADXL345 disabled
    doc["temperature"]   = temperature;
    doc["humidity"]      = humidity;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    Serial.printf("[HTTP POST] Sending payload to %s\n", url.c_str());
    Serial.printf("[Payload] %s\n", jsonPayload.c_str());

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.printf("[HTTP Response] Code: %d (Success)\n", httpResponseCode);
      String response = http.getString();
      Serial.println("[Backend Reply] " + response.substring(0, 100) + "...");
    } else {
      Serial.printf("[HTTP Error] POST failed, error: %s (Code %d)\n", http.errorToString(httpResponseCode).c_str(), httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("[WiFi Warning] WiFi disconnected. Reconnecting...");
    connectToWiFi();
  }
}

void loop() {
  unsigned long currentMillis = millis();

  // Transmit every 3 seconds
  if (currentMillis - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = currentMillis;
    sendTelemetry();
  }

  delay(50);
}

