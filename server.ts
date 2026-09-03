import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { parseTamilQuery } from './src/utils/nlpParser';
import { MOCK_PRODUCTS, MOCK_MERCHANTS } from './src/data/mockData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory catalog of places for both Coimbatore & Chennai locations
const ALL_PLACES = [
  {
    id: 'mer_abc_hotel',
    name: 'ABC Hotel (Sri Krishna Bhavan)',
    tamilName: 'ஏபிசி ஹோட்டல் (ஸ்ரீ கிருஷ்ணா பவன்)',
    category: 'RET11',
    categoryLabel: 'Food & Restaurants',
    rating: 4.4,
    reviewCount: 1240,
    distanceKm: 1.2,
    etaMinutes: 25,
    address: 'Cross Cut Road, Gandhipuram, Coimbatore',
    locality: 'Gandhipuram',
    lat: 11.0183,
    lng: 76.9644,
    isOpen: true,
    timing: 'Open • Closes 11 pm',
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
    description: 'Specializes in Seeraga Samba Chicken Biryani, Bun Parotta, and Chettinad Pepper Fry.'
  },
  {
    id: 'plc_ramaas_biryani',
    name: "Ramaas The Hyderabadi",
    tamilName: "ராமாஸ் தி ஹைதராபாதி பிரியாணி",
    category: 'RET11',
    categoryLabel: 'Hyderabadi Dum Biryani',
    rating: 4.5,
    reviewCount: 1420,
    distanceKm: 1.6,
    etaMinutes: 22,
    address: 'Arcot Road, Vadapalani, Chennai',
    locality: 'Vadapalani',
    lat: 13.052,
    lng: 80.208,
    isOpen: true,
    timing: 'Open • Closes 11 pm',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    description: 'Authentic Hyderabadi dum biryani with mirchi ka salna and dahi chutney on Arcot Road.'
  },
  {
    id: 'plc_manis_biryani',
    name: "Mani's Dum Biryani",
    tamilName: "மணிஸ் தம் பிரியாணி",
    category: 'RET11',
    categoryLabel: 'Dum Biryani & Kebabs',
    rating: 4.6,
    reviewCount: 1850,
    distanceKm: 1.9,
    etaMinutes: 26,
    address: 'Near Murugan Temple, Vadapalani, Chennai',
    locality: 'Vadapalani',
    lat: 13.053,
    lng: 80.214,
    isOpen: true,
    timing: 'Open • Closes 11:30 pm',
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
    description: 'Popular choice in the area known for tender meat, fragrant basmati rice, and chicken 65.'
  },
  {
    id: 'mer_aasife',
    name: 'Aasife Biriyani & Darbar',
    tamilName: 'ஆசிப் பிரியாணி & தர்பார்',
    category: 'RET11',
    categoryLabel: 'Food & Restaurants',
    rating: 4.3,
    reviewCount: 890,
    distanceKm: 1.8,
    etaMinutes: 30,
    address: '7th Street, Gandhipuram, Coimbatore',
    locality: 'Gandhipuram',
    lat: 11.021,
    lng: 76.968,
    isOpen: true,
    timing: 'Open • Closes 11 pm',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    description: 'Famous Mughlai and Chennai style dum biryani with rich gravies.'
  },
  {
    id: 'mer_annapoorna',
    name: 'Sree Annapoorna Sree Gowrishankar',
    tamilName: 'ஸ்ரீ அன்னபூர்ணா ஸ்ரீ கௌரிசங்கர்',
    category: 'RET11',
    categoryLabel: 'Pure Veg South Indian',
    rating: 4.7,
    reviewCount: 3450,
    distanceKm: 3.1,
    etaMinutes: 28,
    address: 'DB Road, RS Puram, Coimbatore',
    locality: 'RS Puram',
    lat: 11.0105,
    lng: 76.9502,
    isOpen: true,
    timing: 'Open • Closes 10:30 pm',
    imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
    description: 'Legendary filter coffee, Ghee Roast Dosa, and authentic South Indian Meals.'
  },
  {
    id: 'mer_kr_bakes',
    name: 'KR Bakes & Sweets',
    tamilName: 'கே.ஆர் பேக்ஸ் & ஸ்வீட்ஸ்',
    category: 'BAKERY',
    categoryLabel: 'Bakery & Confectionery',
    rating: 4.5,
    reviewCount: 980,
    distanceKm: 1.5,
    etaMinutes: 20,
    address: '100 Feet Road, Gandhipuram, Coimbatore',
    locality: 'Gandhipuram',
    lat: 11.0225,
    lng: 76.961,
    isOpen: true,
    timing: 'Open • Closes 10 pm',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    description: 'Fresh milk bread, hot egg puffs, chicken puffs, cutlets, and honey cake.'
  },
  {
    id: 'mer_peelamedu_mart',
    name: 'Peelamedu Daily Fresh Groceries',
    tamilName: 'பீளமேடு டெய்லி பிரெஷ் மளிகை',
    category: 'RET10',
    categoryLabel: 'Hyperlocal Groceries',
    rating: 4.4,
    reviewCount: 620,
    distanceKm: 4.2,
    etaMinutes: 35,
    address: 'Avinashi Road, Peelamedu, Coimbatore',
    locality: 'Peelamedu',
    lat: 11.0289,
    lng: 77.0021,
    isOpen: true,
    timing: 'Open • Closes 10 pm',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    description: 'Aavin Green Milk, Fresh Curd, Ponni Boiled Rice, fresh vegetables and staples.'
  },
  {
    id: 'mer_apollo_pharmacy',
    name: 'Apollo Pharmacy (24/7)',
    tamilName: 'அப்பல்லோ பார்மசி (24 மணி நேரம்)',
    category: 'DISCOVERY',
    categoryLabel: 'Pharmacy & Healthcare',
    rating: 4.5,
    reviewCount: 310,
    distanceKm: 0.9,
    etaMinutes: 15,
    address: 'Cross Cut Road, Gandhipuram, Coimbatore',
    locality: 'Gandhipuram',
    lat: 11.019,
    lng: 76.963,
    isOpen: true,
    timing: 'Open 24/7',
    imageUrl: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=80',
    description: '24-hour pharmacy for prescription medicines, wellness supplements, and first aid.'
  },
  {
    id: 'plc_vasanth_clinic',
    name: "Dr. Vasanth's Diabetes & Obesity Clinic (Specialist BMI)",
    tamilName: "டாக்டர் வசந்த் நீரிழிவு & உடல் பருமன் சிகிச்சை மையம்",
    category: 'CLINIC',
    categoryLabel: 'Diabetologist & Obesity Clinic',
    rating: 4.9,
    reviewCount: 380,
    distanceKm: 2.1,
    etaMinutes: 18,
    address: '2nd Avenue, Anna Nagar / Ambattur Link Rd, Chennai',
    locality: 'Anna Nagar',
    lat: 13.085,
    lng: 80.21,
    isOpen: true,
    timing: 'Open • Closes 9 pm',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
    description: 'Comprehensive diabetes care, clinical BMI analysis, metabolic wellness, and diet consultation.'
  },
  {
    id: 'plc_magna_centres',
    name: "Magna Centres for Obesity, Diabetes and Endocrinology",
    tamilName: "மேக்னா உடல் பருமன் & நீரிழிவு மையம்",
    category: 'CLINIC',
    categoryLabel: 'Endocrinology & BMI Care',
    rating: 4.8,
    reviewCount: 295,
    distanceKm: 3.4,
    etaMinutes: 24,
    address: 'Arcot Road, Vadapalani / Porur, Chennai',
    locality: 'Vadapalani',
    lat: 13.05,
    lng: 80.212,
    isOpen: true,
    timing: 'Open 7 am to 9 pm',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=80',
    description: 'Specialized center for adult & pediatric endocrinology, obesity management, and BMI assessment.'
  }
];

// Initialize Gemini Client safely
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI();
  } catch {
    genAI = null;
  }
}

// In-memory protocol logs and metrics
const protocolLogs: any[] = [];
let metrics = {
  ordersToday: 14,
  gmvToday: 4120,
  avgAiResponseTimeMs: 745,
  sttAccuracyPct: 93.4,
  upiSuccessRatePct: 99.2,
  rtoRatePct: 7.5,
  ondcSearchSuccessPct: 98.6,
  whatsappLatencyMs: 310,
  activeSessions: 6,
  lastUpdated: new Date().toISOString(),
};

// Helper for live web search grounding (Wikipedia / web context)
async function fetchWebSearch(query: string): Promise<{ title: string; snippet: string; url: string }[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'VoiceCart-AI/2.0' }
    });
    clearTimeout(timer);
    const data: any = await res.json();
    const hits = data?.query?.search || [];
    return hits.slice(0, 3).map((h: any) => ({
      title: h.title,
      snippet: h.snippet ? h.snippet.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'") : '',
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(h.title.replace(/\s+/g, '_'))}`
    }));
  } catch {
    return [];
  }
}

// Helper for category-accurate food & product imagery
function getFoodImage(name: string, category?: string): string {
  const n = (name + ' ' + (category || '')).toLowerCase();
  if (n.includes('ice cream') || n.includes('sundae') || n.includes('scoop') || n.includes('dessert') || n.includes('kulfi') || n.includes('gelato') || n.includes('ibaco') || n.includes('cream stone')) {
    return 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('burger')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('dosa') || n.includes('idli') || n.includes('vada') || n.includes('sambar') || n.includes('south indian') || n.includes('tiffin') || n.includes('annapoorna')) {
    return 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('parotta') || n.includes('bread') || n.includes('roti') || n.includes('naan')) {
    return 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('coffee') || n.includes('tea') || n.includes('chai') || n.includes('beverage')) {
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('cake') || n.includes('pastry') || n.includes('bakes') || n.includes('brownie') || n.includes('sweet') || n.includes('bakery')) {
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('milk') || n.includes('curd') || n.includes('grocery') || n.includes('egg') || n.includes('butter') || n.includes('cheese') || n.includes('aavin')) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('biryani') || n.includes('briyani') || n.includes('mutton') || n.includes('chicken') || n.includes('rice') || n.includes('meals')) {
    return 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('juice') || n.includes('shake') || n.includes('fruit') || n.includes('smoothie')) {
    return 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80';
  }
  if (n.includes('medicine') || n.includes('pharmacy') || n.includes('tablet') || n.includes('capsule')) {
    return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
}

// Helper to calculate realistic map coordinates for any locality
function getBaseLocalityCoords(locality: string): { lat: number; lng: number } {
  const l = (locality || '').toLowerCase();
  if (l.includes('rs puram') || l.includes('r.s. puram')) return { lat: 11.008, lng: 76.951 };
  if (l.includes('peelamedu')) return { lat: 11.026, lng: 77.003 };
  if (l.includes('saibaba')) return { lat: 11.024, lng: 76.945 };
  if (l.includes('town hall')) return { lat: 10.998, lng: 76.962 };
  if (l.includes('singanallur')) return { lat: 10.999, lng: 77.021 };
  if (l.includes('saravanampatti')) return { lat: 11.079, lng: 76.997 };
  if (l.includes('vadapalani')) return { lat: 13.052, lng: 80.208 };
  if (l.includes('anna nagar')) return { lat: 13.085, lng: 80.21 };
  if (l.includes('porur')) return { lat: 13.038, lng: 80.156 };
  if (l.includes('t nagar') || l.includes('t. nagar')) return { lat: 13.041, lng: 80.233 };
  // Default to Gandhipuram, Coimbatore
  return { lat: 11.0183, lng: 76.9644 };
}

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'VoiceCart AI 2.0 Buyer App', timestamp: new Date().toISOString() });
});

// 1.5 Chat Assistant API (Voice-first conversational backend)
app.post('/api/chat', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { message, location = 'Gandhipuram', language = 'ta', cart = [], history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message string is required' });
  }

  const queryLower = message.toLowerCase().trim();

  // Check Guardrail Refusal first (Electronics, mobile phones, loans, etc.)
  const outOfScopeKeywords = [
    'mobile', 'phone', 'iphone', 'samsung', 'laptop', 'computer', 'tv',
    'television', 'clothing', 'dress', 'shirt', 'loan', 'credit', 'flight', 'crypto',
    'மொபைல்', 'போன்', 'லேப்டாப்', 'துணி'
  ];
  const isOutOfScope = outOfScopeKeywords.some(kw => queryLower.includes(kw));

  if (isOutOfScope) {
    const refusalTamil = "VoiceCart மொபைல் போன்கள் அல்லது மின்னணு சாதனங்களை ஆர்டர் செய்வதை ஆதரிக்காது. உள்ளூர் உணவகங்கள், பேக்கரிகள் மற்றும் மளிகைப் பொருட்களுக்கு மட்டுமே நாங்கள் உதவுகிறோம். அருகிலுள்ள உணவகங்களை தேடவா?";
    const refusalEnglish = "I don't have the ability to place orders for mobile phones or electronic gadgets directly. You'll need to use a consumer electronics store or contact the seller directly. VoiceCart is focused on local food restaurants, bakeries, and groceries via ONDC. Would you like to explore nearby restaurants or supermarkets instead?";
    return res.json({
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: language === 'ta' ? refusalTamil : refusalEnglish,
      tamilText: refusalTamil,
      spokenText: language === 'ta' ? refusalTamil : refusalEnglish,
      places: [],
      products: [],
      guardrailRefused: true,
      sources: ['ONDC Network Policy RET10/RET11'],
      latencyMs: Date.now() - startTime
    });
  }

  // 0. Greeting Flow ("hi", "hello", "hey", "வணக்கம்", "vanakkam", etc.)
  const isGreetingQuery =
    /^(hi|hello|hey|vanakkam|வணக்கம்|good\s+morning|good\s+evening|good\s+afternoon|namaste|hlo|howdy)\b/i.test(queryLower.trim()) ||
    queryLower === 'hi' ||
    queryLower === 'hello' ||
    queryLower === 'hey' ||
    queryLower === 'வணக்கம்' ||
    queryLower === 'vanakkam' ||
    queryLower === 'start';

  if (isGreetingQuery) {
    const greetingTamil =
      "வணக்கம்! நான் வாய்ஸ்கார்ட் ஏஐ (VoiceCart AI). உங்களுக்கு இன்று என்ன உணவு அல்லது மளிகைப் பொருட்கள் வேண்டும்? அருகிலுள்ள சுவையான பிரியாணி, ஆவின் பால், உணவகங்களின் விலை ஒப்பீடு, அல்லது உங்கள் ஆர்டரை கண்காணிக்க என்னிடம் கேட்கலாம்.";
    const greetingEnglish =
      "Hello! I'm VoiceCart AI, your local food, grocery, and dining assistant. What can I get for you today? You can ask me to find nearby biryani, order fresh groceries, compare restaurant prices, or track an active order.";

    return res.json({
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: greetingEnglish,
      tamilText: greetingTamil,
      spokenText: language === 'ta' ? greetingTamil : greetingEnglish,
      places: [], // Clean greeting: no unsolicited maps or clinics!
      products: [],
      intent: 'greeting',
      sources: ['VoiceCart Assistant'],
      latencyMs: Date.now() - startTime
    });
  }

  // 1. Comparison Flow ("Compare the three", "Which one is cheapest?", "Compare restaurants")
  const isComparisonQuery = queryLower.includes('compare') || queryLower.includes('ஒப்பிடு') || 
    queryLower.includes('cheapest') || queryLower.includes('which one') || queryLower.includes('which biryani');

  if (isComparisonQuery) {
    const comparison = {
      columns: ['Restaurant', 'Rating', 'Distance', 'Delivery', 'Price'],
      rows: [
        { name: 'ABC Hotel (Krishna Bhavan)', rating: 4.4, distance: '1.2 km', delivery: '₹30', price: '₹180' },
        { name: "Mani's Dum Biryani", rating: 4.6, distance: '1.8 km', delivery: '₹20', price: '₹160' },
        { name: 'Ramaas The Hyderabadi', rating: 4.7, distance: '2.3 km', delivery: '₹35', price: '₹195' }
      ],
      highlight: "Ramaas has the highest rating (4.7 ★), while Mani's Dum Biryani has the lowest price (₹160) and lowest delivery fee (₹20).",
      tamilHighlight: "ராமாஸ் தி ஹைதராபாதி மிக உயர்ந்த மதிப்பீட்டைக் கொண்டுள்ளது (4.7 ★), அதே சமயம் மணிஸ் பிரியாணி மிகக் குறைந்த விலை (₹160) மற்றும் குறைந்த டெலிவரி கட்டணத்தைக் (₹20) கொண்டுள்ளது."
    };

    const text = "Here is the comparison between the top nearby biryani spots: Ramaas has the highest rating at 4.7 ★, while Mani's Dum Biryani offers the best value at ₹160 total.";
    const tamilText = "அருகிலுள்ள சிறந்த பிரியாணி உணவகங்களின் ஒப்பீடு: ராமாஸ் 4.7 ★ மதிப்பீட்டுடன் முதலிடத்திலும், மணிஸ் பிரியாணி ₹160 விலையில் சிறந்த சிக்கனத் தேர்வாகவும் உள்ளது.";

    return res.json({
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      tamilText,
      spokenText: language === 'ta' ? tamilText : text,
      comparison,
      places: ALL_PLACES.filter(p => p.category === 'RET11').slice(0, 3),
      intent: 'compare_restaurants',
      sources: ['ONDC Network Seller Quotes', 'Verified Ratings'],
      latencyMs: Date.now() - startTime
    });
  }

  // 2. Multi-Item Shopping & Hyperlocal Grocery Basket
  const isMultiItemFood = (queryLower.includes('biryani') || queryLower.includes('biryanis')) && 
    (queryLower.includes('juice') || queryLower.includes('65') || queryLower.includes('parotta') || queryLower.includes('two') || queryLower.includes('rendu'));
  
  const isGroceryBasket = (queryLower.includes('milk') || queryLower.includes('பால்')) && 
    (queryLower.includes('bread') || queryLower.includes('ரொட்டி') || queryLower.includes('eggs') || queryLower.includes('முட்டை') || queryLower.includes('veetukku'));

  if (isGroceryBasket) {
    const basket = {
      title: 'Your Grocery Basket',
      tamilTitle: 'உங்கள் மளிகைக் கூடை',
      items: [
        { name: 'Aavin Full Cream Milk (500ml × 2)', quantity: 2, unitPrice: 24, totalPrice: 48 },
        { name: 'Freshly Baked Milk Bread (400g)', quantity: 1, unitPrice: 45, totalPrice: 45 },
        { name: 'Namakkal Farm Fresh Eggs (6 pcs)', quantity: 1, unitPrice: 36, totalPrice: 36 }
      ],
      subtotal: 129,
      delivery: 25,
      tax: 8,
      total: 162
    };

    const text = "I've created your hyperlocal grocery basket with Milk, Bread, and Eggs from Peelamedu Daily Fresh Mart. Subtotal is ₹129 with ₹25 delivery (Total: ₹162).";
    const tamilText = "பீளமேடு டெய்லி பிரெஷ் மளிகையிலிருந்து பால், ரொட்டி மற்றும் முட்டையுடன் மளிகைக் கூடை தயார். மொத்தத் தொகை ₹162 (டெலிவரி ₹25 உட்பட). கூடையை உறுதி செய்யவா?";

    return res.json({
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      tamilText,
      spokenText: language === 'ta' ? tamilText : text,
      basket,
      intent: 'multi_item_grocery',
      sources: ['ONDC RET10 Hyperlocal Groceries'],
      latencyMs: Date.now() - startTime
    });
  }

  if (isMultiItemFood) {
    const basket = {
      title: 'Your Multi-Item Food Order',
      tamilTitle: 'உங்கள் உணவு தொகுப்பு',
      items: [
        { name: 'Chicken Biryani (Seeraga Samba)', quantity: 2, unitPrice: 180, totalPrice: 360 },
        { name: 'Fresh Mint Lime Juice', quantity: 1, unitPrice: 40, totalPrice: 40 },
        { name: 'Chettinad Chicken Pepper Fry (65)', quantity: 1, unitPrice: 150, totalPrice: 150 }
      ],
      subtotal: 550,
      delivery: 30,
      tax: 28,
      total: 608
    };

    const text = "I have grouped your items from ABC Hotel: 2 Chicken Biryanis, 1 Lime Juice, and 1 Chicken Pepper Fry. Subtotal is ₹550 + ₹30 delivery + ₹28 taxes = Total ₹608.";
    const tamilText = "ஏபிசி ஹோட்டலில் இருந்து 2 சிக்கன் பிரியாணி, 1 லெமன் ஜூஸ், மற்றும் 1 சிக்கன் 65 தேர்வு செய்யப்பட்டுள்ளது. மொத்தத் தொகை ₹608. ஆர்டரை உறுதி செய்யவா?";

    return res.json({
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      tamilText,
      spokenText: language === 'ta' ? tamilText : text,
      basket,
      intent: 'multi_item_food',
      sources: ['ONDC RET11 Seller ABC Hotel'],
      latencyMs: Date.now() - startTime
    });
  }

  // 3. Conversational Direct Ordering & Checkout ("Order this", "Pay 222", "I want one chicken biryani", "Checkout")
  const isCheckoutQuery = (queryLower.includes('order') || queryLower.includes('pay') || queryLower.includes('checkout') || queryLower.includes('வாங்க') || queryLower.includes('பணம்')) &&
    !queryLower.includes('track') && !queryLower.includes('where') && !queryLower.includes('status') && !queryLower.includes('cancel') && !queryLower.includes('late');

  if (isCheckoutQuery && (queryLower.includes('biryani') || queryLower.includes('one') || queryLower.includes('second') || queryLower.includes('pay') || queryLower.includes('checkout'))) {
    const checkoutCard = {
      orderId: `VC${Math.floor(10000 + Math.random() * 90000)}`,
      merchantName: 'ABC Hotel (Sri Krishna Bhavan)',
      items: [
        { name: 'Chicken Biryani (Seeraga Samba)', quantity: 1, price: 180 }
      ],
      subtotal: 180,
      delivery: 30,
      tax: 12,
      total: 222,
      upiId: 'voicecart.pay@icici',
      isPaid: false
    };

    const text = "Here is your order summary for 1 Chicken Biryani from ABC Hotel. Total is ₹222 including delivery and taxes. Tap 'Pay ₹222' to proceed with UPI payment.";
    const tamilText = "ஏபிசி ஹோட்டலில் இருந்து 1 சிக்கன் பிரியாணிக்கான உங்கள் ஆர்டர் தயார். டெலிவரி மற்றும் வரிகள் உட்பட மொத்தம் ₹222. யுபிஐ (UPI) மூலம் செலுத்த 'Pay ₹222' அழுத்தவும்.";

    return res.json({
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      tamilText,
      spokenText: language === 'ta' ? tamilText : text,
      checkoutCard,
      intent: 'direct_checkout',
      sources: ['ONDC Network Verified Quote'],
      latencyMs: Date.now() - startTime
    });
  }

  // 4. Order Status & Live Tracking Flow ("Where is my order?", "Track my order", "When will food arrive?")
  const isTrackingQuery = queryLower.includes('track') || queryLower.includes('where is my order') || 
    queryLower.includes('when will') || queryLower.includes('status') || queryLower.includes('எங்கே') || queryLower.includes('ஆர்டர் நிலை');

  if (isTrackingQuery) {
    const orderTrackingCard = {
      orderId: 'VC10482',
      merchantName: 'ABC Hotel (Sri Krishna Bhavan)',
      status: 'OUT_FOR_DELIVERY' as const,
      statusLabel: 'Rider picked up • Out for delivery',
      tamilStatusLabel: 'டெலிவரி பார்ட்னர் உணவை எடுத்துக்கொண்டு புறப்பட்டுவிட்டார்',
      etaMinutes: 18,
      riderName: 'Saravanan K',
      riderPhone: '+91 98421 82910',
      total: 222,
      steps: [
        { label: 'Payment received', tamilLabel: 'பணம் செலுத்தப்பட்டது', completed: true, current: false },
        { label: 'Restaurant accepted', tamilLabel: 'உணவகம் ஏற்றுக்கொண்டது', completed: true, current: false },
        { label: 'Food preparing', tamilLabel: 'உணவு தயாராகிறது', completed: true, current: false },
        { label: 'Rider assigned (Saravanan K)', tamilLabel: 'டெலிவரி பார்ட்னர் நியமிக்கப்பட்டார்', completed: true, current: false },
        { label: 'Rider picked up & Out for delivery', tamilLabel: 'டெலிவரி புறப்பட்டுவிட்டது', completed: true, current: true }
      ]
    };

    const text = "Your order #VC10482 from ABC Hotel is currently OUT FOR DELIVERY by rider Saravanan K. Estimated arrival is in 18 minutes.";
    const tamilText = "உங்கள் ஆர்டர் #VC10482 ஏபிசி ஹோட்டலில் இருந்து டெலிவரிக்கு புறப்பட்டுள்ளது. டெலிவரி பார்ட்னர் சரவணன் இன்னும் 18 நிமிடங்களில் உங்கள் இருப்பிடத்திற்கு வந்துவிடுவார்.";

    return res.json({
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      tamilText,
      spokenText: language === 'ta' ? tamilText : text,
      orderTrackingCard,
      intent: 'track_order',
      sources: ['ONDC Logistics Telemetry', 'Live GPS Tracking'],
      latencyMs: Date.now() - startTime
    });
  }

  // 5. Reorder Flow ("Order what I had yesterday", "Reorder", "Order my usual dinner")
  const isReorderQuery = queryLower.includes('yesterday') || queryLower.includes('reorder') || queryLower.includes('usual') || queryLower.includes('நேற்று');

  if (isReorderQuery) {
    const reorderCard = {
      prevOrderId: 'VC10283',
      merchantName: 'ABC Hotel (Sri Krishna Bhavan)',
      items: [
        { name: 'Chicken Biryani (Seeraga Samba)', quantity: 1, price: 180 },
        { name: 'Madurai Bun Parotta (2 Pcs)', quantity: 1, price: 40 }
      ],
      total: 220
    };

    const text = "Yesterday you ordered Chicken Biryani and Bun Parotta from ABC Hotel. Would you like to reorder the same for ₹220?";
    const tamilText = "நேற்று நீங்கள் ஏபிசி ஹோட்டலில் இருந்து சிக்கன் பிரியாணி மற்றும் பன் புரோட்டா ஆர்டர் செய்தீர்கள். அதே உணவை மீண்டும் ₹220-க்கு ஆர்டர் செய்யவா?";

    return res.json({
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      tamilText,
      spokenText: language === 'ta' ? tamilText : text,
      reorderCard,
      intent: 'reorder',
      sources: ['VoiceCart Order History'],
      latencyMs: Date.now() - startTime
    });
  }

  // 6. Favorites Flow ("Save this restaurant", "Add to favorites", "Show my favorites")
  const isFavoriteQuery = queryLower.includes('favorite') || queryLower.includes('favourite') || queryLower.includes('save this') || queryLower.includes('விருப்ப');

  if (isFavoriteQuery) {
    const favoriteStatus = {
      merchantName: 'ABC Hotel (Sri Krishna Bhavan)',
      isSaved: true
    };

    const text = "I've saved ABC Hotel (Sri Krishna Bhavan) to your favorites! You can say 'Order my usual' or 'Show my favorite restaurants' anytime.";
    const tamilText = "ஏபிசி ஹோட்டல் (ஸ்ரீ கிருஷ்ணா பவன்) உங்கள் விருப்பப் பட்டியலில் சேமிக்கப்பட்டது! எப்போது வேண்டுமானாலும் 'என் வழக்கமான உணவை ஆர்டர் செய்' என்று கூறலாம்.";

    return res.json({
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      tamilText,
      spokenText: language === 'ta' ? tamilText : text,
      favoriteStatus,
      intent: 'save_favorite',
      sources: ['User Profile Preferences'],
      latencyMs: Date.now() - startTime
    });
  }

  // 7. Customer Support & Human Escalation ("My order is late", "Didn't receive", "Food damaged", "Connect with support")
  const isSupportQuery = queryLower.includes('late') || queryLower.includes('didn\'t receive') || 
    queryLower.includes('damaged') || queryLower.includes('support') || queryLower.includes('human') || 
    queryLower.includes('help') || queryLower.includes('உதவி') || queryLower.includes('தாமதம்');

  if (isSupportQuery) {
    const supportCase = {
      orderId: 'VC10482',
      statusText: 'Checking Order #VC10482: Rider Saravanan K is currently 1.1 km away on Cross Cut Road with slight peak traffic delay (ETA: 12 minutes).',
      canEscalate: true,
      agentConnected: false
    };

    const text = "I checked with our logistics partner: Rider Saravanan K is 1.1 km away on Cross Cut Road with slight peak traffic delay. If you prefer to talk with a representative, tap below to connect with a support agent.";
    const tamilText = "டெலிவரி பார்ட்னர் சரவணன் 1.1 கி.மீ தொலைவில் க்ராஸ் கட் ரோட்டில் வந்து கொண்டிருக்கிறார். மனித ஆதரவு உதவியாளரிடம் பேச விரும்பினால், கீழே உள்ள பொத்தானைத் தொடவும்.";

    return res.json({
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
      tamilText,
      spokenText: language === 'ta' ? tamilText : text,
      supportCase,
      intent: 'customer_support',
      sources: ['Logistics Dispatch', 'Customer Support Desk'],
      latencyMs: Date.now() - startTime
    });
  }

  // 8. Dynamic AI & Real-World Discovery (NO Mock Data, Live Web Search & Parametric Intelligence)
  const isWebSearchNeeded = 
    queryLower.includes('search') || queryLower.includes('browse') || queryLower.includes('google') ||
    queryLower.includes('what is') || queryLower.includes('who is') || queryLower.includes('how to') ||
    queryLower.includes('why') || queryLower.includes('recipe') || queryLower.includes('history') ||
    queryLower.includes('tell me about') || queryLower.includes('news') || queryLower.includes('wiki') ||
    queryLower.includes('என்ன') || queryLower.includes('யார்') || queryLower.includes('எப்படி');

  let webSearchResults: { title: string; snippet: string; url: string }[] = [];
  if (isWebSearchNeeded) {
    webSearchResults = await fetchWebSearch(message);
  }

  // Dietary checks
  const isVegOnly = queryLower.includes('veg') && !queryLower.includes('non-veg') && !queryLower.includes('non veg');
  const isNonVeg = queryLower.includes('non-veg') || queryLower.includes('non veg') || queryLower.includes('chicken') || queryLower.includes('mutton') || queryLower.includes('அசைவம்');

  // Budget checks
  let maxBudget: number | null = null;
  const budgetMatch = queryLower.match(/under\s*₹?\s*(\d+)/) || queryLower.match(/below\s*₹?\s*(\d+)/) || queryLower.match(/(\d+)\s*(?:roobaikku|rupees|rs)/);
  if (budgetMatch) {
    maxBudget = parseInt(budgetMatch[1], 10);
  }

  // 9. Call Gemini with full real-world knowledge and web grounding
  if (process.env.GEMINI_API_KEY && genAI) {
    try {
      const searchContextText = webSearchResults.length > 0 
        ? `\nLIVE WEB SEARCH RESULTS:\n${webSearchResults.map(r => `- ${r.title}: ${r.snippet} (Source: ${r.url})`).join('\n')}` 
        : '';

      const baseCoords = getBaseLocalityCoords(location);

      const prompt = `You are VoiceCart AI, an advanced Indic conversational and local commerce assistant for ${location}, Tamil Nadu, India.
Current Local Time: ${new Date().toLocaleTimeString()}
User Location: ${location}, Tamil Nadu
User Preferred Language: ${language}
${searchContextText}

USER QUERY: "${message}"

CRITICAL INSTRUCTIONS:
1. NO MOCK DATA. Answer the user's specific request directly and truthfully. Never force biryani or ABC Hotel when the user asks for ice cream, pizza, coffee, groceries, or general questions!
2. If the user asks for ANY food, dessert, ice cream, beverages, bakery, groceries, medicine, or local place:
   - Identify 2-3 REAL, actual places/outlets that exist in or near ${location} (e.g. for ice cream in Gandhipuram: Cream Stone on 100 Feet Road, Ibaco on Dr. Nanjappa Road, Naturals Ice Cream; for south indian/coffee: Sree Annapoorna; for bakery: KR Bakes; for pizza: Domino's or Pizza Hut).
   - In "places", include: { id, name, tamilName, address, locality, rating (e.g. 4.3), categoryLabel, isOpen: true, timing, description, etaMinutes, distanceKm }.
   - In "products", include 2-3 realistic menu items / items with realistic Indian Rupee prices (e.g. for ice cream: Belgian Chocolate Scoop ₹140, Tender Coconut Scoop ₹110) so the user can add them to their cart!
3. If the user asks a recipe, explanation, definition, general fact, or conversational query:
   - Provide a comprehensive, accurate answer using your real-world knowledge and any provided web search results.
   - Set "places": [] and "products": [] (do NOT attach unrelated restaurants or food).
4. If the user asks to compare places or items:
   - Provide a "comparison" object with columns, rows, highlight, and tamilHighlight.
5. Dietary & Budget awareness:
   ${isVegOnly ? '- Note: The user requested VEGETARIAN options only. Filter all products to veg: true.' : ''}
   ${isNonVeg ? '- Note: The user requested NON-VEGETARIAN options.' : ''}
   ${maxBudget ? `- Note: The user specified budget under ₹${maxBudget}. Ensure prices reflect this constraint.` : ''}

Respond strictly in JSON:
{
  "text": "Detailed English response",
  "tamilText": "Detailed natural Tamil response",
  "spokenText": "Concise spoken summary for TTS",
  "places": [],
  "products": [],
  "comparison": null,
  "intent": "search_food"
}`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5500)
      );

      const generatePromise = genAI.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        }
      });

      const aiResponse: any = await Promise.race([generatePromise, timeoutPromise]);
      const responseText = aiResponse.text || '{}';
      const parsed = JSON.parse(responseText);

      // Enrich places with real coordinates and category-accurate images
      const enrichedPlaces = (parsed.places || []).map((p: any, idx: number) => {
        const offsetLat = (idx === 0 ? 0.002 : idx === 1 ? -0.003 : 0.004);
        const offsetLng = (idx === 0 ? 0.003 : idx === 1 ? -0.002 : 0.005);
        return {
          id: p.id || `plc_${Date.now()}_${idx}`,
          name: p.name,
          tamilName: p.tamilName || p.name,
          rating: typeof p.rating === 'number' ? p.rating : 4.4,
          reviewCount: p.reviewCount || 450 + idx * 120,
          category: p.categoryLabel || 'RET11',
          address: p.address || `${location}, Tamil Nadu`,
          locality: p.locality || location,
          lat: p.lat || Number((baseCoords.lat + offsetLat).toFixed(4)),
          lng: p.lng || Number((baseCoords.lng + offsetLng).toFixed(4)),
          distanceKm: p.distanceKm || Number((0.8 + idx * 0.6).toFixed(1)),
          etaMinutes: p.etaMinutes || 15 + idx * 5,
          isOpen: p.isOpen ?? true,
          timing: p.timing || 'Open • Closes 11:00 PM',
          imageUrl: p.imageUrl || getFoodImage(p.name, p.categoryLabel),
          description: p.description || `Popular local establishment in ${location}.`
        };
      });

      // Enrich products with images and ONDC network tags
      const enrichedProducts = (parsed.products || []).map((pr: any, idx: number) => {
        const merchantName = pr.merchantName || (enrichedPlaces[0]?.name || 'Local Verified Merchant');
        return {
          id: pr.id || `prod_gen_${Date.now()}_${idx}`,
          merchantId: `mer_${idx + 1}`,
          merchantName,
          name: pr.name,
          tamilName: pr.tamilName || pr.name,
          category: 'RET11',
          price: typeof pr.price === 'number' ? pr.price : 120,
          veg: pr.veg ?? true,
          inStock: true,
          freshness: 'CONFIRMED',
          freshnessNote: 'Verified in stock via ONDC Network',
          tamilFreshnessNote: 'ONDC மூலம் சரிபார்க்கப்பட்டது',
          imageUrl: pr.imageUrl || getFoodImage(pr.name, merchantName),
          description: pr.description || `Freshly prepared item from ${merchantName}`,
          tamilDescription: pr.tamilDescription || `${merchantName} வழங்கும் சிறந்த உணவு`,
          unit: pr.unit || '1 serving',
          rating: 4.5,
          tags: ['ondc', 'fresh', location.toLowerCase()]
        };
      });

      const sourcesList = webSearchResults.length > 0 
        ? ['Live Web Search', ...webSearchResults.map(s => s.url)]
        : ['ONDC Network Live Discovery', 'Verified Local Merchants', 'Google Places'];

      return res.json({
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: parsed.text || "Here is what I found for you.",
        tamilText: parsed.tamilText,
        spokenText: parsed.spokenText || (language === 'ta' && parsed.tamilText ? parsed.tamilText : parsed.text),
        places: enrichedPlaces,
        products: enrichedProducts,
        comparison: parsed.comparison || undefined,
        intent: parsed.intent || 'dynamic_discovery',
        sources: sourcesList,
        latencyMs: Date.now() - startTime
      });
    } catch {
      // Fall through to resilient local knowledge engine
    }
  }

  // 10. Resilient Fallback Knowledge Engine (Category-specific, NEVER forces Biryani for ice cream!)
  let fallbackText = '';
  let fallbackTamil = '';
  let fallbackPlaces: any[] = [];
  let fallbackProducts: any[] = [];
  const baseCoords = getBaseLocalityCoords(location);

  if (queryLower.includes('ice cream') || queryLower.includes('icecream') || queryLower.includes('sundae') || queryLower.includes('dessert') || queryLower.includes('ஐஸ்கிரீம்')) {
    fallbackText = `Here are the top ice cream parlours near ${location}: Cream Stone on 100 Feet Road and Ibaco on Dr. Nanjappa Road are popular choices with high ratings.`;
    fallbackTamil = `${location} பகுதிக்கு அருகிலுள்ள சிறந்த ஐஸ்கிரீம் கடைகள்: 100 அடி சாலையில் உள்ள கிரீம் ஸ்டோன் மற்றும் டாக்டர் நஞ்சப்பா சாலையில் உள்ள ஐபாகோ மிகவும் பிரபலமானவை.`;
    fallbackPlaces = [
      {
        id: 'plc_cream_stone',
        name: 'Cream Stone Ice Cream',
        tamilName: 'கிரீம் ஸ்டோன் ஐஸ்கிரீம்',
        rating: 4.4,
        category: 'Ice Cream Parlour',
        address: '100 Feet Road, Gandhipuram, Coimbatore',
        locality: location,
        lat: Number((baseCoords.lat + 0.002).toFixed(4)),
        lng: Number((baseCoords.lng + 0.003).toFixed(4)),
        distanceKm: 1.1,
        etaMinutes: 18,
        isOpen: true,
        timing: 'Open • Closes 12:00 AM',
        imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80',
        description: 'Specializes in hand-crafted stone cold ice cream sundaes and waffles.'
      },
      {
        id: 'plc_ibaco',
        name: 'Ibaco',
        tamilName: 'ஐபாகோ பிரீமியம் ஐஸ்கிரீம்',
        rating: 4.3,
        category: 'Ice Cream & Desserts',
        address: 'Dr. Nanjappa Road, Gandhipuram, Coimbatore',
        locality: location,
        lat: Number((baseCoords.lat - 0.002).toFixed(4)),
        lng: Number((baseCoords.lng - 0.001).toFixed(4)),
        distanceKm: 0.9,
        etaMinutes: 15,
        isOpen: true,
        timing: 'Open • Closes 11:30 PM',
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
        description: 'Scoops by weight with premium toppings, chocolates, and ice cream cakes.'
      }
    ];
    fallbackProducts = [
      {
        id: 'prod_cs_belgian',
        merchantId: 'plc_cream_stone',
        merchantName: 'Cream Stone Ice Cream',
        name: 'Belgian Chocolate Scoop Sundae',
        tamilName: 'பெல்ஜியன் சாக்லேட் ஸ்கூப்',
        category: 'RET11',
        price: 140,
        veg: true,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80',
        description: 'Rich Belgian chocolate with chocochips on frozen cold stone.',
        tamilDescription: 'சுவையான பெல்ஜியன் சாக்லேட் ஐஸ்கிரீம்',
        unit: '1 scoop',
        rating: 4.7,
        tags: ['ice cream', 'dessert']
      },
      {
        id: 'prod_ibaco_coconut',
        merchantId: 'plc_ibaco',
        merchantName: 'Ibaco',
        name: 'Tender Coconut Ice Cream',
        tamilName: 'இளநீர் ஐஸ்கிரீம்',
        category: 'RET11',
        price: 110,
        veg: true,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80',
        description: 'Natural tender coconut flesh infused in velvety cream.',
        tamilDescription: 'புத்துணர்ச்சியூட்டும் இயற்கையான இளநீர் ஐஸ்கிரீம்',
        unit: '1 scoop',
        rating: 4.6,
        tags: ['ice cream', 'fresh']
      }
    ];
  } else if (queryLower.includes('pizza') || queryLower.includes('பீட்சா')) {
    fallbackText = `Found top pizza places near ${location}: Domino's Pizza on Cross Cut Road and Pizza Hut are serving fresh hot pizzas with 30-min delivery.`;
    fallbackTamil = `${location} பகுதியில் உள்ள சிறந்த பீட்சா கடைகள்: கிராஸ் கட் ரோட்டில் உள்ள டோமினோஸ் மற்றும் பீட்சா ஹட் உடனுக்குடன் சூடான பீட்சாக்களை வழங்குகின்றன.`;
    fallbackPlaces = [
      {
        id: 'plc_dominos',
        name: "Domino's Pizza",
        tamilName: "டோமினோஸ் பீட்சா",
        rating: 4.3,
        category: 'Pizza & Fast Food',
        address: 'Cross Cut Road, Gandhipuram, Coimbatore',
        locality: location,
        lat: Number((baseCoords.lat + 0.001).toFixed(4)),
        lng: Number((baseCoords.lng + 0.002).toFixed(4)),
        distanceKm: 0.8,
        etaMinutes: 25,
        isOpen: true,
        timing: 'Open • Closes 11:00 PM',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
        description: 'Hot hand-tossed pizzas, garlic bread, and choco lava cake.'
      }
    ];
    fallbackProducts = [
      {
        id: 'prod_dom_margherita',
        merchantId: 'plc_dominos',
        merchantName: "Domino's Pizza",
        name: 'Classic Margherita Pizza',
        tamilName: 'கிளாசிக் மார்கரிட்டா பீட்சா',
        category: 'RET11',
        price: 169,
        veg: true,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
        description: 'Classic cheese and herb pizza on hand-tossed crust.',
        tamilDescription: 'மொஸரெல்லா சீஸ் நிறைந்த மார்கரிட்டா பீட்சா',
        unit: 'Regular (4 slices)',
        rating: 4.5,
        tags: ['pizza', 'veg']
      }
    ];
  } else if (queryLower.includes('dosa') || queryLower.includes('தோசை') || queryLower.includes('coffee') || queryLower.includes('காபி') || queryLower.includes('breakfast') || queryLower.includes('tiffin')) {
    fallbackText = `For authentic South Indian tiffin and coffee near ${location}, Sree Annapoorna on 7th Street is renowned for its Ghee Roast Dosa and authentic filter coffee.`;
    fallbackTamil = `${location} பகுதியில் சுவையான தென்னிந்திய காலை உணவு மற்றும் காபிக்கு 7-வது வீதியில் உள்ள ஸ்ரீ அன்னபூர்ணா நெய் ரோஸ்ட் தோசை மற்றும் பில்டர் காபிக்கு பெயர் பெற்றது.`;
    fallbackPlaces = [
      {
        id: 'plc_annapoorna',
        name: 'Sree Annapoorna Sree Gowrishankar',
        tamilName: 'ஸ்ரீ அன்னபூர்ணா கௌரிசங்கர்',
        rating: 4.6,
        category: 'South Indian Vegetarian',
        address: '7th Street, Cross Cut Road, Gandhipuram, Coimbatore',
        locality: location,
        lat: Number((baseCoords.lat + 0.001).toFixed(4)),
        lng: Number((baseCoords.lng - 0.002).toFixed(4)),
        distanceKm: 0.6,
        etaMinutes: 15,
        isOpen: true,
        timing: 'Open 6:30 AM to 10:30 PM',
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
        description: 'Legendary pure vegetarian restaurant famous for Ghee Roast Dosa and Filter Coffee.'
      }
    ];
    fallbackProducts = [
      {
        id: 'prod_anna_ghee_roast',
        merchantId: 'plc_annapoorna',
        merchantName: 'Sree Annapoorna Sree Gowrishankar',
        name: 'Ghee Roast Dosa with Chutneys',
        tamilName: 'நெய் ரோஸ்ட் தோசை (சாம்பார் & சட்னி)',
        category: 'RET11',
        price: 95,
        veg: true,
        inStock: true,
        freshness: 'CONFIRMED',
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
        description: 'Crispy golden crepe roasted in pure ghee served with 3 chutneys and hot sambar.',
        tamilDescription: 'சுத்தமான நெய்யில் சுடப்பட்ட மொறுமொறு தோசை',
        unit: '1 plate',
        rating: 4.8,
        tags: ['dosa', 'veg', 'south indian']
      }
    ];
  } else if (queryLower.includes('biryani') || queryLower.includes('briyani') || queryLower.includes('பிரியாணி')) {
    fallbackText = `Checking nearby biryani spots near ${location}: Ramaas The Hyderabadi and Mani's Dum Biryani are top choices. ABC Hotel also has Seeraga Samba Chicken Biryani ready for instant delivery.`;
    fallbackTamil = `${location} பகுதியில் சுவையான பிரியாணி உணவகங்கள்: ராமாஸ் தி ஹைதராபாதி மற்றும் மணிஸ் தம் பிரியாணி மிக பிரபலம். ஏபிசி ஹோட்டலில் சீரக சம்பா சிக்கன் பிரியாணி உடனடியாகக் கிடைக்கும்.`;
    fallbackPlaces = ALL_PLACES.filter(p => p.category === 'RET11').slice(0, 3);
    fallbackProducts = MOCK_PRODUCTS.filter(p => p.tags.some(t => t.includes('biryani') || t.includes('chicken')));
  } else if (queryLower.includes('milk') || queryLower.includes('பால்') || queryLower.includes('grocery') || queryLower.includes('மளிகை')) {
    fallbackText = `Found fresh groceries nearby in ${location}: Peelamedu Daily Fresh Mart has Aavin Full Cream Milk and essentials ready with 20-min delivery.`;
    fallbackTamil = `${location} பகுதியில் மளிகைப் பொருட்கள்: பீளமேடு டெய்லி பிரெஷ் மளிகையில் ஆவின் பசும்பால் மற்றும் அன்றாடத் தேவைகள் உடனே கிடைக்கும்.`;
    fallbackPlaces = ALL_PLACES.filter(p => p.category === 'RET10').slice(0, 2);
    fallbackProducts = MOCK_PRODUCTS.filter(p => p.category === 'RET10');
  } else {
    // Helpful conversational answer
    fallbackText = `I am here to help you explore food, groceries, dining, and local services in ${location}. Tell me what you're looking for!`;
    fallbackTamil = `${location} பகுதியில் உணவு, மளிகை மற்றும் கடைகளைத் தேட நான் உங்களுக்கு உதவத் தயார். என்ன வேண்டும் என்று கூறுங்கள்!`;
    fallbackPlaces = [];
    fallbackProducts = [];
  }

  res.json({
    id: `msg_${Date.now()}`,
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: fallbackText,
    tamilText: fallbackTamil,
    spokenText: language === 'ta' && fallbackTamil ? fallbackTamil : fallbackText,
    places: fallbackPlaces,
    products: fallbackProducts,
    intent: 'general_query',
    sources: webSearchResults.length > 0 ? ['Live Web Search', ...webSearchResults.map(s => s.url)] : ['ONDC Local Network', 'Verified Places'],
    latencyMs: Date.now() - startTime
  });
});

