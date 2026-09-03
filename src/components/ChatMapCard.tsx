import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Star,
  Navigation,
  Maximize2,
  Minimize2,
  ExternalLink,
  Crosshair,
  Heart,
  Plus,
  Check,
  Loader2,
  ShoppingBag,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
} from 'lucide-react';
import { ChatPlace, ProductItem } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface ChatMapCardProps {
  places: ChatPlace[];
  locality?: string;
  onSelectPlace?: (place: ChatPlace) => void;
  onCheckLocation?: (detectedLocality: string, lat: number, lng: number) => void;
  onAddToCart?: (product: ProductItem) => void;
  likedProductIds?: Set<string>;
  onToggleLikeProduct?: (product: ProductItem) => void;
  onShowToast?: (message: string) => void;
}

// Fallback products generator if place has no products attached yet
function getPlaceProducts(place: ChatPlace): ProductItem[] {
  if (place.products && place.products.length > 0) return place.products;
  const pName = (place.name || '').toLowerCase();
  const cat = (place.category || '').toLowerCase();

  if (pName.includes('ice cream') || cat.includes('ice cream') || pName.includes('ibaco') || pName.includes('cream stone')) {
    return [
      {
        id: `prod_${place.id}_1`,
        merchantId: place.id,
        merchantName: place.name,
        name: 'Belgian Dark Chocolate Scoop',
        tamilName: 'பெல்ஜியன் டார்க் சாக்லேட்',
        category: 'RET11',
        price: 130,
        veg: true,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&auto=format&fit=crop&q=80',
        description: 'Rich dark chocolate infused with fudge and chocolate chips.',
        tamilDescription: 'சுவையான டார்க் சாக்லேட் மற்றும் ஃபட்ஜ் கலவை.',
        unit: '1 scoop',
        rating: 4.7,
        tags: ['ice cream', 'dessert']
      },
      {
        id: `prod_${place.id}_2`,
        merchantId: place.id,
        merchantName: place.name,
        name: 'Tender Coconut Ice Cream',
        tamilName: 'இளநீர் ஐஸ்கிரீம்',
        category: 'RET11',
        price: 110,
        veg: true,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&auto=format&fit=crop&q=80',
        description: 'Natural tender coconut malai infused in velvety cream.',
        tamilDescription: 'இயற்கையான இளநீர் மலாலுடன் தயாரிக்கப்பட்ட கிரீமி ஐஸ்கிரீம்.',
        unit: '1 scoop',
        rating: 4.8,
        tags: ['ice cream', 'fresh']
      }
    ];
  }
  if (pName.includes('pizza') || cat.includes('pizza') || pName.includes('domino')) {
    return [
      {
        id: `prod_${place.id}_1`,
        merchantId: place.id,
        merchantName: place.name,
        name: 'Farmhouse Veggie Pizza (Regular)',
        tamilName: 'பண்ணை காய்கறி பீட்சா',
        category: 'RET11',
        price: 249,
        veg: true,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
        description: 'Crisp capsicum, onion, tomato, and fresh grilled mushrooms with mozzarella.',
        tamilDescription: 'புதிய குடைமிளகாய், வெங்காயம், தக்காளி மற்றும் காளான் மொசரெல்லா பீட்சா.',
        unit: '1 pizza',
        rating: 4.5,
        tags: ['pizza', 'veg']
      },
      {
        id: `prod_${place.id}_2`,
        merchantId: place.id,
        merchantName: place.name,
        name: 'Garlic Breadsticks with Dip',
        tamilName: 'கார்லிக் பிரெட்ஸ்டிக்ஸ்',
        category: 'RET11',
        price: 109,
        veg: true,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&auto=format&fit=crop&q=80',
        description: 'Fresh baked garlic bread with herb seasoning.',
        tamilDescription: 'நறுமண பூண்டு மற்றும் மூலிகைகளுடன் சுடப்பட்ட பிரெட்ஸ்டிக்ஸ்.',
        unit: '1 pack',
        rating: 4.4,
        tags: ['bread', 'snacks']
      }
    ];
  }
  if (pName.includes('bake') || cat.includes('bakery')) {
    return [
      {
        id: `prod_${place.id}_1`,
        merchantId: place.id,
        merchantName: place.name,
        name: 'Fresh Hot Chicken Puff',
        tamilName: 'சிக்கன் பப்ஸ்',
        category: 'RET11',
        price: 35,
        veg: false,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
        description: 'Crisp flaky pastry with savory spiced chicken filling.',
        tamilDescription: 'மொருமொருப்பான பேஸ்ட்ரி மற்றும் மசாலா சிக்கன் பப்ஸ்.',
        unit: '1 pc',
        rating: 4.6,
        tags: ['bakery', 'snacks']
      },
      {
        id: `prod_${place.id}_2`,
        merchantId: place.id,
        merchantName: place.name,
        name: 'Honey Cake Slice',
        tamilName: 'ஹனி கேக்',
        category: 'RET11',
        price: 30,
        veg: true,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80',
        description: 'Moist sponge cake with honey glaze and coconut.',
        tamilDescription: 'தேன் மற்றும் தேங்காய்த் துருவல் கலந்த சுவையான ஹனி கேக்.',
        unit: '1 slice',
        rating: 4.7,
        tags: ['bakery', 'sweet']
      }
    ];
  }
  if (cat.includes('ret10') || pName.includes('mart') || pName.includes('grocery') || pName.includes('store')) {
    return [
      {
        id: `prod_${place.id}_1`,
        merchantId: place.id,
        merchantName: place.name,
        name: 'Aavin Full Cream Milk (500ml)',
        tamilName: 'ஆவின் பசும்பால் (500மி.லி)',
        category: 'RET10',
        price: 24,
        veg: true,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
        description: 'Farm fresh pasteurized full cream milk.',
        tamilDescription: 'தூய்மையான ஆவின் பசும்பால் பாக்கெட்.',
        unit: '500 ml',
        rating: 4.8,
        tags: ['milk', 'dairy']
      },
      {
        id: `prod_${place.id}_2`,
        merchantId: place.id,
        merchantName: place.name,
        name: 'Namakkal Country Eggs (6 Pcs)',
        tamilName: 'நாட்டுக்கோழி முட்டை (6)',
        category: 'RET10',
        price: 48,
        veg: false,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&auto=format&fit=crop&q=80',
        description: 'Fresh farm eggs with rich yolk.',
        tamilDescription: 'நாமக்கல் பண்ணை புத்தம் புதிய நாட்டுக் கோழி முட்டைகள்.',
        unit: '6 pcs',
        rating: 4.6,
        tags: ['eggs', 'fresh']
      }
    ];
  }
  // Default delicious local food items
  return [
    {
      id: `prod_${place.id}_1`,
      merchantId: place.id,
      merchantName: place.name,
      name: 'Special Chicken Biryani (Seeraga Samba)',
      tamilName: 'சீரக சம்பா சிக்கன் பிரியாணி',
      category: 'RET11',
      price: 180,
      veg: false,
      inStock: true,
      freshness: 'CONFIRMED',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
      description: 'Slow-cooked fragrant biryani with tender chicken pieces.',
      tamilDescription: 'சீரக சம்பா அரிசியில் விறகடுப்பில் சமைக்கப்பட்ட சிக்கன் பிரியாணி.',
      unit: '1 plate',
      rating: 4.7,
      tags: ['biryani', 'chicken']
    },
    {
      id: `prod_${place.id}_2`,
      merchantId: place.id,
      merchantName: place.name,
      name: 'South Indian Filter Coffee',
      tamilName: 'சுவையான பில்டர் காபி',
      category: 'RET11',
      price: 35,
      veg: true,
      inStock: true,
      freshness: 'CONFIRMED',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
      description: 'Freshly brewed aromatic chicory filter coffee.',
      tamilDescription: 'பாரம்பரிய முறைப்படி வடிகட்டப்பட்ட சுடச்சுட பில்டர் காபி.',
      unit: '1 cup',
      rating: 4.9,
      tags: ['coffee', 'beverage']
    }
  ];
}

