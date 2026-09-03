import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Plus,
  Compass,
  ShoppingBag,
  ShoppingCart,
  Share2,
  Camera,
  ArrowUp,
  MapPin,
  CheckCircle2,
  Radio,
  MoreVertical,
  X,
  Activity,
  Globe,
  Trash2,
  ExternalLink,
  Phone,
  Wifi,
  CreditCard,
  Clock,
  RotateCcw,
  Heart,
  Headphones,
  UserCheck,
  Truck,
  Star,
  ShieldCheck,
  ChevronRight,
  Layers,
  ArrowRight,
  Crosshair,
  Loader2,
} from 'lucide-react';
import {
  ChatMessage,
  ChatPlace,
  CartItem,
  ProductItem,
  LanguageMode,
  Order,
} from '../types';
import { ChatMapCard } from './ChatMapCard';
import { speakText, soundEffects } from '../utils/speechSynthesis';
import { MOCK_PRODUCTS } from '../data/mockData';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';

interface VoiceChatSystemProps {
  currentLocality: string;
  onLocalityChange: (locality: string) => void;
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
  cartItems: CartItem[];
  onAddToCart: (product: ProductItem, quantity?: number) => void;
  onOpenCart: () => void;
  orders: Order[];
  onOpenOrderTracking: (order: Order) => void;
  onOpenOndcInspector: () => void;
  onOpenAdminMetrics: () => void;
  onOrderPlaced?: (order: Order) => void;
}

