import React, { useState } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  CreditCard,
  ShoppingBag,
  Volume2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { WhatsAppMessage, LanguageMode, ProductItem } from '../types';
import { speakText, soundEffects } from '../utils/speechSynthesis';

interface WhatsAppSimulatorProps {
  onAddToCart: (product: ProductItem) => void;
  language: LanguageMode;
  onOpenCart: () => void;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  onAddToCart,
  language,
  onOpenCart,
}) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: 'msg_1',
      sender: 'bot',
      timestamp: '11:40 AM',
      type: 'text',
      text: 'வணக்கம்! VoiceCart AI வாட்ஸ்அப் உதவி மையத்திற்கு வரவேற்கிறோம். 🍗 உணவுகள், 🥐 பேக்கரி அல்லது 🥛 மளிகைப் பொருட்களை வாய்ஸ் மெசேஜ் மூலம் கேட்கலாம்.',
      tamilText:
        'வணக்கம்! VoiceCart AI வாட்ஸ்அப் உதவி மையத்திற்கு வரவேற்கிறோம். 🍗 உணவுகள், 🥐 பேக்கரி அல்லது 🥛 மளிகைப் பொருட்களை வாய்ஸ் மெசேஜ் மூலம் கேட்கலாம்.',
    },
    {
      id: 'msg_2',
      sender: 'user',
      timestamp: '11:41 AM',
      type: 'voice',
      text: 'காந்திபுரத்துல 2 சிக்கன் பிரியாணி வேணும் (Gandhipuram 2 chicken biryani venum)',
      audioDurationSec: 4,
    },
    {
      id: 'msg_3',
      sender: 'bot',
      timestamp: '11:41 AM',
      type: 'template',
      text: 'காந்திபுரத்தில் 2 கடைகளில் சூடான பிரியாணி கிடைக்கிறது:',
      templateData: {
        title: 'ABC Hotel - Gandhipuram',
        subtitle: 'சிக்கன் பிரியாணி (சீரக சம்பா) • ₹180 • 25 min',
        imageUrl:
          'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80',
        items: [
          { title: 'Chicken Biryani (Seeraga Samba)', price: 180, id: 'prod_abc_biryani' },
          { title: 'Madurai Bun Parotta (2 pcs)', price: 40, id: 'prod_abc_parotta' },
        ],
        actions: [
          { label: 'கூடையில் சேர் (Add to Cart)', actionId: 'add_biryani', primary: true },
          { label: 'மெனு பார்க்க (View Menu)', actionId: 'view_menu' },
        ],
      },
    },
    {
      id: 'msg_4',
      sender: 'bot',
      timestamp: '11:42 AM',
      type: 'payment_request',
      text: 'மொத்த தொகை ₹268 (உணவு ₹220 + டெலிவரி ₹30 + ஜிஎஸ்டி ₹18). UPI மூலம் செலுத்தவும்:',
      paymentData: {
        amount: 268,
        upiUri: 'upi://pay?pa=voicecart@oksbi&pn=VoiceCart&am=268.00&cu=INR',
        qrCodeUrl:
          'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=voicecart@oksbi&am=268.00',
        orderId: 'VC10283',
      },
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);

  const handleSendVoiceNote = (promptText: string) => {
    soundEffects.playMicStop();
    const newMsg: WhatsAppMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'voice',
      text: promptText,
      audioDurationSec: 3,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Bot reply logic
    setTimeout(() => {
      if (promptText.toLowerCase().includes('phone') || promptText.toLowerCase().includes('மொபைல்')) {
        const guardrailMsg: WhatsAppMessage = {
          id: `msg_bot_${Date.now()}`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          text: 'VoiceCart இந்த நேரத்தில் சமையல் உணவகங்கள் மற்றும் மளிகைக் கடைகளுக்கு மட்டுமே துணை புரிகிறது. அருகிலுள்ள உணவகங்களையோ பல்பொருள் அங்காடிகளையோ தேட விரும்புகிறீர்களா?',
        };
        setMessages((prev) => [...prev, guardrailMsg]);
        speakText(guardrailMsg.text || '', 'ta');
        return;
      }

      const botReply: WhatsAppMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        text: `உங்கள் கோரிக்கை பெறப்பட்டது: "${promptText}". ONDC நெட்வொர்க் மூலம் சிறந்த விற்பனையாளரை தேர்வு செய்கிறோம்.`,
      };
      setMessages((prev) => [...prev, botReply]);
      speakText(botReply.text || '', 'ta');
    }, 1000);
  };

  const handleSendText = () => {
    if (!inputVal.trim()) return;
    const text = inputVal.trim();
    setInputVal('');

    const newMsg: WhatsAppMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      text,
    };
    setMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      const botReply: WhatsAppMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        text: `ஆர்டர் தகவல் சரிபார்க்கப்பட்டது. மேலும் விவரங்களை திரையில் காண்க.`,
      };
      setMessages((prev) => [...prev, botReply]);
    }, 900);
  };

  return (
    <div className="max-w-2xl mx-auto my-6 bg-[#131317] rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden text-[#E5E5E5]">
      {/* WhatsApp Chat Header */}
      <div className="bg-[#18181D] text-[#F3F4F6] p-3.5 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center font-bold text-sm shadow-md">
              VC
            </div>
            <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#18181D] absolute bottom-0 right-0" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold font-display text-sm text-[#F3F4F6]">
              <span>VoiceCart AI Official</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full border border-amber-500/40">
                Verified Business
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
              <span>நேரலை குரல் முகவர் (Beckn RET10/11)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-neutral-400">
          <button className="hover:text-white p-1 transition-colors cursor-pointer" title="Call">
            <Phone className="w-4 h-4" />
          </button>
          <button className="hover:text-white p-1 transition-colors cursor-pointer" title="Video Call">
            <Video className="w-4 h-4" />
          </button>
          <button className="hover:text-white p-1 transition-colors cursor-pointer" title="Menu">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WhatsApp Message Canvas */}
      <div
        className="p-4 space-y-3.5 min-h-[420px] max-h-[520px] overflow-y-auto"
        style={{
          backgroundColor: '#0E0E12',
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Encryption notice */}
        <div className="text-center my-1">
          <span className="bg-[#1C1814] text-amber-300/80 border border-amber-800/40 text-[10px] px-3 py-1 rounded-lg shadow-sm inline-block font-medium">
            🔒 Messages and voice notes are end-to-end encrypted with VoiceCart ONDC Gateway.
          </span>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-md text-xs relative ${
                  isUser
                    ? 'bg-[#241F18] border border-amber-800/40 text-[#F3F4F6] rounded-tr-xs'
                    : 'bg-[#181820] border border-neutral-800 text-[#F3F4F6] rounded-tl-xs'
                }`}
              >
                {/* Voice Note View */}
                {msg.type === 'voice' && (
                  <div className="flex items-center gap-2.5 py-1">
                    <button
                      onClick={() => speakText(msg.text || '', 'ta')}
                      className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center shrink-0 hover:from-amber-400 hover:to-orange-500 cursor-pointer font-bold"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-[130px]">
                      <div className="h-1 bg-neutral-700 rounded-full overflow-hidden mb-1">
                        <div className="w-3/4 h-full bg-amber-400 rounded-full" />
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span>0:0{msg.audioDurationSec || 3}</span>
                        <span className="font-semibold text-amber-400">குரல் குறிப்பு</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text View */}
                {msg.text && msg.type !== 'voice' && (
                  <p className="leading-relaxed mb-1 font-medium">{msg.text}</p>
                )}

                {/* Interactive Template Card */}
                {msg.templateData && (
                  <div className="mt-2 rounded-xl border border-neutral-700 overflow-hidden bg-[#121217]">
                    {msg.templateData.imageUrl && (
                      <img
                        src={msg.templateData.imageUrl}
                        alt="Product"
                        className="w-full h-32 object-cover opacity-90"
                      />
                    )}
                    <div className="p-2.5">
                      <div className="font-display font-bold text-[#F3F4F6]">{msg.templateData.title}</div>
                      <div className="text-[11px] text-neutral-400 mb-2">
                        {msg.templateData.subtitle}
                      </div>

                      {/* Items */}
                      <div className="space-y-1 mb-2 border-t border-neutral-800 pt-1.5">
                        {msg.templateData.items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-[11px] text-neutral-300">
                            <span>{item.title}</span>
                            <span className="font-bold font-mono text-amber-400">₹{item.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Interactive Buttons */}
                      <div className="space-y-1.5">
                        {msg.templateData.actions?.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (act.actionId === 'add_biryani') {
                                onAddToCart({
                                  id: 'prod_abc_biryani',
                                  merchantId: 'mer_abc_hotel',
                                  merchantName: 'ABC Hotel',
                                  name: 'Chicken Biryani (Seeraga Samba)',
                                  tamilName: 'சிக்கன் பிரியாணி',
                                  category: 'RET11',
                                  price: 180,
                                  veg: false,
                                  inStock: true,
                                  freshness: 'CONFIRMED',
                                  imageUrl:
                                    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
                                  description: 'Seeraga samba chicken biryani',
                                  tamilDescription: 'சீரக சம்பா சிக்கன் பிரியாணி',
                                  unit: '1 Plate',
                                  rating: 4.5,
                                  tags: ['biryani'],
                                });
                                onOpenCart();
                              }
                            }}
                            className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              act.primary
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold shadow-sm'
                                : 'bg-[#22222B] border border-neutral-700 text-neutral-300 hover:bg-[#2C2C36]'
                            }`}
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Request Template */}
                {msg.paymentData && (
                  <div className="mt-2 p-3 bg-[#1C1814] rounded-xl border border-amber-800/60 text-[#F3F4F6]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold flex items-center gap-1 text-amber-300">
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span>UPI Payment Request</span>
                      </span>
                      <span className="font-display font-extrabold text-sm text-amber-400">₹{msg.paymentData.amount}</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 mb-2">
                      Google Pay, PhonePe அல்லது Paytm மூலம் ஸ்கேன் செய்து உடனடியாக பணம் செலுத்தலாம்.
                    </p>
                    <button
                      onClick={onOpenCart}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>₹{msg.paymentData.amount} ஐ செலுத்தவும் (Pay via UPI)</span>
                    </button>
                  </div>
                )}

                {/* Message Timestamp & Blue Ticks */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-neutral-400">
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-amber-400" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Quick Prompts Bar */}
      <div className="p-2 bg-[#16161B] border-t border-neutral-800 flex flex-wrap gap-1.5 text-[11px]">
        <span className="text-neutral-400 font-semibold px-1 py-0.5">குரல் சோதனை:</span>
        <button
          onClick={() => handleSendVoiceNote('காந்திபுரம் 2 சிக்கன் பிரியாணி பார்சல் வேணும்')}
          className="px-2 py-1 bg-[#1F1F26] border border-neutral-700 rounded-lg font-medium hover:bg-[#282832] shadow-sm text-neutral-200 cursor-pointer transition-colors"
        >
          🎙️ "2 பிரியாணி வேணும்"
        </button>
        <button
          onClick={() => handleSendVoiceNote('ஆவின் பால் 2 பாக்கெட் மளிகை அனுப்பு')}
          className="px-2 py-1 bg-[#1F1F26] border border-neutral-700 rounded-lg font-medium hover:bg-[#282832] shadow-sm text-neutral-200 cursor-pointer transition-colors"
        >
          🎙️ "ஆவின் பால் 2 பாக்கெட்"
        </button>
        <button
          onClick={() => handleSendVoiceNote('20000 ரூபாய்க்கு மொபைல் போன் வேணும்')}
          className="px-2 py-1 bg-[#2A161A] border border-rose-800/60 text-rose-300 rounded-lg font-medium hover:bg-[#381B20] shadow-sm cursor-pointer transition-colors"
        >
          🚨 "மொபைல் போன் வேணும்" (Guardrail)
        </button>
      </div>

      {/* WhatsApp Input Bar */}
      <div className="p-2.5 bg-[#16161B] flex items-center gap-2 border-t border-neutral-850">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
          placeholder="செய்தியை தட்டச்சு செய்யவும் (Type message in Tamil/English)..."
          className="flex-1 bg-[#101014] border border-neutral-700 text-[#F3F4F6] placeholder:text-neutral-500 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-amber-500"
          id="whatsapp-text-input"
        />

        {inputVal.trim() ? (
          <button
            onClick={handleSendText}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold flex items-center justify-center transition-colors cursor-pointer"
            id="whatsapp-send-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => handleSendVoiceNote('காந்திபுரம் ஏபிசி ஹோட்டலில் 2 பிரியாணி ஆர்டர் செய்க')}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-bold flex items-center justify-center transition-colors cursor-pointer"
            id="whatsapp-mic-btn"
            title="குரல் குறிப்பு அனுப்ப (Send Voice Note)"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
