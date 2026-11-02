/**
 * LANDSense - IoT-Based Landslide Monitoring & Early Warning System
 * ESP32 Firmware (Arduino IDE / PlatformIO)
 *
 * Pin Connections:
 * - Rain Sensor (Analog AO) : GPIO 34 (ADC1_CH6)
 * - Soil Moisture Sensor AO : GPIO 35 (ADC1_CH7)
 * - DHT11 Data Pin          : GPIO 25
 * - ADXL345 Accelerometer   : DISABLED (Hardware Standby)
 * - Red LED                 : GPIO 14 (CRITICAL: Blinking)
 * - Yellow LED              : GPIO 27 (WATCH: Solid ON / WARNING: Blinking)
 * - Green LED               : GPIO 26 (NORMAL: Solid ON)
 * - Buzzer                  : REMOVED / NOT CONNECTED
 *
 * Telemetry Interval: Every 3 seconds (3000 ms)
 * Ingestion Endpoint : POST /api/v1/readings
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#if __has_include("include/secrets.h")
  #include "include/secrets.h"
#elif __has_include("secrets.h")
  #include "secrets.h"
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

// IP address of your laptop running the FastAPI backend:
const char* SERVER_HOST   = "10.83.254.39";
const int   SERVER_PORT   = 8000;
const char* API_ENDPOINT  = "/api/v1/readings";

const char* NODE_ID       = "NODE-001";

// ==========================================
// 2. Hardware Pin Assignments
// ==========================================
#define PIN_RAIN_SENSOR 34   // Analog input GPIO 34
#define PIN_SOIL_SENSOR 35   // Analog input GPIO 35
#define PIN_DHT11       25   // Digital data GPIO 25
#define DHT_TYPE        DHT11

// LED Indicator Pins
#define PIN_LED_RED     14   // Red LED: Critical (Blinking)
#define PIN_LED_YELLOW  27   // Yellow LED: Watch (Solid) / Warning (Blinking)
#define PIN_LED_GREEN   26   // Green LED: Normal (Solid)

DHT dht(PIN_DHT11, DHT_TYPE);

// ==========================================
// 3. Risk Levels & LED State Management
// ==========================================
enum RiskLevel {
  RISK_NORMAL,
  RISK_WATCH,
  RISK_WARNING,
  RISK_CRITICAL
};

RiskLevel currentRiskLevel = RISK_NORMAL;
RiskLevel lastHardwareRiskLevel = RISK_NORMAL;
bool isScenarioMode = false;
unsigned long lastScenarioCommandTime = 0;

// Non-blocking blink state & intervals
unsigned long lastBlinkTime = 0;
bool blinkState = false;
const unsigned long BLINK_INTERVAL_WARNING  = 500; // 500ms toggle for Warning
const unsigned long BLINK_INTERVAL_CRITICAL = 250; // 250ms fast toggle for Critical

// Telemetry timing
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 3000; // 3 seconds

// Calibration baselines (12-bit ADC: 0 to 4095)
const int SOIL_DRY_RAW = 3500;
const int SOIL_WET_RAW = 1400;
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

// Risk calculation matching the backend RiskService engine
RiskLevel calculateRiskLevel(float rainfall, float soilMoisture, float groundTilt = 0.0, float vibration = 0.0) {
  int rainfallScore = min(30, (int)((rainfall / 50.0) * 30.0));
  int moistureScore = min(25, (int)((soilMoisture / 100.0) * 25.0));
  int movementScore = min(30, (int)((abs(groundTilt) / 5.0) * 30.0));
  int vibrationScore = min(15, (int)((vibration / 1.0) * 15.0));

  int totalScore = rainfallScore + moistureScore + movementScore + vibrationScore;
  totalScore = constrain(totalScore, 0, 100);

  if (totalScore <= 25) return RISK_NORMAL;
  if (totalScore <= 50) return RISK_WATCH;
  if (totalScore <= 75) return RISK_WARNING;
  return RISK_CRITICAL;
}

const char* getRiskLevelName(RiskLevel level) {
  switch (level) {
    case RISK_NORMAL:   return "NORMAL";
    case RISK_WATCH:    return "WATCH";
    case RISK_WARNING:  return "WARNING";
    case RISK_CRITICAL: return "CRITICAL";
    default:            return "UNKNOWN";
  }
}

/**
 * Non-blocking LED update routine:
 * - NORMAL   : Green ON, Yellow & Red OFF
 * - WATCH    : Yellow ON, Green & Red OFF
 * - WARNING  : Yellow Blinking (500ms), Green & Red OFF
 * - CRITICAL : Red Blinking (250ms), Green & Yellow OFF
 */