export const VoiceChatSystem: React.FC<VoiceChatSystemProps> = ({
  currentLocality,
  onLocalityChange,
  language,
  onLanguageChange,
  cartItems,
  onAddToCart,
  onOpenCart,
  orders,
  onOpenOrderTracking,
  onOpenOndcInspector,
  onOpenAdminMetrics,
  onOrderPlaced,
}) => {
  // Chat messages state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [liveVoiceMode, setLiveVoiceMode] = useState<boolean>(false); // Mode from Image 1 & 2!
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, 'up' | 'down'>>({});
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [paidCheckoutIds, setPaidCheckoutIds] = useState<Record<string, boolean>>({});
  const [connectedAgentCases, setConnectedAgentCases] = useState<Record<string, boolean>>({});
  const [favoriteSaved, setFavoriteSaved] = useState<Record<string, boolean>>({
    'ABC Hotel (Sri Krishna Bhavan)': true,
  });
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [likedProductIds, setLikedProductIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('voicecart_liked_product_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const toggleLikeProduct = (product: ProductItem) => {
    setLikedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
        showToast(`Removed ${product.name} from likes`);
      } else {
        next.add(product.id);
        showToast(`❤️ Liked ${product.name}!`);
        soundEffects.playTone(680, 0.08);
      }
      try {
        localStorage.setItem('voicecart_liked_product_ids', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // Check Current GPS Location
  const handleCheckCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser');
      return;
    }
    setIsLocatingUser(true);
    showToast('Checking your GPS location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            const detectedLoc = data.locality || data.city || 'Your Location';
            onLocalityChange(detectedLoc);
            showToast(`📍 Location updated: ${data.displayName || detectedLoc}`);
            handleSendMessage(`Show nearby stores and products around ${detectedLoc}`);
          } else {
            onLocalityChange('Current Location');
            showToast(`📍 Location detected: [${lat.toFixed(3)}, ${lng.toFixed(3)}]`);
            handleSendMessage(`Show stores and products around my current location`);
          }
        } catch {
          onLocalityChange('Current Location');
          showToast(`📍 Location detected: [${lat.toFixed(3)}, ${lng.toFixed(3)}]`);
          handleSendMessage(`Show stores and products around my current location`);
        } finally {
          setIsLocatingUser(false);
        }
      },
      (err) => {
        setIsLocatingUser(false);
        showToast('Please allow browser location access to check nearby products');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  // Live dual clocks (Chennai & Riyadh matching user's image 1 & 2)
  const [chennaiTime, setChennaiTime] = useState<string>('');
  const [riyadhTime, setRiyadhTime] = useState<string>('');
  const [simpleMobileTime, setSimpleMobileTime] = useState<string>('12:02');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Update dual clocks & status bar time every second
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      // Chennai (IST: UTC+5:30)
      const chennaiStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).toLowerCase();
      // Simple status bar time (e.g. 12:02)
      const simpleStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      // Riyadh (AST: UTC+3:00)
      const riyadhStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Riyadh',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).toLowerCase();

      setChennaiTime(chennaiStr);
      setRiyadhTime(riyadhStr);
      setSimpleMobileTime(simpleStr);
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Show quick toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // Web Speech API Voice Recognition setup
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      soundEffects.playMicStop();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Speech recognition not supported in this browser. Please type or use sample prompt.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        soundEffects.playMicStart();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          showToast('Mic permission required. You can also type or tap quick prompts.');
        } else if (event.error !== 'no-speech') {
          showToast('Voice input inactive. You can type or tap quick prompts.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      showToast('Microphone not supported in this browser. Please type or tap prompts.');
    }
  };

  // Send message to the backend `/api/chat`
  const handleSendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isProcessing) return;

    soundEffects.playTone(520, 0.08);

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          location: currentLocality,
          language: language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const aiResponse: ChatMessage = await res.json();
      setMessages((prev) => [...prev, aiResponse]);

      // Speak response aloud if audio readout is enabled
      if (voicePlaybackEnabled) {
        const textToSpeak =
          language === 'ta' && aiResponse.tamilText
            ? aiResponse.tamilText
            : aiResponse.spokenText || aiResponse.text;
        speakText(textToSpeak, language === 'ta' ? 'ta' : 'en');
      }
    } catch {
      // High-fidelity fallback engine: NEVER leaves the user stranded with a generic error
      const queryLower = trimmed.toLowerCase();
      let fallbackText = '';
      let fallbackTamil = '';
      let fallbackPlaces: ChatPlace[] = [];
      let fallbackComparison: any = undefined;
      let fallbackBasket: any = undefined;
      let fallbackCheckout: any = undefined;
      let fallbackTracking: any = undefined;
      let fallbackReorder: any = undefined;
      let fallbackSupport: any = undefined;
      let fallbackFavorite: any = undefined;
      let fallbackProducts: ProductItem[] | undefined = undefined;

      // 0. Greeting Flow ("hi", "hello", "hey", etc.)
      const isGreeting =
        /^(hi|hello|hey|vanakkam|வணக்கம்|good\s+morning|good\s+evening|good\s+afternoon|namaste|hlo|howdy)\b/i.test(queryLower.trim()) ||
        queryLower === 'hi' ||
        queryLower === 'hello' ||
        queryLower === 'hey' ||
        queryLower === 'வணக்கம்' ||
        queryLower === 'vanakkam' ||
        queryLower === 'start';

      if (isGreeting) {
        fallbackText =
          "Hello! I'm VoiceCart AI, your local food, grocery, and dining assistant. What can I get for you today? You can ask me to find nearby biryani, order fresh groceries, compare restaurant prices, or track an active order.";
        fallbackTamil =
          "வணக்கம்! நான் வாய்ஸ்கார்ட் ஏஐ (VoiceCart AI). உங்களுக்கு இன்று என்ன உணவு அல்லது மளிகைப் பொருட்கள் வேண்டும்? அருகிலுள்ள சுவையான பிரியாணி, ஆவின் பால், உணவகங்களின் விலை ஒப்பீடு, அல்லது உங்கள் ஆர்டரை கண்காணிக்க என்னிடம் கேட்கலாம்.";
        fallbackPlaces = [];
        fallbackProducts = undefined;
      }
      // 1. Comparison
      else if (
        queryLower.includes('compare') ||
        queryLower.includes('ஒப்பிடு') ||
        queryLower.includes('cheapest') ||
        queryLower.includes('which one')
      ) {
        fallbackText =
          "Here is the comparison between the top nearby biryani spots: Ramaas has the highest rating at 4.7 ★, while Mani's Dum Biryani offers the best value at ₹160 total.";
        fallbackTamil =
          "அருகிலுள்ள சிறந்த பிரியாணி உணவகங்களின் ஒப்பீடு: ராமாஸ் 4.7 ★ மதிப்பீட்டுடன் முதலிடத்திலும், மணிஸ் பிரியாணி ₹160 விலையில் சிறந்த சிக்கனத் தேர்வாகவும் உள்ளது.";
        fallbackComparison = {
          columns: ['Restaurant', 'Rating', 'Distance', 'Delivery', 'Price'],
          rows: [
            { name: 'ABC Hotel (Krishna Bhavan)', rating: 4.4, distance: '1.2 km', delivery: '₹30', price: '₹180' },
            { name: "Mani's Dum Biryani", rating: 4.6, distance: '1.8 km', delivery: '₹20', price: '₹160' },
            { name: 'Ramaas The Hyderabadi', rating: 4.7, distance: '2.3 km', delivery: '₹35', price: '₹195' },
          ],
          highlight: "Ramaas has the highest rating (4.7 ★), while Mani's Dum Biryani has the lowest price (₹160) and lowest delivery fee (₹20).",
          tamilHighlight: "ராமாஸ் தி ஹைதராபாதி மிக உயர்ந்த மதிப்பீட்டைக் கொண்டுள்ளது (4.7 ★), அதே சமயம் மணிஸ் பிரியாணி மிகக் குறைந்த விலை (₹160) மற்றும் குறைந்த டெலிவரி கட்டணத்தைக் (₹20) கொண்டுள்ளது.",
        };
      }
      // 2. Groceries basket
      else if (
        (queryLower.includes('milk') || queryLower.includes('பால்')) &&
        (queryLower.includes('bread') || queryLower.includes('eggs') || queryLower.includes('veetukku') || queryLower.includes('முட்டை'))
      ) {
        fallbackText =
          "I've created your hyperlocal grocery basket with Milk, Bread, and Eggs from Peelamedu Daily Fresh Mart. Subtotal is ₹129 with ₹25 delivery (Total: ₹162).";
        fallbackTamil =
          "பீளமேடு டெய்லி பிரெஷ் மளிகையிலிருந்து பால், ரொட்டி மற்றும் முட்டையுடன் மளிகைக் கூடை தயார். மொத்தத் தொகை ₹162 (டெலிவரி ₹25 உட்பட). கூடையை உறுதி செய்யவா?";
        fallbackBasket = {
          title: 'Your Grocery Basket',
          tamilTitle: 'உங்கள் மளிகைக் கூடை',
          items: [
            { name: 'Aavin Full Cream Milk (500ml × 2)', quantity: 2, unitPrice: 24, totalPrice: 48 },
            { name: 'Freshly Baked Milk Bread (400g)', quantity: 1, unitPrice: 45, totalPrice: 45 },
            { name: 'Namakkal Farm Fresh Eggs (6 pcs)', quantity: 1, unitPrice: 36, totalPrice: 36 },
          ],
          subtotal: 129,
          delivery: 25,
          tax: 8,
          total: 162,
        };
      }
      // 3. Multi-item food order
      else if (
        (queryLower.includes('biryani') || queryLower.includes('biryanis')) &&
        (queryLower.includes('juice') || queryLower.includes('65') || queryLower.includes('parotta') || queryLower.includes('two') || queryLower.includes('rendu'))
      ) {
        fallbackText =
          "I have grouped your items from ABC Hotel: 2 Chicken Biryanis, 1 Lime Juice, and 1 Chicken Pepper Fry. Subtotal is ₹550 + ₹30 delivery + ₹28 taxes = Total ₹608.";
        fallbackTamil =
          "ஏபிசி ஹோட்டலில் இருந்து 2 சிக்கன் பிரியாணி, 1 லெமன் ஜூஸ், மற்றும் 1 சிக்கன் 65 தேர்வு செய்யப்பட்டுள்ளது. மொத்தத் தொகை ₹608. ஆர்டரை உறுதி செய்யவா?";
        fallbackBasket = {
          title: 'Your Multi-Item Food Order',
          tamilTitle: 'உங்கள் உணவு தொகுப்பு',
          items: [
            { name: 'Chicken Biryani (Seeraga Samba)', quantity: 2, unitPrice: 180, totalPrice: 360 },
            { name: 'Fresh Mint Lime Juice', quantity: 1, unitPrice: 40, totalPrice: 40 },
            { name: 'Chettinad Chicken Pepper Fry (65)', quantity: 1, unitPrice: 150, totalPrice: 150 },
          ],
          subtotal: 550,
          delivery: 30,
          tax: 28,
          total: 608,
        };
      }
      // 4. Direct Checkout
      else if (
        (queryLower.includes('order') || queryLower.includes('pay') || queryLower.includes('checkout') || queryLower.includes('வாங்க')) &&
        !queryLower.includes('track') && !queryLower.includes('where') && !queryLower.includes('late')
      ) {
        fallbackText =
          "Here is your order summary for 1 Chicken Biryani from ABC Hotel. Total is ₹222 including delivery and taxes. Tap 'Pay ₹222' to proceed with UPI payment.";
        fallbackTamil =
          "ஏபிசி ஹோட்டலில் இருந்து 1 சிக்கன் பிரியாணிக்கான உங்கள் ஆர்டர் தயார். டெலிவரி மற்றும் வரிகள் உட்பட மொத்தம் ₹222. யுபிஐ (UPI) மூலம் செலுத்த 'Pay ₹222' அழுத்தவும்.";
        fallbackCheckout = {
          orderId: 'VC10482',
          merchantName: 'ABC Hotel (Sri Krishna Bhavan)',
          items: [{ name: 'Chicken Biryani (Seeraga Samba)', quantity: 1, price: 180 }],
          subtotal: 180,
          delivery: 30,
          tax: 12,
          total: 222,
          upiId: 'voicecart.pay@icici',
          isPaid: false,
        };
      }
      // 5. Live Tracking
      else if (
        queryLower.includes('track') ||
        queryLower.includes('where is my order') ||
        queryLower.includes('when will') ||
        queryLower.includes('status') ||
        queryLower.includes('எங்கே')
      ) {
        fallbackText =
          "Your order #VC10482 from ABC Hotel is currently OUT FOR DELIVERY by rider Saravanan K. Estimated arrival is in 18 minutes.";
        fallbackTamil =
          "உங்கள் ஆர்டர் #VC10482 ஏபிசி ஹோட்டலில் இருந்து டெலிவரிக்கு புறப்பட்டுள்ளது. டெலிவரி பார்ட்னர் சரவணன் இன்னும் 18 நிமிடங்களில் வந்துவிடுவார்.";
        fallbackTracking = {
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
            { label: 'Rider picked up & Out for delivery', tamilLabel: 'டெலிவரி புறப்பட்டுவிட்டது', completed: true, current: true },
          ],
        };
      }
      // 6. Reorder
      else if (
        queryLower.includes('yesterday') ||
        queryLower.includes('reorder') ||
        queryLower.includes('usual') ||
        queryLower.includes('நேற்று')
      ) {
        fallbackText =
          "Yesterday you ordered Chicken Biryani and Bun Parotta from ABC Hotel. Would you like to reorder the same for ₹220?";
        fallbackTamil =
          "நேற்று நீங்கள் ஏபிசி ஹோட்டலில் இருந்து சிக்கன் பிரியாணி மற்றும் பன் புரோட்டா ஆர்டர் செய்தீர்கள். அதே உணவை மீண்டும் ₹220-க்கு ஆர்டர் செய்யவா?";
        fallbackReorder = {
          prevOrderId: 'VC10283',
          merchantName: 'ABC Hotel (Sri Krishna Bhavan)',
          items: [
            { name: 'Chicken Biryani (Seeraga Samba)', quantity: 1, price: 180 },
            { name: 'Madurai Bun Parotta (2 Pcs)', quantity: 1, price: 40 },
          ],
          total: 220,
        };
      }
      // 7. Customer Support
      else if (
        queryLower.includes('late') ||
        queryLower.includes('support') ||
        queryLower.includes('didn\'t receive') ||
        queryLower.includes('damaged') ||
        queryLower.includes('help') ||
        queryLower.includes('உதவி') ||
        queryLower.includes('தாமதம்')
      ) {
        fallbackText =
          "I checked with our logistics partner: Rider Saravanan K is 1.1 km away on Cross Cut Road with slight peak traffic delay. If you prefer to talk with a representative, tap below to connect with a support agent.";
        fallbackTamil =
          "டெலிவரி பார்ட்னர் சரவணன் 1.1 கி.மீ தொலைவில் க்ராஸ் கட் ரோட்டில் வந்து கொண்டிருக்கிறார். மனித ஆதரவு உதவியாளரிடம் பேச விரும்பினால், கீழே உள்ள பொத்தானைத் தொடவும்.";
        fallbackSupport = {
          orderId: 'VC10482',
          statusText: 'Checking Order #VC10482: Rider Saravanan K is currently 1.1 km away on Cross Cut Road with slight peak traffic delay (ETA: 12 minutes).',
          canEscalate: true,
          agentConnected: false,
        };
      }
      // 8. Health / BMI Discovery
      else if (
        queryLower.includes('bmi') ||
        queryLower.includes('obesity') ||
        queryLower.includes('clinic') ||
        queryLower.includes('doctor') ||
        queryLower.includes('மருத்துவ') ||
        queryLower.includes('டாக்டர்')
      ) {
        fallbackText =
          "Checking nearby now. Just a second. Hmm—if you mean BMI like Body Mass Index, there are a few nearby centers, like Magna Centres for Obesity, Diabetes and Endocrinology, open today 7 am to 9 pm, and Dr. Vasanth's Diabetes and Obesity Clinic (4.9 ★), open 9 am to 9 pm. If you just wanna know your BMI or get a checkup, both offer clinical wellness consultations.";
        fallbackTamil =
          "அருகிலுள்ள இடங்களை சரிபார்க்கிறது. ஒரு நிமிடம். பிஎம்ஐ (BMI - Body Mass Index) உடல் பருமன் மற்றும் நீரிழிவு பரிசோதனைக்கு டாக்டர் வசந்த் கிளினிக் (Anna Nagar) மற்றும் மேக்னா சென்டர் ஆகியவை சிறந்தவை.";
        fallbackPlaces = [
          {
            id: 'plc_vasanth_clinic',
            name: "Dr. Vasanth's Diabetes & Obesity Clinic (Specialist BMI)",
            tamilName: 'டாக்டர் வசந்த் நீரிழிவு & உடல் பருமன் சிகிச்சை மையம்',
            category: 'Diabetologist & Obesity Clinic',
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
            imageUrl:
              'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
            description:
              'Comprehensive diabetes care, clinical BMI analysis, metabolic wellness, and diet consultation.',
          },
          {
            id: 'plc_magna_centres',
            name: 'Magna Centres for Obesity, Diabetes and Endocrinology',
            tamilName: 'மேக்னா உடல் பருமன் & நீரிழிவு மையம்',
            category: 'Endocrinology & BMI Care',
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
            imageUrl:
              'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=80',
            description:
              'Specialized center for adult & pediatric endocrinology, obesity management, and BMI assessment.',
          },
        ];
      } else if (
        queryLower.includes('biryani') ||
        queryLower.includes('food') ||
        queryLower.includes('பிரியாணி') ||
        queryLower.includes('ஹோட்டல்')
      ) {
        fallbackText =
          "Checking nearby biryani spots now. You could try Ramaas The Hyderabadi just a bit further down Arcot Road. Mani's Dum Biryani is another popular choice in the area with a 4.6 rating. We also have ABC Hotel Seeraga Samba Chicken Biryani ready for instant delivery (₹180, ETA 25 min).";
        fallbackTamil =
          'அருகிலுள்ள பிரியாணி உணவகங்கள்: ராமாஸ் தி ஹைதராபாதி மற்றும் மணிஸ் தம் பிரியாணி மிக பிரபலம். ஏபிசி ஹோட்டலில் சீரக சம்பா சிக்கன் பிரியாணி ₹180-க்கு உடனடியாக டெலிவரி செய்ய தயாராக உள்ளது.';
        fallbackPlaces = [
          {
            id: 'plc_ramaas_biryani',
            name: 'Ramaas The Hyderabadi',
            tamilName: 'ராமாஸ் தி ஹைதராபாதி பிரியாணி',
            category: 'Hyderabadi Dum Biryani',
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
            imageUrl:
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
            description:
              'Authentic Hyderabadi dum biryani with mirchi ka salna and dahi chutney on Arcot Road.',
          },
          {
            id: 'plc_manis_biryani',
            name: "Mani's Dum Biryani",
            tamilName: 'மணிஸ் தம் பிரியாணி',
            category: 'Dum Biryani & Kebabs',
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
            imageUrl:
              'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
            description:
              'Popular choice in the area known for tender meat, fragrant basmati rice, and chicken 65.',
          },
        ];
        fallbackProducts = MOCK_PRODUCTS.filter((p) => p.category === 'RET11');
      } else {
        fallbackText = `Here are the top-rated places and food options near ${currentLocality}. Let me know what you would like to order or explore!`;
        fallbackTamil = `${currentLocality} பகுதியில் உள்ள சிறந்த உணவகங்கள் மற்றும் கடைகள் இங்கே பட்டியலிடப்பட்டுள்ளன. என்ன ஆர்டர் செய்ய வேண்டும் என்று கூறுங்கள்!`;
      }

      const fallbackMsg: ChatMessage = {
        id: `fb_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: fallbackText,
        tamilText: fallbackTamil,
        spokenText: language === 'ta' && fallbackTamil ? fallbackTamil : fallbackText,
        places: fallbackPlaces.length > 0 ? fallbackPlaces : undefined,
        products: fallbackProducts,
        comparison: fallbackComparison,
        basket: fallbackBasket,
        checkoutCard: fallbackCheckout,
        orderTrackingCard: fallbackTracking,
        reorderCard: fallbackReorder,
        supportCase: fallbackSupport,
        favoriteStatus: fallbackFavorite,
        intent: isGreeting ? 'greeting' : undefined,
        sources: ['ONDC Network RET10/11', 'OpenStreetMap Places'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);

      if (voicePlaybackEnabled) {
        const textToSpeak =
          language === 'ta' && fallbackTamil ? fallbackTamil : fallbackText;
        speakText(textToSpeak, language === 'ta' ? 'ta' : 'en');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Copied to clipboard');
  };

  const handleFeedback = (id: string, type: 'up' | 'down') => {
    setLikedMap((prev) => ({ ...prev, [id]: type }));
    showToast(type === 'up' ? 'Thanks for positive feedback!' : 'Feedback noted to improve.');
  };

  const cartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="flex flex-col h-full w-full bg-[#0B0C10] text-[#E5E5E5] relative font-sans overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1A2333]/95 backdrop-blur-md text-amber-300 border border-amber-500/40 text-xs px-4 py-2 rounded-full shadow-2xl animate-fade-in flex items-center gap-2 pointer-events-none">
          <Check className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. Mobile Status Bar (Simulated Phone Status Bar matching user's Image 1 & 2) */}
      <div className="px-3.5 pt-2 pb-1 flex items-center justify-between text-[11px] font-mono text-neutral-400 border-b border-white/[0.04] shrink-0 bg-[#0B0C10] z-30">
        <div className="flex items-center gap-2 font-semibold text-neutral-200 tracking-tight pl-0.5">
          <span>{simpleMobileTime}</span>
          {/* Mobile Dual Clocks (Chennai & Riyadh) positioned safely in status bar with no overlap */}
          <div className="flex min-[560px]:hidden items-center gap-1.5 text-[9px] font-mono bg-[#141B28] border border-sky-900/50 rounded-full px-2 py-0.5 shadow-xs">
            <span className="text-sky-400 font-bold">MAA</span>
            <span className="text-sky-100 font-semibold">{chennaiTime ? chennaiTime.replace(/\s*[ap]m/i, '') : '6:20'}</span>
            <span className="text-neutral-500">•</span>
            <span className="text-sky-400 font-bold">RUH</span>
            <span className="text-sky-100 font-semibold">{riyadhTime ? riyadhTime.replace(/\s*[ap]m/i, '') : '3:50'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold text-neutral-300">5G</span>
          <Wifi className="w-3.5 h-3.5 text-neutral-300" />
          {/* Battery 83% from image 1 */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-neutral-300">83%</span>
            <div className="w-5 h-2.5 rounded-xs border border-neutral-400 p-0.5 flex items-center">
              <div className="w-[83%] h-full bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Bar (matching user's Image 1, 2, & 3) */}
      <header className="px-3 py-1.5 bg-[#0E1017] border-b border-neutral-800/80 flex items-center justify-between gap-2 shrink-0 z-30 shadow-md overflow-hidden">
        {/* Left: Sparkle Brand Icon & Location */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-900 via-indigo-700 to-sky-600 border border-purple-400/40 flex items-center justify-center shadow-md shadow-purple-950/40 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-purple-200 fill-purple-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-display font-bold text-xs text-white tracking-wide">
                VoiceCart
              </span>
              <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-mono border border-amber-500/30">
                ONDC
              </span>
            </div>
            <button
              onClick={handleCheckCurrentLocation}
              className="text-[9px] text-neutral-400 hover:text-amber-300 flex items-center gap-0.5 truncate cursor-pointer transition-colors"
              title="Click to check current location via GPS"
            >
              {isLocatingUser ? (
                <Loader2 className="w-2.5 h-2.5 text-sky-400 animate-spin shrink-0" />
              ) : (
                <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              )}
              <span className="truncate max-w-[80px]">{currentLocality}</span>
            </button>
          </div>
        </div>

        {/* Center: Signature Dual Clock Capsule (Only shown when width >= 560px to guarantee NO overlap on mobile screens) */}
        <div className="hidden min-[560px]:flex items-center bg-[#15202E]/90 border border-sky-900/60 rounded-full px-2.5 py-0.5 shadow-inner gap-2 text-[10px] font-mono shrink-0 mx-auto">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[8px] uppercase font-bold text-sky-400">Chennai</span>
            <span className="font-semibold text-sky-100 text-[9px] whitespace-nowrap">{chennaiTime || '12:02 pm'}</span>
          </div>
          <div className="w-[1px] h-2.5 bg-sky-800/60 shrink-0" />
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[8px] uppercase font-bold text-sky-400">Riyadh</span>
            <span className="font-semibold text-sky-100 text-[9px] whitespace-nowrap">{riyadhTime || '9:32 am'}</span>
          </div>
        </div>

        {/* Right Controls (Carefully spaced buttons with isolated badges) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Live Mode Toggle (Image 1 & 2 vs Image 3) */}
          <button
            onClick={() => {
              setLiveVoiceMode(!liveVoiceMode);
              showToast(
                !liveVoiceMode
                  ? '🎙️ Gemini Live Voice Mode Activated'
                  : '💬 Chat Stream Mode'
              );
            }}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
              liveVoiceMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 text-white shadow-md'
                : 'bg-[#151722] border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Toggle Gemini Live Voice Mode"
          >
            <Radio className="w-3.5 h-3.5" />
          </button>

          {/* Voice Readout Toggle */}
          <button
            onClick={() => {
              setVoicePlaybackEnabled(!voicePlaybackEnabled);
              showToast(
                !voicePlaybackEnabled ? 'குரல் வாசிப்பு இயக்கப்பட்டது' : 'குரல் முடக்கப்பட்டது'
              );
            }}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
              voicePlaybackEnabled
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-[#151722] border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Voice Readout"
          >
            {voicePlaybackEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Cart Bag */}
          <button
            onClick={onOpenCart}
            className="relative p-1.5 rounded-lg bg-[#151722] hover:bg-[#1E2030] border border-neutral-800 text-neutral-200 transition-colors cursor-pointer shrink-0"
            title="Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md ring-2 ring-[#0E1017] pointer-events-none">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg bg-[#151722] hover:bg-[#1E2030] border border-neutral-800 text-neutral-300 transition-colors cursor-pointer shrink-0"
            title="Menu"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer / Action Sheet */}
      {menuOpen && (
        <div className="absolute top-[88px] right-2 z-40 w-60 bg-[#161824] border border-neutral-750 rounded-2xl shadow-2xl p-2.5 space-y-1.5 animate-fade-in text-xs">
          <div className="px-2 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Quick Controls
          </div>

          {/* Dual Clocks Info Row in Menu */}
          <div className="px-2.5 py-2 rounded-xl bg-[#10121B] border border-neutral-800 text-neutral-300 space-y-1">
            <div className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>World Clocks (Dual Zone)</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
              <span className="text-sky-300">Chennai: <strong className="text-white">{chennaiTime || '12:02 pm'}</strong></span>
              <span className="text-sky-300">Riyadh: <strong className="text-white">{riyadhTime || '9:32 am'}</strong></span>
            </div>
          </div>
          <button
            onClick={() => {
              const localities = ['Gandhipuram', 'RS Puram', 'Peelamedu', 'Anna Nagar', 'Vadapalani'];
              const nextLoc = localities[(localities.indexOf(currentLocality) + 1) % localities.length];
              onLocalityChange(nextLoc);
              showToast(`Location: ${nextLoc}`);
              setMenuOpen(false);
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#212435] text-neutral-200 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Location</span>
            </span>
            <span className="font-semibold text-amber-300 text-[11px]">{currentLocality}</span>
          </button>

          <button
            onClick={() => {
              onLanguageChange(language === 'ta' ? 'tanglish' : language === 'tanglish' ? 'en' : 'ta');
              setMenuOpen(false);
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#212435] text-neutral-200 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>Language</span>
            </span>
            <span className="font-semibold text-sky-300 text-[11px]">
              {language === 'ta' ? 'தமிழ்' : language === 'tanglish' ? 'Tanglish' : 'English'}
            </span>
          </button>

          <button
            onClick={() => {
              onOpenOndcInspector();
              setMenuOpen(false);
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#212435] text-neutral-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>ONDC Beckn Protocol JSON</span>
          </button>

          <button
            onClick={() => {
              onOpenAdminMetrics();
              setMenuOpen(false);
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#212435] text-neutral-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>System Telemetry & Metrics</span>
          </button>

          <div className="w-full h-[1px] bg-neutral-800 my-1" />

          <button
            onClick={() => {
              setMessages([]);
              setMenuOpen(false);
              showToast('Chat history cleared');
            }}
            className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-950/40 text-rose-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Chat</span>
          </button>
        </div>
      )}

      {/* 3. VIEW MODE A: GEMINI LIVE VOICE OVERLAY (Image 1 & 2) */}
      {liveVoiceMode ? (
        <div
          className="flex-1 flex flex-col justify-between p-4 relative overflow-hidden"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 50% 30%, #151A2E 0%, #080A12 100%),
              radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)
            `,
          }}
        >
          {/* Subtle mood lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-purple-600/15 via-sky-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Top Status in Live Mode */}
          <div className="text-center pt-6 space-y-1 z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-medium text-neutral-300 backdrop-blur-md">
              <span
                className={`w-2 h-2 rounded-full ${
                  isListening ? 'bg-amber-400 animate-ping' : isProcessing ? 'bg-purple-400 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span>
                {isListening
                  ? 'குரல் கேட்கிறது... (Listening)'
                  : isProcessing
                  ? 'ஆராய்ச்சி செய்கிறது... (Thinking)'
                  : 'Live Voice Assistant Ready'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto pt-1">
              Ask anything naturally in Tamil or English about BMI clinics, Biryani, or groceries.
            </p>
          </div>

          {/* Center Visual Area / Recognized speech */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-4 z-10">
            {messages.length > 0 ? (
              <div className="bg-[#121622]/80 backdrop-blur-md border border-neutral-750 p-4 rounded-3xl max-w-sm w-full space-y-2 text-left shadow-2xl">
                <div className="text-[10px] uppercase font-bold text-amber-400 font-mono">
                  Latest Response:
                </div>
                <p className="text-xs text-neutral-200 leading-relaxed max-h-48 overflow-y-auto">
                  {messages[messages.length - 1].text}
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setLiveVoiceMode(false)}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                  >
                    வரைபடம் மற்றும் விவரங்களை பார்க்க (View Map) →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-purple-600/30 via-sky-600/20 to-amber-500/20 border border-white/10 flex items-center justify-center shadow-2xl relative">
                  <Sparkles className="w-12 h-12 text-sky-300 animate-pulse" />
                  <span className="absolute -inset-2 rounded-full border border-sky-400/20 animate-ping" />
                </div>
                <div className="text-xs text-neutral-400">
                  Tap microphone below or ask "Ah, is there any BMI nearby"
                </div>
              </div>
            )}
          </div>

          {/* FLOATING VOICE PILL (Exact match to Image 1 & 2!) */}
          <div className="z-20 pb-4 flex justify-center w-full">
            <div className="bg-[#151926]/95 backdrop-blur-xl border border-neutral-700/80 rounded-full px-4 py-2.5 shadow-2xl flex items-center gap-3 w-full max-w-xs justify-between">
              {/* Camera / Lens button */}
              <button
                onClick={() => showToast('Camera / Lens vision available in next update')}
                className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Camera Lens"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Share / Upload button */}
              <button
                onClick={() => showToast('Screen shared to VoiceCart session')}
                className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* CENTER ANIMATED MULTICOLOR AUDIO VISUALIZER (From Image 1 & 2!) */}
              <div
                onClick={toggleListening}
                className="h-10 px-3 bg-gradient-to-r from-sky-950/80 via-purple-950/80 to-indigo-950/80 rounded-full border border-sky-500/40 flex items-center gap-1.5 cursor-pointer shadow-inner shadow-sky-900/40"
                title="Audio Waveform Visualizer"
              >
                <div className="w-1 rounded-full bg-sky-400 animate-wave-1" />
                <div className="w-1 rounded-full bg-purple-400 animate-wave-2" />
                <div className="w-1.5 rounded-full bg-amber-400 animate-wave-3" />
                <div className="w-1 rounded-full bg-emerald-400 animate-wave-4" />
                <div className="w-1 rounded-full bg-rose-400 animate-wave-5" />
              </div>

              {/* Mic toggle */}
              <button
                onClick={toggleListening}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-900/60'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-amber-400'
                }`}
                title="Toggle Mic"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Close (✕) button to exit live mode */}
              <button
                onClick={() => setLiveVoiceMode(false)}
                className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close Live Voice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 4. VIEW MODE B: CONVERSATIONAL CHAT & MAP STREAM (Image 3) */
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {/* Clean empty greeting state */}
            {messages.length === 0 && (
              <div className="py-6 flex flex-col items-center text-center space-y-4 animate-fade-in max-w-sm mx-auto">
                {/* Glowing Voice Center Orb */}
                <div
                  onClick={toggleListening}
                  className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 shadow-xl ${
                    isListening
                      ? 'bg-gradient-to-tr from-amber-500 to-red-600 scale-110 ring-4 ring-amber-500/30'
                      : 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-sky-600 ring-2 ring-sky-400/20 hover:scale-105'
                  }`}
                >
                  <Mic
                    className={`w-8 h-8 ${
                      isListening ? 'text-white animate-pulse' : 'text-sky-100'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-white">
                    வணக்கம்! குரல் மூலம் கேளுங்கள்
                  </h3>
                  <p className="text-xs text-neutral-400 leading-normal">
                    Tap mic or type. VoiceCart searches ONDC places, clinics & food only when you ask.
                  </p>
                </div>

                {/* Sample Prompt Chips (matching Image 1, 2, 3) */}
                <div className="w-full space-y-1.5 pt-1 text-left">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                    மாதிரி வினாக்கள் (Try asking):
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handleSendMessage('Ah, is there any BMI nearby')}
                      className="w-full px-3 py-2 bg-[#131622] hover:bg-[#1C2030] border border-neutral-800 text-xs text-neutral-200 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-amber-400">🎙️</span>
                      <span className="font-medium text-left">"Ah, is there any BMI nearby"</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage('காந்திபுரம் சிறந்த பிரியாணி உணவகங்கள் வேணும்')}
                      className="w-full px-3 py-2 bg-[#131622] hover:bg-[#1C2030] border border-neutral-800 text-xs text-neutral-200 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-amber-400">🎙️</span>
                      <span className="font-medium text-left">"பிரியாணி எங்க நல்லா இருக்கும்? (Biryani)"</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage('ஆவின் பால் 2 பாக்கெட் மளிகை அனுப்பு')}
                      className="w-full px-3 py-2 bg-[#131622] hover:bg-[#1C2030] border border-neutral-800 text-xs text-neutral-200 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-amber-400">🎙️</span>
                      <span className="font-medium text-left">"ஆவின் பால் 2 பாக்கெட் மளிகை"</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  {/* USER MESSAGE BUBBLE (Exact deep emerald green `#144726` from Image 3!) */}
                  {isUser ? (
                    <div className="max-w-[85%] bg-[#144726] text-[#E8F8EE] px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-md border border-emerald-700/40 text-xs sm:text-sm font-medium leading-relaxed">
                      {msg.text}
                    </div>
                  ) : (
                    /* ASSISTANT MESSAGE CARD (Image 3) */
                    <div className="w-full space-y-3 max-w-full">
                      {/* Assistant Text Response */}
                      <div className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans pr-1">
                        {language === 'ta' && msg.tamilText ? (
                          <div className="space-y-1.5">
                            <div>{msg.tamilText}</div>
                            {msg.text && msg.text !== msg.tamilText && (
                              <div className="text-[11px] text-neutral-400 pt-0.5">{msg.text}</div>
                            )}
                          </div>
                        ) : (
                          <div>{msg.text || msg.tamilText}</div>
                        )}
                      </div>

                      {/* Quick Interactive Shortcuts if greeting */}
                      {(msg.intent === 'greeting' || msg.text.includes("I'm VoiceCart AI")) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <button
                            onClick={() => handleSendMessage('Chicken biryani under ₹200')}
                            className="px-2.5 py-1.5 bg-[#182032] hover:bg-[#202c46] active:scale-95 text-amber-300 border border-amber-500/30 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span>🍛</span>
                            <span>பிரியாணி ₹200-க்குள் (Biryani)</span>
                          </button>
                          <button
                            onClick={() => handleSendMessage('Milk, bread, and eggs')}
                            className="px-2.5 py-1.5 bg-[#14261d] hover:bg-[#1b3628] active:scale-95 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span>🥛</span>
                            <span>பால் & முட்டை (Groceries)</span>
                          </button>
                          <button
                            onClick={() => handleSendMessage('Compare the three')}
                            className="px-2.5 py-1.5 bg-[#201c34] hover:bg-[#2c2648] active:scale-95 text-purple-300 border border-purple-500/30 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span>⚖️</span>
                            <span>விலை ஒப்பீடு (Compare)</span>
                          </button>
                          <button
                            onClick={() => handleSendMessage('Where is my order?')}
                            className="px-2.5 py-1.5 bg-[#152336] hover:bg-[#1d3048] active:scale-95 text-sky-300 border border-sky-500/30 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span>🚚</span>
                            <span>ஆர்டர் எங்கே? (Track)</span>
                          </button>
                        </div>
                      )}

                      {/* Out of scope guardrail banner if refused */}
                      {msg.guardrailRefused && (
                        <div className="bg-[#2A181A] border border-rose-800/60 rounded-xl p-2.5 text-xs text-rose-200 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-rose-300">
                            <span>🛡️</span>
                            <span>ONDC வரம்பு (Commerce Policy Notice)</span>
                          </div>
                          <p className="text-[11px] text-neutral-300">
                            Food restaurants, bakeries & groceries are active on ONDC.
                          </p>
                        </div>
                      )}

                      {/* INLINE LIVE LEAFLET MAP & NEARBY PRODUCTS */}
                      {msg.places && msg.places.length > 0 && (
                        <div className="w-full pt-1">
                          <ChatMapCard
                            places={msg.places}
                            locality={currentLocality}
                            onSelectPlace={(place) => {
                              showToast(`Selected: ${place.name}`);
                              handleSendMessage(`Tell me more about ${place.name} at ${place.address}`);
                            }}
                            onCheckLocation={(detectedLocality) => {
                              onLocalityChange(detectedLocality);
                              handleSendMessage(`Check popular stores and products around ${detectedLocality}`);
                            }}
                            onAddToCart={(prod) => {
                              onAddToCart(prod, 1);
                              showToast(`Added ${prod.name} to Cart`);
                              soundEffects.playOrderSuccess();
                            }}
                            likedProductIds={likedProductIds}
                            onToggleLikeProduct={toggleLikeProduct}
                            onShowToast={showToast}
                          />
                        </div>
                      )}

                      {/* PRODUCT CARDS (When Food / Grocery is searched) */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="text-[11px] font-bold text-neutral-400 flex items-center justify-between">
                            <span>உடனடி ONDC ஆர்டர்கள் (In-Stock Items):</span>
                            <span className="text-amber-400 font-mono text-[10px]">
                              {msg.products.length} ready
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {msg.products.map((prod) => (
                              <Card
                                key={prod.id}
                                className="p-2.5 bg-[#121522] border-neutral-800/90 flex gap-3 shadow-xs hover:border-amber-500/30 transition-all rounded-xl"
                              >
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-neutral-800 border border-neutral-700/60"
                                />
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between gap-1.5">
                                      <div className="font-bold text-xs text-white truncate">
                                        {prod.name}
                                      </div>
                                      <Badge variant="ondc" className="shrink-0 text-[8px] py-0 px-1.5">
                                        ONDC
                                      </Badge>
                                    </div>
                                    <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                                      {prod.merchantName}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/[0.04]">
                                    <span className="font-display font-bold text-xs text-amber-400 font-mono">
                                      ₹{prod.price}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => toggleLikeProduct(prod)}
                                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                          likedProductIds.has(prod.id)
                                            ? 'bg-rose-500/20 text-rose-500 border-rose-500/40'
                                            : 'bg-[#181B28] text-neutral-400 hover:text-rose-400 border-neutral-700/70'
                                        }`}
                                        title={likedProductIds.has(prod.id) ? 'Unlike' : 'Like product'}
                                      >
                                        <Heart
                                          className={`w-3.5 h-3.5 ${
                                            likedProductIds.has(prod.id) ? 'fill-rose-500 text-rose-500' : ''
                                          }`}
                                        />
                                      </button>
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => {
                                          onAddToCart(prod, 1);
                                          showToast(`Added ${prod.name} to Cart`);
                                          soundEffects.playOrderSuccess();
                                        }}
                                        className="h-7 px-2.5 text-[10px] font-bold shadow-xs"
                                      >
                                        <span>+ கூடையில் சேர்</span>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* COMPARISON CARD ("Compare the three", "Which is cheapest?") */}
                      {msg.comparison && (
                        <div className="bg-[#121522] rounded-xl p-3 border border-indigo-900/40 shadow-lg space-y-2.5">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                              <Layers className="w-3.5 h-3.5 text-indigo-400" />
                              <span>உணவகங்கள் ஒப்பீடு (Restaurant Comparison)</span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">ONDC RET11</span>
                          </div>

                          {/* Comparison Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px]">
                              <thead>
                                <tr className="text-neutral-400 border-b border-neutral-800/80">
                                  <th className="pb-1.5 font-medium">Restaurant</th>
                                  <th className="pb-1.5 font-medium text-center">Rating</th>
                                  <th className="pb-1.5 font-medium text-center">Distance</th>
                                  <th className="pb-1.5 font-medium text-right">Price</th>
                                  <th className="pb-1.5 font-medium text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-850">
                                {msg.comparison.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-neutral-800/30">
                                    <td className="py-2 pr-2 font-medium text-white truncate max-w-[110px]">
                                      {row.name}
                                    </td>
                                    <td className="py-2 px-1 text-center">
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        {row.rating}
                                      </span>
                                    </td>
                                    <td className="py-2 px-1 text-center text-neutral-300 font-mono text-[10px]">
                                      {row.distance}
                                    </td>
                                    <td className="py-2 pl-1 text-right text-emerald-400 font-bold font-mono">
                                      {row.price}
                                    </td>
                                    <td className="py-2 pl-2 text-right">
                                      <button
                                        onClick={() => {
                                          handleSendMessage(`I want one chicken biryani from ${row.name}`);
                                        }}
                                        className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-semibold cursor-pointer transition-colors"
                                      >
                                        Order
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Highlight takeaway callout */}
                          {msg.comparison.highlight && (
                            <div className="bg-[#171B2B] rounded-lg p-2 border border-neutral-800 text-[11px] text-neutral-300 flex items-start gap-2">
                              <span className="text-amber-400 font-bold text-xs shrink-0">💡</span>
                              <span>{language === 'ta' && msg.comparison.tamilHighlight ? msg.comparison.tamilHighlight : msg.comparison.highlight}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* BASKET CARD (Multi-Item Shopping & Hyperlocal Grocery Basket) */}
                      {msg.basket && (
                        <div className="bg-[#121624] rounded-xl p-3 border border-emerald-900/40 shadow-lg space-y-2.5">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{language === 'ta' && msg.basket.tamilTitle ? msg.basket.tamilTitle : msg.basket.title}</span>
                            </div>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                              {msg.basket.items.length} items
                            </span>
                          </div>

                          {/* Items List */}
                          <div className="space-y-1.5">
                            {msg.basket.items.map((it, iIdx) => (
                              <div key={iIdx} className="flex items-center justify-between text-[11px] bg-[#171C2E] px-2.5 py-1.5 rounded-lg border border-neutral-800">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded bg-neutral-800 text-neutral-300 flex items-center justify-center text-[10px] font-bold">
                                    {it.quantity}×
                                  </span>
                                  <span className="text-white font-medium">{it.name}</span>
                                </div>
                                <span className="font-mono text-emerald-400 font-bold">₹{it.totalPrice}</span>
                              </div>
                            ))}
                          </div>

                          {/* Financial breakdown */}
                          <div className="border-t border-neutral-800/80 pt-2 space-y-1 text-[10px] text-neutral-400 font-mono">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span>₹{msg.basket.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ONDC Hyperlocal Delivery</span>
                              <span>₹{msg.basket.delivery}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Taxes (GST)</span>
                              <span>₹{msg.basket.tax}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-white border-t border-neutral-800 pt-1">
                              <span>Grand Total</span>
                              <span className="text-amber-400">₹{msg.basket.total}</span>
                            </div>
                          </div>

                          {/* Basket Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                showToast('Added entire basket to cart!');
                                soundEffects.playOrderSuccess();
                                onAddToCart(MOCK_PRODUCTS[0], 1);
                              }}
                              className="flex-1 py-1.5 bg-[#1C2337] hover:bg-[#252E47] text-neutral-200 border border-neutral-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>கூடையில் சேர்</span>
                            </button>
                            <button
                              onClick={() => {
                                handleSendMessage(`Pay ${msg.basket?.total}`);
                              }}
                              className="flex-1 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay ₹{msg.basket.total} via UPI</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CHECKOUT CARD (Direct Conversational Checkout) */}
                      {msg.checkoutCard && (
                        <div className="bg-[#121622] rounded-xl p-3 border border-amber-500/40 shadow-xl space-y-2.5">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                              <span>நேரடி ஆர்டர் (Direct Order Summary)</span>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400">
                              #{msg.checkoutCard.orderId}
                            </span>
                          </div>

                          <div className="text-[11px] text-neutral-300 font-medium">
                            {msg.checkoutCard.merchantName}
                          </div>

                          {/* Item list */}
                          <div className="space-y-1">
                            {msg.checkoutCard.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between text-xs py-1 border-b border-neutral-800/60">
                                <span className="text-white">
                                  {it.name} <span className="text-neutral-400 font-mono">× {it.quantity}</span>
                                </span>
                                <span className="font-mono text-amber-400 font-bold">₹{it.price * it.quantity}</span>
                              </div>
                            ))}
                          </div>

                          {/* Financial breakdown */}
                          <div className="space-y-1 text-[10px] text-neutral-400 font-mono">
                            <div className="flex justify-between">
                              <span>Delivery Fee</span>
                              <span>₹{msg.checkoutCard.delivery}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Taxes</span>
                              <span>₹{msg.checkoutCard.tax}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-white border-t border-neutral-800 pt-1.5">
                              <span>Amount Payable</span>
                              <span className="text-emerald-400 text-sm">₹{msg.checkoutCard.total}</span>
                            </div>
                          </div>

                          {/* Payment status / Action button */}
                          {paidCheckoutIds[msg.checkoutCard.orderId] ? (
                            <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-lg p-2.5 text-center space-y-1.5">
                              <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>பணம் பெறப்பட்டது (Paid & Confirmed!)</span>
                              </div>
                              <div className="text-[10px] text-neutral-300 font-mono">
                                ICICI UPI Ref: UPI/8294719203
                              </div>
                              <button
                                onClick={() => {
                                  handleSendMessage('Where is my order?');
                                }}
                                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 mt-1"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Track Order Status</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                const ordId = msg.checkoutCard?.orderId || 'VC10482';
                                setPaidCheckoutIds((prev) => ({ ...prev, [ordId]: true }));
                                soundEffects.playOrderSuccess();
                                showToast(`Paid ₹${msg.checkoutCard?.total} via UPI! Order confirmed.`);

                                if (onOrderPlaced) {
                                  onOrderPlaced({
                                    id: ordId,
                                    merchantId: 'mer_abc_hotel',
                                    merchantName: msg.checkoutCard?.merchantName || 'ABC Hotel',
                                    items: [{ product: MOCK_PRODUCTS[0], quantity: 1 }],
                                    subtotal: msg.checkoutCard?.subtotal || 180,
                                    deliveryFee: msg.checkoutCard?.delivery || 30,
                                    tax: msg.checkoutCard?.tax || 12,
                                    convenienceFee: 0,
                                    total: msg.checkoutCard?.total || 222,
                                    paymentMethod: 'UPI',
                                    paymentStatus: 'PAID',
                                    orderStatus: 'OUT_FOR_DELIVERY',
                                    statusTimeline: [
                                      { status: 'PLACED', timestamp: new Date().toLocaleTimeString(), description: 'Order confirmed' },
                                      { status: 'ACCEPTED', timestamp: new Date().toLocaleTimeString(), description: 'Restaurant accepted' },
                                      { status: 'PREPARING', timestamp: new Date().toLocaleTimeString(), description: 'Food preparing' },
                                      { status: 'RIDER_ASSIGNED', timestamp: new Date().toLocaleTimeString(), description: 'Saravanan K assigned' },
                                      { status: 'OUT_FOR_DELIVERY', timestamp: new Date().toLocaleTimeString(), description: 'Out for delivery' },
                                    ],
                                    deliveryAddress: { name: 'Customer', addressLine: 'Gandhipuram 4th St', locality: currentLocality, pincode: '641012', phone: '+91 98401 23456' },
                                    rider: { name: 'Saravanan K', phone: '+91 98421 82910', lat: 11.02, lng: 76.965 },
                                    createdAt: new Date().toLocaleTimeString(),
                                    etaMinutes: 18,
                                  });
                                }
                              }}
                              className="w-full py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs rounded-lg shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>Pay ₹{msg.checkoutCard.total} via UPI</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* ORDER TRACKING CARD (Live 5-step status) */}
                      {msg.orderTrackingCard && (
                        <div className="bg-[#111420] rounded-xl p-3 border border-sky-900/40 shadow-xl space-y-3">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                              <Truck className="w-3.5 h-3.5 text-sky-400" />
                              <span>நேரடி ஆர்டர் நிலை (Live Order Tracking)</span>
                            </div>
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                              ETA {msg.orderTrackingCard.etaMinutes} min
                            </span>
                          </div>

                          <div>
                            <div className="text-xs font-bold text-white">
                              {msg.orderTrackingCard.merchantName}
                            </div>
                            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{language === 'ta' && msg.orderTrackingCard.tamilStatusLabel ? msg.orderTrackingCard.tamilStatusLabel : msg.orderTrackingCard.statusLabel}</span>
                            </div>
                          </div>

                          {/* 5-step timeline */}
                          <div className="space-y-1.5 py-1">
                            {msg.orderTrackingCard.steps.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-2 text-[11px]">
                                {step.completed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : step.current ? (
                                  <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 flex items-center justify-center shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                  </span>
                                ) : (
                                  <span className="w-3.5 h-3.5 rounded-full border border-neutral-700 shrink-0" />
                                )}
                                <span className={step.completed ? 'text-neutral-200' : step.current ? 'text-amber-300 font-bold' : 'text-neutral-500'}>
                                  {language === 'ta' && step.tamilLabel ? step.tamilLabel : step.label}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Rider and Map action */}
                          <div className="flex items-center gap-2 pt-1 border-t border-neutral-800">
                            {msg.orderTrackingCard.riderPhone && (
                              <a
                                href={`tel:${msg.orderTrackingCard.riderPhone}`}
                                className="flex-1 py-1.5 bg-[#171D2D] hover:bg-[#20283D] text-sky-300 border border-sky-900/50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Call Rider</span>
                              </a>
                            )}
                            <button
                              onClick={() => {
                                const matched = orders.find((o) => o.id === msg.orderTrackingCard?.orderId) || orders[0];
                                if (matched) {
                                  onOpenOrderTracking(matched);
                                  showToast('Opening Live ONDC Telemetry Map');
                                }
                              }}
                              className="flex-1 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>Live Map View</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* REORDER CARD */}
                      {msg.reorderCard && (
                        <div className="bg-[#141724] rounded-xl p-3 border border-purple-900/40 shadow-lg space-y-2.5">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                              <span>மீண்டும் அதே ஆர்டர் (Reorder from Yesterday)</span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              #{msg.reorderCard.prevOrderId}
                            </span>
                          </div>

                          <div className="text-[11px] text-white font-medium">
                            {msg.reorderCard.merchantName}
                          </div>

                          <div className="space-y-1">
                            {msg.reorderCard.items.map((it, rIdx) => (
                              <div key={rIdx} className="flex justify-between text-xs text-neutral-300">
                                <span>{it.name} × {it.quantity}</span>
                                <span className="font-mono text-purple-300">₹{it.price * it.quantity}</span>
                              </div>
                            ))}
                          </div>

                          <div className="border-t border-neutral-800 pt-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Total: ₹{msg.reorderCard.total}</span>
                            <button
                              onClick={() => {
                                handleSendMessage(`Order this for ${msg.reorderCard?.total}`);
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-md flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reorder Now — ₹{msg.reorderCard.total}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* FAVORITE STATUS */}
                      {msg.favoriteStatus && (
                        <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-2.5 flex items-center gap-2 text-xs text-rose-200">
                          <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" />
                          <div>
                            <span className="font-bold">{msg.favoriteStatus.merchantName}</span> விருப்பப் பட்டியலில் சேமிக்கப்பட்டது (Saved to Favorites)
                          </div>
                        </div>
                      )}

                      {/* CUSTOMER SUPPORT & HUMAN ESCALATION */}
                      {msg.supportCase && (
                        <div className="bg-[#161822] rounded-xl p-3 border border-amber-600/40 shadow-lg space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                            <Headphones className="w-3.5 h-3.5 text-amber-400" />
                            <span>வாடிக்கையாளர் ஆதரவு (Customer Support Desk)</span>
                          </div>
                          <p className="text-[11px] text-neutral-300 leading-relaxed">
                            {msg.supportCase.statusText}
                          </p>

                          {connectedAgentCases[msg.id] ? (
                            <div className="bg-[#1A2030] rounded-lg p-2.5 border border-sky-800 text-xs text-sky-200 space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                                <UserCheck className="w-4 h-4" />
                                <span>Support Executive Priya connected</span>
                              </div>
                              <p className="text-[11px] text-neutral-300">
                                "வணக்கம்! உங்கள் ஆர்டர் #VC10482-ஐ கண்காணித்து வருகிறேன். ரைடர் சரவணன் கிராஸ் கட் ரோடு மேம்பாலத்தைக் கடந்துவிட்டார். இன்னும் 8 நிமிடங்களில் உங்களை அடைவார்."
                              </p>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setConnectedAgentCases((prev) => ({ ...prev, [msg.id]: true }));
                                showToast('Connected with Support Executive Priya');
                                soundEffects.playOrderSuccess();
                              }}
                              className="w-full py-1.5 bg-[#23273A] hover:bg-[#2C324B] text-amber-300 border border-amber-600/50 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                              <span>உதவியாளரிடம் பேச (Connect with Human Agent)</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* BOTTOM ACTION FOOTER ON AI RESPONSE (matching Image 3!) */}
                      <div className="flex items-center gap-2 pt-1 text-neutral-400 text-xs">
                        {/* Thumbs up */}
                        <button
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer ${
                            likedMap[msg.id] === 'up' ? 'text-amber-400' : 'text-neutral-400'
                          }`}
                          title="Thumbs up"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Thumbs down */}
                        <button
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`p-1.5 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer ${
                            likedMap[msg.id] === 'down' ? 'text-rose-400' : 'text-neutral-400'
                          }`}
                          title="Thumbs down"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Voice Readout */}
                        <button
                          onClick={() => {
                            if (msg.spokenText || msg.text) {
                              speakText(msg.spokenText || msg.text, language === 'ta' ? 'ta' : 'en');
                              showToast('குரல் மூலம் வாசிக்கப்படுகிறது...');
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Listen aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Copy */}
                        <button
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Indian Flag Sources Badge (from Image 3!) */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="flex items-center gap-1 bg-[#141722] border border-neutral-800 px-2 py-0.5 rounded-full text-[9px] text-neutral-300 ml-auto">
                            <span>🇮🇳</span>
                            <span className="font-semibold">Sources</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI Typing / Processing State */}
            {isProcessing && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#131622] border border-neutral-800 text-xs text-neutral-300 w-fit animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Checking nearby now. Just a second...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* 5. BOTTOM MOBILE DOCK (Fixed at bottom with Safe Area) */}
          <div className="bg-[#0E1017] border-t border-neutral-800/80 p-2.5 space-y-2 shrink-0 z-20 shadow-lg">
            {/* Quick Prompt Pill Carousel above input (Image 3) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                onClick={handleCheckCurrentLocation}
                disabled={isLocatingUser}
                className="px-2.5 py-1 bg-gradient-to-r from-sky-950/80 to-indigo-950/80 hover:from-sky-900 hover:to-indigo-900 text-sky-200 border border-sky-600/40 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 font-semibold flex items-center gap-1 shadow-xs active:scale-95"
              >
                {isLocatingUser ? (
                  <Loader2 className="w-3 h-3 text-sky-300 animate-spin" />
                ) : (
                  <Crosshair className="w-3 h-3 text-sky-400" />
                )}
                <span>📍 Check location & nearby products</span>
              </button>
              <button
                onClick={() => handleSendMessage('Compare the three')}
                className="px-2.5 py-1 bg-[#141724] hover:bg-[#1C2032] text-indigo-300 border border-indigo-900/50 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 font-medium active:scale-95 shadow-xs"
              >
                ⚖️ "Compare the three"
              </button>
              <button
                onClick={() => handleSendMessage('I need milk, bread, and eggs for home')}
                className="px-2.5 py-1 bg-[#141724] hover:bg-[#1C2032] text-emerald-300 border border-emerald-900/50 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 font-medium active:scale-95 shadow-xs"
              >
                🥛 "Milk, bread, and eggs"
              </button>
              <button
                onClick={() => handleSendMessage('Chicken biryani under ₹200')}
                className="px-2.5 py-1 bg-[#141724] hover:bg-[#1C2032] text-amber-300 border border-amber-900/50 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 font-medium active:scale-95 shadow-xs"
              >
                🍛 "Biryani under ₹200"
              </button>
              <button
                onClick={() => handleSendMessage('Where is my order?')}
                className="px-2.5 py-1 bg-[#141724] hover:bg-[#1C2032] text-sky-300 border border-sky-900/50 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 font-medium active:scale-95 shadow-xs"
              >
                🚚 "Where is my order?"
              </button>
              <button
                onClick={() => handleSendMessage('Order what I had yesterday')}
                className="px-2.5 py-1 bg-[#141724] hover:bg-[#1C2032] text-purple-300 border border-purple-900/50 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 font-medium active:scale-95 shadow-xs"
              >
                🔁 "Order what I had yesterday"
              </button>
              <button
                onClick={() => handleSendMessage('My order is late, can you check with rider?')}
                className="px-2.5 py-1 bg-[#141724] hover:bg-[#1C2032] text-rose-300 border border-rose-900/50 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 font-medium active:scale-95 shadow-xs"
              >
                🎧 "My order is late"
              </button>
              <button
                onClick={() => handleSendMessage('பிரியாணி எங்க நல்லா இருக்கும்?')}
                className="px-2.5 py-1 bg-[#141724] hover:bg-[#1C2032] text-neutral-300 border border-neutral-800 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95"
              >
                "பிரியாணி (Biryani)"
              </button>
              <button
                onClick={() => handleSendMessage('ஆவின் பால் 2 பாக்கெட்')}
                className="px-2.5 py-1 bg-[#141724] hover:bg-[#1C2032] text-neutral-300 border border-neutral-800 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95"
              >
                "ஆவின் பால்"
              </button>
              <button
                onClick={() => handleSendMessage('Ah, is there any BMI nearby')}
                className="px-2.5 py-1 bg-[#141724] hover:bg-[#1C2032] text-neutral-300 border border-neutral-800 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95"
              >
                "BMI nearby"
              </button>
            </div>

            {/* Main Input Row (Image 3) */}
            <div className="flex items-center gap-2">
              {/* Plus (+) Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-xl bg-[#141724] hover:bg-[#1E2235] border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
                title="Add options"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Text Input with shadcn focus ring */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                  placeholder={
                    language === 'ta'
                      ? 'கேளுங்கள் அல்லது தட்டச்சு செய்க...'
                      : 'Ask anything or type message...'
                  }
                  className="w-full bg-[#12141F] border border-neutral-800 text-white placeholder:text-neutral-500 rounded-xl pl-3.5 pr-8 py-2 text-xs focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
                  id="mobile-voice-input"
                />
              </div>

              {/* Mic Button */}
              <button
                onClick={toggleListening}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm active:scale-95 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/30'
                    : 'bg-[#141724] hover:bg-[#1E2235] text-amber-400 border border-neutral-800'
                }`}
                title="Voice mic"
                id="mobile-mic-btn"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Green Circular/Rounded Send Button */}
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim()}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm active:scale-95 ${
                  inputText.trim()
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 font-black shadow-emerald-500/20'
                    : 'bg-[#141724] text-neutral-600 border border-neutral-800 cursor-not-allowed'
                }`}
                title="Send"
                id="mobile-send-btn"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
