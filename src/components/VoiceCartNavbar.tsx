import React from 'react';
import {
  Mic,
  ShoppingBag,
  MapPin,
  Globe,
  Activity,
  Code,
  MessageSquare,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { LanguageMode } from '../types';
import { COIMBATORE_LOCALITIES } from '../data/mockData';

interface NavbarProps {
  currentLocality: string;
  onLocalityChange: (locality: string) => void;
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
  activeTab: 'chat' | 'whatsapp' | 'ondc' | 'metrics';
  onTabChange: (tab: 'chat' | 'whatsapp' | 'ondc' | 'metrics') => void;
  cartCount: number;
  onOpenCart: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isAiProcessing?: boolean;
}

export const VoiceCartNavbar: React.FC<NavbarProps> = ({
  currentLocality,
  onLocalityChange,
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  cartCount,
  onOpenCart,
  soundEnabled,
  onToggleSound,
  isAiProcessing = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#121214]/90 backdrop-blur-md border-b border-neutral-800/90 shadow-lg">
      {/* Top Banner: ONDC Participant & Indic Voice Note */}
      <div className="bg-gradient-to-r from-[#0c2415] via-[#141418] to-[#211208] text-neutral-300 text-xs py-1.5 px-4 border-b border-neutral-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
              ONDC Beckn Buyer v1.2
            </span>
            <span className="hidden sm:inline text-neutral-400">
              • Tamil-First Voice Commerce for Food, Bakeries & Groceries (Coimbatore Pilot)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-neutral-300 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400">Beckn Network Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('pwa')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
            id="brand-home-button"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-orange-950/40 group-hover:scale-105 transition-transform border border-amber-400/30">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-[#F3F4F6] text-lg tracking-wide">VoiceCart AI</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#1C1C20] text-amber-400 border border-amber-500/30">
                  2.0
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                <span>குரல் வழி வணிகம்</span>
                <span className="text-neutral-600">•</span>
                <span className="text-amber-400 font-semibold">Tamil & Tanglish</span>
              </p>
            </div>
          </button>

          {/* Locality Selector (Coimbatore) */}
          <div className="hidden md:flex items-center gap-1.5 bg-[#18181C] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-neutral-400 font-normal">நகரம்:</span>
            <select
              value={currentLocality}
              onChange={(e) => onLocalityChange(e.target.value)}
              className="bg-transparent font-semibold text-[#F3F4F6] focus:outline-none cursor-pointer"
              id="locality-select-nav"
            >
              {COIMBATORE_LOCALITIES.map((loc) => (
                <option key={loc} value={loc} className="bg-[#18181C] text-[#E5E5E5]">
                  {loc}, கோவை
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs for Modes */}
        <nav className="flex items-center gap-1 bg-[#18181C] p-1 rounded-xl border border-neutral-800 overflow-x-auto scrollbar-none shrink-0" id="primary-nav-tabs">
          <button
            onClick={() => onTabChange('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'chat'
                ? 'bg-[#25252A] text-amber-300 shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#202024]'
            }`}
            id="tab-chat-button"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden xl:inline">குரல் அரட்டை (Voice Chat)</span>
            <span className="xl:hidden">குரல் அரட்டை</span>
          </button>

          <button
            onClick={() => onTabChange('whatsapp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'whatsapp'
                ? 'bg-[#25252A] text-emerald-400 shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#202024]'
            }`}
            id="tab-whatsapp-button"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">WhatsApp முகவர்</span>
            <span className="sm:hidden">WhatsApp</span>
          </button>

          <button
            onClick={() => onTabChange('ondc')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'ondc'
                ? 'bg-[#25252A] text-teal-300 shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#202024]'
            }`}
            id="tab-ondc-button"
            title="ONDC Beckn Protocol Inspector"
          >
            <Code className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="hidden lg:inline">ONDC Beckn</span>
            <span className="lg:hidden">ONDC</span>
          </button>

          <button
            onClick={() => onTabChange('metrics')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'metrics'
                ? 'bg-[#25252A] text-cyan-300 shadow-sm border border-neutral-700'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#202024]'
            }`}
            id="tab-metrics-button"
            title="Observability & Health Dashboard"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden lg:inline">கண்காணிப்பு</span>
            <span className="lg:hidden">KPIs</span>
          </button>
        </nav>

        {/* Right Tools: Language, Sound, Cart */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Selector */}
          <div className="flex items-center bg-[#18181C] rounded-lg p-0.5 border border-neutral-800 text-xs shrink-0">
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
                language === 'ta'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="தமிழ்"
              id="lang-ta-btn"
            >
              தமிழ்
            </button>
            <button
              onClick={() => onLanguageChange('tanglish')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
                language === 'tanglish'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Tanglish"
              id="lang-tanglish-btn"
            >
              Tanglish
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 py-1 rounded-md font-semibold transition-colors cursor-pointer hidden sm:inline shrink-0 ${
                language === 'en'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="English"
              id="lang-en-btn"
            >
              EN
            </button>
          </div>

          {/* Sound Read-Aloud Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
              soundEnabled
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-[#18181C] text-neutral-500 border-neutral-800 hover:text-neutral-300'
            }`}
            title={soundEnabled ? 'குரல் வாசிப்பு இயக்கத்தில் உள்ளது' : 'குரல் வாசிப்பு முடக்கப்பட்டுள்ளது'}
            id="toggle-sound-btn"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 shrink-0" /> : <VolumeX className="w-4 h-4 shrink-0" />}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-stone-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-orange-950/40 cursor-pointer shrink-0"
            id="open-cart-btn"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">கூடை</span>
            {cartCount > 0 && (
              <span className="ml-1 bg-stone-950 text-amber-300 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border border-amber-400/50 shadow-xs shrink-0">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