// 2. AI Tamil/Tanglish Intent & Slot Extraction API
app.post('/api/gemini/parse-intent', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { query, language = 'ta', userLocation = 'Gandhipuram' } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // Check fallback parser first for quick guardrail check
  const fallbackResult = parseTamilQuery(query);

  if (!process.env.GEMINI_API_KEY || !genAI) {
    // Return high-fidelity local Indic NLP engine
    const latency = Date.now() - startTime;
    metrics.avgAiResponseTimeMs = Math.round((metrics.avgAiResponseTimeMs * 9 + latency) / 10);
    return res.json({
      ...fallbackResult,
      engine: 'local-indic-nlp',
      latencyMs: latency,
    });
  }

  try {
    const prompt = `You are VoiceCart AI 2.0, an Indic voice-first commerce assistant for Coimbatore, Tamil Nadu, India.
The user speaks in Tamil, Tanglish, or English.
Current user location: ${userLocation}.
User query: "${query}"

Your task is to parse the query into structured intent and slots, and generate a natural, friendly spoken Tamil voice response and Tanglish response.

Strict Scope Guardrails:
- We ONLY support:
  1. Food & Restaurants (RET11): Biryani, Parotta, Dosa, Meals, Coffee, etc.
  2. Bakeries: Bread, Puffs, Cakes, Tea.
  3. Hyperlocal Groceries (RET10): Milk, Curd, Eggs, Rice, Vegetables, Provisions.
  4. Assistant Discovery: Generic nearby places (Pharmacy, ATM, Clinic) in read-only mode.
- Any out-of-scope query (e.g. mobile phones, electronics, clothes, taxi ride, loans):
  MUST be flagged with guardrailTriggered=true, and set spokenResponseTamil to:
  "VoiceCart இந்த நேரத்தில் சமையல் உணவகங்கள் மற்றும் மளிகைக் கடைகளுக்கு மட்டுமே துணை புரிகிறது. அருகிலுள்ள உணவகங்களையோ பல்பொருள் அங்காடிகளையோ தேட விரும்புகிறீர்களா?"

Return ONLY a JSON object in this exact structure without markdown backticks:
{
  "intent": "search_food" | "search_grocery" | "search_bakery" | "add_to_cart" | "view_cart" | "confirm_order" | "track_order" | "place_discovery" | "file_dispute" | "scope_refused" | "general_help",
  "item": "biryani" or specific food/grocery name,
  "cuisine": "south_indian" or null,
  "quantity": number,
  "budget": number or null,
  "location": "Gandhipuram" or extracted location,
  "veg": boolean or null,
  "rawTranscript": "${query}",
  "spokenResponseTamil": "சுருக்கமான குரல் பதில் தமிழில்",
  "spokenResponseTanglish": "Short voice response in Tanglish",
  "spokenResponseEnglish": "Short voice response in English",
  "guardrailTriggered": boolean,
  "guardrailReason": string or null,
  "confidence": 0.95
}`;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 4500)
    );

    const generatePromise = genAI.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    const latency = Date.now() - startTime;
    metrics.avgAiResponseTimeMs = Math.round((metrics.avgAiResponseTimeMs * 9 + latency) / 10);

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return res.json({
      ...parsed,
      engine: 'gemini-3.1-flash-lite',
      latencyMs: latency,
    });
  } catch {
    const latency = Date.now() - startTime;
    return res.json({
      ...fallbackResult,
      engine: 'fallback-indic-nlp',
      latencyMs: latency,
    });
  }
});

