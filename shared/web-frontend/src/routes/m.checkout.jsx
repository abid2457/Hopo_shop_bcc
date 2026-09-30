import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MobileFrame, AppHeader } from "@/components/app/MobileShell";
import {
  MapPin,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Wallet,
  Banknote,
  Shield,
  Truck,
  Tag,
  Lock,
  AlertCircle,
  ShieldCheck,
  User,
  Phone,
} from "lucide-react";
import {
  useStoreSync,
  getCartCalculations,
  getAuthUser,
  createOrder,
  clearCart,
  clearPendingPurchaseIntent,
} from "@/lib/store";
import { BUSINESS_CONFIG, formatINR, getEstimatedDeliveryDate } from "@/lib/business-config";
import { HopoImage } from "@/components/app/HopoImage";
const PAYMENT_METHODS = [
  {
    id: "UPI",
    label: "Instant UPI",
    desc: "Google Pay · PhonePe · Paytm · BHIM UPI (Fastest & Zero Fee)",
    icon: Smartphone,
    badge: "Recommended",
  },
  {
    id: "CARD",
    label: "Credit / Debit Card",
    desc: "Visa · MasterCard · RuPay · Amex (Secure OTP Verification)",
    icon: CreditCard,
    badge: null,
  },
  {
    id: "NET_BANKING",
    label: "Net Banking",
    desc: "All 50+ major Indian banks supported (SBI, HDFC, ICICI, Axis)",
    icon: Wallet,
    badge: null,
  },
  {
    id: "COD",
    label: "Cash on Delivery",
    desc: "Pay in cash or QR code scan when your parcel arrives",
    icon: Banknote,
    badge: null,
  },
];
export function Checkout() {
  useStoreSync();
  const navigate = useNavigate();
  const user = getAuthUser();
  // 1. Mandatory Auth Protection: Redirect unauthenticated customers immediately
  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/checkout", { replace: true });
    }
  }, [user, navigate]);
  const calc = getCartCalculations();
  const {
    items,
    appliedCoupon,
    subtotal,
    mrpTotal,
    productDiscount,
    couponDiscount,
    shippingFee,
    gstAmount,
    finalTotal,
    totalSavings,
    itemCount,
  } = calc;
  // Temporary Single-Transaction Delivery Address Form (Held strictly in component memory)
  const [recipientName, setRecipientName] = useState(user?.name || "");
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Maharashtra");
  const [pincode, setPincode] = useState("");
  const [addressError, setAddressError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const deliveryEstimate = getEstimatedDeliveryDate(3);
  if (!user) {
    return null;
  }
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setAddressError("");
    if (items.length === 0) {
      navigate("/cart");
      return;
    }
    // Strict Validation of Temporary Delivery Destination
    const trimmedName = recipientName.trim();
    const cleanPhone = recipientPhone.trim().replace(/\D/g, "");
    const trimmedLine1 = addressLine1.trim();
    const trimmedCity = city.trim();
    const trimmedState = stateName.trim();
    const cleanPincode = pincode.trim().replace(/\D/g, "");
    if (!trimmedName) {
      setAddressError("Please enter the recipient full name.");
      return;
    }
    if (cleanPhone.length < 10) {
      setAddressError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!trimmedLine1) {
      setAddressError("Please enter your flat/house no., building and street address.");
      return;
    }
    if (!trimmedCity) {
      setAddressError("Please enter your city.");
      return;
    }
    if (!trimmedState) {
      setAddressError("Please select or enter your state.");
      return;
    }
    if (cleanPincode.length !== 6) {
      setAddressError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }
    setIsProcessing(true);
    // Single-order destination record (not stored to customer profile)
    const singleOrderAddress = {
      id: `ADDR-TX-${Date.now()}`,
      fullName: trimmedName,
      phone: recipientPhone.trim(),
      addressLine1: trimmedLine1,
      addressLine2: addressLine2.trim() || undefined,
      city: trimmedCity,
      state: trimmedState,
      pincode: cleanPincode,
    };
    setTimeout(() => {
      const order = createOrder({
        userId: user.id,
        items,
        deliveryAddress: singleOrderAddress,
        paymentMethod,
      });
      clearCart();
      clearPendingPurchaseIntent();
      setIsProcessing(false);
      navigate(`/order/${order.id}`, { replace: true });
    }, 1000);
  };
  const steps = [
    { key: "bag", label: "Bag", done: true },
    { key: "destination", label: "Delivery", active: true },
    { key: "payment", label: "Payment", active: true },
    { key: "confirmation", label: "Confirmation", active: false },
  ];
  if (items.length === 0) {
    return (
      <MobileFrame>
        <AppHeader title="Secure Luxury Checkout" back showSearch={false} showBell={false} />
        <div className="py-16 text-center space-y-4 max-w-md mx-auto px-4">
          <div className="h-16 w-16 rounded-full bg-[#FAF6EE] text-[#8B1E3F] grid place-items-center mx-auto">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="font-display font-bold text-xl text-[#0D1B2A]">
            Your Shopping Bag is Empty
          </h2>
          <p className="text-xs text-[#6B7280]">
            Please select couture pieces before proceeding to checkout.
          </p>
          <Link
            to="/listing"
            className="inline-block px-7 py-3 rounded-full bg-[#8B1E3F] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#5E0F27] transition shadow-md cursor-pointer"
          >
            Explore Collections
          </Link>
        </div>
      </MobileFrame>
    );
  }
  return (
    <MobileFrame>
      <AppHeader title="Secure Luxury Checkout" back showSearch={false} showBell={false} />

      {/* Progress Steps Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-0 max-w-lg mx-auto px-2">
          {steps.map((step, i) => (
            <div key={step.key} className="flex items-center gap-0">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    step.done
                      ? "bg-[#8B1E3F] text-white shadow-xs"
                      : step.active
                        ? "bg-[#8B1E3F]/15 text-[#8B1E3F] border-2 border-[#8B1E3F]"
                        : "bg-white text-[#6B7280] border-2 border-[#E5DCCD]"
                  }`}
                >
                  {step.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${step.active || step.done ? "text-[#0D1B2A]" : "text-[#6B7280]"}`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-px w-8 sm:w-16 md:w-20 mx-1 mb-5 transition ${step.done ? "bg-[#8B1E3F]" : "bg-[#E5DCCD]"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handlePlaceOrder}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
      >
        {/* Left Column: Delivery Destination & Payment Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Transient Delivery Destination Section */}
          <section className="rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-7 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DCCD] pb-3">
              <h2 className="font-display font-bold text-base sm:text-lg text-[#0D1B2A] flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#8B1E3F]" />
                Order Delivery Destination
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C8A96E] bg-[#FAF6EE] px-2.5 py-1 rounded-md border border-[#E5DCCD]">
                Current Order Only
              </span>
            </div>

            {/* Privacy Assurance Notice */}
            <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#C8A96E]/40 text-[#0D1B2A] text-xs flex items-start gap-2.5 shadow-xs">
              <ShieldCheck className="h-4.5 w-4.5 text-[#8B1E3F] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-[#8B1E3F]">Customer Privacy Guaranteed:</strong> Your
                delivery destination is collected solely to dispatch this single order. It will
                never be stored in an address book, saved to your profile, or persisted across
                browser sessions.
              </div>
            </div>

            {/* Validation Error */}
            {addressError && (
              <div className="p-3 rounded-xl bg-[#8B1E3F]/10 border border-[#8B1E3F]/20 text-[#8B1E3F] text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{addressError}</span>
              </div>
            )}

            {/* Delivery Form Fields */}
            <div className="space-y-3.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    Recipient Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Radhika Roy"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] text-[#0D1B2A] focus:bg-white focus:outline-none focus:border-[#8B1E3F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    10-Digit Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280]" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] text-[#0D1B2A] focus:bg-white focus:outline-none focus:border-[#8B1E3F]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                  Flat / House No., Building & Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Penthouse 802, Signature Towers, MG Road"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] text-[#0D1B2A] focus:bg-white focus:outline-none focus:border-[#8B1E3F]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                  Colony, Area or Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Indiranagar Metro Station"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] text-[#0D1B2A] focus:bg-white focus:outline-none focus:border-[#8B1E3F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] text-[#0D1B2A] focus:bg-white focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    State *
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] text-[#0D1B2A] focus:bg-white focus:outline-none focus:border-[#8B1E3F]"
                  >
                    {[
                      "Maharashtra",
                      "Karnataka",
                      "Delhi NCR",
                      "Tamil Nadu",
                      "Telangana",
                      "Gujarat",
                      "West Bengal",
                      "Rajasthan",
                      "Uttar Pradesh",
                      "Kerala",
                      "Punjab",
                      "Haryana",
                      "Madhya Pradesh",
                      "Bihar",
                      "Odisha",
                      "Assam",
                    ].map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                    6-Digit PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 560038"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] text-[#0D1B2A] font-mono focus:bg-white focus:outline-none focus:border-[#8B1E3F]"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-[#2E7D6B] font-semibold mt-4 flex items-center gap-1.5 bg-[#2E7D6B]/10 p-2.5 rounded-xl">
              <Truck className="h-4 w-4 shrink-0" />
              <span>
                Pan-India Express Delivery estimated by {deliveryEstimate.formattedDate} •{" "}
                {shippingFee === 0 ? "Zero Shipping Fee" : `${formatINR(shippingFee)} Shipping Fee`}
              </span>
            </p>
          </section>

          {/* Applied Coupon Info */}
          {appliedCoupon && (
            <div className="rounded-3xl border border-[#2E7D6B]/40 bg-[#2E7D6B]/5 p-4 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#2E7D6B]/15 p-2 text-[#2E7D6B]">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0D1B2A]">{appliedCoupon} Coupon Applied</p>
                  <p className="text-[11px] text-[#2E7D6B] font-semibold">
                    You save {formatINR(couponDiscount)} on this order 🎉
                  </p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#2E7D6B] bg-[#2E7D6B]/15 px-2 py-0.5 rounded">
                Active
              </span>
            </div>
          )}

          {/* Payment Methods Section */}
          <section className="rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-7 shadow-subtle">
            <h2 className="font-display font-bold text-base sm:text-lg text-[#0D1B2A] mb-4 flex items-center gap-2 border-b border-[#E5DCCD] pb-3">
              <Shield className="h-5 w-5 text-[#8B1E3F]" />
              Select Secure Payment Method
            </h2>

            <div className="space-y-3">
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon;
                const isSelected = paymentMethod === pm.id;
                return (
                  <label
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 transition cursor-pointer ${
                      isSelected
                        ? "border-[#8B1E3F] bg-[#8B1E3F]/5"
                        : "border-[#E5DCCD] hover:border-[#8B1E3F]/40 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={pm.id}
                      checked={isSelected}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="mt-1 h-4 w-4 text-[#8B1E3F] focus:ring-[#8B1E3F]"
                    />
                    <div className="h-8 w-8 rounded-xl bg-[#FAF6EE] text-[#8B1E3F] grid place-items-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#0D1B2A]">
                          {pm.label}
                        </span>
                        {pm.badge && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-[#C8A96E] text-[#0D1B2A] px-2 py-0.5 rounded-full">
                            {pm.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">{pm.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-6 shadow-subtle space-y-5 sticky top-24">
            <h3 className="font-display font-bold text-base text-[#0D1B2A] border-b border-[#E5DCCD] pb-3">
              Order Summary ({itemCount} {itemCount === 1 ? "Item" : "Items"})
            </h3>

            {/* Items mini list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.selectedColor || ""}`}
                  className="flex gap-3 items-center"
                >
                  <HopoImage
                    src={item.image}
                    alt={item.title}
                    productId={item.id}
                    title={item.title}
                    category={item.category}
                    brand={item.brand}
                    className="h-12 w-10 object-cover rounded-lg border border-[#E5DCCD] shrink-0 bg-[#F7F2E9]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0D1B2A] truncate">{item.title}</p>
                    <p className="text-[10px] text-[#6B7280]">
                      Size: <strong className="text-[#0D1B2A]">{item.size}</strong> • Qty:{" "}
                      {item.qty}
                      {item.selectedColor && ` • ${item.selectedColor}`}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#0D1B2A] shrink-0">
                    {formatINR((item.price ?? item.unitPrice ?? 0) * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs sm:text-sm border-t border-[#E5DCCD] pt-3">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Total MRP</span>
                <span className="text-[#0D1B2A] font-medium">{formatINR(mrpTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Catalog Discount</span>
                <span className="text-[#2E7D6B] font-semibold">- {formatINR(productDiscount)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Coupon Discount ({appliedCoupon})</span>
                  <span className="text-[#2E7D6B] font-semibold">
                    - {formatINR(couponDiscount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Pan-India Delivery</span>
                <span
                  className={
                    shippingFee === 0
                      ? "text-[#2E7D6B] font-semibold"
                      : "text-[#0D1B2A] font-medium"
                  }
                >
                  {shippingFee === 0 ? "FREE" : formatINR(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">
                  Estimated GST ({BUSINESS_CONFIG.ecommerce.gstRatePercentage}%)
                </span>
                <span className="text-[#0D1B2A] font-medium">{formatINR(gstAmount)}</span>
              </div>

              <div className="border-t border-[#E5DCCD] pt-3 flex justify-between font-bold text-base text-[#0D1B2A]">
                <span>Final Payable</span>
                <span className="text-[#8B1E3F]">{formatINR(finalTotal)}</span>
              </div>
            </div>

            {totalSavings > 0 && (
              <div className="text-xs text-[#2E7D6B] font-bold bg-[#2E7D6B]/10 p-3 rounded-2xl text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>You save {formatINR(totalSavings)} on this order</span>
              </div>
            )}

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#8B1E3F] text-white py-4 text-xs sm:text-sm uppercase font-bold tracking-widest hover:bg-[#5E0F27] transition transform active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Lock className="h-4 w-4" />
              <span>
                {isProcessing
                  ? "Processing Secure Order..."
                  : `Place Order • ${formatINR(finalTotal)}`}
              </span>
            </button>

            <p className="text-[10px] text-[#6B7280] text-center flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#C8A96E]" />
              <span>256-Bit Encrypted Secure Checkout</span>
            </p>
          </div>
        </div>
      </form>
    </MobileFrame>
  );
}
export default Checkout;