export const ChatMapCard: React.FC<ChatMapCardProps> = ({
  places,
  locality = 'Gandhipuram, Coimbatore',
  onSelectPlace,
  onCheckLocation,
  onAddToCart,
  likedProductIds = new Set<string>(),
  onToggleLikeProduct,
  onShowToast,
}) => {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(
    places.length > 0 ? places[0].id : ''
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectedLocalityName, setDetectedLocalityName] = useState<string>('');
  const [showProductsDeck, setShowProductsDeck] = useState<boolean>(true);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const activePlace = places.find((p) => p.id === selectedPlaceId) || places[0];
  const activeProducts = activePlace ? getPlaceProducts(activePlace) : [];

  // Update selected place when places list updates
  useEffect(() => {
    if (places.length > 0 && !places.some((p) => p.id === selectedPlaceId)) {
      setSelectedPlaceId(places[0].id);
    }
  }, [places, selectedPlaceId]);

  // Initialize real Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Calculate initial center
    let centerLat = 11.0183;
    let centerLng = 76.9644;
    if (places.length > 0 && places[0].lat && places[0].lng) {
      centerLat = places[0].lat;
      centerLng = places[0].lng;
    }

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // High-performance, crisp CartoDB Voyager tiles (clear labels in Tamil Nadu)
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      ).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Invalidate map size when expanded / collapsed
  useEffect(() => {
    const timer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [isExpanded, showProductsDeck]);

  // Render markers and adjust bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const boundsPoints: L.LatLngTuple[] = [];

    // 1. Render User GPS position if available
    if (userCoords) {
      boundsPoints.push([userCoords.lat, userCoords.lng]);

      const userIcon = L.divIcon({
        className: 'user-leaflet-gps-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 pointer-events-none">
            <div class="absolute w-8 h-8 rounded-full bg-sky-500/40 animate-radar"></div>
            <div class="w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-white shadow-lg"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([userCoords.lat, userCoords.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(markersGroup);
    }

    // 2. Render Place Pins
    places.forEach((place) => {
      if (!place.lat || !place.lng) return;
      boundsPoints.push([place.lat, place.lng]);

      const isSelected = place.id === selectedPlaceId;
      const isVeg = place.category?.toLowerCase().includes('veg');

      const pinIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer group select-none">
            <div class="flex items-center gap-1 bg-stone-950/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border ${
              isSelected
                ? 'border-amber-400 text-amber-300 ring-2 ring-amber-400/40 scale-105'
                : 'border-neutral-700 hover:border-neutral-500'
            } transition-all mb-1 whitespace-nowrap">
              <span class="text-amber-400 font-extrabold">★ ${place.rating || '4.4'}</span>
              <span class="text-neutral-300 max-w-[100px] truncate">${place.name}</span>
            </div>
            <div class="relative flex items-center justify-center">
              <div class="w-7 h-7 rounded-full ${
                isSelected
                  ? 'bg-gradient-to-br from-red-500 to-amber-600 ring-4 ring-red-500/40 scale-115'
                  : 'bg-gradient-to-br from-red-600 to-orange-700 hover:scale-110'
              } text-white flex items-center justify-center shadow-2xl border border-white/80 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-white drop-shadow">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div class="absolute -bottom-1 w-1.5 h-1.5 bg-red-800 rounded-full"></div>
            </div>
          </div>
        `,
        iconSize: [140, 56],
        iconAnchor: [70, 52],
      });

      const marker = L.marker([place.lat, place.lng], { icon: pinIcon })
        .addTo(markersGroup)
        .on('click', () => {
          setSelectedPlaceId(place.id);
          onSelectPlace?.(place);
          map.panTo([place.lat, place.lng], { animate: true, duration: 0.4 });
        });
    });

    // Fit map view to encompass pins
    if (boundsPoints.length > 1) {
      map.fitBounds(L.latLngBounds(boundsPoints), {
        padding: [45, 45],
        maxZoom: 15,
      });
    } else if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 15);
    }
  }, [places, userCoords, selectedPlaceId]);

  // Check Current GPS Location handler
  const handleCheckCurrentLocation = () => {
    if (!navigator.geolocation) {
      onShowToast?.('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    onShowToast?.('Checking your current location via GPS...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });

        // Smoothly fly map to user's location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
        }

        try {
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            const locName = data.locality || data.city || 'Your Location';
            setDetectedLocalityName(data.displayName || locName);
            onShowToast?.(`📍 Located: ${data.displayName || locName}`);
            onCheckLocation?.(locName, lat, lng);
          } else {
            setDetectedLocalityName(`Location [${lat.toFixed(3)}, ${lng.toFixed(3)}]`);
            onShowToast?.(`📍 Location detected: [${lat.toFixed(3)}, ${lng.toFixed(3)}]`);
            onCheckLocation?.('My Location', lat, lng);
          }
        } catch {
          setDetectedLocalityName(`Location [${lat.toFixed(3)}, ${lng.toFixed(3)}]`);
          onShowToast?.(`📍 Location detected: [${lat.toFixed(3)}, ${lng.toFixed(3)}]`);
          onCheckLocation?.('My Location', lat, lng);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to fetch your location';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please allow GPS access in your browser.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        onShowToast?.(msg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleAddToCartClick = (prod: ProductItem) => {
    onAddToCart?.(prod);
    setAddedItems((prev) => ({ ...prev, [prod.id]: true }));
    onShowToast?.(`Added ${prod.name} to Cart`);
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [prod.id]: false }));
    }, 1500);
  };

  const googleMapsUrl = activePlace
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        activePlace.name + ' ' + (activePlace.address || locality)
      )}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locality)}`;

  return (
    <div
      id="live-map-card"
      className={`relative w-full rounded-2xl overflow-hidden border border-neutral-800 bg-[#090e17] shadow-2xl transition-all duration-300 ${
        isExpanded ? 'h-[520px]' : 'h-[380px]'
      }`}
    >
      {/* Real Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0 select-none cursor-grab active:cursor-grabbing"
      />

      {/* Top Floating Control Bar */}
      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20 pointer-events-none">
        {/* Locality Badge */}
        <div className="flex items-center gap-1.5 bg-[#0e1422]/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-neutral-700/80 shadow-lg pointer-events-auto max-w-[45%] shrink min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-white flex items-center gap-1 truncate">
              <span className="truncate">{detectedLocalityName || locality}</span>
              {userCoords && <span className="text-[9px] text-sky-400 font-mono shrink-0">(GPS)</span>}
            </span>
            <span className="text-[9px] text-neutral-400 truncate">
              {places.length} verified {places.length === 1 ? 'store' : 'stores'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
          {/* Check Current Location Button */}
          <button
            onClick={handleCheckCurrentLocation}
            disabled={isLocating}
            title="Check Current Location (GPS)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-[10px] shadow-md border border-sky-400/40 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-sky-200" />
            )}
            <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'Check Location'}</span>
            <span className="sm:hidden">{isLocating ? '...' : 'GPS'}</span>
          </button>

          {/* Zoom In & Out */}
          <div className="flex items-center bg-[#0e1422]/90 backdrop-blur-md rounded-xl border border-neutral-700/80 overflow-hidden shadow-md">
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-neutral-700" />
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expand / Minimize */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-[#0e1422]/90 backdrop-blur-md hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 transition-colors shadow-md cursor-pointer"
            title={isExpanded ? 'Collapse map' : 'Expand map'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Overlay: Active Place Details & Likeable Products */}
      {activePlace && (
        <div className="absolute bottom-2 inset-x-2 z-20 pointer-events-auto flex flex-col gap-1.5">
          {/* Main Selected Place Card */}
          <Card className="bg-[#0e1422]/95 backdrop-blur-md rounded-xl p-2.5 border-neutral-700/80 shadow-2xl flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Place Image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700">
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
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white truncate font-display">
                    {activePlace.name}
                  </span>
                  {activePlace.isOpen && (
                    <Badge variant="success" className="text-[8px] py-0 px-1">
                      Open
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-neutral-300 mt-0.5">
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold shrink-0">
                    <Star className="w-2.5 h-2.5 fill-amber-400 shrink-0" />
                    {activePlace.rating || '4.4'}
                  </span>
                  <span>•</span>
                  <span className="text-neutral-400 truncate max-w-[110px]">
                    {activePlace.category || 'ONDC RET11'}
                  </span>
                  <span>•</span>
                  <Badge variant="secondary" className="font-mono text-[9px] py-0 px-1 text-sky-400 shrink-0">
                    {activePlace.distanceKm || 1.2} km
                  </Badge>
                </div>

                <div className="text-[9px] text-neutral-400 truncate mt-0.5">
                  {activePlace.address || locality}
                </div>
              </div>
            </div>

            {/* Actions: Open Google Maps & Toggle Products */}
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors flex items-center justify-center shadow-xs shrink-0"
                title="Open in Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>

              <Button
                size="sm"
                variant={showProductsDeck ? 'secondary' : 'default'}
                onClick={() => setShowProductsDeck(!showProductsDeck)}
                className="h-8 px-2.5 text-[10px] font-bold gap-1 shadow-xs shrink-0"
              >
                <ShoppingBag className="w-3 h-3 shrink-0" />
                <span className="hidden sm:inline">{showProductsDeck ? 'Hide Products' : 'Products & Likes'}</span>
                <span className="sm:hidden">{showProductsDeck ? 'Hide' : 'Items'}</span>
              </Button>
            </div>
          </Card>

          {/* Products Around It Deck (Where users can Like & Add to Cart directly!) */}
          {showProductsDeck && activeProducts.length > 0 && (
            <div className="bg-[#0b101b]/95 backdrop-blur-md rounded-xl p-2 border border-neutral-800/90 shadow-xl space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-300">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>Products around this location (Like & Order):</span>
                </div>
                <span className="text-[9px] text-neutral-400 font-mono">
                  {activeProducts.length} items
                </span>
              </div>

              {/* Horizontal Scroll of Products */}
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                {activeProducts.map((prod) => {
                  const isLiked = likedProductIds.has(prod.id);
                  const isAdded = !!addedItems[prod.id];

                  return (
                    <div
                      key={prod.id}
                      className="bg-[#141a29] rounded-lg p-2 border border-neutral-800 hover:border-neutral-700 min-w-[210px] max-w-[210px] shrink-0 flex gap-2 shadow-sm transition-all"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700/60">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Veg / Non-veg dot */}
                        <div className="absolute top-1 left-1 bg-black/70 rounded-xs p-0.5">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              prod.veg ? 'bg-emerald-400' : 'bg-rose-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-[11px] text-white truncate" title={prod.name}>
                            {prod.name}
                          </div>
                          <div className="text-[9px] text-neutral-400 truncate">
                            {prod.tamilName || prod.merchantName}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-neutral-800/80">
                          <span className="font-bold text-xs text-amber-400 font-mono">
                            ₹{prod.price}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Like / Heart Button */}
                            <button
                              onClick={() => {
                                onToggleLikeProduct?.(prod);
                                onShowToast?.(
                                  isLiked
                                    ? `Removed ${prod.name} from likes`
                                    : `❤️ Liked ${prod.name}!`
                                );
                              }}
                              className={`p-1 rounded-md transition-all cursor-pointer ${
                                isLiked
                                  ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                                  : 'bg-neutral-800/80 text-neutral-400 hover:text-rose-400 hover:bg-neutral-700'
                              }`}
                              title={isLiked ? 'Unlike product' : 'Like product'}
                            >
                              <Heart
                                className={`w-3 h-3 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                              />
                            </button>

                            {/* Add to Cart Button */}
                            <button
                              onClick={() => handleAddToCartClick(prod)}
                              className={`px-1.5 py-1 rounded-md text-[9px] font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                                isAdded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                              }`}
                              title="Add to Cart"
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map Attribution */}
      <div className="absolute top-14 right-2.5 text-[8px] text-neutral-400/80 bg-[#090e17]/80 backdrop-blur-xs px-1.5 py-0.5 rounded shadow z-10 select-none">
        Leaflet • © OpenStreetMap • CartoDB
      </div>
    </div>
  );
};