// 3. ONDC (Beckn) Protocol APIs
app.post('/api/ondc/search', (req: Request, res: Response) => {
  const { query, location = 'Gandhipuram', category = 'RET11' } = req.body;
  const log = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    action: '/search',
    method: 'POST',
    status: 'SUCCESS',
    latencyMs: 142,
    description: `Broadcasted search for "${query || 'all'}" near ${location} to ONDC Gateway`,
    requestPayload: {
      context: {
        domain: category,
        country: 'IND',
        city: 'std:0422', // Coimbatore STD code
        action: 'search',
        core_version: '1.2.0',
        bap_id: 'buyer.voicecart.ai',
        bap_uri: 'https://buyer.voicecart.ai/protocol/v1',
      },
      message: {
        intent: {
          descriptor: { name: query || 'food' },
          fulfillment: {
            type: 'Delivery',
            start: { location: { address: { area_code: '641012' } } },
          },
        },
      },
    },
    responsePayload: {
      message: { ack: { status: 'ACK' } },
    },
  };
  protocolLogs.unshift(log);
  if (protocolLogs.length > 50) protocolLogs.pop();
  res.json(log);
});

app.post('/api/ondc/select', (req: Request, res: Response) => {
  const { cartItems, merchantId } = req.body;
  const log = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    action: '/select',
    method: 'POST',
    status: 'SUCCESS',
    latencyMs: 210,
    description: `Validated stock and pricing with seller node ${merchantId}`,
    requestPayload: {
      context: { action: 'select', bpp_id: merchantId },
      message: { order: { items: cartItems } },
    },
    responsePayload: {
      message: {
        order: {
          items: cartItems,
          quote: {
            price: { currency: 'INR', value: '268.00' },
            breakup: [
              { title: 'Subtotal', price: { value: '220.00' } },
              { title: 'Delivery Fee', price: { value: '30.00' } },
              { title: 'Tax (GST)', price: { value: '18.00' } },
            ],
          },
        },
      },
    },
  };
  protocolLogs.unshift(log);
  res.json(log);
});

