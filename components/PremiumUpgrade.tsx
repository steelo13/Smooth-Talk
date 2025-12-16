import React, { useState } from 'react';
import { Check, Star, Shield, Lock, CreditCard, Sparkles, Zap, X } from 'lucide-react';

interface PremiumUpgradeProps {
  onUpgrade: () => void;
  onClose?: () => void;
}

const PremiumUpgrade: React.FC<PremiumUpgradeProps> = ({ onUpgrade, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    
    // --- STRIPE CHECKOUT INTEGRATION ---
    try {
      // 1. In a real app, initialize Stripe with your Publishable Key
      // const stripe = window.Stripe('pk_test_YOUR_PUBLISHABLE_KEY');

      // 2. Call your backend to create a Checkout Session
      // const response = await fetch('/api/create-checkout-session', { method: 'POST' });
      // const session = await response.json();

      // 3. Redirect to Stripe Checkout
      // const result = await stripe.redirectToCheckout({ sessionId: session.id });
      // if (result.error) alert(result.error.message);
      
      console.log("Stripe Checkout Initiated");
      
      // SIMULATION FOR DEMO:
      setTimeout(() => {
        setLoading(false);
        onUpgrade();
        alert("Payment Successful! Welcome to BoldTalk Premium.");
        if (onClose) onClose();
      }, 1500);

    } catch (error) {
      console.error("Payment failed", error);
      setLoading(false);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-darkSurface to-black rounded-3xl border border-yellow-500/30 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/40 rounded-full text-gray-400 hover:text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="overflow-y-auto custom-scrollbar p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 mb-4 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
              <Star className="w-8 h-8 text-white fill-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Unlock Practice Lab</h2>
            <p className="text-gray-400 text-sm">Get unlimited access to all 30+ real-world social scenarios.</p>
          </div>

          {/* Pricing Card */}
          <div className="bg-white/5 border border-yellow-500/30 rounded-2xl p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">
              BEST VALUE
            </div>
            
            <div className="flex items-baseline justify-center gap-1 mb-4 mt-2">
              <span className="text-lg text-gray-400">£</span>
              <span className="text-4xl font-bold text-white tracking-tight">7.99</span>
              <span className="text-gray-500 text-sm font-medium">/ month</span>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3">
                <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-400" /></div>
                <span className="text-sm text-gray-200">Unlock All 30+ Scenarios</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-400" /></div>
                <span className="text-sm text-gray-200">Hard & Expert Difficulty Modes</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-green-500/20 p-1 rounded-full"><Check className="w-3 h-3 text-green-400" /></div>
                <span className="text-sm text-gray-200">Advanced AI Coaching Tips</span>
              </li>
            </ul>

            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                   Connecting Stripe...
                </div>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-black" /> Upgrade Now
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-500">
               <Shield className="w-3 h-3" /> Secure payment via Stripe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpgrade;