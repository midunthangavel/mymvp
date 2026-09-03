/**
 * VoiceCart AI 2.0 - Core Types
 * Based on ONDC (Beckn) Buyer Application & Voice Assistant Specifications
 */

export type LanguageMode = 'ta' | 'tanglish' | 'en';

export type CategoryDomain = 'RET11' | 'RET10' | 'BAKERY' | 'DISCOVERY';

export type FreshnessState = 'CONFIRMED' | 'RECENT' | 'STALE' | 'UNKNOWN' | 'OOS';

export interface Merchant {
  id: string;
  name: string;
  tamilName: string;
  category: CategoryDomain;
  categoryLabel: string;
  tamilCategoryLabel: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  etaMinutes: number;
  address: string;
  locality: string;
  lat: number;
  lng: number;
  fssaiNumber: string;
  imageUrl: string;
  isVegOnly: boolean;
  freshness: FreshnessState;
  isOpen: boolean;
}

export interface ProductItem {
  id: string;
  merchantId: string;
  merchantName: string;
  name: string;
  tamilName: string;
  category: CategoryDomain;
  price: number;
  veg: boolean;
  inStock: boolean;
  freshness: FreshnessState;
  freshnessNote?: string;
  tamilFreshnessNote?: string;
  imageUrl: string;
  description: string;
  tamilDescription: string;
  unit: string;
  rating: number;
  tags: string[];
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RTO_FAILED'
  | 'DISPUTED';

export interface Order {
  id: string;
  merchantId: string;
  merchantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  convenienceFee: number;
  total: number;
  paymentMethod: 'UPI' | 'COD_TOKEN';
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  orderStatus: OrderStatus;
  statusTimeline: {
    status: OrderStatus;
    label: string;
    tamilLabel: string;
    timestamp: string;
    completed: boolean;
    current: boolean;
  }[];
  rider?: {
    name: string;
    phone: string;
    vehicleNumber: string;
    currentLat: number;
    currentLng: number;
    distanceKm: number;
    etaMinutes: number;
  };
  deliveryAddress: string;
  deliveryLocality: string;
  customerPhone: string;
  createdAt: string;
  ondcTransactionId: string;
}

export interface ParsedVoiceIntent {
  intent:
    | 'search_food'
    | 'search_grocery'
    | 'search_bakery'
    | 'add_to_cart'
    | 'view_cart'
    | 'confirm_order'
    | 'track_order'
    | 'place_discovery'
    | 'file_dispute'
    | 'scope_refused'
    | 'general_help';
  item?: string;
  cuisine?: string | null;
  quantity?: number;
  budget?: number | null;
  location?: string;
  veg?: boolean | null;
  rawTranscript: string;
  spokenResponseTamil: string;
  spokenResponseTanglish: string;
  spokenResponseEnglish: string;
  matchedMerchantId?: string;
  matchedProductId?: string;
  guardrailTriggered?: boolean;
  guardrailReason?: string;
  confidence: number;
}

export interface BecknProtocolLog {
  id: string;
  timestamp: string;
  action:
    | '/search'
    | '/on_search'
    | '/select'
    | '/on_select'
    | '/init'
    | '/confirm'
    | '/status'
    | '/track'
    | '/issue';
  method: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  latencyMs: number;
  description: string;
  requestPayload: Record<string, any>;
  responsePayload: Record<string, any>;
}

export interface ObservabilityMetrics {
  ordersToday: number;
  gmvToday: number;
  avgAiResponseTimeMs: number;
  sttAccuracyPct: number;
  upiSuccessRatePct: number;
  rtoRatePct: number;
  ondcSearchSuccessPct: number;
  whatsappLatencyMs: number;
  activeSessions: number;
  lastUpdated: string;
}

export interface WhatsAppMessage {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type: 'voice' | 'text' | 'template' | 'payment_request' | 'order_update';
  text?: string;
  tamilText?: string;
  audioDurationSec?: number;
  templateData?: {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    items?: { title: string; price: number; id: string }[];
    actions?: { label: string; actionId: string; primary?: boolean }[];
  };
  paymentData?: {
    amount: number;
    upiUri: string;
    qrCodeUrl: string;
    orderId: string;
  };
}

export interface ChatPlace {
  id: string;
  name: string;
  tamilName?: string;
  rating: number;
  reviewCount?: number;
  category: string;
  address: string;
  locality: string;
  lat: number;
  lng: number;
  distanceKm: number;
  etaMinutes?: number;
  isOpen: boolean;
  timing?: string;
  description?: string;
  imageUrl?: string;
  fssaiNumber?: string;
  products?: ProductItem[];
}

export interface ComparisonRow {
  name: string;
  rating: number;
  distance: string;
  delivery: string;
  price: string;
}

export interface ComparisonData {
  columns: string[];
  rows: ComparisonRow[];
  highlight?: string;
  tamilHighlight?: string;
}

export interface BasketItemData {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BasketData {
  title: string;
  tamilTitle?: string;
  items: BasketItemData[];
  subtotal: number;
  delivery: number;
  tax: number;
  total: number;
}

export interface CheckoutCardData {
  orderId: string;
  merchantName: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  delivery: number;
  tax: number;
  total: number;
  upiId?: string;
  isPaid?: boolean;
}

export interface OrderTrackingCardData {
  orderId: string;
  merchantName: string;
  status: OrderStatus;
  statusLabel: string;
  tamilStatusLabel?: string;
  etaMinutes: number;
  riderName?: string;
  riderPhone?: string;
  total: number;
  steps: { label: string; tamilLabel?: string; completed: boolean; current: boolean }[];
}

export interface ReorderCardData {
  prevOrderId: string;
  merchantName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

export interface SupportCaseData {
  orderId?: string;
  statusText: string;
  canEscalate: boolean;
  agentConnected?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  tamilText?: string;
  spokenText?: string;
  isVoiceInput?: boolean;
  audioDurationSec?: number;
  places?: ChatPlace[];
  selectedPlace?: ChatPlace;
  products?: ProductItem[];
  comparison?: ComparisonData;
  basket?: BasketData;
  checkoutCard?: CheckoutCardData;
  orderTrackingCard?: OrderTrackingCardData;
  reorderCard?: ReorderCardData;
  supportCase?: SupportCaseData;
  favoriteStatus?: { merchantName: string; isSaved: boolean };
  cartAction?: {
    type: 'added' | 'view' | 'checkout';
    item?: ProductItem;
    quantity?: number;
  };
  sources?: string[];
  intent?: string;
  guardrailRefused?: boolean;
  orderInfo?: {
    orderId: string;
    status: OrderStatus;
    merchantName: string;
    etaMinutes: number;
    amount: number;
  };
}
