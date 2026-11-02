import { useState } from 'react';
import {
  SlidersHorizontal,
  Radio,
  FlaskConical,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Cpu,
  Info
} from 'lucide-react';
import {
  type RiskScenarioType,
  type ScenarioState,
  SCENARIO_PRESETS,
  scenarioService
} from '../../services/scenarioService';
import type { SensorReading } from '../../types/sensor';
import type { RiskAssessment } from '../../types/risk';

interface ScenarioControlBarProps {
  scenarioState: ScenarioState;
  onScenarioChange: (state: ScenarioState) => void;
  actualLiveReading: SensorReading;
  actualLiveRisk: RiskAssessment;
  isRealHardware: boolean;
  secondsSincePacket: number;
}

export const ScenarioControlBar = ({
  scenarioState,
  onScenarioChange,
  actualLiveReading,
  actualLiveRisk,
  isRealHardware,
  secondsSincePacket
}: ScenarioControlBarProps) => {
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLiveComparison, setShowLiveComparison] = useState<boolean>(true);

  const isScenarioMode = scenarioState.mode === 'SCENARIO';
  const activeScenario = scenarioState.scenario;

  const handleSelectScenario = async (scenario: RiskScenarioType) => {
    setIsApplying(true);
    setErrorMessage(null);
    try {
      const updated = await scenarioService.setScenario(scenario, 300);
      onScenarioChange(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to apply demonstration scenario';
      setErrorMessage(`Backend error: ${msg}`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleReturnToLive = async () => {
    setIsApplying(true);
    setErrorMessage(null);
    try {
      const updated = await scenarioService.resetToLive();
      onScenarioChange(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to return to live mode';
      setErrorMessage(`Backend error: ${msg}`);
    } finally {
      setIsApplying(false);
    }
  };

  // Format seconds countdown mm:ss
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)] space-y-5 transition-all">
      {/* Top Header: Title and Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isScenarioMode ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'} transition-colors`}>
            {isScenarioMode ? <FlaskConical className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                System Operating Mode
              </h2>
              {isScenarioMode ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider animate-pulse">
                  Simulation Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  Live Telemetry
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Toggle between actual IoT hardware telemetry and verified risk demonstration scenarios
            </p>
          </div>
        </div>

        {/* Segmented Mode Selector Buttons */}
        <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 self-start md:self-auto">
          <button
            onClick={handleReturnToLive}
            disabled={isApplying || !isScenarioMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isScenarioMode
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${!isScenarioMode ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <span>Live Hardware Mode</span>
          </button>

          <button
            onClick={() => handleSelectScenario(activeScenario || 'WARNING')}
            disabled={isApplying || isScenarioMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isScenarioMode
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Scenario Demonstration Mode</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 text-[11px] font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Scenario Mode Controls */}
      {isScenarioMode ? (
        <div className="space-y-4">
          {/* 4 Selectable Scenario Cards */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Select Landslide Risk Demonstration Scenario
              </span>
              <span className="text-[11px] text-slate-400">
                Click any scenario to immediately trigger ESP32 physical LEDs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Scenario 1: NORMAL */}
              <button
                onClick={() => handleSelectScenario('NORMAL')}
                disabled={isApplying}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  activeScenario === 'NORMAL'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {activeScenario === 'NORMAL' && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3" /> ACTIVE
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-extrabold text-slate-900">1. NORMAL</span>
                </div>
                <div className="mt-2 text-xs font-bold text-emerald-800">
                  Risk Score: 15 / 100
                </div>
                <div className="mt-1 text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <span>LED:</span>
                  <span className="text-emerald-700 font-mono">Green Solid ON (GPIO 26)</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                  Dry baseline slope conditions. Topsoil pore pressure minimal.
                </p>
              </button>

              {/* Scenario 2: WATCH */}
              <button
                onClick={() => handleSelectScenario('WATCH')}
                disabled={isApplying}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  activeScenario === 'WATCH'
                    ? 'border-amber-500 bg-amber-50/60 shadow-sm ring-2 ring-amber-500/20'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {activeScenario === 'WATCH' && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                    <CheckCircle className="w-3 h-3" /> ACTIVE
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm font-extrabold text-slate-900">2. WATCH</span>
                </div>
                <div className="mt-2 text-xs font-bold text-amber-800">
                  Risk Score: 40 / 100
                </div>
                <div className="mt-1 text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <span>LED:</span>
                  <span className="text-amber-700 font-mono">Yellow Solid ON (GPIO 27)</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                  Moderate rainfall (16.5 mm/hr). Saturation rising on slope face.
                </p>
              </button>

              {/* Scenario 3: WARNING */}
              <button
                onClick={() => handleSelectScenario('WARNING')}
                disabled={isApplying}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  activeScenario === 'WARNING'
                    ? 'border-orange-500 bg-orange-50/60 shadow-sm ring-2 ring-orange-500/20'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {activeScenario === 'WARNING' && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-extrabold text-orange-700 bg-white px-2 py-0.5 rounded-full border border-orange-200">
                    <CheckCircle className="w-3 h-3" /> ACTIVE
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-sm font-extrabold text-slate-900">3. WARNING</span>
                </div>
                <div className="mt-2 text-xs font-bold text-orange-800">
                  Risk Score: 65 / 100
                </div>
                <div className="mt-1 text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <span>LED:</span>
                  <span className="text-orange-700 font-mono">Yellow Blinking (500ms)</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                  Heavy rain storm (38 mm/hr) & 68% soil saturation. Elevated risk.
                </p>
              </button>

              {/* Scenario 4: CRITICAL */}
              <button
                onClick={() => handleSelectScenario('CRITICAL')}
                disabled={isApplying}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  activeScenario === 'CRITICAL'
                    ? 'border-rose-500 bg-rose-50/60 shadow-sm ring-2 ring-rose-500/20'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {activeScenario === 'CRITICAL' && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-extrabold text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                    <CheckCircle className="w-3 h-3" /> ACTIVE
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-sm font-extrabold text-slate-900">4. CRITICAL</span>
                </div>
                <div className="mt-2 text-xs font-bold text-rose-800">
                  Risk Score: 90 / 100
                </div>
                <div className="mt-1 text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <span>LED:</span>
                  <span className="text-rose-700 font-mono">Red Blinking (250ms)</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                  Severe monsoon (54 mm/hr) & 88% saturation. Evacuation state.
                </p>
              </button>
            </div>
          </div>

          {/* Active Demonstration Status Banner */}
          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-extrabold text-purple-900">
                    Active Preset: {activeScenario || 'NORMAL'}
                  </span>
                  <span className="text-purple-300">&bull;</span>
                  <span className="font-bold text-purple-800">
                    Simulated Risk Score: {scenarioState.risk_score ?? 15}
                  </span>
                  <span className="text-purple-300">&bull;</span>
                  <span className="font-mono text-purple-700 bg-white/80 px-2 py-0.5 rounded-md border border-purple-200 text-[11px]">
                    {scenarioState.led_status || SCENARIO_PRESETS[activeScenario || 'NORMAL'].ledStatus}
                  </span>
                </div>
                <p className="text-[11px] text-purple-700/90 leading-relaxed">
                  <strong>Notice:</strong> Overview cards below display simulated values for demonstration. Physical ESP32 LEDs update automatically within 3 seconds.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              {/* Auto-Expiry Countdown */}
              {scenarioState.expires_in_seconds > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-800 bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Auto-revert: {formatCountdown(scenarioState.expires_in_seconds)}</span>
                </div>
              )}

              {/* Exit Demonstration Button */}
              <button
                onClick={handleReturnToLive}
                disabled={isApplying}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Exit Demo / Return to Live</span>
              </button>
            </div>
          </div>

          {/* Actual Real-Time Hardware Sensor Comparison Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-extrabold text-slate-800">
                  Actual ESP32 Hardware Stream (Uninterrupted Background Feed)
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isRealHardware ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isRealHardware ? `ESP32 Streaming (${secondsSincePacket}s ago)` : 'Awaiting Packets'}
                </span>
              </div>
              <button
                onClick={() => setShowLiveComparison(!showLiveComparison)}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                {showLiveComparison ? 'Hide Sensor Details' : 'Show Sensor Details'}
              </button>
            </div>

            {showLiveComparison && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Rain (GPIO 34)</div>
                  <div className="font-extrabold text-slate-900 font-mono">
                    {actualLiveReading.rainfall.toFixed(1)} mm/hr
                  </div>
                  <div className="text-[10px] text-slate-500">Live Physical Sensor</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Soil Moisture (GPIO 35)</div>
                  <div className="font-extrabold text-slate-900 font-mono">
                    {actualLiveReading.soilMoisture.toFixed(1)} %
                  </div>
                  <div className="text-[10px] text-slate-500">Live Capacitive Probe</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Temp & Humidity (GPIO 25)</div>
                  <div className="font-extrabold text-slate-900 font-mono">
                    {actualLiveReading.temperature.toFixed(1)}°C / {actualLiveReading.humidity.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500">Live DHT11 Stream</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 space-y-0.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Physical Risk Calculation</div>
                  <div className="font-extrabold text-emerald-700 font-mono flex items-center gap-1.5">
                    <span>{actualLiveRisk.riskLevel}</span>
                    <span className="text-slate-400 font-sans font-normal">({actualLiveRisk.riskScore}/100)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Calculated from Real Data</div>
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-400">
              * Actual sensor telemetry is continuously stored in the database without interruption. The scenario simulation only temporarily overrides physical LED indicators and preview widgets.
            </p>
          </div>
        </div>
      ) : (
        /* Live Hardware Banner */
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div className="text-slate-700">
              <strong className="text-emerald-950 font-bold">LIVE HARDWARE MODE ACTIVE:</strong>
              <span className="text-slate-600 ml-1">
                Dashboard telemetry is streaming live from the ESP32 on WiFi. Physical LEDs (GPIO 14, 27, 26) are dynamically driven by real sensor risk algorithms.
              </span>
            </div>
          </div>
          <button
            onClick={() => handleSelectScenario('WARNING')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 font-bold text-[11px] transition-colors shrink-0 cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
            <span>Start Scenario Demo</span>
          </button>
        </div>
      )}
    </div>
  );
};
