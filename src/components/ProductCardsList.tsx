import React, { useState } from 'react';
import {
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  MapPin,
  Sparkles,
  Info,
  AlertCircle,
} from 'lucide-react';
import { ProductItem, CartItem, LanguageMode, FreshnessState } from '../types';

interface ProductCardsListProps {
  products: ProductItem[];
  cartItems: CartItem[];
  onAddToCart: (product: ProductItem) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  language: LanguageMode;
  searchQuery?: string;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const ProductCardsList: React.FC<ProductCardsListProps> = ({
  products,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
  language,
  searchQuery = '',
  selectedCategory = 'ALL',
  onSelectCategory,
}) => {
  const [vegOnly, setVegOnly] = useState(false);

  // Filter products by search query, category, and veg filter
  const filtered = products.filter((p) => {
    if (vegOnly && !p.veg) return false;

    if (selectedCategory === 'RET11' && p.category !== 'RET11') return false;
    if (selectedCategory === 'RET10' && p.category !== 'RET10') return false;
    if (selectedCategory === 'BAKERY' && p.category !== 'BAKERY') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchName =
        p.name.toLowerCase().includes(q) ||
        p.tamilName.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName) return false;
    }

    return true;
  });

  const getCartQuantity = (productId: string): number => {
    const item = cartItems.find((ci) => ci.product.id === productId);
    return item ? item.quantity : 0;
  };

  const renderFreshnessBadge = (freshness: FreshnessState, note?: string) => {
    switch (freshness) {
      case 'CONFIRMED':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-600/40 shadow-xs"
            title={note || 'Verified via ONDC API recently'}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>CONFIRMED (உறுதி செய்யப்பட்டது)</span>
          </span>
        );
      case 'RECENT':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-600/40 shadow-xs"
            title={note || 'Updated in last few hours'}
          >
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>RECENT (புதியது)</span>
          </span>
        );
      case 'STALE':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-600/40 shadow-xs"
            title={note || 'Last confirmed >1 day ago'}
          >
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>STALE (பழைய தகவல்)</span>
          </span>
        );
      case 'OOS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/90 text-rose-300 border border-rose-600/40 shadow-xs">
            <span>SOLD OUT (தீர்ந்துவிட்டது)</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="my-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-800">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5" id="category-pills-container">
          <button
            onClick={() => onSelectCategory && onSelectCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold shadow-md shadow-orange-950/40'
                : 'bg-[#18181D] text-neutral-300 border border-neutral-800 hover:border-neutral-700 hover:bg-[#202026]'
            }`}
            id="cat-pill-all"
          >
            அனைத்தும் (All)
          </button>
          <button
            onClick={() => onSelectCategory && onSelectCategory('RET11')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'RET11'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-md shadow-orange-950/40'
                : 'bg-[#18181D] text-neutral-300 border border-neutral-800 hover:border-neutral-700 hover:bg-[#202026]'
            }`}
            id="cat-pill-ret11"
          >
            🍲 உணவகங்கள் (RET11)
          </button>
          <button
            onClick={() => onSelectCategory && onSelectCategory('BAKERY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'BAKERY'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-stone-950 font-bold shadow-md shadow-amber-950/40'
                : 'bg-[#18181D] text-neutral-300 border border-neutral-800 hover:border-neutral-700 hover:bg-[#202026]'
            }`}
            id="cat-pill-bakery"
          >
            🥐 பேக்கரி (Bakeries)
          </button>
          <button
            onClick={() => onSelectCategory && onSelectCategory('RET10')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'RET10'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-950/40'
                : 'bg-[#18181D] text-neutral-300 border border-neutral-800 hover:border-neutral-700 hover:bg-[#202026]'
            }`}
            id="cat-pill-ret10"
          >
            🥛 மளிகை & பால் (RET10)
          </button>
        </div>

        {/* Dietary Veg Toggle */}
        <label className="flex items-center gap-2 text-xs font-bold text-neutral-300 cursor-pointer select-none bg-[#18181D] px-3 py-1.5 rounded-xl border border-neutral-800 hover:border-neutral-700">
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
            className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer bg-[#22222A] border-neutral-700"
            id="veg-only-filter-checkbox"
          />
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 border-2 border-emerald-500 rounded-xs flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </span>
            <span>சைவம் மட்டும் (Pure Veg)</span>
          </span>
        </label>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#141418] rounded-2xl border border-neutral-800 p-8 text-center">
          <Info className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-[#F3F4F6]">
            பொருட்கள் எதுவும் கிடைக்கவில்லை (No matching items found)
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            "சிக்கன் பிரியாணி", "பால்", அல்லது "பிரெட்" போன்ற பிற தேவைகளை குரல் மூலம் கேட்கவும்.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const qty = getCartQuantity(item.id);

            return (
              <div
                key={item.id}
                className="bg-[#141418]/90 rounded-2xl border border-neutral-800/90 shadow-xl hover:shadow-2xl hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group backdrop-blur-md"
                id={`product-card-${item.id}`}
              >
                <div>
                  {/* Card Image with Badges */}
                  <div className="relative h-44 w-full overflow-hidden bg-[#1A1A20]">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />

                    {/* Freshness Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      {renderFreshnessBadge(item.freshness, item.freshnessNote)}
                    </div>

                    {/* Veg / Non-Veg Indicator */}
                    <div className="absolute top-2.5 right-2.5 bg-[#141418]/90 p-1 rounded-md border border-neutral-700 shadow-sm">
                      {item.veg ? (
                        <div
                          className="w-4 h-4 border-2 border-emerald-500 flex items-center justify-center rounded-xs"
                          title="Pure Veg"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                      ) : (
                        <div
                          className="w-4 h-4 border-2 border-rose-500 flex items-center justify-center rounded-xs"
                          title="Non-Veg"
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        </div>
                      )}
                    </div>

                    {/* Merchant Name Pill */}
                    <div className="absolute bottom-2 left-2 right-2 bg-[#121216]/85 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center justify-between border border-neutral-800">
                      <span className="truncate font-semibold text-neutral-200">{item.merchantName}</span>
                      <span className="flex items-center gap-1 text-amber-400 font-bold shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {item.rating}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    {/* Bilingual Titles */}
                    <h3 className="font-display font-bold text-[#F3F4F6] text-base leading-snug group-hover:text-amber-300 transition-colors">
                      {language === 'ta' ? item.tamilName : item.name}
                    </h3>
                    <p className="text-xs text-neutral-400 font-medium mb-2">
                      {language === 'ta' ? item.name : item.tamilName}
                    </p>

                    {/* Description */}
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                      {language === 'ta' ? item.tamilDescription : item.description}
                    </p>

                    {/* Unit & Serving */}
                    <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-2">
                      <span className="bg-[#1B1B22] px-2 py-0.5 rounded-md text-neutral-300 border border-neutral-800">
                        அளவு: {item.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price and Add To Cart */}
                <div className="p-4 pt-0 mt-2 flex items-center justify-between border-t border-neutral-800/80">
                  <div>
                    <span className="text-xs text-neutral-500 font-medium">விலை</span>
                    <div className="text-xl font-bold font-display text-[#F3F4F6]">₹{item.price}</div>
                  </div>

                  {/* Add / Quantity Buttons */}
                  {qty === 0 ? (
                    <button
                      onClick={() => onAddToCart(item)}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-orange-950/30 flex items-center gap-1.5 cursor-pointer"
                      id={`add-to-cart-btn-${item.id}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>கூடையில் சேர் (Add)</span>
                    </button>
                  ) : (
                    <div className="flex items-center bg-[#1A1A20] rounded-xl p-1 border border-neutral-700">
                      <button
                        onClick={() => onUpdateQuantity(item.id, qty - 1)}
                        className="w-7 h-7 rounded-lg bg-[#272730] text-neutral-200 hover:bg-[#32323D] flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                        id={`dec-qty-${item.id}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#F3F4F6]">
                        {qty}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, qty + 1)}
                        className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 hover:from-amber-400 hover:to-orange-500 flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer"
                        id={`inc-qty-${item.id}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
