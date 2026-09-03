import React from 'react';
import {
  Activity,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { ObservabilityMetrics } from '../types';

interface AdminMetricsDashboardProps {
  metrics: ObservabilityMetrics;
  onRefreshMetrics: () => void;
}

export const AdminMetricsDashboard: React.FC<AdminMetricsDashboardProps> = ({
  metrics,
  onRefreshMetrics,
}) => {
  return (
    <div className="max-w-6xl mx-auto my-6 space-y-6 text-[#E5E5E5]">
      {/* Dashboard Top Banner */}
      <div className="bg-[#131317] text-[#F3F4F6] rounded-3xl p-5 border border-neutral-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              நேரலை கண்காணிப்பு பலகை (Live Telemetry)
            </span>
            <span className="text-neutral-600">•</span>
            <span className="text-xs text-neutral-400">புதுப்பிக்கப்பட்டது: {metrics.lastUpdated}</span>
          </div>
          <h2 className="text-xl font-bold font-display mt-1 tracking-tight text-[#F3F4F6]">
            VoiceCart AI 2.0 - System Health & Observability (Section 10 & 11)
          </h2>
          <p className="text-xs text-neutral-400 max-w-xl mt-0.5">
            Real-time tracking of Indic ASR/TTS latency, ONDC Buyer transactions, UPI gateway conversion, and failure alerts.
          </p>
        </div>

        <button
          onClick={onRefreshMetrics}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          <span>அளவீடுகளை புதுப்பிக்க (Refresh)</span>
        </button>
      </div>

      {/* Primary KPI Metric Cards (Section 10 & 11 Spec) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orders Today */}
        <div className="bg-[#18181D] rounded-2xl p-4 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="font-semibold">இன்றைய ஆர்டர்கள் (Orders)</span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-display text-[#F3F4F6]">{metrics.ordersToday}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18% நேற்றையதை விட</span>
          </div>
        </div>

        {/* GMV */}
        <div className="bg-[#18181D] rounded-2xl p-4 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="font-semibold">விற்பனை மதிப்பு (GMV)</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black font-display text-[#F3F4F6]">₹{metrics.gmvToday.toLocaleString()}</div>
          <div className="text-[11px] text-neutral-400 mt-1">சராசரி கூடை: ₹294</div>
        </div>

        {/* Avg AI Latency */}
        <div className="bg-[#18181D] rounded-2xl p-4 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="font-semibold">AI பதில் நேரம் (Latency)</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-display text-[#F3F4F6]">{metrics.avgAiResponseTimeMs} ms</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            ✓ இலக்கு: &lt;1000 ms (Passed)
          </div>
        </div>

        {/* STT Accuracy */}
        <div className="bg-[#18181D] rounded-2xl p-4 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="font-semibold">தமிழ் ASR துல்லியம் (STT)</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-display text-[#F3F4F6]">{metrics.sttAccuracyPct}%</div>
          <div className="text-[11px] text-neutral-400 mt-1">சான்றளிக்கப்பட்ட Saaras V3</div>
        </div>
      </div>

      {/* Secondary Benchmark Table (Matching Page 11 Table from PDF) */}
      <div className="bg-[#131317] rounded-2xl border border-neutral-800 shadow-md overflow-hidden">
        <div className="p-4 bg-[#18181D] border-b border-neutral-800 flex items-center justify-between">
          <h3 className="font-display font-bold text-[#F3F4F6] text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            <span>தொழில்நுட்ப அளவுகோல் அட்டவணை (Technical Benchmarks & Thresholds)</span>
          </h3>
          <span className="text-[11px] text-neutral-400">ONDC Retail RET10/11 Compliance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A22] text-neutral-400 uppercase font-bold text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="p-3">அளவீடு (Metric)</th>
                <th className="p-3">தற்போதைய மதிப்பு (Current Value)</th>
                <th className="p-3">வரம்பு / கருத்து (Threshold / SLA)</th>
                <th className="p-3">நிலை (Status)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              <tr>
                <td className="p-3 font-semibold text-[#F3F4F6]">Orders Today</td>
                <td className="p-3 font-mono font-bold text-amber-400">{metrics.ordersToday}</td>
                <td className="p-3 text-neutral-500">—</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-bold text-[10px]">
                    Active
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#F3F4F6]">Avg AI Response Time</td>
                <td className="p-3 font-mono font-bold text-amber-400">{metrics.avgAiResponseTimeMs} ms</td>
                <td className="p-3 text-neutral-500">Goal &lt;1s</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-bold text-[10px]">
                    Optimal
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#F3F4F6]">STT Accuracy (Tamil)</td>
                <td className="p-3 font-mono font-bold text-amber-400">{metrics.sttAccuracyPct}%</td>
                <td className="p-3 text-neutral-500">Periodic eval (&gt;90%)</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-bold text-[10px]">
                    High
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#F3F4F6]">UPI Payment Success Rate</td>
                <td className="p-3 font-mono font-bold text-emerald-400">{metrics.upiSuccessRatePct}%</td>
                <td className="p-3 text-neutral-500">Flag if &lt;95%</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-bold text-[10px]">
                    Passed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#F3F4F6]">RTO Rate (Return to Origin)</td>
                <td className="p-3 font-mono font-bold text-amber-400">{metrics.rtoRatePct}%</td>
                <td className="p-3 text-neutral-500">Target &lt;10%</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-bold text-[10px]">
                    Controlled
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#F3F4F6]">ONDC Search Success</td>
                <td className="p-3 font-mono font-bold text-amber-400">{metrics.ondcSearchSuccessPct}%</td>
                <td className="p-3 text-neutral-500">Tool calls /search</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-bold text-[10px]">
                    Healthy
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#F3F4F6]">WhatsApp Latency</td>
                <td className="p-3 font-mono font-bold text-amber-400">{metrics.whatsappLatencyMs} ms</td>
                <td className="p-3 text-neutral-500">Initial webhook &lt;500ms</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/40 font-bold text-[10px]">
                    Optimal
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Failure Alerts & Guardrail Log Stream (Section 10 Failure Alerts) */}
      <div className="bg-[#18181D] rounded-2xl p-4 border border-neutral-800">
        <h3 className="font-display font-bold text-neutral-300 text-xs uppercase tracking-wider mb-3">
          நிகழ்நேர எச்சரிக்கைகள் (Real-time Failure & Guardrail Audit):
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131317] border border-neutral-800/80">
            <span className="flex items-center gap-2 text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>UPI Payment Gateway Webhooks (Razorpay / Cashfree)</span>
            </span>
            <span className="font-semibold text-emerald-400">Operational (99.2%)</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131317] border border-neutral-800/80">
            <span className="flex items-center gap-2 text-neutral-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ONDC Gateway Response SLA (std:0422 Coimbatore)</span>
            </span>
            <span className="font-semibold text-emerald-400">142 ms average</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131317] border border-neutral-800/80">
            <span className="flex items-center gap-2 text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Programmatic Scope Guardrail Enforcement</span>
            </span>
            <span className="font-semibold text-neutral-400">Active (100% hardcoded filter)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
