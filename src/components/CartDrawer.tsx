import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  ShieldCheck,
  Truck,
  Volume2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { CartItem, Order, LanguageMode } from '../types';
import { speakText, soundEffects } from '../utils/speechSynthesis';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
  deliveryLocality: string;
  language: LanguageMode;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onClearCart,
  onOrderPlaced,
  deliveryLocality,
  language,
}) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'COD_TOKEN'>('UPI');
  const [paymentFailSimulated, setPaymentFailSimulated] = useState(false);
  const [failoverNotice, setFailoverNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate financials
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 30 : 0;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const convenienceFee = subtotal > 0 ? 5 : 0;
  const total = subtotal + deliveryFee + tax + convenienceFee;

  const primaryMerchant = cartItems[0]?.product.merchantName || 'ABC Hotel';
  const primaryMerchantId = cartItems[0]?.product.merchantId || 'mer_abc_hotel';

  // Voice Confirmation readback (Section 5 & 8.3)
  const handleVoiceConfirmReadback = () => {
    const speech =
      language === 'ta'
        ? `உங்கள் மொத்த தொகை ₹${total}. ஆர்டரை உறுதி செய்து பணம் செலுத்தலாமா?`
        : `Your total is ₹${total} from ${primaryMerchant}. Proceed to checkout?`;
    speakText(speech, language === 'ta' ? 'ta' : 'en');
  };

  const handlePay = (isSimulatedFail: boolean = false) => {
    setIsProcessingPayment(true);
    setPaymentFailSimulated(false);
    setFailoverNotice(null);

    // Call voice readback
    handleVoiceConfirmReadback();

    setTimeout(() => {
      if (isSimulatedFail) {
        setIsProcessingPayment(false);
        setPaymentFailSimulated(true);
        const failSpeech =
          language === 'ta'
            ? 'பணம் செலுத்துதல் தோல்வியடைந்தது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : 'Payment failed or timed out. Please try again or cancel.';
        speakText(failSpeech, language === 'ta' ? 'ta' : 'en');
        return;
      }

      // Success flow
      const newOrder: Order = {
        id: `VC${Math.floor(10000 + Math.random() * 90000)}`,
        merchantId: primaryMerchantId,
        merchantName: primaryMerchant,
        items: [...cartItems],
        subtotal,
        deliveryFee,
        tax,
        convenienceFee,
        total,
        paymentMethod: paymentMode,
        paymentStatus: 'PAID',
        orderStatus: 'PLACED',
        statusTimeline: [
          {
            status: 'PLACED',
            label: 'Order Placed',
            tamilLabel: 'ஆர்டர் பதிவு செய்யப்பட்டது',
            timestamp: new Date().toLocaleTimeString(),
            completed: true,
            current: true,
          },
          {
            status: 'ACCEPTED',
            label: 'Restaurant Accepted',
            tamilLabel: 'உணவகம் ஏற்றுக்கொண்டது',
            timestamp: '--',
            completed: false,
            current: false,
          },
          {
            status: 'PREPARING',
            label: 'Kitchen Preparing',
            tamilLabel: 'உணவு தயாராகிறது',
            timestamp: '--',
            completed: false,
            current: false,
          },
          {
            status: 'READY_FOR_PICKUP',
            label: 'Ready for Pickup',
            tamilLabel: 'விநியோகத்திற்கு தயார்',
            timestamp: '--',
            completed: false,
            current: false,
          },
          {
            status: 'OUT_FOR_DELIVERY',
            label: 'Out for Delivery',
            tamilLabel: 'ரைடர் புறப்பட்டுவிட்டார்',
            timestamp: '--',
            completed: false,
            current: false,
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
        deliveryAddress: `வீடு எண் 42, காந்திபுரம் மெயின் ரோடு, ${deliveryLocality}`,
        deliveryLocality,
        customerPhone: '+91 98422 12345',
        createdAt: new Date().toLocaleTimeString(),
        ondcTransactionId: `txn_ondc_${Date.now()}`,
      };

      setIsProcessingPayment(false);
      soundEffects.playOrderSuccess();
      onOrderPlaced(newOrder);
      onClearCart();
      onClose();

      const successSpeech =
        language === 'ta'
          ? `ஆர்டர் #${newOrder.id} வெற்றிகரமாக பதிவு செய்யப்பட்டது! சமையல் அறை தயாரிப்பை தொடங்கிவிட்டது.`
          : `Order #${newOrder.id} placed successfully! Kitchen has started preparing.`;
      speakText(successSpeech, language === 'ta' ? 'ta' : 'en');
    }, 1400);
  };

  const handleSimulateMerchantFailover = () => {
    setFailoverNotice(
      `ONDC Failover: முதல் உணவகம் 10 வினாடிகளில் பதிலளிக்கவில்லை. ஆட்டோ-சுவிட்ச் மூலம் அடுத்த சிறந்த உணவகத்திற்கு மாற்றப்பட்டது!`
    );
    speakText(
      'முதல் உணவகம் பிஸியாக உள்ளது. அடுத்த சிறந்த உணவகத்திற்கு மாற்றப்பட்டது.',
      language === 'ta' ? 'ta' : 'en'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131317] border-l border-neutral-800 text-[#E5E5E5] h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 bg-[#18181D] border-b border-neutral-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="font-display font-bold text-[#F3F4F6] text-base tracking-wide">
              உங்கள் கூடை (Your Cart)
            </h2>
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
              {cartItems.reduce((sum, i) => sum + i.quantity, 0)} பொருட்கள்
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#22222A] hover:bg-[#2C2C36] flex items-center justify-center text-neutral-300 transition-colors cursor-pointer"
            id="close-cart-drawer-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1A1A22] text-neutral-500 flex items-center justify-center mb-3 border border-neutral-800">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-[#F3F4F6] text-base mb-1">
              கூடை காலியாக உள்ளது (Cart is Empty)
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs">
              "2 சிக்கன் பிரியாணி வேணும்" என்று பேசி கூடையில் பொருட்களை சேர்க்கலாம்.
            </p>
          </div>
        ) : (
          <div className="flex-1 p-4 space-y-4">
            {/* Failover Alert (if triggered) */}
            {failoverNotice && (
              <div className="bg-[#241710] border border-amber-800/60 rounded-xl p-3 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300">ONDC Seller Failover Triggered</div>
                  <div className="mt-0.5 text-neutral-300">{failoverNotice}</div>
                </div>
              </div>
            )}

            {/* Merchant Info */}
            <Card className="bg-[#151824] p-3 border-neutral-800 text-xs shadow-xs">
              <div className="flex items-center justify-between font-bold text-[#F3F4F6]">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>{primaryMerchant}</span>
                </span>
                <Badge variant="ondc" className="text-[10px]">
                  ONDC Verified
                </Badge>
              </div>
              <div className="text-neutral-400 mt-1">
                டெலிவரி முகவரி: வீடு எண் 42, {deliveryLocality}, கோவை
              </div>
            </Card>

            {/* Cart Items List */}
            <div className="space-y-2.5">
              {cartItems.map((item) => (
                <Card
                  key={item.product.id}
                  className="flex items-center justify-between p-3 border-neutral-800/90 bg-[#161928] shadow-xs"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-[#F3F4F6] text-xs truncate">
                        {item.product.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400">{item.product.tamilName}</div>
                    <div className="text-xs font-bold text-amber-400 mt-1">
                      ₹{item.product.price} × {item.quantity} = ₹{item.product.price * item.quantity}
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center bg-[#10121D] rounded-lg p-0.5 border border-neutral-800 shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-[#1B1E30] text-neutral-300 hover:bg-[#252A42] flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-[#F3F4F6]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Bill Details (Section 8.3 Exact Spec) */}
            <Card className="bg-[#151824] p-3.5 border-neutral-800 space-y-2 text-xs shadow-xs">
              <div className="font-display font-bold text-[#F3F4F6] pb-1 border-b border-neutral-800/80">
                கட்டண விவரம் (Bill Breakdown)
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>பொருட்களின் விலை (Subtotal)</span>
                <span className="font-semibold text-neutral-200">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>டெலிவரி கட்டணம் (Delivery Fee)</span>
                <span className="font-semibold text-neutral-200">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>வரி (GST 5%)</span>
                <span className="font-semibold text-neutral-200">₹{tax}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>ONDC வசதிக்கட்டணம் (Convenience Fee)</span>
                <span className="font-semibold text-neutral-200">₹{convenienceFee}</span>
              </div>
              <Separator />
              <div className="pt-1 flex justify-between font-bold text-sm text-[#F3F4F6]">
                <span>மொத்தத் தொகை (TOTAL)</span>
                <span className="text-amber-400 font-display text-base">₹{total}</span>
              </div>
            </Card>

            {/* Payment Method Selection (Section 5 Spec: UPI default or COD with Token) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-300">பணம் செலுத்தும் முறை (Payment):</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMode('UPI')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    paymentMode === 'UPI'
                      ? 'bg-amber-500/15 border-amber-500/70 text-amber-300 font-bold ring-1 ring-amber-500/40'
                      : 'bg-[#18181D] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>UPI (Google Pay / PhonePe)</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    உடனடி டிஜிட்டல் பேமென்ட்
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMode('COD_TOKEN')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    paymentMode === 'COD_TOKEN'
                      ? 'bg-amber-500/15 border-amber-500/70 text-amber-300 font-bold ring-1 ring-amber-500/40'
                      : 'bg-[#18181D] border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>COD + ₹30 டோக்கன்</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    ₹30 UPI அட்வான்ஸ், மீதி ரொக்கம்
                  </div>
                </button>
              </div>
            </div>

            {/* Voice Confirm Audio Trigger */}
            <button
              onClick={handleVoiceConfirmReadback}
              className="w-full py-2 bg-[#1C1C24] hover:bg-[#23232C] text-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-800 transition-colors cursor-pointer"
              id="listen-bill-voice-btn"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>மொத்த தொகையை குரலில் கேளுங்கள் (Read Bill Aloud)</span>
            </button>

            {/* Payment Failure Notice */}
            {paymentFailSimulated && (
              <div className="bg-[#241316] border border-rose-800/60 rounded-xl p-3 text-xs text-rose-200">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Payment Failure Simulation (தோல்வி ஏற்பட்டது)</span>
                </div>
                <p className="text-rose-200/90 leading-relaxed mb-2">
                  வங்கி சர்வர் தாமதம் காரணமாக UPI ரத்தானது. கீழே உள்ள "மீண்டும் செலுத்து" பொத்தானை அழுத்தவும்.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePay(false)}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700 cursor-pointer"
                  >
                    மீண்டும் முயற்சி செய் (Retry)
                  </button>
                  <button
                    onClick={() => setPaymentFailSimulated(false)}
                    className="px-3 py-1 bg-[#22222A] text-neutral-300 hover:bg-[#2C2C36] rounded-lg text-xs cursor-pointer"
                  >
                    ரத்து செய்
                  </button>
                </div>
              </div>
            )}

            {/* Protocol Failure Testing Toggles */}
            <div className="pt-2 border-t border-neutral-800">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
                சோதனை உருவகப்படுத்துதல்கள் (Simulations):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handlePay(true)}
                  disabled={isProcessingPayment}
                  className="px-2 py-1 rounded-lg bg-[#251518] text-rose-300 border border-rose-800/50 text-[10px] font-semibold hover:bg-[#301A1E] cursor-pointer"
                >
                  ⚡ Simulate UPI Fail & Retry
                </button>
                <button
                  onClick={handleSimulateMerchantFailover}
                  className="px-2 py-1 rounded-lg bg-[#251C12] text-amber-300 border border-amber-800/50 text-[10px] font-semibold hover:bg-[#302417] cursor-pointer"
                >
                  ⚡ Simulate Seller 1 Timeout & Failover
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drawer Bottom Actions */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-[#18181D] border-t border-neutral-800 sticky bottom-0 space-y-2">
            <Button
              variant="default"
              size="lg"
              onClick={() => handlePay(false)}
              disabled={isProcessingPayment}
              className="w-full h-12 text-stone-950 font-bold text-sm shadow-xl shadow-orange-950/40 flex items-center justify-center gap-2 rounded-xl"
              id="pay-upi-button"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>UPI வங்கியில் இணைக்கப்படுகிறது...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {paymentMode === 'UPI'
                      ? `₹${total} ஐ UPI மூலம் செலுத்துக`
                      : `₹30 டோக்கன் செலுத்தி COD பதிவு செய்`}
                  </span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCart}
              className="w-full text-neutral-400 hover:text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5"
              id="clear-cart-button"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>கூடையை காலியாக்கு (Clear Cart)</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
