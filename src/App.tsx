import React, { useState, useEffect, useCallback } from 'react';
import {
  VoiceCartNavbar,
} from './components/VoiceCartNavbar';
import {
  VoiceAssistantMic,
} from './components/VoiceAssistantMic';
import {
  VoiceWorkspace,
} from './components/VoiceWorkspace';
import {
  InteractiveMap,
} from './components/InteractiveMap';
import {
  ProductCardsList,
} from './components/ProductCardsList';
import {
  CartDrawer,
} from './components/CartDrawer';
import {
  OrderTrackingModal,
} from './components/OrderTrackingModal';
import {
  WhatsAppSimulator,
} from './components/WhatsAppSimulator';
import {
  OndcInspectorModal,
} from './components/OndcInspectorModal';
import {
  AdminMetricsDashboard,
} from './components/AdminMetricsDashboard';
import {
  DisputeModal,
} from './components/DisputeModal';
import {
  VoiceChatSystem,
} from './components/VoiceChatSystem';

import {
  LanguageMode,
  ProductItem,
  CartItem,
  Order,
  ParsedVoiceIntent,
  BecknProtocolLog,
  ObservabilityMetrics,
  OrderStatus,
} from './types';

import {
  MOCK_MERCHANTS,
  MOCK_PRODUCTS,
  INITIAL_METRICS,
} from './data/mockData';

import { speakText, soundEffects } from './utils/speechSynthesis';
import { parseTamilQuery } from './utils/nlpParser';

