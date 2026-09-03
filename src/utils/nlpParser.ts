import { ParsedVoiceIntent } from '../types';

// Normalization maps
const TAMIL_NUMBER_MAP: Record<string, number> = {
  'ஒன்று': 1,
  'ஒன்னு': 1,
  'ஒரு': 1,
  'oru': 1,
  'onnu': 1,
  'one': 1,
  '1': 1,
  'இரண்டு': 2,
  'ரெண்டு': 2,
  'rendu': 2,
  'two': 2,
  '2': 2,
  'மூன்று': 3,
  'மூணு': 3,
  'moonu': 3,
  'three': 3,
  '3': 3,
  'நான்கு': 4,
  'நாலு': 4,
  'naalu': 4,
  'four': 4,
  '4': 4,
  'ஐந்து': 5,
  'அஞ்சு': 5,
  'anju': 5,
  'five': 5,
  '5': 5,
};

const FOOD_SYNONYMS: Record<string, string> = {
  'பிரியாணி': 'biryani',
  'biriyani': 'biryani',
  'briyani': 'biryani',
  'biryani': 'biryani',
  'புரோட்டா': 'parotta',
  'பரோட்டா': 'parotta',
  'barotta': 'parotta',
  'parotta': 'parotta',
  'தோசை': 'dosa',
  'ரோஸ்ட்': 'dosa',
  'roast': 'dosa',
  'dosa': 'dosa',
  'dhosa': 'dosa',
  'சிக்கன்': 'chicken',
  'chicken': 'chicken',
  'மட்டன்': 'mutton',
  'mutton': 'mutton',
  'காபி': 'coffee',
  'coffee': 'coffee',
  'சாப்பாடு': 'meals',
  'meals': 'meals',
  'உணவு': 'food',
  'சாப்பாடு வேணும்': 'food',
};

const BAKERY_SYNONYMS: Record<string, string> = {
  'பிரெட்': 'bread',
  'ரொட்டி': 'bread',
  'bread': 'bread',
  'பப்ஸ்': 'egg puff',
  'puff': 'egg puff',
  'puffs': 'egg puff',
  'கேக்': 'cake',
  'cake': 'cake',
  'டீ': 'tea',
  'tea': 'tea',
  'சாயா': 'tea',
  'chai': 'tea',
};

const GROCERY_SYNONYMS: Record<string, string> = {
  'பால்': 'milk',
  'paal': 'milk',
  'milk': 'milk',
  'தயிர்': 'curd',
  'thayir': 'curd',
  'curd': 'curd',
  'முட்டை': 'eggs',
  'muttai': 'eggs',
  'egg': 'eggs',
  'eggs': 'eggs',
  'அரிசி': 'rice',
  'arisi': 'rice',
  'rice': 'rice',
  'பொன்னி': 'rice',
  'மளிகை': 'grocery',
  'grocery': 'grocery',
  'groceries': 'grocery',
  'காய்கறி': 'vegetables',
};

const DISCOVERY_SYNONYMS: Record<string, string> = {
  'பார்மசி': 'pharmacy',
  'மருந்தகம்': 'pharmacy',
  'pharmacy': 'pharmacy',
  'medical': 'pharmacy',
  'மருந்து': 'pharmacy',
  'ஏடிஎம்': 'atm',
  'atm': 'atm',
  'bank': 'bank',
};

// Forbidden out-of-scope keywords for programmatic guardrail (Section 2 & 11)
const OUT_OF_SCOPE_KEYWORDS = [
  'phone',
  'mobile',
  'iphone',
  'samsung',
  'laptop',
  'computer',
  'tv',
  'television',
  'shoes',
  'shirt',
  'pant',
  'dress',
  'clothes',
  'taxi',
  'cab',
  'auto ride',
  'bike ride',
  'flight',
  'train ticket',
  'loan',
  'insurance',
  'mutual fund',
  'doctor consultation',
  'போன்',
  'மொபைல்',
  'துணி',
  'வண்டி',
  'டாக்ஸி',
];

