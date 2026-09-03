import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Sparkles, Volume2, ArrowRight, ShieldAlert } from 'lucide-react';
import { LanguageMode } from '../types';
import { SAMPLE_VOICE_QUERIES } from '../data/mockData';
import { soundEffects } from '../utils/speechSynthesis';

interface VoiceAssistantMicProps {
  onTranscriptReceived: (transcript: string) => void;
  isProcessing: boolean;
  language: LanguageMode;
  currentLocality: string;
}

export const VoiceAssistantMic: React.FC<VoiceAssistantMicProps> = ({
  onTranscriptReceived,
  isProcessing,
  language,
  currentLocality,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [hasMicSupport, setHasMicSupport] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasMicSupport(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Select speech language
      if (language === 'ta') {
        recognition.lang = 'ta-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsListening(true);
        soundEffects.playMicStart();
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setInterimTranscript(currentText);

        if (event.results[0].isFinal) {
          setIsListening(false);
          soundEffects.playMicStop();
          onTranscriptReceived(currentText);
          setInterimTranscript('');
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition notice:', err?.error);
        setIsListening(false);
        soundEffects.playMicStop();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition setup notice:', e);
      setHasMicSupport(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, onTranscriptReceived]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      soundEffects.playMicStop();
    } else {
      setInterimTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
          recognitionRef.current.start();
        } catch (e) {
          // If already running or permission issue, fallback to simulated prompt prompt
          simulateMicrophone();
        }
      } else {
        simulateMicrophone();
      }
    }
  };

  const simulateMicrophone = () => {
    setIsListening(true);
    soundEffects.playMicStart();
    setInterimTranscript('கேட்கிறது... "2 சிக்கன் பிரியாணி வேணும்"');
    setTimeout(() => {
      setIsListening(false);
      soundEffects.playMicStop();
      onTranscriptReceived('காந்திபுரத்துல 2 சிக்கன் பிரியாணி வேணும்');
      setInterimTranscript('');
    }, 2000);
  };

  const handleChipClick = (sample: (typeof SAMPLE_VOICE_QUERIES)[0]) => {
    const text =
      language === 'ta' ? sample.tamil : language === 'tanglish' ? sample.tanglish : sample.english;
    soundEffects.playMicStart();
    onTranscriptReceived(text);
  };

  return (
    <div className="bg-[#141417]/90 rounded-2xl p-6 border border-neutral-800/90 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background Subtle Wave & Glow Accent */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-gradient-to-bl from-amber-500/10 via-orange-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Vernacular Greeting */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>வணக்கம்! இன்று உங்களுக்கு என்ன வேண்டும்?</span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F3F4F6] tracking-wide mb-2">
          {language === 'ta'
            ? 'பேசி ஆர்டர் செய்யுங்கள் (Voice Order)'
            : language === 'tanglish'
            ? 'Just Pesunga, Order Pannunga!'
            : 'Speak naturally to order food & groceries'}
        </h1>

        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mb-6 leading-relaxed">
          {language === 'ta'
            ? `கோவையின் ${currentLocality} பகுதியில் சூடான பிரியாணி, பன் புரோட்டா, பேக்கரி இனிப்புகள் அல்லது ஆவின் பால் மளிகை பொருட்களை குரல் மூலம் கேளுங்கள்.`
            : `Search nearby restaurants, hot bakeries, or fresh groceries in ${currentLocality}, Coimbatore simply by speaking in Tamil or Tanglish.`}
        </p>

        {/* The Big Tactile Microphone Button */}
        <div className="relative my-3">
          {/* Animated sound ripple waves when listening */}
          {isListening && (
            <>
              <span className="absolute -inset-4 rounded-full bg-rose-500/30 animate-ping" />
              <span className="absolute -inset-8 rounded-full bg-amber-500/20 animate-pulse" />
            </>
          )}

          <button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl focus:outline-none cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white shadow-rose-600/50 ring-4 ring-rose-500/30 scale-105'
                : isProcessing
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30 animate-pulse'
                : 'bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 text-white hover:from-amber-400 hover:to-orange-500 active:scale-95 shadow-xl shadow-orange-950/60 ring-2 ring-amber-400/30 hover:ring-amber-400/60'
            }`}
            id="tap-to-speak-mic-btn"
            title="பேச அழுத்தவும் (Tap to Speak)"
          >
            {isListening ? (
              <>
                <MicOff className="w-8 h-8 animate-bounce" />
                <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">நிறுத்து</span>
              </>
            ) : isProcessing ? (
              <>
                <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-bold mt-1">ஆராய்ச்சி...</span>
              </>
            ) : (
              <>
                <Mic className="w-9 h-9" />
                <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">பேசுக</span>
              </>
            )}
          </button>
        </div>

        {/* Live Status Indicator */}
        <div className="mt-2 min-h-[28px] flex items-center justify-center">
          {isListening ? (
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>
                {interimTranscript ||
                  (language === 'ta'
                    ? 'கேட்கிறது... உங்கள் தேவையை கூறுங்கள்...'
                    : 'Listening... Speak in Tamil or Tanglish...')}
              </span>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>ONDC & Gemini AI மூலம் தேடுகிறது...</span>
            </div>
          ) : (
            <span className="text-xs text-neutral-400 font-medium">
              மைக்கை அழுத்திப் பேசுங்கள் அல்லது கீழே உள்ள உதாரணங்களை கிளிக் செய்யுங்கள்
            </span>
          )}
        </div>

        {/* Interactive Preset Spoken Voice Prompts */}
        <div className="w-full mt-6 pt-5 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>உதாரண குரல் கட்டளைகள் (Quick Tamil Voice Prompts):</span>
            </span>
            <span className="text-[11px] text-neutral-500">நேரடியாக சோதிக்க கிளிக் செய்யவும்</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {SAMPLE_VOICE_QUERIES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(sample)}
                disabled={isProcessing || isListening}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 shadow-md cursor-pointer ${
                  sample.category.includes('Guardrail')
                    ? 'bg-[#1E1114] border-rose-900/60 text-rose-200 hover:border-rose-600/50'
                    : 'bg-[#1A1A20] border-neutral-800 text-neutral-200 hover:border-amber-500/40 hover:bg-[#202028]'
                }`}
                id={`sample-voice-chip-${idx}`}
              >
                {sample.category.includes('Guardrail') ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : (
                  <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-[#F3F4F6] leading-tight">
                    {language === 'ta'
                      ? sample.tamil
                      : language === 'tanglish'
                      ? sample.tanglish
                      : sample.english}
                  </div>
                  <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                    <span className="text-amber-400/80">{sample.category}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-neutral-500" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
