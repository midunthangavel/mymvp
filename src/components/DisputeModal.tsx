import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  Camera,
  CheckCircle2,
  DollarSign,
  Upload,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { Order, LanguageMode } from '../types';
import { speakText, soundEffects } from '../utils/speechSynthesis';

interface DisputeModalProps {
  order: Order | null;
  onClose: () => void;
  onResolved: (orderId: string, refundAmount: number) => void;
  language: LanguageMode;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  order,
  onClose,
  onResolved,
  language,
}) => {
  const [issueType, setIssueType] = useState('Incorrect item / தவறான பொருள்');
  const [description, setDescription] = useState('பிரியாணியுடன் வர வேண்டிய சால்னா கிடைக்கவில்லை.');
  const [hasPhoto, setHasPhoto] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionResult, setResolutionResult] = useState<any | null>(null);

  if (!order) return null;

  const handleSubmitIGM = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const refund = 50;
      setResolutionResult({
        ticketId: `IGM_TN_${Math.floor(100000 + Math.random() * 900000)}`,
        refundAmount: refund,
        status: 'RESOLVED_INSTANT',
      });
      soundEffects.playOrderSuccess();
      onResolved(order.id, refund);

      const speech =
        language === 'ta'
          ? 'மன்னிக்கவும்! ONDC சர்வீஸ் மூலம் புகார் பதியப்பட்டது. உங்கள் ₹50 ரீஃபண்ட் உடனடியாக கணக்கில் சேர்க்கப்பட்டது.'
          : 'Issue resolved via ONDC IGM and ₹50 refunded to your original payment method. Sorry for the inconvenience!';
      speakText(speech, language === 'ta' ? 'ta' : 'en');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131317] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-800 text-[#E5E5E5]">
        {/* Header */}
        <div className="p-4 bg-[#1C1628] text-[#F3F4F6] flex items-center justify-between border-b border-purple-900/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-700/50 flex items-center justify-center text-purple-300">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[#F3F4F6]">ONDC IGM புகார் மையம் (Issue & Grievance)</h3>
              <p className="text-[11px] text-purple-300/80 font-mono">ஆர்டர் #{order.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#281F38] text-purple-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {resolutionResult ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-[#F3F4F6]">
                  புகார் தீர்க்கப்பட்டது (Issue Resolved)
                </h4>
                <p className="text-neutral-400 mt-1">
                  டிக்கெட் எண்: <span className="font-mono font-bold text-amber-400">{resolutionResult.ticketId}</span>
                </p>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-2xl p-4 text-emerald-200">
                <div className="text-xs font-semibold text-emerald-400">ரீஃபண்ட் ஒப்புதல்:</div>
                <div className="text-2xl font-black font-display text-emerald-300 my-1">
                  ₹{resolutionResult.refundAmount}
                </div>
                <div className="text-[11px] text-neutral-300">
                  தொகை உங்கள் UPI வங்கிக் கணக்கில் உடனடியாக வரவு வைக்கப்பட்டது.
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition-colors cursor-pointer"
              >
                சரி (Done)
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="font-bold text-neutral-300 block mb-1">
                  பிரச்சனையின் வகை (Select Issue Type):
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-700 bg-[#181820] font-medium text-[#F3F4F6] focus:outline-none focus:border-amber-500"
                >
                  <option value="Incorrect item / தவறான பொருள்">
                    Incorrect item / தவறான பொருள்
                  </option>
                  <option value="Cold food / சூடில்லாத உணவு">Cold food / சூடில்லாத உணவு</option>
                  <option value="Spilled or Damaged / சேதமடைந்த பார்சல்">
                    Spilled or Damaged / சேதமடைந்த பார்சல்
                  </option>
                  <option value="Rider undelivered / விநியோகிக்கப்படவில்லை">
                    Rider undelivered / விநியோகிக்கப்படவில்லை
                  </option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">
                  விளக்கம் (Details):
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-neutral-700 bg-[#181820] text-[#F3F4F6] focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Photo Proof Simulation (Section 13.7) */}
              <div className="bg-[#181820] border border-neutral-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-neutral-400" />
                    <span>புகைப்பட சான்று (Photo Evidence):</span>
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-600/40 px-2 py-0.5 rounded-full">
                    Uploaded: item_proof.jpg
                  </span>
                </div>
                <div className="h-20 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&auto=format&fit=crop&q=80"
                    alt="Proof"
                    className="w-full h-full object-cover opacity-85"
                  />
                </div>
              </div>

              <div className="text-[11px] bg-[#1F1628] p-2.5 rounded-xl border border-purple-800/40 text-purple-200">
                <strong className="text-purple-300">ONDC IGM SLA:</strong> விற்பனையாளர் நெறிமுறை மூலம் உடனடி எஸ்க்ரோ ரீஃபண்ட் ₹50 தானாக அங்கீகரிக்கப்படும்.
              </div>

              <button
                onClick={handleSubmitIGM}
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>ONDC நெட்வொர்க்கில் புகார் பதியப்படுகிறது...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>புகாரை சமர்ப்பித்து ₹50 ரீஃபண்ட் பெறுக</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