export function parseTamilQuery(rawQuery: string): ParsedVoiceIntent {
  const normalized = rawQuery.toLowerCase().trim();

  // 1. Guardrail Check: Out-of-Scope Detection
  for (const keyword of OUT_OF_SCOPE_KEYWORDS) {
    if (normalized.includes(keyword)) {
      return {
        intent: 'scope_refused',
        rawTranscript: rawQuery,
        spokenResponseTamil:
          'VoiceCart இந்த நேரத்தில் சமையல் உணவகங்கள் மற்றும் மளிகைக் கடைகளுக்கு மட்டுமே துணை புரிகிறது. அருகிலுள்ள உணவகங்களையோ பல்பொருள் அங்காடிகளையோ தேட விரும்புகிறீர்களா?',
        spokenResponseTanglish:
          'VoiceCart ippo food, bakery matrum groceries mattum dhan help pannum. Pakkathula irukura restaurants illa grocery kadaigal paarkalaama?',
        spokenResponseEnglish:
          'VoiceCart currently only helps with nearby restaurants, bakeries, or groceries. Would you like something to eat or buy at a grocery store?',
        guardrailTriggered: true,
        guardrailReason: `Unsupported category: detected "${keyword}". Only RET10 (groceries), RET11 (restaurants), and bakeries are supported.`,
        confidence: 0.99,
      };
    }
  }

  // 2. STT Check: Low confidence / empty
  if (!normalized || normalized.length < 3) {
    return {
      intent: 'general_help',
      rawTranscript: rawQuery,
      spokenResponseTamil: 'நான் புரிஞ்சிக்க மாட்டேன், மிகச் சில வார்த்தைகளில் தயவுசெய்து மீண்டும் பேசுங்கள்.',
      spokenResponseTanglish: 'Enakku sariya puriyala, konjam thirumba pesunga.',
      spokenResponseEnglish: "I didn't catch that. Could you please repeat more slowly?",
      confidence: 0.2,
    };
  }

  // 3. Status / Tracking intent
  if (
    normalized.includes('order status') ||
    normalized.includes('track') ||
    normalized.includes('order எங்க') ||
    normalized.includes('enge') ||
    normalized.includes('rider') ||
    normalized.includes('வந்திட்டாரா') ||
    normalized.includes('delivery')
  ) {
    return {
      intent: 'track_order',
      rawTranscript: rawQuery,
      spokenResponseTamil: 'உங்கள் ஆர்டர் டெலிவரிக்கு புறப்பட்டுவிட்டது. டெலிவரி பார்ட்னர் 2 கி.மீ தொலைவில் உள்ளார், வர 12 நிமிடங்கள் ஆகும்.',
      spokenResponseTanglish: 'Unga order out for delivery aayiruchu. Rider 2 km thoorathula irukkaaru, ETA 12 minutes.',
      spokenResponseEnglish: 'Your order is out for delivery. Rider is 2 km away, estimated time 12 minutes.',
      confidence: 0.95,
    };
  }

  // 4. Dispute / IGM intent (Section 11 & 13)
  if (
    normalized.includes('complaint') ||
    normalized.includes('புகார்') ||
    normalized.includes('wrong item') ||
    normalized.includes('தவறான') ||
    normalized.includes('cold') ||
    normalized.includes('பிரச்சனை')
  ) {
    return {
      intent: 'file_dispute',
      rawTranscript: rawQuery,
      spokenResponseTamil: 'மன்னிக்கவும்! ONDC சர்வீஸ் மூலம் புகார் பதியப்பட்டது. உங்கள் ₹50 ரீஃபண்ட் உடனடியாக கணக்கில் சேர்க்கப்பட்டது.',
      spokenResponseTanglish: 'Kshamikanum! ONDC IGM moolama complaint register aayiruchu. Unga ₹50 refund settle aagiruchu.',
      spokenResponseEnglish: 'Apologies for the issue! A complaint has been logged with ONDC IGM and ₹50 refund has been initiated.',
      confidence: 0.92,
    };
  }

  // 5. Quantity Extraction
  let extractedQty = 1;
  for (const [token, qty] of Object.entries(TAMIL_NUMBER_MAP)) {
    if (normalized.includes(token)) {
      extractedQty = qty;
      break;
    }
  }

  // Extract explicit digit quantity
  const digitMatch = normalized.match(/\b(\d+)\b/);
  if (digitMatch && parseInt(digitMatch[1], 10) > 0 && parseInt(digitMatch[1], 10) <= 20) {
    extractedQty = parseInt(digitMatch[1], 10);
  }

  // 6. Location Extraction (Coimbatore)
  let extractedLocation = 'Gandhipuram';
  if (normalized.includes('rs puram') || normalized.includes('ஆர்.எஸ்')) extractedLocation = 'RS Puram';
  else if (normalized.includes('peelamedu') || normalized.includes('பீளமேடு')) extractedLocation = 'Peelamedu';
  else if (normalized.includes('saibaba') || normalized.includes('சாய்பாபா')) extractedLocation = 'Saibaba Colony';
  else if (normalized.includes('town hall') || normalized.includes('டவுன் ஹால்')) extractedLocation = 'Town Hall';
  else if (normalized.includes('gandhipuram') || normalized.includes('காந்திபுரம்')) extractedLocation = 'Gandhipuram';

  // 7. Discovery Mode: Generic places / POI (Section 2)
  for (const [key, category] of Object.entries(DISCOVERY_SYNONYMS)) {
    if (normalized.includes(key)) {
      return {
        intent: 'place_discovery',
        item: category,
        location: extractedLocation,
        rawTranscript: rawQuery,
        spokenResponseTamil: `${extractedLocation} பகுதியில் 24 மணி நேர அப்பல்லோ பார்மசி அருகிலுள்ளது. விவரங்கள் திரையில் காட்டப்பட்டுள்ளன.`,
        spokenResponseTanglish: `${extractedLocation} pakkathula 24/7 Apollo Pharmacy irukku. Details screen-la kaatren.`,
        spokenResponseEnglish: `Found Apollo Pharmacy open 24/7 near ${extractedLocation}. Details are shown on screen.`,
        confidence: 0.9,
      };
    }
  }

  // 8. Bakery check
  for (const [key, itemVal] of Object.entries(BAKERY_SYNONYMS)) {
    if (normalized.includes(key)) {
      return {
        intent: 'search_bakery',
        item: itemVal,
        quantity: extractedQty,
        location: extractedLocation,
        rawTranscript: rawQuery,
        spokenResponseTamil: `${extractedLocation} கே.ஆர் பேக்ஸ் கடையில் புதிய ${itemVal === 'bread' ? 'மில்க் பிரெட்' : itemVal === 'egg puff' ? 'முட்டை பப்ஸ்' : 'கேக்'} கிடைக்கிறது. ஆர்டர் செய்ய கார்ட்டில் சேர்க்கவா?`,
        spokenResponseTanglish: `${extractedLocation} KR Bakes-la fresh ${itemVal} irukku. Cart-la add pannalama?`,
        spokenResponseEnglish: `KR Bakes in ${extractedLocation} has fresh ${itemVal}. Would you like to add it to your cart?`,
        confidence: 0.94,
      };
    }
  }

  // 9. Groceries check (RET10)
  for (const [key, itemVal] of Object.entries(GROCERY_SYNONYMS)) {
    if (normalized.includes(key)) {
      return {
        intent: 'search_grocery',
        item: itemVal,
        quantity: extractedQty,
        location: extractedLocation,
        rawTranscript: rawQuery,
        spokenResponseTamil: `${extractedLocation} டெய்லி பிரெஷ் மளிகையில் ஆவின் பால் மற்றும் கெட்டி தயிர் இருப்பு உறுதி செய்யப்பட்டுள்ளது.`,
        spokenResponseTanglish: `${extractedLocation} Daily Fresh-la Aavin paal matrum thayir stock confirm aagirukku.`,
        spokenResponseEnglish: `Found confirmed stock for fresh dairy & groceries near ${extractedLocation}. Added to recommendations.`,
        confidence: 0.93,
      };
    }
  }

  // 10. Food & Restaurant check (RET11)
  let matchedFoodItem = 'chicken biryani';
  let isFoundFood = false;

  for (const [key, itemVal] of Object.entries(FOOD_SYNONYMS)) {
    if (normalized.includes(key)) {
      matchedFoodItem = itemVal;
      isFoundFood = true;
      break;
    }
  }

  if (isFoundFood || normalized.includes('order') || normalized.includes('ஆர்டர்') || normalized.includes('hotel') || normalized.includes('ஹோட்டல்')) {
    const isVeg = normalized.includes('veg') || normalized.includes('சைவம்') || normalized.includes('தோசை') || normalized.includes('dosa');
    
    return {
      intent: 'search_food',
      item: matchedFoodItem,
      quantity: extractedQty,
      location: extractedLocation,
      veg: isVeg,
      rawTranscript: rawQuery,
      spokenResponseTamil: `${extractedLocation} பகுதியில் ஏபிசி ஹோட்டல் மற்றும் ஆசிப் பிரியாணியில் ${matchedFoodItem === 'biryani' ? 'சிக்கன் பிரியாணி ₹180-க்கு' : matchedFoodItem === 'dosa' ? 'நெய் ரோஸ்ட் ₹95-க்கு' : 'சுவையான உணவு'} கிடைக்கிறது.`,
      spokenResponseTanglish: `${extractedLocation} pakkathula ABC Hotel-la ${matchedFoodItem} kidaikkudhu. Add to cart pannalama?`,
      spokenResponseEnglish: `ABC Hotel near ${extractedLocation} has ${matchedFoodItem} available for ₹180 (25 min). Would you like to add it to cart?`,
      confidence: 0.96,
    };
  }

  // Default fallback to food search
  return {
    intent: 'search_food',
    item: 'chicken biryani',
    quantity: 1,
    location: extractedLocation,
    rawTranscript: rawQuery,
    spokenResponseTamil: `வணக்கம்! ${extractedLocation} பகுதியில் சூடான உணவுகள் மற்றும் மளிகை பொருட்களை தேடுகிறேன்.`,
    spokenResponseTanglish: `Vanakkam! ${extractedLocation}-la food matrum grocery search panren.`,
    spokenResponseEnglish: `Searching popular food and groceries near ${extractedLocation}.`,
    confidence: 0.8,
  };
}
