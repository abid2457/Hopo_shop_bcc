import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect, useCallback } from "react";
import { MobileFrame, AppHeader, BottomNav } from "@/components/app/MobileShell";
import { ProductCard } from "@/components/app/ProductCard";
import { Copy, Tag, Check, Sparkles, CreditCard, ArrowRight } from "lucide-react";
import { DEFAULT_COUPONS, applyCartCoupon } from "@/lib/store";
import { formatINR } from "@/lib/business-config";
import { PRODUCTS } from "@/lib/hopo-data";
import { useDynamicCategories } from "@/lib/catalog-service";
import { productApi } from "@/services/api/index";

export function Offers() {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);
  const { categories } = useDynamicCategories();
  const [liveProducts, setLiveProducts] = useState(null);

  const fetchLiveProducts = useCallback(async () => {
    try {
      const res = await productApi.getProducts({ sort: "discount", limit: 50 });
      if (res && res.success && Array.isArray(res.data?.products)) {
        setLiveProducts(res.data.products);
      }
    } catch {
      // fallback to static
    }
  }, []);

  useEffect(() => {
    fetchLiveProducts();
    const handleUpdate = () => {
      fetchLiveProducts();
    };
    window.addEventListener("hopo-catalog-update", handleUpdate);
    window.addEventListener("hopo-store-update", handleUpdate);
    return () => {
      window.removeEventListener("hopo-catalog-update", handleUpdate);
      window.removeEventListener("hopo-store-update", handleUpdate);
    };
  }, [fetchLiveProducts]);

  // Filter genuinely discounted products belonging to active categories
  const festiveProducts = useMemo(() => {
    const validCategories = new Set(categories.map((c) => c.name.toLowerCase()));
    const source = Array.isArray(liveProducts) && liveProducts.length > 0 ? liveProducts : PRODUCTS;
    return source.filter((p) => {
      if (p.isArchived || p.is_archived || (p.status && p.status !== "active")) return false;
      const catName = (p.category || p.category_name || "").toLowerCase();
      const isValidCat = validCategories.size === 0 || validCategories.has(catName);
      const isDiscounted = p.mrp && Number(p.mrp) > Number(p.price);
      return isValidCat && isDiscounted;
    });
  }, [categories, liveProducts]);
  const handleApplyDirect = (code) => {
    applyCartCoupon(code);
    navigate("/cart");
  };
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };
  return (
    <MobileFrame>
      <AppHeader title="Festive Sale & Offers" />

      {/* Featured Banner */}
      <div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3d0d1b] via-[#5e0f27] to-[#8B1E3F] text-white p-6 sm:p-8 shadow-luxury border border-[#C8A96E]/40">
          <div className="relative z-10 space-y-2 max-w-md">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A96E]">
              SEASONAL ATELIER SPECIAL
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Festive Sale Live
            </h2>
            <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
              Curated festive offers across handcrafted bridal blouses, royal lehengas, and designer
              salwar suits.
            </p>
            <div className="pt-2">
              <a
                href="#sale-collection"
                className="inline-flex items-center gap-2 rounded-full bg-[#C8A96E] text-[#0D1B2A] px-5 py-2 text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-110 transition"
              >
                <span>Shop Festive Pieces ({festiveProducts.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-[#C8A96E]/20 blur-2xl" />
        </div>
      </div>

      {/* Festive Sale Live Products Grid */}
      <section id="sale-collection" className="space-y-4 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 border-b border-[#E5DCCD] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B1E3F]">
              FESTIVE ATELIER
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0D1B2A]">
              Festive Sale Collection ({festiveProducts.length})
            </h3>
          </div>
          <Link
            to="/listing?sort=discount"
            className="text-xs font-bold text-[#8B1E3F] hover:text-[#5E0F27] uppercase tracking-wider flex items-center gap-1"
          >
            <span>View Filtered Listing</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {festiveProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {festiveProducts.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#E5DCCD] bg-white p-12 text-center shadow-subtle space-y-3">
            <div className="h-12 w-12 rounded-full bg-[#FAF6F0] border border-[#E5DCCD] flex items-center justify-center mx-auto text-[#8B1E3F]">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#0D1B2A]">
              Festive Offers Arriving Soon
            </h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed">
              Our festive offers are currently being updated by our atelier team. Check back shortly
              for seasonal promotions.
            </p>
          </div>
        )}
      </section>

      {/* Verified Coupons */}
      <div className="space-y-3 mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#0D1B2A]">
          Active Promotional Promo Codes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_COUPONS.filter((c) => c.enabled).map((c) => (
            <div
              key={c.code}
              className="rounded-3xl border border-[#E5DCCD] bg-white p-5 flex flex-col justify-between shadow-subtle hover:border-[#8B1E3F]/40 transition space-y-4"
            >
              <div className="flex gap-3.5 items-start">
                <div className="h-11 w-11 rounded-2xl bg-[#8B1E3F]/10 text-[#8B1E3F] flex items-center justify-center shrink-0">
                  <Tag className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold text-[#0D1B2A]">
                      {c.code}
                    </span>
                    <span className="text-[10px] rounded bg-[#2E7D6B]/10 text-[#2E7D6B] font-bold px-2 py-0.5 uppercase">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">{c.description}</p>
                  <p className="text-[11px] font-semibold text-[#8B1E3F] mt-1">
                    Min. Order: {formatINR(c.minOrderAmount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#E5DCCD]/60">
                <button
                  onClick={() => handleCopy(c.code)}
                  className="flex-1 py-2 rounded-xl border border-[#E5DCCD] text-xs font-bold text-[#0D1B2A] hover:bg-[#F7F2E9] transition flex items-center justify-center gap-1.5"
                >
                  {copiedCode === c.code ? (
                    <Check className="h-3.5 w-3.5 text-[#2E7D6B]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedCode === c.code ? "Copied!" : "Copy Code"}</span>
                </button>
                <button
                  onClick={() => handleApplyDirect(c.code)}
                  className="flex-1 py-2 rounded-xl bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] transition shadow-xs"
                >
                  Apply & Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank & Payment Partner Offers */}
      <div className="space-y-3 mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#0D1B2A]">
          Bank & Payment Partner Offers
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { bank: "HDFC Bank", offer: "10% Instant Discount on Credit Cards above ₹4,999" },
            { bank: "ICICI Bank", offer: "Flat ₹500 Cashback on NetBanking transactions" },
            { bank: "UPI Instant", offer: "Zero Payment Surcharges & Instant Confirmation" },
          ].map((item) => (
            <div
              key={item.bank}
              className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle flex items-start gap-3"
            >
              <div className="h-9 w-9 rounded-xl bg-[#F7F2E9] border border-[#E5DCCD] grid place-items-center text-[#8B1E3F] shrink-0">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0D1B2A]">{item.bank}</p>
                <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">{item.offer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav active="home" />
    </MobileFrame>
  );
}
export default Offers;
