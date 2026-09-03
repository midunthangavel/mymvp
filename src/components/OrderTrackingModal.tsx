import React from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Bike,
  Phone,
  MapPin,
  AlertTriangle,
  Volume2,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { Order, OrderStatus, LanguageMode } from '../types';
import { speakText } from '../utils/speechSynthesis';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
  onAdvanceStatus: (orderId: string) => void;
  onTriggerRTO: (orderId: string) => void;
  onOpenDispute: (order: Order) => void;
  language: LanguageMode;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  onClose,
  onAdvanceStatus,
  onTriggerRTO,
  onOpenDispute,
  language,
}) => {
  if (!order) return null;

  const handleSpeakStatus = () => {
    let text = '';
    if (order.orderStatus === 'PLACED') {
      text = 'உங்கள் ஆர்டர் பதிவு செய்யப்பட்டு உணவகத்திற்கு அனுப்பப்பட்டுள்ளது.';
    } else if (order.orderStatus === 'ACCEPTED') {
      text = 'உணவகம் உங்கள் ஆர்டரை ஏற்றுக்கொண்டது.';
    } else if (order.orderStatus === 'PREPARING') {
      text = 'சமையல் அறையில் உங்கள் சூடான உணவு தயாராகிக்கொண்டிருக்கிறது.';
    } else if (order.orderStatus === 'READY_FOR_PICKUP') {
      text = 'உணவு தயாராகிவிட்டது, டெலிவரி ரைடருக்காக காத்திருக்கிறது.';
    } else if (order.orderStatus === 'OUT_FOR_DELIVERY') {
      text = 'உங்கள் ஆர்டர் டெலிவரிக்கு புறப்பட்டுவிட்டது. ரைடர் 2 கி.மீ தொலைவில் உள்ளார், வர 12 நிமிடங்கள் ஆகும்.';
    } else if (order.orderStatus === 'DELIVERED') {
      text = 'உங்கள் ஆர்டர் வெற்றிகரமாக டெலிவரி செய்யப்பட்டது. உணவை மகிழ்ந்து உண்ணுங்கள்!';
    } else if (order.orderStatus === 'RTO_FAILED') {
      text = 'ரைடர் உங்களை தொடர்பு கொள்ள முடியாததால் பார்சல் திரும்பியது. மாற்று ஏற்பாடு செய்யப்படுகிறது.';
    }

    speakText(text, language === 'ta' ? 'ta' : 'en');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131317] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-800 text-[#E5E5E5]">
        {/* Header */}
        <div className="p-5 bg-[#18181D] text-[#F3F4F6] flex items-center justify-between sticky top-0 z-10 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ONDC Ret11 Track
              </span>
              <span className="font-mono text-xs text-neutral-400">#{order.id}</span>
            </div>
            <h2 className="text-lg font-bold font-display mt-1 text-[#F3F4F6]">
              நேரலை ஆர்டர் நிலை (Live Order Tracking)
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#22222A] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            id="close-tracking-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Spoken Voice Status Alert */}
          <div className="bg-[#18181D] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center shrink-0 font-bold">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300">குரல் தகவல் (Voice Notification)</div>
                <div className="text-xs text-neutral-300">
                  {order.orderStatus === 'OUT_FOR_DELIVERY'
                    ? 'ரைடர் 2 கி.மீ தொலைவில் உள்ளார், ETA 12 நிமிடங்கள்'
                    : order.orderStatus === 'DELIVERED'
                    ? 'ஆர்டர் டெலிவரி செய்யப்பட்டது!'
                    : 'ஆர்டர் தயாரிப்பில் உள்ளது'}
                </div>
              </div>
            </div>
            <button
              onClick={handleSpeakStatus}
              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
              id="speak-order-status-btn"
            >
              கேட்கவும்
            </button>
          </div>

          {/* Rider Status Card (Section 8.4) */}
          {order.orderStatus === 'OUT_FOR_DELIVERY' && order.rider && (
            <div className="bg-[#1C1814] border border-amber-800/40 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center font-bold">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-display text-[#F3F4F6]">{order.rider.name}</div>
                    <div className="text-[11px] text-neutral-400 font-mono">
                      {order.rider.vehicleNumber} (Shadowfax/Dunzo)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-amber-400">
                    {order.rider.distanceKm} km தூரம்
                  </div>
                  <div className="text-[11px] font-bold text-neutral-400">
                    ETA: {order.rider.etaMinutes} நிமிடங்கள்
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-amber-800/30 text-xs">
                <span className="text-neutral-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>கிராஸ்கட் ரோடு வழியாக வருகிறார்</span>
                </span>
                <a
                  href={`tel:${order.rider.phone}`}
                  className="text-amber-300 font-bold flex items-center gap-1 bg-[#251A14] px-2.5 py-1 rounded-lg border border-amber-700/40 hover:bg-[#30221A] transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>அழைக்கவும்</span>
                </a>
              </div>
            </div>
          )}

          {/* RTO Failure notice (if simulated) */}
          {order.orderStatus === 'RTO_FAILED' && (
            <div className="bg-[#241316] border border-rose-800/50 rounded-2xl p-4 text-xs text-rose-200">
              <div className="flex items-center gap-2 font-bold mb-1 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>டெலிவரி தோல்வி - பார்சல் திரும்பியது (RTO Issue)</span>
              </div>
              <p className="text-rose-200/80 mb-2 leading-relaxed">
                ரைடர் உங்கள் இடத்தை அடைய முடியாமல் திரும்பியுள்ளார். ONDC நெட்வொர்க் வழியாக புதிய ஆர்டர் மாற்று அல்லது முழு தொகை திரும்ப வழங்கல் ஏற்பாடு செய்யப்படுகிறது.
              </p>
              <button
                onClick={() => onOpenDispute(order)}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
              >
                உடனடி ரீஃபண்ட் பெறுக (Claim Refund)
              </button>
            </div>
          )}

          {/* Status Timeline (Exact Section 8.4 Spec) */}
          <div className="border border-neutral-800 rounded-2xl p-4 bg-[#18181D]/60">
            <h4 className="font-display font-bold text-[#F3F4F6] text-xs mb-3 uppercase tracking-wider">
              ஆர்டர் முன்னேற்றம் (Status Timeline)
            </h4>

            <div className="space-y-4">
              {order.statusTimeline.map((step, idx) => {
                const isCurrent = step.status === order.orderStatus;
                const isPassed = step.completed;

                return (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {/* Connecting line */}
                    {idx < order.statusTimeline.length - 1 && (
                      <div
                        className={`absolute left-3.5 top-6 bottom--3 w-0.5 ${
                          isPassed ? 'bg-amber-500/70' : 'bg-neutral-800'
                        }`}
                      />
                    )}

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-1 text-xs font-bold ${
                        isCurrent
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 ring-4 ring-amber-500/20 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#22222A] text-neutral-500 border border-neutral-700'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isCurrent ? 'text-amber-400 font-display' : 'text-[#F3F4F6]'
                          }`}
                        >
                          {language === 'ta' ? step.tamilLabel : step.label}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {step.timestamp}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-medium">
                        {language === 'ta' ? step.label : step.tamilLabel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Item Summary */}
          <div className="bg-[#18181D] rounded-2xl p-4 border border-neutral-800 text-xs space-y-2">
            <div className="flex justify-between font-bold text-[#F3F4F6] pb-1 border-b border-neutral-800">
              <span className="font-display">{order.merchantName}</span>
              <span className="text-amber-400 font-bold font-display">மொத்தம்: ₹{order.total}</span>
            </div>
            {order.items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-neutral-400">
                <span>
                  {item.quantity} × {item.product.name}
                </span>
                <span className="text-neutral-200">₹{item.product.price * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Simulation & Edge Case Buttons */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              சோதனை கட்டுப்பாடுகள் (Simulations & Support):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onAdvanceStatus(order.id)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                id="advance-order-step-btn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>அடுத்த நிலைக்கு நகர்த்து (Next Stage)</span>
              </button>

              <button
                onClick={() => onTriggerRTO(order.id)}
                className="px-3 py-1.5 rounded-xl bg-[#251A14] text-amber-300 border border-amber-800/50 font-bold text-xs hover:bg-[#30221A] flex items-center gap-1.5 cursor-pointer transition-colors"
                id="simulate-rto-btn"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Rider RTO</span>
              </button>

              <button
                onClick={() => onOpenDispute(order)}
                className="px-3 py-1.5 rounded-xl bg-[#1F162A] text-purple-300 border border-purple-800/50 font-bold text-xs hover:bg-[#2A1E38] flex items-center gap-1.5 cursor-pointer transition-colors"
                id="open-igm-dispute-btn"
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>ONDC IGM புகார் (Dispute)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
