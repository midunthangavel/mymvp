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
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

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
      <div className="bg-[#12141C] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-800 text-[#E5E5E5]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#171923] text-[#F3F4F6] flex items-center justify-between sticky top-0 z-20 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="ondc" className="text-[10px] py-0.5 px-2 font-mono">
                ONDC Ret11 Track
              </Badge>
              <span className="font-mono text-xs text-neutral-400">#{order.id}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold font-display mt-1 text-[#F3F4F6]">
              நேரலை ஆர்டர் நிலை (Live Order Tracking)
            </h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
            id="close-tracking-modal-btn"
          >
            <X className="w-4 h-4 shrink-0" />
          </Button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Spoken Voice Status Alert */}
          <Card className="bg-[#181B26] border-amber-500/30 p-3.5 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                <Volume2 className="w-4 h-4 shrink-0" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-amber-300 truncate">குரல் தகவல் (Voice Notification)</div>
                <div className="text-xs text-neutral-300 truncate">
                  {order.orderStatus === 'OUT_FOR_DELIVERY'
                    ? 'ரைடர் 2 கி.மீ தொலைவில் உள்ளார், ETA 12 நிமிடங்கள்'
                    : order.orderStatus === 'DELIVERED'
                    ? 'ஆர்டர் டெலிவரி செய்யப்பட்டது!'
                    : 'ஆர்டர் தயாரிப்பில் உள்ளது'}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={handleSpeakStatus}
              className="h-8 px-3 text-xs font-bold shrink-0"
              id="speak-order-status-btn"
            >
              கேட்கவும்
            </Button>
          </Card>

          {/* Rider Status Card */}
          {order.orderStatus === 'OUT_FOR_DELIVERY' && order.rider && (
            <Card className="bg-[#1C1814] border-amber-800/40 p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                    <Bike className="w-5 h-5 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold font-display text-[#F3F4F6] truncate">{order.rider.name}</div>
                    <div className="text-[11px] text-neutral-400 font-mono truncate">
                      {order.rider.vehicleNumber} (Shadowfax/Dunzo)
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-amber-400 font-mono">
                    {order.rider.distanceKm} km தூரம்
                  </div>
                  <div className="text-[11px] font-bold text-neutral-400">
                    ETA: {order.rider.etaMinutes} நிமிடங்கள்
                  </div>
                </div>
              </div>

              <Separator className="bg-amber-800/30" />

              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-neutral-400 flex items-center gap-1 min-w-0 truncate">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">கிராஸ்கட் ரோடு வழியாக வருகிறார்</span>
                </span>
                <a
                  href={`tel:${order.rider.phone}`}
                  className="text-amber-300 font-bold flex items-center gap-1 bg-[#251A14] px-2.5 py-1 rounded-lg border border-amber-700/40 hover:bg-[#30221A] transition-colors shrink-0"
                >
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>அழைக்கவும்</span>
                </a>
              </div>
            </Card>
          )}

          {/* RTO Failure notice (if simulated) */}
          {order.orderStatus === 'RTO_FAILED' && (
            <Card className="bg-[#241316] border-rose-800/50 p-4 text-xs text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>டெலிவரி தோல்வி - பார்சல் திரும்பியது (RTO Issue)</span>
              </div>
              <p className="text-rose-200/80 leading-relaxed">
                ரைடர் உங்கள் இடத்தை அடைய முடியாமல் திரும்பியுள்ளார். ONDC நெட்வொர்க் வழியாக புதிய ஆர்டர் மாற்று அல்லது முழு தொகை திரும்ப வழங்கல் ஏற்பாடு செய்யப்படுகிறது.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onOpenDispute(order)}
                className="font-bold text-xs"
              >
                உடனடி ரீஃபண்ட் பெறுக (Claim Refund)
              </Button>
            </Card>
          )}

          {/* Status Timeline */}
          <Card className="border-neutral-800 p-4 bg-[#161822]/70 shadow-sm">
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
                        className={`absolute left-3.5 top-7 -bottom-4 w-0.5 z-0 ${
                          isPassed ? 'bg-amber-500/70' : 'bg-neutral-800'
                        }`}
                      />
                    )}

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-[1] text-xs font-bold ${
                        isCurrent
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 ring-4 ring-amber-500/20 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#22222A] text-neutral-500 border border-neutral-700'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-bold truncate ${
                            isCurrent ? 'text-amber-400 font-display' : 'text-[#F3F4F6]'
                          }`}
                        >
                          {language === 'ta' ? step.tamilLabel : step.label}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                          {step.timestamp}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-medium truncate">
                        {language === 'ta' ? step.label : step.tamilLabel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Order Item Summary */}
          <Card className="bg-[#161822] p-4 border-neutral-800 text-xs space-y-2">
            <div className="flex justify-between font-bold text-[#F3F4F6] pb-1 border-b border-neutral-800">
              <span className="font-display truncate">{order.merchantName}</span>
              <span className="text-amber-400 font-bold font-display font-mono shrink-0">மொத்தம்: ₹{order.total}</span>
            </div>
            {order.items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-neutral-400 text-[11px]">
                <span className="truncate pr-2">
                  {item.quantity} × {item.product.name}
                </span>
                <span className="text-neutral-200 font-mono shrink-0">₹{item.product.price * item.quantity}</span>
              </div>
            ))}
          </Card>

          {/* Simulation & Edge Case Buttons */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
              சோதனை கட்டுப்பாடுகள் (Simulations & Support):
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => onAdvanceStatus(order.id)}
                className="gap-1.5 text-xs font-bold"
                id="advance-order-step-btn"
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span>அடுத்த நிலைக்கு நகர்த்து (Next Stage)</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onTriggerRTO(order.id)}
                className="bg-[#251A14] text-amber-300 border-amber-800/50 hover:bg-[#30221A] gap-1.5 text-xs font-bold"
                id="simulate-rto-btn"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Simulate Rider RTO</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenDispute(order)}
                className="bg-[#1F162A] text-purple-300 border-purple-800/50 hover:bg-[#2A1E38] gap-1.5 text-xs font-bold"
                id="open-igm-dispute-btn"
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>ONDC IGM புகார் (Dispute)</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