export default function App() {
  // Layout & Device View State - 'mobile' is the PRIMARY use!
  const [viewMode, setViewMode] = useState<'mobile' | 'wide'>('mobile');

  // Navigation & Localization State
  const [currentLocality, setCurrentLocality] = useState<string>('Gandhipuram');
  const [language, setLanguage] = useState<LanguageMode>('ta');
  const [activeTab, setActiveTab] = useState<'chat' | 'whatsapp' | 'ondc' | 'metrics'>('chat');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Commerce & Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: MOCK_PRODUCTS[0], // Chicken Biryani
      quantity: 1,
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Voice Interaction State
  const [lastIntent, setLastIntent] = useState<ParsedVoiceIntent | null>({
    intent: 'search_food',
    item: 'chicken biryani',
    quantity: 1,
    location: 'Gandhipuram',
    rawTranscript: 'காந்திபுரத்துல சிக்கன் பிரியாணி வேணும்',
    spokenResponseTamil:
      'காந்திபுரம் ஏபிசி ஹோட்டலில் சிக்கன் பிரியாணி ₹180-க்கு (25 min) தயாராக உள்ளது. கூடையில் சேர்க்கவா?',
    spokenResponseTanglish:
      'Gandhipuram ABC Hotel-la Chicken Biryani ₹180 kidaikkudhu. Cart-la add pannalama?',
    spokenResponseEnglish:
      'ABC Hotel in Gandhipuram has Chicken Biryani available for ₹180 (25 min). Would you like to add it?',
    confidence: 0.98,
  });
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Category Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(null);

  // Orders & Tracking State
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'VC10283',
      merchantId: 'mer_abc_hotel',
      merchantName: 'ABC Hotel (Sri Krishna Bhavan)',
      items: [
        { product: MOCK_PRODUCTS[0], quantity: 1 },
        { product: MOCK_PRODUCTS[1], quantity: 2 },
      ],
      subtotal: 220,
      deliveryFee: 30,
      tax: 18,
      convenienceFee: 5,
      total: 268,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      orderStatus: 'OUT_FOR_DELIVERY',
      statusTimeline: [
        {
          status: 'PLACED',
          label: 'Order Placed',
          tamilLabel: 'ஆர்டர் பதிவு செய்யப்பட்டது',
          timestamp: '11:15 AM',
          completed: true,
          current: false,
        },
        {
          status: 'ACCEPTED',
          label: 'Restaurant Accepted',
          tamilLabel: 'உணவகம் ஏற்றுக்கொண்டது',
          timestamp: '11:18 AM',
          completed: true,
          current: false,
        },
        {
          status: 'PREPARING',
          label: 'Kitchen Preparing',
          tamilLabel: 'உணவு தயாராகிறது',
          timestamp: '11:22 AM',
          completed: true,
          current: false,
        },
        {
          status: 'READY_FOR_PICKUP',
          label: 'Ready for Pickup',
          tamilLabel: 'விநியோகத்திற்கு தயார்',
          timestamp: '11:32 AM',
          completed: true,
          current: false,
        },
        {
          status: 'OUT_FOR_DELIVERY',
          label: 'Out for Delivery',
          tamilLabel: 'ரைடர் புறப்பட்டுவிட்டார்',
          timestamp: '11:36 AM',
          completed: true,
          current: true,
        },
        {
          status: 'DELIVERED',
          label: 'Delivered',
          tamilLabel: 'டெலிவரி செய்யப்பட்டது',
          timestamp: '--',
          completed: false,
          current: false,
        },
      ],
      rider: {
        name: 'முருகன் (Murugan K)',
        phone: '+91 98765 43210',
        vehicleNumber: 'TN 38 BK 4912',
        currentLat: 11.02,
        currentLng: 76.966,
        distanceKm: 2.1,
        etaMinutes: 12,
      },
      deliveryAddress: 'வீடு எண் 42, காந்திபுரம் மெயின் ரோடு, Gandhipuram',
      deliveryLocality: 'Gandhipuram',
      customerPhone: '+91 98422 12345',
      createdAt: '11:15 AM',
      ondcTransactionId: 'txn_ondc_884129',
    },
  ]);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [activeDisputeOrder, setActiveDisputeOrder] = useState<Order | null>(null);

  // ONDC Protocol Logs & Observability
  const [ondcLogs, setOndcLogs] = useState<BecknProtocolLog[]>([
    {
      id: 'log_init_1',
      timestamp: '11:42:10 AM',
      action: '/search',
      method: 'POST',
      status: 'SUCCESS',
      latencyMs: 138,
      description: 'Broadcasted buyer search for "chicken biryani" in std:0422 (Coimbatore)',
      requestPayload: {
        context: {
          domain: 'RET11',
          country: 'IND',
          city: 'std:0422',
          action: 'search',
          core_version: '1.2.0',
          bap_id: 'buyer.voicecart.ai',
          bap_uri: 'https://buyer.voicecart.ai/protocol/v1',
          transaction_id: 'txn_77182939',
        },
        message: {
          intent: {
            descriptor: { name: 'chicken biryani' },
            fulfillment: {
              type: 'Delivery',
              start: { location: { gps: '11.0183,76.9644' } },
            },
          },
        },
      },
      responsePayload: {
        message: {
          ack: { status: 'ACK' },
        },
      },
    },
    {
      id: 'log_init_2',
      timestamp: '11:42:12 AM',
      action: '/on_search',
      method: 'POST',
      status: 'SUCCESS',
      latencyMs: 240,
      description: 'Received catalog from ABC Hotel with FSSAI verification and live inventory',
      requestPayload: {
        context: { action: 'on_search', bpp_id: 'seller.abchotel.ondc' },
      },
      responsePayload: {
        message: {
          catalog: {
            bpp_providers: [
              {
                id: 'mer_abc_hotel',
                descriptor: { name: 'ABC Hotel (Sri Krishna Bhavan)' },
                items: [{ id: 'prod_abc_biryani', price: { value: '180.00' } }],
              },
            ],
          },
        },
      },
    },
  ]);

  const [metrics, setMetrics] = useState<ObservabilityMetrics>(INITIAL_METRICS);

  // Push an ONDC log entry
  const addOndcLog = useCallback(
    (
      action: BecknProtocolLog['action'],
      description: string,
      requestPayload: any,
      responsePayload: any,
      latencyMs: number = 180
    ) => {
      const newLog: BecknProtocolLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action,
        method: 'POST',
        status: 'SUCCESS',
        latencyMs,
        description,
        requestPayload,
        responsePayload,
      };
      setOndcLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    },
    []
  );

  // Cart Management
  const handleAddToCart = useCallback((product: ProductItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const handleOrderPlaced = useCallback(
    (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      setActiveTrackingOrder(newOrder);

      // Register Beckn /init and /confirm in inspector
      addOndcLog(
        '/init',
        `Initialized order ${newOrder.id} with delivery address in ${currentLocality}`,
        { order_id: newOrder.id, total: newOrder.total },
        { ack: { status: 'ACK' } },
        210
      );
      addOndcLog(
        '/confirm',
        `Payment confirmed via UPI; seller accepted order ${newOrder.id}`,
        { order_id: newOrder.id, payment: { status: 'PAID', type: newOrder.paymentMethod } },
        { order: { state: 'Accepted', fulfillment: { tracking: true } } },
        290
      );

      // Update metrics
      setMetrics((prev) => ({
        ...prev,
        ordersToday: prev.ordersToday + 1,
        gmvToday: prev.gmvToday + newOrder.total,
        lastUpdated: new Date().toLocaleTimeString(),
      }));
    },
    [addOndcLog, currentLocality]
  );

  // Speech & Natural Language Handler
  const handleVoiceTranscript = async (transcript: string) => {
    if (!transcript || !transcript.trim()) return;

    setIsAiProcessing(true);

    try {
      // Call server-side API
      const res = await fetch('/api/gemini/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: transcript,
          language,
          userLocation: currentLocality,
        }),
      });

      let parsed: ParsedVoiceIntent;
      if (res.ok) {
        parsed = await res.json();
      } else {
        parsed = parseTamilQuery(transcript);
      }

      setLastIntent(parsed);

      // Log Beckn /search if search intent
      if (
        parsed.intent === 'search_food' ||
        parsed.intent === 'search_grocery' ||
        parsed.intent === 'search_bakery'
      ) {
        addOndcLog(
          '/search',
          `Voice search for "${parsed.item || 'all'}" in ${parsed.location || currentLocality}`,
          { intent: { descriptor: { name: parsed.item }, location: parsed.location } },
          { message: { ack: { status: 'ACK' } } },
          165
        );
      }

      // Update category filter based on intent
      if (parsed.intent === 'search_food') setSelectedCategory('RET11');
      if (parsed.intent === 'search_grocery') setSelectedCategory('RET10');
      if (parsed.intent === 'search_bakery') setSelectedCategory('BAKERY');

      // Update search query if specific item
      if (parsed.item) {
        setSearchQuery(parsed.item);
      }

      // Handle track order intent
      if (parsed.intent === 'track_order' && orders.length > 0) {
        setActiveTrackingOrder(orders[0]);
      }

      // Handle dispute intent
      if (parsed.intent === 'file_dispute' && orders.length > 0) {
        setActiveDisputeOrder(orders[0]);
      }

      // Speak response aloud if enabled
      if (soundEnabled) {
        const spoken =
          language === 'ta'
            ? parsed.spokenResponseTamil
            : language === 'tanglish'
            ? parsed.spokenResponseTanglish
            : parsed.spokenResponseEnglish;
        speakText(spoken, language === 'ta' ? 'ta' : 'en');
      }
    } catch (e) {
      // Offline / network fallback
      const localParsed = parseTamilQuery(transcript);
      setLastIntent(localParsed);
      if (soundEnabled) {
        speakText(localParsed.spokenResponseTamil, 'ta');
      }
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Order status advancement simulation
  const handleAdvanceOrderStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const statuses: OrderStatus[] = [
          'PLACED',
          'ACCEPTED',
          'PREPARING',
          'READY_FOR_PICKUP',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
        ];
        const currentIndex = statuses.indexOf(order.orderStatus);
        if (currentIndex < statuses.length - 1) {
          const nextStatus = statuses[currentIndex + 1];
          const updatedTimeline = order.statusTimeline.map((step) => {
            if (step.status === nextStatus) {
              return {
                ...step,
                completed: true,
                current: true,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };
            }
            if (statuses.indexOf(step.status) < statuses.indexOf(nextStatus)) {
              return { ...step, completed: true, current: false };
            }
            return { ...step, completed: false, current: false };
          });

          const updated = {
            ...order,
            orderStatus: nextStatus,
            statusTimeline: updatedTimeline,
          };

          if (activeTrackingOrder?.id === orderId) {
            setActiveTrackingOrder(updated);
          }

          // Beckn log for status update
          addOndcLog(
            '/status',
            `Order ${orderId} moved to ${nextStatus}`,
            { order_id: orderId },
            { order: { state: nextStatus } },
            110
          );

          return updated;
        }
        return order;
      })
    );
  };

  // Simulate RTO / Undelivered failure
  const handleTriggerRTO = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updated = { ...order, orderStatus: 'RTO_FAILED' as OrderStatus };
        if (activeTrackingOrder?.id === orderId) {
          setActiveTrackingOrder(updated);
        }
        return updated;
      })
    );
    addOndcLog(
      '/issue',
      `RTO Alert: Rider unable to contact recipient for order ${orderId}`,
      { order_id: orderId, issue_type: 'RTO_UNDELIVERED' },
      { issue: { status: 'RESOLVING_ESCROW' } },
      190
    );
    speakText(
      'ரைடர் உங்களை தொடர்பு கொள்ள முடியாததால் பார்சல் திரும்பியது. ரீஃபண்ட் செய்யப்படுகிறது.',
      language === 'ta' ? 'ta' : 'en'
    );
  };

  // IGM Dispute resolved
  const handleDisputeResolved = (orderId: string, refundAmount: number) => {
    addOndcLog(
      '/issue',
      `ONDC IGM Grievance resolved for ${orderId}; ₹${refundAmount} credited`,
      { order_id: orderId, status: 'RESOLVED', refund_inr: refundAmount },
      { ack: { status: 'RESOLVED' } },
      140
    );
  };

  return (
    <div className="h-screen h-dvh w-full bg-[#07080B] text-[#E5E5E5] flex flex-col font-sans overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Device Control Bar (Only shown on desktop to allow switching between Mobile Phone View & Wide View) */}
      <div className="hidden md:flex items-center justify-between px-6 py-2 bg-[#0E1017] border-b border-neutral-800 text-xs shrink-0 z-50">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-white tracking-wide flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>VoiceCart AI 2.0</span>
          </span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400">ONDC Beckn Pilot Node (Coimbatore & Chennai)</span>
        </div>

        {/* View Mode & Module Switcher */}
        <div className="flex items-center gap-3">
          {/* Device Toggle */}
          <div className="flex items-center bg-[#151824] p-0.5 rounded-xl border border-neutral-750">
            <button
              onClick={() => setViewMode('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>📱 Mobile Phone View (Primary)</span>
            </button>
            <button
              onClick={() => setViewMode('wide')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'wide'
                  ? 'bg-[#22273A] text-white shadow-sm font-bold border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>🖥️ Wide Screen</span>
            </button>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-1 bg-[#151824] p-0.5 rounded-xl border border-neutral-750 text-[11px]">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'chat' ? 'bg-[#22273A] text-amber-300 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              குரல் அரட்டை (Chat)
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'whatsapp' ? 'bg-[#22273A] text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setActiveTab('ondc')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'ondc' ? 'bg-[#22273A] text-sky-400 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Beckn JSON
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'metrics' ? 'bg-[#22273A] text-purple-400 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Metrics
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Mobile-First Layout */}
      {viewMode === 'mobile' ? (
        /* 📱 MOBILE VIEW CONTAINER:
           On phones (<md): 100% full screen edge-to-edge.
           On desktop (md+): Centered authentic smartphone container, strictly fitted inside viewport.
        */
        <div className="flex-1 w-full flex items-center justify-center p-0 md:p-2 md:bg-[#07080B] overflow-hidden min-h-0">
          <div className="w-full h-full max-w-[440px] flex flex-col bg-[#0B0C10] md:border md:border-neutral-800/80 md:rounded-2xl md:shadow-2xl overflow-hidden relative">
            {/* Back to Chat header when secondary tabs are open in mobile view */}
            {activeTab !== 'chat' && (
              <div className="px-3 py-2 bg-[#121520] border-b border-neutral-800 flex items-center justify-between text-xs shrink-0 z-30">
                <button
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                >
                  <span>←</span>
                  <span>குரல் அரட்டை (Back to Voice Chat)</span>
                </button>
                <span className="text-[10px] text-neutral-400 uppercase font-mono">
                  {activeTab} mode
                </span>
              </div>
            )}

            {/* Content inside Mobile Frame */}
            <div className="flex-1 w-full h-full overflow-hidden flex flex-col min-h-0 relative">
              {activeTab === 'chat' && (
                <VoiceChatSystem
                  currentLocality={currentLocality}
                  onLocalityChange={(loc) => {
                    setCurrentLocality(loc);
                    if (lastIntent) {
                      setLastIntent({ ...lastIntent, location: loc });
                    }
                  }}
                  language={language}
                  onLanguageChange={setLanguage}
                  cartItems={cartItems}
                  onAddToCart={handleAddToCart}
                  onOpenCart={() => setIsCartOpen(true)}
                  orders={orders}
                  onOpenOrderTracking={(ord) => setActiveTrackingOrder(ord)}
                  onOpenOndcInspector={() => setActiveTab('ondc')}
                  onOpenAdminMetrics={() => setActiveTab('metrics')}
                  onOrderPlaced={handleOrderPlaced}
                />
              )}

              {activeTab === 'whatsapp' && (
                <div className="flex-1 overflow-y-auto">
                  <WhatsAppSimulator
                    onAddToCart={handleAddToCart}
                    language={language}
                    onOpenCart={() => setIsCartOpen(true)}
                  />
                </div>
              )}

              {activeTab === 'ondc' && (
                <div className="flex-1 overflow-y-auto p-2">
                  <OndcInspectorModal
                    logs={ondcLogs}
                    onClearLogs={() => setOndcLogs([])}
                  />
                </div>
              )}

              {activeTab === 'metrics' && (
                <div className="flex-1 overflow-y-auto p-2">
                  <AdminMetricsDashboard
                    metrics={metrics}
                    onRefreshMetrics={() =>
                      setMetrics((prev) => ({
                        ...prev,
                        avgAiResponseTimeMs: Math.floor(700 + Math.random() * 80),
                        lastUpdated: new Date().toLocaleTimeString(),
                      }))
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 🖥️ WIDE DESKTOP VIEW CONTAINER (When user explicitly toggles wide view) */
        <div className="flex-1 flex flex-col overflow-y-auto">
          <VoiceCartNavbar
            currentLocality={currentLocality}
            onLocalityChange={(loc) => {
              setCurrentLocality(loc);
              if (lastIntent) {
                setLastIntent({ ...lastIntent, location: loc });
              }
            }}
            language={language}
            onLanguageChange={setLanguage}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
            onOpenCart={() => setIsCartOpen(true)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((prev) => !prev)}
            isAiProcessing={isAiProcessing}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
            {activeTab === 'chat' && (
              <div className="h-[calc(100vh-140px)] w-full rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
                <VoiceChatSystem
                  currentLocality={currentLocality}
                  onLocalityChange={(loc) => {
                    setCurrentLocality(loc);
                    if (lastIntent) {
                      setLastIntent({ ...lastIntent, location: loc });
                    }
                  }}
                  language={language}
                  onLanguageChange={setLanguage}
                  cartItems={cartItems}
                  onAddToCart={handleAddToCart}
                  onOpenCart={() => setIsCartOpen(true)}
                  orders={orders}
                  onOpenOrderTracking={(ord) => setActiveTrackingOrder(ord)}
                  onOpenOndcInspector={() => setActiveTab('ondc')}
                  onOpenAdminMetrics={() => setActiveTab('metrics')}
                  onOrderPlaced={handleOrderPlaced}
                />
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <WhatsAppSimulator
                onAddToCart={handleAddToCart}
                language={language}
                onOpenCart={() => setIsCartOpen(true)}
              />
            )}

            {activeTab === 'ondc' && (
              <OndcInspectorModal
                logs={ondcLogs}
                onClearLogs={() => setOndcLogs([])}
              />
            )}

            {activeTab === 'metrics' && (
              <AdminMetricsDashboard
                metrics={metrics}
                onRefreshMetrics={() =>
                  setMetrics((prev) => ({
                    ...prev,
                    avgAiResponseTimeMs: Math.floor(700 + Math.random() * 80),
                    lastUpdated: new Date().toLocaleTimeString(),
                  }))
                }
              />
            )}
          </main>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onOrderPlaced={handleOrderPlaced}
        deliveryLocality={currentLocality}
        language={language}
      />

      {/* Order Tracking Modal */}
      {activeTrackingOrder && (
        <OrderTrackingModal
          order={activeTrackingOrder}
          onClose={() => setActiveTrackingOrder(null)}
          onAdvanceStatus={handleAdvanceOrderStatus}
          onTriggerRTO={handleTriggerRTO}
          onOpenDispute={(ord) => {
            setActiveTrackingOrder(null);
            setActiveDisputeOrder(ord);
          }}
          language={language}
        />
      )}

      {/* IGM Dispute Modal */}
      {activeDisputeOrder && (
        <DisputeModal
          order={activeDisputeOrder}
          onClose={() => setActiveDisputeOrder(null)}
          onResolved={handleDisputeResolved}
          language={language}
        />
      )}
    </div>
  );
}
