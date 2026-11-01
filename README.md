# LANDSense – Web Dashboard
**IoT-Based Landslide Monitoring & Early Warning System**

A modern, responsive, high-performance web dashboard built with React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, and Recharts.

---

## 🏔️ System Overview & Architecture

LANDSense is an IoT early warning system designed for mountainous and slope-failure-prone regions (such as the Western Ghats). The dashboard surfaces live telemetry, deterministic multi-factor landslide risk scores (0–100), automated early warning alarms, individual sensor hardware health diagnostics, historical time-series analytics, and provisional location cartography.

The dashboard integrates directly with the existing **LANDSense FastAPI backend** (`/api/v1`), matching its data schemas and response structures with zero modifications to the existing Android mobile application.

---

## 🗂️ Project File Structure

```
d:\MCA\projects\LANDSLIDE\
├── index.html                           # HTML5 entry with Plus Jakarta Sans & JetBrains Mono
├── package.json                         # Dependencies & npm scripts
├── tsconfig.json                        # TypeScript root project configuration
├── tsconfig.app.json                    # Bundler-mode TS settings with strict verification
├── vite.config.ts                       # Vite 8 config with React & Tailwind CSS v4 plugins
└── src\
    ├── index.css                        # Tailwind v4 import & custom scrollbar styles
    ├── main.tsx                         # React 19 DOM bootstrap
    ├── App.tsx                          # Core dashboard layout, tab navigation & state wiring
    ├── types\
    │   ├── sensor.ts                    # SensorNode, SensorReading, HardwareSensorDetail interfaces
    │   ├── risk.ts                      # RiskAssessment, RiskLevel, RiskFactorContribution, thresholds
    │   └── alert.ts                     # Alert, AlertSeverity, AlertTriggerReadings interfaces
    ├── services\
    │   ├── apiConfig.ts                 # FastAPI endpoints & USE_MOCK_DATA toggle
    │   ├── mockData.ts                  # High-fidelity academic prototype dataset matching backend seeds
    │   ├── sensorService.ts             # Fleet query, node diagnostics, and hardware telemetry API
    │   ├── riskService.ts               # Composite landslide risk score & explanation API
    │   └── alertService.ts              # Incident warning list & operator acknowledgment flow
    └── components\
        ├── layout\
        │   ├── Header.tsx               # Sticky header with fleet counter, node switcher & sync
        │   └── Sidebar.tsx              # Responsive sidebar navigation with incident badges
        ├── overview\
        │   └── OverviewStats.tsx        # Overall risk level banner, fleet online/offline metrics
        ├── environmental\
        │   └── EnvironmentalGrid.tsx    # Temp (°C), Humidity (%), Rain (mm/hr), Soil Moisture (%)
        ├── risk\
        │   └── RiskMonitoringCard.tsx   # 0–100 SVG circular gauge & 4-factor risk contributions
        ├── sensors\
        │   └── SensorFleetMonitoring.tsx# Rain, Soil, DHT11 & ADXL345 (Unavailable/Standby notice)
        ├── charts\
        │   └── TelemetryCharts.tsx      # Recharts time-series for Temp, Humidity, Rain & Soil
        ├── alerts\
        │   └── RecentAlertsList.tsx     # Filterable incident list with operator acknowledgment
        └── map\
            └── MonitoringLocationMap.tsx# Field station cartography with placeholder coordinates
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18+` (Tested on `v24.14.1`)
- npm `v9+` (Tested on `v11.11.0`)

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Production Build & Linting
```bash
# Typecheck & build minified bundle
npm run build

# Code hygiene lint check (Oxlint)
npm run lint

# Preview production build locally
npm run preview
```

---

## 🔌 FastAPI Backend Integration

The dashboard is structured with a clean separation between UI components and the API service layer in `src/services/`.

### Inspected FastAPI Endpoints:
- `GET /api/v1/health` – Backend health check
- `GET /api/v1/sensors` – Sensor fleet list (`SensorNodeOut`)
- `GET /api/v1/sensors/{node_id}` – Specific sensor node diagnostics
- `GET /api/v1/sensors/{node_id}/readings` – Historical telemetry array
- `GET /api/v1/risk/current` – Primary zone risk assessment
- `GET /api/v1/risk/{node_id}` – Node-specific risk calculation
- `GET /api/v1/alerts` – Real-time alerts and trigger thresholds
- `POST /api/v1/alerts/{alert_id}/acknowledge` – Operator incident acknowledgment

### Switching to Live Backend:
In [`src/services/apiConfig.ts`](file:///d:/MCA/projects/LANDSLIDE/src/services/apiConfig.ts):
```typescript
// Toggle to false when running the FastAPI server at http://localhost:8000
export const USE_MOCK_DATA = false;
```
Or define an environment variable in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 📋 Requirements Compliance Checklist

| Feature | Status | Notes |
|---|---|---|
| **Overview** | ✅ Implemented | Displays LANDSense title, sidebar nav, risk status (NORMAL/WATCH/WARNING/CRITICAL), online/offline fleet stats, and last sync timestamp. |
| **Environmental Cards** | ✅ Implemented | 4 individual cards: Temperature (°C), Humidity (%), Rain sensor (mm/hr), Soil moisture (%). |
| **Risk Monitoring** | ✅ Implemented | SVG radial gauge, risk classification, clear semantic colors, and 4 contributing factor breakdowns. |
| **Sensor Monitoring** | ✅ Implemented | Rain sensor (FC-37), Soil moisture (Capacitive v1.2), DHT11, and ADXL345 clearly marked as **Unavailable / Not Connected**. |
| **Charts** | ✅ Implemented | Recharts area graphs for Temperature, Humidity, Rain sensor, and Soil moisture history with custom dark navy tooltips. |
| **Alerts** | ✅ Implemented | Filterable incident list with severity tags, timestamp, triggers, and interactive operator acknowledgment. |
| **Map** | ✅ Implemented | Topographic contour layout showing station placement with clear placeholder GPS coordinates notice. |
| **Design Standard** | ✅ Implemented | Dark navy palette (`bg-slate-950` / `bg-slate-900`), clean borders, zero excessive gradients, fluid responsiveness. |
| **Non-Intrusive** | ✅ Implemented | Preserves existing Android application and existing backend without creating redundant databases. |