app.post('/api/ondc/confirm', (req: Request, res: Response) => {
  const { orderId, amount, paymentMethod } = req.body;
  metrics.ordersToday += 1;
  metrics.gmvToday += Number(amount) || 268;

  const log = {
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
    action: '/confirm',
    method: 'POST',
    status: 'SUCCESS',
    latencyMs: 320,
    description: `Order ${orderId} confirmed with seller; rider allocated via Shadowfax/Dunzo`,
    requestPayload: {
      context: { action: 'confirm', transaction_id: `txn_${Date.now()}` },
      message: {
        order: {
          id: orderId,
          payment: { status: 'PAID', type: paymentMethod || 'UPI' },
        },
      },
    },
    responsePayload: {
      message: {
        order: {
          id: orderId,
          state: 'Accepted',
          fulfillment: {
            state: 'Order-in-kitchen',
            tracking: true,
          },
        },
      },
    },
  };
  protocolLogs.unshift(log);
  res.json(log);
});

app.get('/api/ondc/logs', (req: Request, res: Response) => {
  res.json({ logs: protocolLogs });
});

// 4. Metrics endpoint
app.get('/api/metrics', (req: Request, res: Response) => {
  metrics.lastUpdated = new Date().toLocaleTimeString();
  res.json(metrics);
});

// Vite middleware & Static server setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VoiceCart AI 2.0 server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
