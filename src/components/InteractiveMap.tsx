import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Store,
  Bike,
  Compass,
  Layers,
  Utensils,
  ShoppingBag,
  Croissant,
  Cross,
} from 'lucide-react';
import { Merchant, Order } from '../types';

interface InteractiveMapProps {
  merchants: Merchant[];
  selectedLocality: string;
  activeOrder?: Order | null;
  onSelectMerchant?: (merchantId: string) => void;
  selectedMerchantId?: string | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  merchants,
  selectedLocality,
  activeOrder,
  onSelectMerchant,
  selectedMerchantId,
}) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'food' | 'grocery' | 'bakery'>('all');

  // SVG dimensions & coordinate normalization for Coimbatore center
  // Center approx: lat 11.0183, lng 76.9644
  const mapWidth = 700;
  const mapHeight = 360;

  const centerLat = 11.019;
  const centerLng = 76.965;
  const latScale = 6500;
  const lngScale = 6500;

  const projectToX = (lng: number) => {
    return mapWidth / 2 + (lng - centerLng) * lngScale;
  };

  const projectToY = (lat: number) => {
    return mapHeight / 2 - (lat - centerLat) * latScale;
  };

  const customerX = projectToX(76.9644);
  const customerY = projectToY(11.0183);

  const filteredMerchants = merchants.filter((m) => {
    if (activeLayer === 'all') return true;
    if (activeLayer === 'food') return m.category === 'RET11';
    if (activeLayer === 'grocery') return m.category === 'RET10';
    if (activeLayer === 'bakery') return m.category === 'BAKERY';
    return true;
  });

  return (
    <div className="bg-[#141418]/90 rounded-2xl border border-neutral-800/90 shadow-xl overflow-hidden my-4 backdrop-blur-md">
      {/* Map Header */}
      <div className="bg-[#18181D] px-4 py-2.5 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1F1F26] text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Navigation className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xs font-bold text-[#F3F4F6] tracking-wide">
                கோயம்புத்தூர் நேரலை வரைபடம் (Live ONDC Merchant Radar)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                7 கி.மீ சேவை வரம்பு
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {selectedLocality}, கோவை • நேரலை விநியோக வழித்தடம்
            </p>
          </div>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-1 text-[11px] bg-[#121215] p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeLayer === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            அனைத்தும்
          </button>
          <button
            onClick={() => setActiveLayer('food')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeLayer === 'food'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            உணவகம்
          </button>
          <button
            onClick={() => setActiveLayer('bakery')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeLayer === 'bakery'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            பேக்கரி
          </button>
          <button
            onClick={() => setActiveLayer('grocery')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              activeLayer === 'grocery'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            மளிகை
          </button>
        </div>
      </div>

      {/* SVG Canvas Map Area */}
      <div className="relative w-full h-[280px] sm:h-[340px] bg-[#0E0E12] overflow-hidden select-none">
        {/* Map grid lines / road simulation */}
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full object-cover"
          style={{ backgroundColor: '#0F0F14' }}
        >
          {/* Subtle Coimbatore Road Grid Paths */}
          <g stroke="#22222B" strokeWidth="3" fill="none">
            {/* Avinashi Road corridor */}
            <path d="M 50,300 Q 250,220 650,120" strokeWidth="8" stroke="#1C1C24" />
            <path d="M 50,300 Q 250,220 650,120" strokeWidth="3" stroke="#2B2B38" />

            {/* Cross Cut Road */}
            <path d="M 320,60 L 360,330" strokeWidth="5" stroke="#22222E" />
            <path d="M 120,180 L 580,180" strokeWidth="4" stroke="#22222E" />
            <path d="M 180,90 L 520,290" strokeWidth="3" stroke="#1A1A22" />
            <path d="M 460,80 L 420,320" strokeWidth="4" stroke="#22222E" />
          </g>

          {/* 7km Geofence Serviceable Zone Circle */}
          <circle
            cx={customerX}
            cy={customerY}
            r="170"
            fill="rgba(245, 158, 11, 0.03)"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={customerX - 160}
            y={customerY - 140}
            fill="#d97706"
            fontSize="10"
            fontWeight="bold"
          >
            7 KM ONDC GEOFENCE (COIMBATORE)
          </text>

          {/* Active Delivery Rider Path (if order is out for delivery) */}
          {activeOrder && activeOrder.orderStatus === 'OUT_FOR_DELIVERY' && (
            <g>
              <line
                x1={customerX - 80}
                y1={customerY + 60}
                x2={customerX}
                y2={customerY}
                stroke="#f59e0b"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
              {/* Rider Marker */}
              <circle cx={customerX - 45} cy={customerY + 32} r="14" fill="#f59e0b" />
              <text
                x={customerX - 45}
                y={customerY + 36}
                textAnchor="middle"
                fill="#000000"
                fontSize="11"
              >
                🏍️
              </text>
              <rect
                x={customerX - 95}
                y={customerY + 50}
                width="100"
                height="20"
                rx="4"
                fill="#18181D"
                stroke="#f59e0b"
                strokeWidth="1"
              />
              <text
                x={customerX - 45}
                y={customerY + 64}
                textAnchor="middle"
                fill="#f59e0b"
                fontSize="10"
                fontWeight="bold"
              >
                ரைடர் 2 km (12 min)
              </text>
            </g>
          )}

          {/* Customer Home Pin */}
          <g transform={`translate(${customerX}, ${customerY})`}>
            <circle r="18" fill="rgba(16, 185, 129, 0.25)" className="animate-ping" />
            <circle r="12" fill="#059669" />
            <circle r="5" fill="#ffffff" />
            <rect
              x="-45"
              y="-36"
              width="90"
              height="20"
              rx="4"
              fill="#064e3b"
              stroke="#10b981"
              strokeWidth="1"
            />
            <text x="0" y="-23" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
              📍 உங்கள் இடம் (Home)
            </text>
          </g>

          {/* Merchant Pins */}
          {filteredMerchants.map((m) => {
            const posX = Math.max(40, Math.min(mapWidth - 40, projectToX(m.lng)));
            const posY = Math.max(40, Math.min(mapHeight - 40, projectToY(m.lat)));
            const isSelected = selectedMerchantId === m.id;

            return (
              <g
                key={m.id}
                transform={`translate(${posX}, ${posY})`}
                onClick={() => onSelectMerchant && onSelectMerchant(m.id)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Pin shadow and background */}
                <circle
                  r={isSelected ? '16' : '13'}
                  fill={
                    m.category === 'RET11'
                      ? '#ea580c'
                      : m.category === 'BAKERY'
                      ? '#d97706'
                      : m.category === 'RET10'
                      ? '#10b981'
                      : '#0284c7'
                  }
                  stroke={isSelected ? '#f59e0b' : '#272730'}
                  strokeWidth="2.5"
                  className="drop-shadow-md"
                />

                {/* Inner Icon Emoji or Text */}
                <text x="0" y="4" textAnchor="middle" fontSize="9" fill="#ffffff" fontWeight="bold">
                  {m.category === 'RET11'
                    ? '🍲'
                    : m.category === 'BAKERY'
                    ? '🥐'
                    : m.category === 'RET10'
                    ? '🥛'
                    : '💊'}
                </text>

                {/* Floating Label */}
                <rect
                  x="-60"
                  y="-26"
                  width="120"
                  height="18"
                  rx="4"
                  fill="#1C1C22"
                  stroke="#33333E"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-14"
                  textAnchor="middle"
                  fill="#E5E5E5"
                  fontSize="8.5"
                  fontWeight="bold"
                >
                  {m.name.length > 18 ? m.name.substring(0, 16) + '...' : m.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Map Legend */}
        <div className="absolute bottom-2 left-2 bg-[#16161B]/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-neutral-800 text-[10px] text-neutral-400 shadow-md flex items-center gap-3">
          <span className="flex items-center gap-1 font-semibold text-neutral-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> உங்கள் இடம்
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> உணவகம் (RET11)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> பேக்கரி
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> மளிகை (RET10)
          </span>
        </div>
      </div>
    </div>
  );
};
