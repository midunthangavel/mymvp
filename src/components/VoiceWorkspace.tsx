import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { ParsedVoiceIntent, LanguageMode } from '../types';
import { speakText, stopSpeaking } from '../utils/speechSynthesis';

interface VoiceWorkspaceProps {
  lastIntent: ParsedVoiceIntent | null;
  onClear: () => void;
  language: LanguageMode;
  soundEnabled: boolean;
}

export const VoiceWorkspace: React.FC<VoiceWorkspaceProps> = ({
  lastIntent,
  onClear,
  language,
  soundEnabled,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!lastIntent) {
    return null;
  }

  const spokenText =
    language === 'ta'
      ? lastIntent.spokenResponseTamil
      : language === 'tanglish'
      ? lastIntent.spokenResponseTanglish
      : lastIntent.spokenResponseEnglish;

  const handlePlayVoice = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakText(
        spokenText,
        language === 'ta' ? 'ta' : language === 'tanglish' ? 'tanglish' : 'en',
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false)
      );
    }
  };

  return (
    <div className="bg-[#141418]/90 rounded-2xl border border-neutral-800/90 shadow-xl p-4 sm:p-5 my-4 transition-all backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1F1F26] text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
            <Bot className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-[#F3F4F6] text-sm tracking-wide">
              குரல் உரையாடல் (Voice Session Workspace)
            </h3>
            <p className="text-[11px] text-neutral-400">
              குரல் வழியான தேடல் மற்றும் ONDC நுண்ணறிவு
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="text-neutral-400 hover:text-neutral-200 p-1.5 rounded-lg hover:bg-[#202026] text-xs flex items-center gap-1 transition-colors cursor-pointer"
            title="அழித்து புதிதாக தொடங்க (Reset)"
            id="reset-voice-session-btn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px]">மீட்டமைக்க</span>
          </button>
        </div>
      </div>

      {/* User Voice Input Card */}
      <div className="flex items-start gap-3 bg-[#1A1A20] rounded-xl p-3.5 border border-neutral-800/80 mb-3">
        <div className="w-7 h-7 rounded-full bg-[#26262E] text-neutral-300 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
            <span className="font-semibold text-neutral-300">நீங்கள் பேசியது (Voice Input):</span>
            <span className="text-[10px] bg-[#26262E] text-amber-300 px-2 py-0.5 rounded-md border border-neutral-700">
              நம்பகத்தன்மை: {Math.round((lastIntent.confidence || 0.9) * 100)}%
            </span>
          </div>
          <p className="text-[#F3F4F6] font-medium text-sm sm:text-base leading-relaxed">
            "{lastIntent.rawTranscript}"
          </p>
        </div>
      </div>

      {/* Scope Guardrail Refusal Notice (if applicable) */}
      {lastIntent.guardrailTriggered && (
        <div className="bg-[#1E1114] border border-rose-800/60 rounded-xl p-3.5 mb-3 text-rose-200 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1 text-rose-300">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>வரம்பு கட்டுப்பாடு அமல்படுத்தப்பட்டது (Scope Guardrail Enforced)</span>
          </div>
          <p className="text-rose-200/90 leading-relaxed mb-2 font-medium">
            {lastIntent.guardrailReason ||
              'VoiceCart supports only RET10 (groceries), RET11 (restaurants), and bakeries in local Coimbatore.'}
          </p>
          <div className="text-[11px] bg-rose-950/60 p-2 rounded-lg text-rose-200 border border-rose-900/40">
            <strong>திசைதிருப்பல் கொள்கை:</strong> மொபைல் போன், ஆடைகள், எலெக்ட்ரானிக்ஸ் போன்றவை ஆதரிக்கப்படாது. சமையல் உணவுகள் மற்றும் பல்பொருள் மளிகை மட்டுமே ஆர்டர் செய்ய முடியும்.
          </div>
        </div>
      )}

      {/* AI Voice Assistant Spoken Response Card */}
      <div
        className={`rounded-xl p-4 border transition-all ${
          lastIntent.guardrailTriggered
            ? 'bg-[#1E1114] border-rose-900/50'
            : 'bg-[#0E1F16] border-emerald-600/40'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
              <span>உதவியாளர் குரல் பதில் (Spoken Response):</span>
            </span>
          </div>

          <button
            onClick={handlePlayVoice}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-rose-600 text-white'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold'
            }`}
            id="play-voice-response-btn"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                <span>நிறுத்து (Stop)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>கேட்கவும் (Play Audio)</span>
              </>
            )}
          </button>
        </div>

        {/* Read-Aloud Highlighted Text */}
        <p
          className={`text-sm sm:text-base font-medium leading-relaxed ${
            isPlayingAudio ? 'text-emerald-300 bg-emerald-950/60 p-2 rounded-lg border border-emerald-600/40' : 'text-[#E5E5E5]'
          }`}
        >
          {spokenText}
        </p>

        {/* Structured Intent & Slot Badges (Section 4 & 7 Data Contracts) */}
        <div className="mt-3 pt-3 border-t border-neutral-800 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="font-bold text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>பகுப்பாய்வு (Extracted Slots):</span>
          </span>

          <span className="bg-[#1C1C22] text-amber-300 px-2 py-0.5 rounded-md font-mono border border-neutral-700 font-semibold">
            intent: {lastIntent.intent}
          </span>

          {lastIntent.item && (
            <span className="bg-[#1C1C22] text-emerald-300 px-2 py-0.5 rounded-md font-mono border border-emerald-800/60 font-semibold">
              item: {lastIntent.item}
            </span>
          )}

          {lastIntent.quantity && (
            <span className="bg-[#1C1C22] text-amber-300 px-2 py-0.5 rounded-md font-mono border border-amber-800/60 font-semibold">
              qty: {lastIntent.quantity}
            </span>
          )}

          {lastIntent.location && (
            <span className="bg-[#1C1C22] text-cyan-300 px-2 py-0.5 rounded-md font-mono border border-cyan-800/60 font-semibold">
              loc: {lastIntent.location}
            </span>
          )}

          {lastIntent.veg !== undefined && lastIntent.veg !== null && (
            <span
              className={`px-2 py-0.5 rounded-md font-mono font-semibold border ${
                lastIntent.veg
                  ? 'bg-[#122416] text-emerald-300 border-emerald-700/60'
                  : 'bg-[#241712] text-orange-300 border-orange-700/60'
              }`}
            >
              diet: {lastIntent.veg ? 'Pure Veg' : 'Non-Veg'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
