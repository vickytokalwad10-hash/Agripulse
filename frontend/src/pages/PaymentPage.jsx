import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { useEscrow } from '../context/EscrowContext';

export default function PaymentPage() {
  const { t } = useLanguage();
  const { user, role } = useAuth();
  const { isOnline } = useNetwork();
  const { transactions: escrowTxns, setActiveReceipt, releaseEscrowPayment, isProcessing, createEscrowBid, confirmEscrowPayment } = useEscrow();

  // Payment Checkout State
  const [amount, setAmount] = useState('284000'); // ₹2,84,000 default (100 Quintals Wheat)
  const [lotTitle, setLotTitle] = useState('100 Qtl Sharbati Wheat (Lot #LOT-9021)');
  const [sellerName, setSellerName] = useState('Ramesh Devidas Patil (Karnal West)');
  const [paymentRail, setPaymentRail] = useState('escrow'); // 'razorpay', 'upi', 'escrow'

  // 2FA High-Value Modal State
  const [requires2FA, setRequires2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [orderId, setOrderId] = useState(null);

  // Status & Transaction List
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast(null);

    const amtFloat = parseFloat(amount);
    const generatedOrderId = `ord_rzp_${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedOrderId);

    // If amount >= 50,000, trigger mandatory 2FA OTP security step
    if (amtFloat >= 50000) {
      setRequires2FA(true);
      setLoading(false);
      setToast('🔐 High-Value Agricultural Payment detected: 2FA Authorization Required (Use PIN 123456).');
      return;
    }

    finalizePayment(generatedOrderId);
  };

  const handleVerify2FA = () => {
    if (otpCode !== '123456' && otpCode.length !== 6) {
      setToast('⚠️ Invalid OTP Code. Use sandbox PIN 123456.');
      return;
    }
    setRequires2FA(false);
    finalizePayment(orderId);
  };

  const finalizePayment = async (targetOrderId) => {
    setLoading(true);
    setTimeout(async () => {
      if (paymentRail === 'escrow') {
        const mockLot = {
          id: targetOrderId,
          commodity: lotTitle,
          seller: sellerName,
          quantity: 100,
          priceRaw: parseFloat(amount) / 100,
        };
        const escrowTxn = createEscrowBid(mockLot, parseFloat(amount) / 100, user?.name || 'Authorized Buyer');
        await confirmEscrowPayment(escrowTxn.id);
      }
      setLoading(false);
      setToast(`🎉 Payment of ₹${parseFloat(amount).toLocaleString('en-IN')} successfully verified! Gateway Ref: ${targetOrderId}`);
      setTimeout(() => setToast(null), 6000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="bg-brand-700 text-white px-4 py-3 rounded-2xl shadow-floating flex items-center justify-between text-xs font-bold animate-in zoom-in-95">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span className="material-symbols-outlined text-brand-600 text-[32px]">payments</span>
          {t('payment.title')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
          {t('payment.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Checkout Terminal */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5 space-y-4 border-l-4 border-l-brand-600">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-600">point_of_sale</span>
              {t('payment.escrowCheckout')}
            </h3>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaymentRail('razorpay')}
                className={`py-2 px-1 rounded-xl transition text-center ${
                  paymentRail === 'razorpay' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-500'
                }`}
              >
                💳 Razorpay
              </button>
              <button
                type="button"
                onClick={() => setPaymentRail('upi')}
                className={`py-2 px-1 rounded-xl transition text-center ${
                  paymentRail === 'upi' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-500'
                }`}
              >
                📱 Instant UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentRail('escrow')}
                className={`py-2 px-1 rounded-xl transition text-center ${
                  paymentRail === 'escrow' ? 'bg-white text-brand-800 shadow-xs' : 'text-slate-500'
                }`}
              >
                🔒 {t('payment.escrowLocked')}
              </button>
            </div>

            <form onSubmit={handleInitiatePayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('payment.itemLot')}</label>
                <input
                  type="text"
                  value={lotTitle}
                  onChange={(e) => setLotTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('payment.recipientFarmer')}</label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('payment.paymentAmount')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm"
                    required
                  />
                </div>
              </div>

              {parseFloat(amount) >= 50000 && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-amber-700">lock</span>
                  {t('payment.highValueWarning')}
                </div>
              )}

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">verified_user</span>
                  {t('payment.escrowProtocol')}
                </p>
                <p className="opacity-90">{t('payment.escrowProtocolDesc')}</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 text-xs"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                {loading ? '...' : `${t('payment.authorizeBtn')} ₹${parseFloat(amount || 0).toLocaleString('en-IN')}`}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Escrow Ledger */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-600">receipt_long</span>
                {t('payment.liveLedger')}
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                {t('payment.encryptedSha')}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900">Soybean (Yellow Non-GMO)</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        🔒 {t('payment.escrowLocked')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Seller: Malwa Organic FPO • Buyer: Ruchi Soya Ltd.
                    </p>
                  </div>
                  <span className="text-base font-extrabold text-brand-700">₹39,36,000</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Vault: ESC-RBI-IND-9942</span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition">
                      {t('payment.viewReceipt')}
                    </button>
                    <button className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition">
                      {t('payment.releaseFunds')} →
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900">Basmati Rice (Pusa 1121)</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                        ✅ {t('payment.disbursed')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Seller: Tarawadi Basmati Assoc. • Buyer: Adani Wilmar
                    </p>
                  </div>
                  <span className="text-base font-extrabold text-brand-700">₹23,85,000</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Vault: ESC-RBI-IND-9801</span>
                  <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition">
                    {t('payment.viewReceipt')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
