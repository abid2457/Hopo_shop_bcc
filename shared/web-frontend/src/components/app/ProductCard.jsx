import { Link } from "react-router-dom";
import { Heart, Star, ShoppingBag, Eye, Check } from "lucide-react";
import { useState } from "react";
import {
  addToCart,
  toggleWishlist,
  isInWishlist,
  useStoreSync,
  getEffectiveProductPrice,
} from "@/lib/store";
import { normalizeCategoryName, categoryToSlug } from "@/lib/catalog-service";
import { HopoImage } from "@/components/app/HopoImage";
import { formatINR } from "@/lib/business-config";
export function ProductCard({ p: initialProduct, className = "" }) {
  useStoreSync();
  const effectivePricing = getEffectiveProductPrice(initialProduct);
  const p = { ...initialProduct, price: effectivePricing.price, mrp: effectivePricing.mrp };
  const [justAdded, setJustAdded] = useState(false);
  const isSaved = isInWishlist(p.id);
  const discount = p.mrp ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  return (
    <div
      className={`group relative flex flex-col bg-white rounded-2xl border border-[#E5DCCD] overflow-hidden shadow-subtle hover:shadow-luxury hover:border-[#C8A96E]/50 transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      {/* Thumbnail Area */}
      <Link
        to={`/product/${p.id}`}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#F7F2E9] block"
      >
        {/* Primary Image */}
        <HopoImage
          src={p.image}
          alt={p.title}
          loading="lazy"
          productId={p.id}
          title={p.title}
          category={p.category}
          brand={p.brand}
          className={`h-full w-full object-cover transition-all duration-500 ease-out ${p.images && p.images.length > 1 ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-[1.03]"}`}
        />

        {/* Secondary Hover Image (Back design / macro detail) */}
        {p.images && p.images.length > 1 && (
          <HopoImage
            src={p.images[1]}
            alt={`${p.title} - Alternate View`}
            loading="lazy"
            productId={p.id}
            title={p.title}
            category={p.category}
            brand={p.brand}
            className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out scale-105 group-hover:scale-100"
          />
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {p.tag &&
            (() => {
              const displayTag = p.tag.replace(/\bEDIT\b/gi, "").trim();
              if (!displayTag) return null;
              return (
                <span
                  className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-xs ${
                    displayTag.includes("BRIDAL")
                      ? "bg-[#8B1E3F] text-white"
                      : displayTag === "BESTSELLER"
                        ? "bg-[#C8A96E] text-[#0D1B2A]"
                        : displayTag.includes("WEDDING") || displayTag.includes("RECEPTION")
                          ? "bg-[#0D1B2A] text-white"
                          : "bg-[#8B1E3F] text-white"
                  }`}
                >
                  {displayTag}
                </span>
              );
            })()}
          {p.fabric && (
            <Link
              to={`/listing?fabric=${encodeURIComponent(p.fabric)}`}
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:inline-block rounded-md px-1.5 py-0.5 text-[8.5px] font-medium bg-black/60 hover:bg-[#8B1E3F] text-white/90 backdrop-blur-xs w-fit transition pointer-events-auto"
            >
              {p.fabric}
            </Link>
          )}
        </div>

        {/* Multi-photo count pill */}
        {p.images && p.images.length > 1 && (
          <span className="absolute bottom-2.5 right-2.5 rounded-full px-2 py-0.5 text-[8.5px] font-medium bg-black/50 text-white backdrop-blur-xs z-10">
            {p.images.length} views
          </span>
        )}

        {/* Quick Add / Quick View Overlay on Desktop Hover */}
        <div className="absolute inset-x-2.5 bottom-2.5 hidden lg:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-20">
          <Link
            to={`/product/${p.id}`}
            className="flex-1 text-center py-2 rounded-xl bg-white/95 backdrop-blur-md text-[#0D1B2A] font-medium text-xs shadow-md border border-[#E5DCCD] hover:bg-[#8B1E3F] hover:text-white transition flex items-center justify-center gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(p, "M", 1);
              setJustAdded(true);
              setTimeout(() => setJustAdded(false), 2000);
            }}
            className={`p-2 rounded-xl text-white shadow-md transition ${justAdded ? "bg-[#2E7D6B]" : "bg-[#8B1E3F] hover:bg-[#5E0F27]"}`}
            aria-label="Add to cart"
          >
            {justAdded ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </Link>

      {/* Wishlist Button */}
      <button
        aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(p);
        }}
        className={`absolute top-2.5 right-2.5 rounded-full p-2 backdrop-blur-md transition-all duration-200 shadow-xs z-10 ${
          isSaved
            ? "bg-[#8B1E3F] text-white scale-110"
            : "bg-white/85 text-[#0D1B2A]/70 hover:text-[#8B1E3F] hover:bg-white"
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
      </button>

      {/* Product Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {(() => {
            const categoryName = normalizeCategoryName(p.category) || p.category;
            const categorySlug = categoryName ? categoryToSlug(categoryName) : "";
            return categoryName ? (
              <Link
                to={categorySlug ? `/category/${categorySlug}` : "/listing"}
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#8B1E3F] truncate mb-0.5 hover:underline block w-fit"
              >
                {categoryName}
              </Link>
            ) : null;
          })()}
          <Link to={`/product/${p.id}`} className="block">
            <h3 className="text-xs sm:text-sm font-medium text-[#0D1B2A] line-clamp-1 group-hover:text-[#8B1E3F] transition-colors">
              {p.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-[#6B7280]">
            <span className="flex items-center gap-0.5 font-semibold text-[#0D1B2A]">
              <Star className="h-3 w-3 fill-[#C8A96E] text-[#C8A96E]" />
              {p.rating}
            </span>
            <span className="text-[10px] text-[#6B7280]">
              ({p.reviews?.toLocaleString("en-IN")})
            </span>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-2.5 pt-2 border-t border-[#E5DCCD]/60 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-[#0D1B2A]">
            {formatINR(p.price)}
          </span>
          {p.mrp && p.mrp > p.price && (
            <>
              <span className="text-[11px] text-[#6B7280] line-through">
                {formatINR(p.mrp)}
              </span>
              <span className="text-[10px] font-semibold text-[#8B1E3F] bg-[#8B1E3F]/10 px-1.5 py-0.5 rounded-md">
                {discount}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export function HRail({ children, className = "" }) {
  return (
    <div className={`flex gap-4 overflow-x-auto scrollbar-none pb-2 ${className}`}>{children}</div>
  );
}
