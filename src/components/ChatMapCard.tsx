import React, { useState } from 'react';
import { MapPin, Star, Navigation, Maximize2, Minimize2, ExternalLink, Clock, Info } from 'lucide-react';
import { ChatPlace } from '../types';

interface ChatMapCardProps {
  places: ChatPlace[];
  locality?: string;
  onSelectPlace?: (place: ChatPlace) => void;
}

export const ChatMapCard: React.FC<ChatMapCardProps> = ({
  places,
  locality = 'Chennai / Coimbatore',
  onSelectPlace,
}) => {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(
    places.length > 0 ? places[0].id : ''
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const activePlace = places.find((p) => p.id === selectedPlaceId) || places[0];

  // Map pin positions mapped visually to container
  const getPinOffset = (index: number, total: number) => {
    const coordinates = [
      { top: '35%', left: '56%' }, // Center-right
      { top: '26%', left: '60%' }, // Top-right
      { top: '46%', left: '38%' }, // Center-left
      { top: '48%', left: '42%' }, // Center-left cluster
      { top: '65%', left: '62%' }, // Bottom-right
      { top: '72%', left: '68%' }, // Further bottom-right
    ];
    return coordinates[index % coordinates.length];
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl transition-all duration-300 ${
        isExpanded ? 'h-[460px]' : 'h-[320px]'
      }`}
      style={{
        backgroundColor: '#090E17',
        backgroundImage: `
          radial-gradient(ellipse at center, #0F1B30 0%, #080C14 100%),
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 32px 32px, 32px 32px',
      }}
    >
      {/* Top Header overlay */}
      <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-[#090E17]/90 via-[#090E17]/60 to-transparent flex items-center justify-between z-20 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#141F32]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-700/60 shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-neutral-200">Google Maps / Places</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-medium">
            {places.length} {places.length === 1 ? 'place' : 'places'} nearby
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-[#141F32]/80 hover:bg-[#1C2C46] text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse map' : 'Expand map'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SVG stylized road and grid overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Main arteries / Roads */}
        <path
          d="M -20,180 Q 150,140 280,190 T 500,160 T 700,220"
          fill="none"
          stroke="url(#roadGrad)"
          strokeWidth="3.5"
          strokeDasharray="6 3"
        />
        <path
          d="M 120,-20 L 140,400"
          fill="none"
          stroke="#1E3A8A"
          strokeWidth="2.5"
          opacity="0.6"
        />
        <path
          d="M 280,-10 L 310,420"
          fill="none"
          stroke="#1E40AF"
          strokeWidth="3"
        />
        <path
          d="M 20,90 Q 200,90 320,50 T 600,120"
          fill="none"
          stroke="#1E293B"
          strokeWidth="2"
        />
        <path
          d="M 40,260 Q 240,240 380,290 T 650,270"
          fill="none"
          stroke="#334155"
          strokeWidth="2"
        />
      </svg>

      {/* Area Labels (like in user image 1 & 3: Vadapalani, Koyambedu, Anna Nagar, etc.) */}
      <div className="absolute top-16 left-6 text-[10px] uppercase font-bold tracking-wider text-neutral-500/70 select-none pointer-events-none">
        Koyambedu / கோயம்பேடு
      </div>
      <div className="absolute top-20 right-10 text-[10px] uppercase font-bold tracking-wider text-neutral-500/70 select-none pointer-events-none">
        Anna Nagar / அண்ணா நகர்
      </div>
      <div className="absolute top-36 left-8 text-[10px] uppercase font-bold tracking-wider text-neutral-500/70 select-none pointer-events-none">
        Vadapalani / வடபழனி
      </div>
      <div className="absolute bottom-28 right-8 text-[10px] uppercase font-bold tracking-wider text-neutral-500/70 select-none pointer-events-none">
        West Mambalam / மேற்கு மாம்பலம்
      </div>

      {/* Interactive Map Pins */}
      {places.map((place, idx) => {
        const isSelected = place.id === (activePlace?.id || '');
        const pos = getPinOffset(idx, places.length);

        return (
          <div
            key={place.id}
            onClick={() => {
              setSelectedPlaceId(place.id);
              onSelectPlace?.(place);
            }}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-10 group transition-transform hover:scale-110"
            style={{ top: pos.top, left: pos.left }}
          >
            {/* Rating badge above pin if high rated */}
            {place.rating >= 4.8 && (
              <div className="mb-1 flex items-center justify-center gap-0.5 bg-white text-stone-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full shadow-lg border border-neutral-300">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                <span>{place.rating}</span>
              </div>
            )}

            {/* Red Pin graphic matching Google Maps */}
            <div className="relative flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xl transition-all ${
                  isSelected
                    ? 'bg-red-500 text-white ring-4 ring-red-500/40 scale-110'
                    : 'bg-red-600/90 text-white/90 hover:bg-red-500'
                }`}
              >
                <MapPin className="w-4 h-4 fill-white text-white" />
              </div>
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-[-2px] shadow-sm" />

              {/* Pin Tooltip/Label */}
              <div
                className={`mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md border ${
                  isSelected
                    ? 'bg-[#181820] text-amber-300 border-amber-500/50'
                    : 'bg-[#0D1524]/90 text-neutral-300 border-neutral-700/60 group-hover:text-white'
                }`}
              >
                {place.name.length > 20 ? `${place.name.substring(0, 18)}...` : place.name}
              </div>
            </div>
          </div>
        );
      })}

      {/* Selected Place Overlay Card at bottom of Map (Exact match to Image 1 & 3) */}
      {activePlace && (
        <div className="absolute bottom-2 inset-x-2 z-20 pointer-events-auto">
          <div className="bg-[#121824]/95 backdrop-blur-md rounded-xl p-2 border border-neutral-700/80 shadow-2xl flex items-center gap-2">
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700/80">
              <img
                src={
                  activePlace.imageUrl ||
                  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&auto=format&fit=crop&q=80'
                }
                alt={activePlace.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white truncate font-display">
                  {activePlace.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-neutral-300 mt-0.5">
                <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  {activePlace.rating}
                </span>
                <span>•</span>
                <span className="text-neutral-400 truncate max-w-[120px]">{activePlace.category}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[9px] mt-0.5 text-neutral-400">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {activePlace.isOpen ? 'Open' : 'Closed'}
                </span>
                <span>•</span>
                <span>{activePlace.distanceKm} km away</span>
              </div>
            </div>

            {/* Action pill */}
            <button
              onClick={() => onSelectPlace?.(activePlace)}
              className="px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 rounded-lg text-[10px] font-bold shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Navigation className="w-2.5 h-2.5" />
              <span>Select</span>
            </button>
          </div>
        </div>
      )}

      {/* Mapbox / OpenStreetMap attribution */}
      <div className="absolute bottom-1 right-3 text-[9px] text-neutral-500/60 z-10 select-none flex items-center gap-1">
        <Info className="w-2.5 h-2.5" />
        <span>Map data © OpenStreetMap / ONDC Places</span>
      </div>
    </div>
  );
};
