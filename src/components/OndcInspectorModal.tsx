import React, { useState } from 'react';
import {
  Code,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { BecknProtocolLog } from '../types';

interface OndcInspectorModalProps {
  logs: BecknProtocolLog[];
  onClearLogs: () => void;
}

export const OndcInspectorModal: React.FC<OndcInspectorModalProps> = ({ logs, onClearLogs }) => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(logs[0]?.id || null);
  const [copied, setCopied] = useState(false);

  const selectedLog = logs.find((l) => l.id === selectedLogId) || logs[0];

  const handleCopy = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="max-w-6xl mx-auto my-6 bg-[#131317] rounded-3xl border border-neutral-800 shadow-xl overflow-hidden text-[#E5E5E5]">
      {/* Protocol Header */}
      <div className="p-4 bg-[#18181D] text-[#F3F4F6] flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-[#F3F4F6]">ONDC Beckn Protocol Live Inspector</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#22222B] text-amber-300 border border-amber-500/30">
                Buyer Node (BAP) v1.2.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Real-time Beckn transactions: /search ➔ /select ➔ /init ➔ /confirm ➔ /track
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearLogs}
            className="px-2.5 py-1 rounded-lg bg-[#22222A] hover:bg-[#2C2C36] text-neutral-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>பதிவுகளை அழிக்க (Clear)</span>
          </button>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left: Transaction Log List */}
        <div className="lg:col-span-5 border-r border-neutral-800 bg-[#16161B] p-3 space-y-2 overflow-y-auto max-h-[500px]">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
            நெறிமுறை செயல்பாடுகள் (Protocol Events - {logs.length}):
          </div>

          {logs.map((log) => {
            const isSelected = selectedLog?.id === log.id;

            return (
              <div
                key={log.id}
                onClick={() => setSelectedLogId(log.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#202028] border-amber-500/70 shadow-md ring-1 ring-amber-500/40 text-[#F3F4F6]'
                    : 'bg-[#191920] border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
                    <span className="px-1.5 py-0.5 rounded-md bg-[#251A14] text-amber-400 border border-amber-700/40 text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-normal">{log.method}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">{log.timestamp}</span>
                </div>

                <p className="text-[11px] text-neutral-300 line-clamp-2 leading-relaxed mb-1.5">
                  {log.description}
                </p>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{log.status}</span>
                  </span>
                  <span className="font-mono text-neutral-400">{log.latencyMs} ms</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Log JSON Inspection */}
        <div className="lg:col-span-7 p-4 bg-[#0F0F12] text-[#E5E5E5] flex flex-col justify-between overflow-x-auto max-h-[500px]">
          {selectedLog ? (
            <div>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {selectedLog.action}
                    </span>
                    <span className="text-xs text-neutral-400">
                      Latency: {selectedLog.latencyMs} ms
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-sans mt-0.5">
                    {selectedLog.description}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(selectedLog)}
                  className="px-2.5 py-1 rounded-lg bg-[#22222A] hover:bg-[#2C2C36] text-xs font-semibold flex items-center gap-1 text-neutral-300 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'நகலெடுக்கப்பட்டது' : 'JSON Copy'}</span>
                </button>
              </div>

              {/* Request Payload */}
              <div className="mb-4">
                <span className="text-[11px] font-mono text-amber-400 font-bold block mb-1">
                  // Beckn Request Context & Intent:
                </span>
                <pre className="p-3 bg-[#09090C] rounded-xl font-mono text-[11px] text-neutral-300 overflow-x-auto border border-neutral-800/80">
                  {JSON.stringify(selectedLog.requestPayload, null, 2)}
                </pre>
              </div>

              {/* Response Payload */}
              <div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold block mb-1">
                  // Network Ack / Seller Response:
                </span>
                <pre className="p-3 bg-[#09090C] rounded-xl font-mono text-[11px] text-neutral-300 overflow-x-auto border border-neutral-800/80">
                  {JSON.stringify(selectedLog.responsePayload, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500 text-xs">
              ஒரு பதிவை தேர்ந்தெடுக்கவும் (Select a log from the list)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