void updateLedIndicators() {
  unsigned long now = millis();

  switch (currentRiskLevel) {
    case RISK_NORMAL:
      digitalWrite(PIN_LED_GREEN, HIGH);
      digitalWrite(PIN_LED_YELLOW, LOW);
      digitalWrite(PIN_LED_RED, LOW);
      break;

    case RISK_WATCH:
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_YELLOW, HIGH);
      digitalWrite(PIN_LED_RED, LOW);
      break;

    case RISK_WARNING:
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_RED, LOW);
      if (now - lastBlinkTime >= BLINK_INTERVAL_WARNING) {
        lastBlinkTime = now;
        blinkState = !blinkState;
      }
      digitalWrite(PIN_LED_YELLOW, blinkState ? HIGH : LOW);
      break;

    case RISK_CRITICAL:
      digitalWrite(PIN_LED_GREEN, LOW);
      digitalWrite(PIN_LED_YELLOW, LOW);
      if (now - lastBlinkTime >= BLINK_INTERVAL_CRITICAL) {
        lastBlinkTime = now;
        blinkState = !blinkState;
      }
      digitalWrite(PIN_LED_RED, blinkState ? HIGH : LOW);
      break;
  }
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
    updateLedIndicators(); // Keep LEDs alive during connection
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] ESP32 Assigned IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Connection timeout. Retrying in background...");
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
  Serial.println(" - Red LED      : GPIO 14 (Critical: Blinking)");
  Serial.println(" - Yellow LED   : GPIO 27 (Watch: Solid, Warning: Blinking)");
  Serial.println(" - Green LED    : GPIO 26 (Normal: Solid)");
  Serial.println(" - ADXL345      : DISABLED / NOT CONNECTED");
  Serial.println(" - Buzzer       : NOT INSTALLED / REMOVED");
  Serial.println("==================================================\n");

  // Configure LED pins
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_GREEN, OUTPUT);

  // Initial state: Green ON
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_GREEN, HIGH);

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

  // Validate DHT readings
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("[Hardware Warning] DHT11 read failed, using baseline.");
    temperature = 26.5;
    humidity = 72.0;
  }

  // 3. Compute Real Physical Sensor Risk
  lastHardwareRiskLevel = calculateRiskLevel(rainRate, soilMoisturePct);

  // If not overridden by active scenario demonstration, apply physical risk to LEDs
  if (!isScenarioMode) {
    currentRiskLevel = lastHardwareRiskLevel;
  }

  // 4. Print Local Diagnostics to Serial
  Serial.println("\n---------------------------------------------");
  Serial.printf("[Sensor Data] Time: %lu ms\n", millis());
  Serial.printf(" - Rain Raw ADC : %d  --> Rate: %.1f mm/hr\n", rawRain, rainRate);
  Serial.printf(" - Soil Raw ADC : %d  --> Moisture: %.1f %%\n", rawSoil, soilMoisturePct);
  Serial.printf(" - Temperature  : %.1f °C\n", temperature);
  Serial.printf(" - Humidity     : %.1f %%\n", humidity);
  Serial.printf(" - Operating Mode: %s\n", isScenarioMode ? "SCENARIO DEMONSTRATION" : "LIVE HARDWARE");
  Serial.printf(" - Risk State   : %s\n", getRiskLevelName(currentRiskLevel));
  Serial.printf(" - LED Indicators: RED(14)=%s, YEL(27)=%s, GRN(26)=%s\n",
    (currentRiskLevel == RISK_CRITICAL) ? "BLINKING" : "OFF",
    (currentRiskLevel == RISK_WARNING) ? "BLINKING" : (currentRiskLevel == RISK_WATCH ? "ON" : "OFF"),
    (currentRiskLevel == RISK_NORMAL) ? "ON" : "OFF"
  );
  Serial.println(" - ADXL345      : DISABLED (0.0° tilt, 0.0g vibration)");

  // 5. Send HTTP POST to FastAPI Backend
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    String url = "http://" + String(SERVER_HOST) + ":" + String(SERVER_PORT) + String(API_ENDPOINT);

    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");

    // Build JSON Payload (always contains ACTUAL physical sensor readings)
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

      // Parse scenario command returned in telemetry response
      JsonDocument resDoc;
      DeserializationError err = deserializeJson(resDoc, response);
      if (!err) {
        const char* cmd = resDoc["command"] | "LIVE";
        if (strcmp(cmd, "SCENARIO") == 0) {
          const char* scn = resDoc["scenario"] | "NORMAL";
          isScenarioMode = true;
          lastScenarioCommandTime = millis();

          if (strcmp(scn, "NORMAL") == 0) {
            currentRiskLevel = RISK_NORMAL;
          } else if (strcmp(scn, "WATCH") == 0) {
            currentRiskLevel = RISK_WATCH;
          } else if (strcmp(scn, "WARNING") == 0) {
            currentRiskLevel = RISK_WARNING;
          } else if (strcmp(scn, "CRITICAL") == 0) {
            currentRiskLevel = RISK_CRITICAL;
          }
          Serial.printf("[Scenario Mode] Physical LEDs forced to: %s\n", scn);
        } else {
          if (isScenarioMode) {
            Serial.println("[Scenario Mode] Returned to LIVE hardware mode.");
          }
          isScenarioMode = false;
          currentRiskLevel = lastHardwareRiskLevel;
        }
      }
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
  // Fail-safe watchdog: if no scenario heartbeat received in 15 seconds, revert to live hardware
  if (isScenarioMode && (millis() - lastScenarioCommandTime >= 15000)) {
    Serial.println("[Safety Watchdog] Demonstration session expired or disconnected. Reverting to LIVE hardware mode.");
    isScenarioMode = false;
    currentRiskLevel = lastHardwareRiskLevel;
  }

  // Continuous non-blocking LED update
  updateLedIndicators();

  unsigned long currentMillis = millis();

  // Transmit every 3 seconds
  if (currentMillis - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = currentMillis;
    sendTelemetry();
  }

  delay(10); // Small non-blocking yield for FreeRTOS background tasks
}
