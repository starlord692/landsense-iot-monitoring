import { useState, useEffect } from 'react';
import {
  Server,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  AlertTriangle,
  Globe,
  Radio
} from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, API_FETCH_HEADERS } from '../../services/apiConfig';

interface ServerConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEndpointChanged: () => void;
}

export const ServerConnectionModal = ({
  isOpen,
  onClose,
  onEndpointChanged,
}: ServerConnectionModalProps) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const isHttpsDeployment = typeof window !== 'undefined' && window.location.protocol === 'https:';

  useEffect(() => {
    if (isOpen) {
      setUrlInput(getApiBaseUrl());
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const testConnection = async (targetUrl: string) => {
    setTestStatus('testing');
    setTestMessage('Pinging backend endpoint...');

    const cleanUrl = targetUrl.replace(/\/+$/, '');
    const healthUrl = cleanUrl.endsWith('/api/v1') ? `${cleanUrl}/health` : `${cleanUrl}/api/v1/health`;

    try {
      const res = await fetch(healthUrl, {
        headers: API_FETCH_HEADERS,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setTestStatus('success');
      setTestMessage(`Connected! Service: ${data.service || 'LANDSense API'} (v${data.version || '1.0'})`);
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'Connection failed';
      setTestStatus('error');

      if (isHttpsDeployment && cleanUrl.startsWith('http://')) {
        setTestMessage(`Mixed Content Block: Browser blocked insecure HTTP request from this HTTPS dashboard. Use an HTTPS tunnel URL.`);
      } else {
        setTestMessage(`Could not reach backend: ${errText}`);
      }
    }
  };

  const handleSave = () => {
    const cleanUrl = urlInput.trim().replace(/\/+$/, '');
    setApiBaseUrl(cleanUrl);
    onEndpointChanged();
    onClose();
  };

  const handleResetLocal = () => {
    setUrlInput('http://localhost:8000/api/v1');
    testConnection('http://localhost:8000/api/v1');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Backend Server Connection
              </h3>
              <p className="text-xs text-slate-400">
                Configure FastAPI backend endpoint for IoT sensor streaming
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud HTTPS Notice if loaded on Vercel */}
        {isHttpsDeployment && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Browsing from Vercel Cloud (HTTPS)</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Modern web browsers block direct calls from HTTPS pages to insecure <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">http://localhost:8000</code> (Mixed Content). To view your live hardware on Vercel, forward your backend with a secure HTTPS tunnel (e.g. via ngrok or localtunnel).
            </p>
          </div>
        )}

        {/* Input Field */}
        <div className="space-y-2 text-xs">
          <label className="font-bold text-slate-700 flex items-center justify-between">
            <span>FastAPI Backend URL:</span>
            <span className="text-[10px] text-slate-400 font-mono font-normal">Must include /api/v1</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://your-tunnel.ngrok-free.app/api/v1"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            <button
              onClick={() => testConnection(urlInput)}
              disabled={testStatus === 'testing' || !urlInput.trim()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>Test</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Quick Endpoints:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleResetLocal}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Radio className="w-3 h-3 text-slate-500" />
              <span>Localhost:8000</span>
            </button>

            <button
              onClick={() => {
                setUrlInput('https://landsense-api-live.loca.lt/api/v1');
                testConnection('https://landsense-api-live.loca.lt/api/v1');
              }}
              className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>Cloud HTTPS Tunnel</span>
            </button>
          </div>
        </div>

        {/* Status Feedback */}
        {testStatus !== 'idle' && (
          <div className={`p-3 rounded-2xl text-xs flex items-start gap-2.5 ${
            testStatus === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : testStatus === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-slate-50 text-slate-700 border border-slate-200'
          }`}>
            {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
            {testStatus === 'error' && <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
            {testStatus === 'testing' && <RefreshCw className="w-4 h-4 text-slate-500 animate-spin shrink-0 mt-0.5" />}
            <span className="font-medium text-[11px] leading-relaxed">{testMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};
