import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MobileFrame, AppHeader, BottomNav } from "@/components/app/MobileShell";
import { EmptyState } from "@/components/app/EmptyState";
import { HopoImage } from "@/components/app/HopoImage";
import { Minus, Plus, Tag, Trash2, ShoppingBag, ShieldCheck, CheckCircle2, X } from "lucide-react";
import {
  useStoreSync,
  getCartCalculations,
  updateCartQty,
  removeFromCart,
  applyCartCoupon,
  removeCartCoupon,
  DEFAULT_COUPONS,
  getAuthUser,
} from "@/lib/store";
import { BUSINESS_CONFIG, formatINR } from "@/lib/business-config";
import { normalizeCategoryName } from "@/lib/catalog-service";
export function Cart() {
  useStoreSync();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);
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
  const handleApply = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyCartCoupon(couponCode);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) {
      setCouponCode("");
    }
  };
  const handleRemoveCoupon = () => {
    removeCartCoupon();
    setCouponMsg({ text: "Coupon removed." });
  };
  const isFreeShippingUnlocked = subtotal >= BUSINESS_CONFIG.ecommerce.freeShippingThreshold;
  const neededForFreeShipping = Math.max(
    0,
    BUSINESS_CONFIG.ecommerce.freeShippingThreshold - subtotal,
  );
  return (
    <MobileFrame>
      <AppHeader title="My Shopping Bag" />

      {items.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={ShoppingBag}
            title="Your Bag is Empty"
            description="Looks like you haven't added any luxury pieces to your shopping bag yet."
            actionLabel="Start Exploring Collections"
            actionTo="/home"
          />
        </div>
      ) : (
        <>
          {/* Free Shipping Alert */}
          <div className="rounded-2xl border border-[#C8A96E]/40 bg-[#FAF6EE] p-4 flex items-center justify-between gap-3 text-xs -mt-2 shadow-xs">
            <div className="flex items-center gap-2 text-[#0D1B2A]">
              <span className="h-6 w-6 rounded-full bg-[#C8A96E]/20 text-[#8B1E3F] grid place-items-center font-bold">
                ✓
              </span>
              {isFreeShippingUnlocked ? (
                <span>
                  <strong>Congratulations!</strong> You have unlocked{" "}
                  <strong>Free Express Pan-India Shipping</strong>
                </span>
              ) : (
                <span>
                  Add <strong>{formatINR(neededForFreeShipping)}</strong> more to unlock{" "}
                  <strong>Free Pan-India Delivery</strong>
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-[#8B1E3F] uppercase tracking-wider shrink-0">
              {isFreeShippingUnlocked
                ? "₹0 DELIVERY"
                : `+${formatINR(BUSINESS_CONFIG.ecommerce.standardShippingFee)}`}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-6">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-7 space-y-4">
              {items.map((i) => (
                <div
                  key={`${i.id}-${i.size}-${i.selectedColor || ""}`}
                  className="flex gap-4 rounded-3xl border border-[#E5DCCD] bg-white p-4 sm:p-5 shadow-subtle"
                >
                  <HopoImage
                    src={i.image}
                    alt={i.title}
                    productId={i.id}
                    title={i.title}
                    category={i.category}
                    brand={i.brand}
                    className="h-32 w-26 object-cover rounded-2xl border border-[#E5DCCD] shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-[#8B1E3F] uppercase tracking-wider">
                        {normalizeCategoryName(i.category) || i.category || "Couture"}
                      </p>
                      <Link to={`/product/${i.id}`}>
                        <p className="text-sm font-semibold text-[#0D1B2A] truncate mt-0.5 hover:text-[#8B1E3F] transition">
                          {i.title}
                        </p>
                      </Link>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="text-[11px] rounded-md bg-[#F7F2E9] border border-[#E5DCCD] text-[#0D1B2A] px-2 py-0.5 font-semibold">
                          Size: {i.size}
                        </span>
                        {i.selectedColor && (
                          <span className="text-[11px] rounded-md bg-[#FAF6EE] border border-[#E5DCCD] text-[#0D1B2A] px-2 py-0.5 font-semibold inline-flex items-center gap-1.5">
                            {i.colorHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/15 inline-block shrink-0"
                                style={{ backgroundColor: i.colorHex }}
                              />
                            )}
                            Color: {i.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-2 border-t border-[#E5DCCD]/60">
                      <div className="flex items-center gap-3 rounded-full border border-[#E5DCCD] px-3 py-1 bg-[#F7F2E9]">
                        <button
                          onClick={() => updateCartQty(i.id, i.size, -1, i.selectedColor)}
                          aria-label="Decrease quantity"
                          className="text-[#6B7280] hover:text-[#0D1B2A] p-0.5"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-[#0D1B2A]">
                          {i.qty}
                        </span>
                        <button
                          onClick={() => updateCartQty(i.id, i.size, 1, i.selectedColor)}
                          aria-label="Increase quantity"
                          className="text-[#6B7280] hover:text-[#0D1B2A] p-0.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-[#0D1B2A]">
                          {formatINR(i.price * i.qty)}
                        </span>
                        {i.mrp > i.price && (
                          <span className="block text-[11px] text-[#6B7280] line-through">
                            {formatINR(i.mrp * i.qty)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(i.id, i.size, i.selectedColor)}
                    aria-label="Remove item"
                    className="text-[#6B7280] hover:text-[#8B1E3F] self-start p-1 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Right Column: Coupon & Order Summary */}
            <div className="lg:col-span-5 space-y-5">
              {/* Coupon Box */}
              <div className="rounded-3xl border border-[#E5DCCD] bg-white p-5 shadow-subtle space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D1B2A]">
                  <Tag className="h-4 w-4 text-[#8B1E3F]" />
                  <span>Apply Promo Code</span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-[#2E7D6B]/10 border border-[#2E7D6B]/30 rounded-2xl p-3.5 text-xs text-[#2E7D6B]">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-bold tracking-wider">{appliedCoupon} APPLIED</p>
                        <p className="text-[11px] text-[#0D1B2A]">
                          You saved {formatINR(couponDiscount)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="p-1 text-[#6B7280] hover:text-[#8B1E3F] transition"
                      aria-label="Remove coupon"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="e.g. FESTIVE40 or HOPO10"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5DCCD] bg-[#F7F2E9] text-xs uppercase font-bold text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#0D1B2A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8B1E3F] transition shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponMsg && !appliedCoupon && (
                  <p
                    className={`text-[11px] font-semibold ${couponMsg.isError ? "text-[#8B1E3F]" : "text-[#2E7D6B]"}`}
                  >
                    {couponMsg.text}
                  </p>
                )}

                {/* Available Coupons List */}
                <div className="pt-2 border-t border-[#E5DCCD]/60 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Available Offers
                  </p>
                  {DEFAULT_COUPONS.filter((c) => c.enabled).map((c) => (
                    <div
                      key={c.code}
                      onClick={() => {
                        applyCartCoupon(c.code);
                        setCouponMsg({ text: `Applied ${c.code}` });
                      }}
                      className="cursor-pointer border border-dashed border-[#C8A96E] hover:bg-[#FAF6EE] p-2.5 rounded-xl transition flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs text-[#8B1E3F] tracking-wider">
                          {c.code}
                        </span>
                        <p className="text-[10px] text-[#6B7280]">{c.description}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#C8A96E] uppercase hover:underline">
                        Apply
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-3xl border border-[#E5DCCD] bg-white p-6 shadow-subtle space-y-4">
                <h3 className="font-display font-bold text-base text-[#0D1B2A] border-b border-[#E5DCCD] pb-3">
                  Price Details ({itemCount} {itemCount === 1 ? "Item" : "Items"})
                </h3>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <Row label="Total MRP" value={formatINR(mrpTotal)} />
                  <Row label="Catalog Discount" value={`- ${formatINR(productDiscount)}`} accent />
                  {couponDiscount > 0 && (
                    <Row
                      label={`Promo Discount (${appliedCoupon})`}
                      value={`- ${formatINR(couponDiscount)}`}
                      accent
                    />
                  )}
                  <Row
                    label="Pan-India Shipping"
                    value={shippingFee === 0 ? "FREE" : formatINR(shippingFee)}
                    accent={shippingFee === 0}
                  />
                  <Row
                    label={`Estimated GST (${BUSINESS_CONFIG.ecommerce.gstRatePercentage}%)`}
                    value={formatINR(gstAmount)}
                  />
                  <div className="border-t border-[#E5DCCD] pt-3 flex justify-between font-bold text-base text-[#0D1B2A]">
                    <span>Final Payable Amount</span>
                    <span>{formatINR(finalTotal)}</span>
                  </div>
                </div>

                {totalSavings > 0 && (
                  <div className="text-xs text-[#2E7D6B] font-bold bg-[#2E7D6B]/10 p-3 rounded-2xl text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>You are saving {formatINR(totalSavings)} on this order!</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    const user = getAuthUser();
                    if (!user) {
                      navigate("/login?redirect=/checkout");
                    } else {
                      navigate("/checkout");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#8B1E3F] text-white py-3.5 text-xs uppercase font-bold tracking-widest shadow-md hover:bg-[#5E0F27] transition transform active:scale-95 mt-4 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <span>•</span>
                  <span>{formatINR(finalTotal)}</span>
                </button>

                <p className="text-[10px] text-[#6B7280] text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#C8A96E]" />
                  <span>100% Safe & Secure Luxury Checkout</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav active="bag" />
    </MobileFrame>
  );
}
function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#6B7280]">{label}</span>
      <span className={accent ? "text-[#2E7D6B] font-semibold" : "text-[#0D1B2A] font-medium"}>
        {value}
      </span>
    </div>
  );
}
export default Cart;
