import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { MobileFrame, AppHeader, PriceTag, SectionHeading } from "@/components/app/MobileShell";
import { ProductCard } from "@/components/app/ProductCard";
import { findProduct, COMPLETE_THE_LOOK, REVIEWS } from "@/lib/hopo-data";
import {
  normalizeCategoryName,
  categoryToSlug,
  getCategoryUrl,
  getRelatedProducts,
} from "@/lib/catalog-service";
import { getProductVariants, calculateItemTotal } from "@/lib/variant-service";
import { productApi } from "@/services/api/index";
import { resolveUploadedImageUrl } from "@/lib/image-resolver";
import {
  Heart,
  Share2,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  MapPin,
  Award,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Minus,
  Plus,
  AlertCircle,
} from "lucide-react";
import {
  addToCart,
  toggleWishlist,
  isInWishlist,
  useStoreSync,
  getEffectiveProductPrice,
  getAuthUser,
  setPendingPurchaseIntent,
} from "@/lib/store";
import { formatINR, checkPincodeServiceability } from "@/lib/business-config";
export function ProductPage() {
  useStoreSync();
  const navigate = useNavigate();
  const { id } = useParams();
  const [liveProduct, setLiveProduct] = useState(null);
  const [productPool, setProductPool] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;
    setLoading(true);
    productApi
      .getProductById(id)
      .then((res) => {
        if (isMounted && res && res.success && res.data) {
          setLiveProduct(res.data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch dynamic product details from API:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    productApi
      .getProducts({ limit: 50 })
      .then((res) => {
        if (isMounted && res && res.success && Array.isArray(res.data?.products)) {
          setProductPool(res.data.products);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [id]);

  const rawProduct = useMemo(() => {
    const staticItem = findProduct(id || "p1");
    if (!liveProduct) return staticItem;
    return {
      ...staticItem,
      ...liveProduct,
      price: Number(liveProduct.price) || staticItem?.price || 0,
      mrp: Number(liveProduct.mrp) || staticItem?.mrp || 0,
      image: resolveUploadedImageUrl(liveProduct.image || staticItem?.image),
      images: Array.isArray(liveProduct.images) && liveProduct.images.length > 0
        ? liveProduct.images.map((img) => resolveUploadedImageUrl(img))
        : staticItem?.images,
    };
  }, [id, liveProduct]);

  const effectivePricing = getEffectiveProductPrice(rawProduct);
  const p = useMemo(
    () => ({
      ...rawProduct,
      price: effectivePricing.price,
      mrp: effectivePricing.mrp,
    }),
    [rawProduct, effectivePricing.price, effectivePricing.mrp],
  );

  // Authentic product variants from the single source of truth
  const variants = useMemo(() => {
    const rawVariants = getProductVariants(p);
    return rawVariants.map((v) => ({
      ...v,
      image: resolveUploadedImageUrl(v.image),
      images: Array.isArray(v.images)
        ? v.images.map((img) => resolveUploadedImageUrl(img))
        : [resolveUploadedImageUrl(v.image)],
    }));
  }, [p]);

  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  // Active selected variant
  const activeVariant = variants[selectedColorIdx] || variants[0];

  // Dynamic gallery images based on the active variant
  const galleryImages = useMemo(() => {
    let imgs = [];
    if (activeVariant?.images && activeVariant.images.length > 0) {
      imgs = activeVariant.images;
    } else if (activeVariant?.image) {
      imgs = [activeVariant.image];
    } else {
      imgs = p.images ?? [p.image, p.image, p.image];
    }
    return imgs.map((imgUrl) => resolveUploadedImageUrl(imgUrl));
  }, [activeVariant, p]);
  const [img, setImg] = useState(0);
  // Available sizes for the active variant
  const availableSizes = useMemo(() => {
    return activeVariant?.sizes || [{ size: "Free Size", stock: 5 }];
  }, [activeVariant]);
  // Selected size state
  const [size, setSize] = useState(() => {
    const firstInStock = availableSizes.find((s) => s.stock > 0);
    return firstInStock ? firstInStock.size : availableSizes[0]?.size || "M";
  });
  // Quantity state
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  // Accordion states
  const [openSection, setOpenSection] = useState("details");
  const isSaved = isInWishlist(p.id);
  // Strict Category & Related Product Calculations
  const canonicalCategory = normalizeCategoryName(p.category);
  const categorySlug = canonicalCategory ? categoryToSlug(canonicalCategory) : "";
  const relatedProducts = useMemo(() => getRelatedProducts(p, 5, productPool), [p, productPool]);
  const relatedTitle = canonicalCategory ? `Related ${canonicalCategory}` : "Related Ensembles";
  const relatedViewAllUrl = canonicalCategory ? getCategoryUrl(canonicalCategory) : "/listing";
  // Reset states when product changes
  useEffect(() => {
    setSelectedColorIdx(0);
    setImg(0);
    setQuantity(1);
    const firstInStock = variants[0]?.sizes?.find((s) => s.stock > 0);
    if (firstInStock) {
      setSize(firstInStock.size);
    }
  }, [p.id, variants]);
  // When color variant changes, reset image index and auto-switch size if current size is out-of-stock
  useEffect(() => {
    setImg(0);
    const sizeInStock = availableSizes.find(
      (s) => s.size.toLowerCase() === size.toLowerCase() && s.stock > 0,
    );
    if (!sizeInStock) {
      const firstAvail = availableSizes.find((s) => s.stock > 0);
      if (firstAvail) {
        setSize(firstAvail.size);
      }
    }
  }, [selectedColorIdx, availableSizes]);
  // Stock for current (color, size) selection
  const currentStock = useMemo(() => {
    const sizeEntry = availableSizes.find((s) => s.size.toLowerCase() === size.toLowerCase());
    return sizeEntry ? sizeEntry.stock : 0;
  }, [availableSizes, size]);
  // Constrain quantity when currentStock changes
  useEffect(() => {
    if (currentStock === 0) {
      // Out of stock
    } else if (quantity > currentStock) {
      setQuantity(currentStock);
    } else if (quantity < 1) {
      setQuantity(1);
    }
  }, [currentStock, quantity]);
  // Dynamic pricing
  const unitPrice = activeVariant?.price ?? p.price;
  const unitMrp = activeVariant?.mrp ?? p.mrp;
  const itemTotal = calculateItemTotal(unitPrice, quantity);
  const totalSavings = unitMrp > unitPrice ? (unitMrp - unitPrice) * quantity : 0;
  const handleCheckPincode = (e) => {
    e.preventDefault();
    const res = checkPincodeServiceability(pincode);
    setPincodeStatus(res.message);
  };
  const handleAddToCart = () => {
    if (currentStock === 0) return;
    addToCart(p, size, quantity, activeVariant);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };
  const handleBuyNow = () => {
    if (currentStock === 0) return;
    const user = getAuthUser();
    addToCart(p, size, quantity, activeVariant);
    if (!user) {
      setPendingPurchaseIntent({
        productId: p.id,
        size,
        quantity,
        variantId: activeVariant?.id,
        colorName: activeVariant?.colorName,
      });
      navigate("/login?redirect=/checkout");
      return;
    }
    navigate("/checkout");
  };
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };
  const toggleAccordion = (name) => {
    setOpenSection(openSection === name ? null : name);
  };
  return (
    <MobileFrame>
      <AppHeader title={p.title} back showSearch={false} showBell={false} />

      {/* Interactive Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-[#6B7280] -mt-1 mb-4 overflow-x-auto scrollbar-none py-1"
      >
        <Link to="/home" className="hover:text-[#8B1E3F] transition shrink-0">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-[#A88448] shrink-0" />
        <Link to="/categories" className="hover:text-[#8B1E3F] transition shrink-0">
          Categories
        </Link>
        {canonicalCategory && (
          <>
            <ChevronRight className="h-3 w-3 text-[#A88448] shrink-0" />
            <Link
              to={`/category/${categorySlug}`}
              className="hover:text-[#8B1E3F] transition shrink-0 font-medium"
            >
              {canonicalCategory}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3 text-[#A88448] shrink-0" />
        <span className="font-semibold text-[#0D1B2A] truncate shrink-0 max-w-[200px] sm:max-w-[320px]">
          {p.title}
        </span>
      </nav>

      {/* Main Product Layout: 2-column on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[3/4] bg-[#F7F2E9] overflow-hidden rounded-3xl border border-[#E5DCCD] shadow-luxury group">
            <img
              src={galleryImages[img] || activeVariant.image}
              alt={`${p.title} - ${activeVariant.colorName}`}
              className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Top Tag */}
            {p.tag && (
              <span className="absolute top-4 left-4 rounded-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#8B1E3F] text-white shadow-md">
                {p.tag.replace(/\bEDIT\b/gi, "").trim()}
              </span>
            )}

            {/* Top Right Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2.5 z-10">
              <button
                aria-label={isSaved ? "Saved to Wishlist" : "Save to Wishlist"}
                onClick={() => toggleWishlist(p)}
                className={`rounded-full p-2.5 backdrop-blur-md transition shadow-md ${isSaved ? "bg-[#8B1E3F] text-white" : "bg-white/90 text-[#0D1B2A] hover:text-[#8B1E3F] hover:bg-white"}`}
              >
                <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              </button>

              <button
                aria-label="Share product"
                onClick={handleShare}
                className="rounded-full bg-white/90 backdrop-blur-md p-2.5 text-[#0D1B2A] hover:text-[#8B1E3F] hover:bg-white transition shadow-md relative"
              >
                <Share2 className="h-4 w-4" />
                {copied && (
                  <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-[#0D1B2A] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                    Link Copied!
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {galleryImages.map((src, i) => (
              <button
                key={`${src}-${i}`}
                onClick={() => setImg(i)}
                aria-label={`View photo ${i + 1}`}
                className={`h-20 w-16 sm:h-24 sm:w-20 rounded-2xl overflow-hidden border-2 shrink-0 transition ${i === img ? "border-[#8B1E3F] shadow-sm scale-95" : "border-[#E5DCCD] opacity-70 hover:opacity-100"}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Details & Purchasing */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B2A] leading-tight flex-1">
                {p.title}
              </h1>
              {canonicalCategory && (
                <Link
                  to={`/category/${categorySlug}`}
                  className="shrink-0 text-[11px] sm:text-xs font-semibold text-[#6B7280] hover:text-[#8B1E3F] transition bg-[#FAF6EE] px-3 py-1 rounded-full border border-[#E5DCCD] hover:border-[#8B1E3F]/40 shadow-2xs whitespace-nowrap mt-1"
                >
                  {canonicalCategory}
                </Link>
              )}
            </div>

            {/* Rating Summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-[#C8A96E]/15 px-2 py-0.5 rounded-md text-xs font-bold text-[#0D1B2A]">
                <Star className="h-3.5 w-3.5 fill-[#C8A96E] text-[#C8A96E]" />
                <span>{p.rating}</span>
              </div>
              <span className="text-xs text-[#6B7280]">•</span>
              <a
                href="#reviews"
                className="text-xs text-[#6B7280] hover:text-[#8B1E3F] hover:underline"
              >
                {p.reviews.toLocaleString("en-IN")} Verified Customer Reviews
              </a>
            </div>

            {/* Price Box */}
            <div className="mt-4 border-t border-b border-[#E5DCCD] py-3.5">
              <PriceTag price={unitPrice} mrp={unitMrp} />
              <p className="text-[11px] text-[#2E7D6B] font-semibold mt-1">
                Inclusive of all taxes • Free express shipping Pan-India
              </p>
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A]">
                Color:{" "}
                <span className="font-semibold text-[#8B1E3F]">{activeVariant.colorName}</span>
              </p>
              <span className="text-[11px] text-[#6B7280]">
                {variants.length} {variants.length === 1 ? "Authentic Shade" : "Authentic Shades"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {variants.map((v, i) => {
                const isSelected = i === selectedColorIdx;
                return (
                  <button
                    key={v.id || v.colorName}
                    onClick={() => setSelectedColorIdx(i)}
                    aria-label={`Select color ${v.colorName}`}
                    title={v.colorName}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition ${
                      isSelected
                        ? "border-[#8B1E3F] bg-[#FAF6EE] ring-2 ring-[#8B1E3F]/20 shadow-xs"
                        : "border-[#E5DCCD] bg-white hover:border-[#8B1E3F]/50"
                    }`}
                  >
                    <span
                      className={`h-4.5 w-4.5 rounded-full border border-black/15 shrink-0 transition-transform ${isSelected ? "scale-110 shadow-xs" : "group-hover:scale-105"}`}
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <span
                      className={`text-xs font-semibold ${isSelected ? "text-[#8B1E3F]" : "text-[#0D1B2A]"}`}
                    >
                      {v.colorName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A]">
                Select Size: <span className="font-semibold text-[#8B1E3F]">{size}</span>
              </p>
              <Link
                to="/size-guide"
                className="text-xs text-[#8B1E3F] font-semibold hover:underline"
              >
                View Size Guide
              </Link>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {availableSizes.map((s) => {
                const isSelected = s.size.toLowerCase() === size.toLowerCase();
                const isOutOfStock = s.stock === 0;
                return (
                  <button
                    key={s.size}
                    disabled={isOutOfStock}
                    onClick={() => setSize(s.size)}
                    title={
                      isOutOfStock ? `${s.size} (Out of stock)` : `${s.size} (${s.stock} in stock)`
                    }
                    className={`h-11 min-w-12 px-3 rounded-xl border text-xs sm:text-sm font-bold transition ${
                      isSelected
                        ? "border-[#8B1E3F] bg-[#8B1E3F] text-white shadow-xs"
                        : isOutOfStock
                          ? "border-[#E5DCCD] bg-[#F7F2E9]/60 text-[#9CA3AF] cursor-not-allowed opacity-50 line-through"
                          : "border-[#E5DCCD] bg-white text-[#0D1B2A] hover:border-[#8B1E3F]/50"
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Inventory Stock Status */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A]">Quantity:</p>
              <div>
                {currentStock === 0 ? (
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                  </span>
                ) : currentStock <= 3 ? (
                  <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Only {currentStock} left in stock
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-[#2E7D6B] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({currentStock} available)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#E5DCCD] rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || currentStock === 0}
                  aria-label="Decrease quantity"
                  className="px-3.5 py-2 text-sm font-bold text-[#0D1B2A] hover:bg-[#F7F2E9] transition disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-4 py-2 text-xs font-bold text-[#0D1B2A] min-w-8 text-center">
                  {currentStock === 0 ? 0 : quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  disabled={quantity >= currentStock || currentStock === 0}
                  aria-label="Increase quantity"
                  className="px-3.5 py-2 text-sm font-bold text-[#0D1B2A] hover:bg-[#F7F2E9] transition disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="text-xs text-[#6B7280]">
                <span className="font-semibold text-[#0D1B2A]">{formatINR(unitPrice)}</span> per
                ensemble
              </div>
            </div>

            {/* Live Real-Time Item Total Box */}
            <div className="rounded-2xl bg-[#FAF6EE] border border-[#E5DCCD] p-3.5 flex items-center justify-between shadow-subtle">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#6B7280] font-bold">
                  Item Total ({currentStock === 0 ? 0 : quantity}{" "}
                  {quantity === 1 ? "piece" : "pieces"})
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {formatINR(unitPrice)} × {currentStock === 0 ? 0 : quantity}
                  {totalSavings > 0 && currentStock > 0 && (
                    <span className="text-[#2E7D6B] font-semibold ml-1.5">
                      (Save {formatINR(totalSavings)})
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#8B1E3F]">
                  {formatINR(currentStock === 0 ? 0 : itemTotal)}
                </p>
              </div>
            </div>
          </div>

          {/* Pincode Delivery Estimator */}
          <div className="rounded-2xl border border-[#E5DCCD] bg-white p-4 shadow-subtle space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0D1B2A] uppercase tracking-wider">
              <MapPin className="h-4 w-4 text-[#8B1E3F]" />
              <span>Check Delivery & Cash On Delivery</span>
            </div>
            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-[#F7F2E9] text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0D1B2A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8B1E3F] transition shrink-0"
              >
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p
                className={`text-xs mt-1 ${pincodeStatus.startsWith("Available") ? "text-[#2E7D6B] font-semibold" : "text-[#8B1E3F]"}`}
              >
                {pincodeStatus}
              </p>
            )}
          </div>

          {/* 3 Quick Assurance Badges */}
          <div className="grid grid-cols-3 gap-3 text-center pt-1">
            {[
              { icon: Truck, label: "Free Express Shipping" },
              { icon: RotateCcw, label: "7-Day Easy Returns" },
              { icon: ShieldCheck, label: "100% Authentic Silk" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-[#E5DCCD] bg-white p-3 shadow-xs"
              >
                <Icon className="h-5 w-5 mx-auto text-[#C8A96E] mb-1" />
                <p className="text-[11px] font-medium text-[#0D1B2A]">{label}</p>
              </div>
            ))}
          </div>

          {/* Action CTAs: Add to Bag & Buy Now */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={currentStock === 0}
              className="w-full flex-1 flex items-center justify-center gap-2 rounded-full bg-[#8B1E3F] text-white py-3.5 text-xs uppercase font-bold tracking-widest hover:bg-[#5E0F27] shadow-md transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {addedToast ? (
                <CheckCircle2 className="h-4 w-4 text-[#C8A96E]" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
              <span>
                {addedToast ? "Added to Bag ✓" : currentStock === 0 ? "Out of Stock" : "Add to Bag"}
              </span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={currentStock === 0}
              className="w-full flex-1 flex items-center justify-center gap-2 rounded-full bg-[#C8A96E] text-[#0D1B2A] py-3.5 text-xs uppercase font-bold tracking-widest hover:brightness-110 shadow-md transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Award className="h-4 w-4" />
              <span>{currentStock === 0 ? "Unavailable" : "Buy Now"}</span>
            </button>
          </div>

          {/* Luxury Accordions */}
          <div className="border-t border-[#E5DCCD] pt-4 space-y-2">
            {/* Garment Details & Craftsmanship */}
            <div className="border border-[#E5DCCD] rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion("details")}
                className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0D1B2A] hover:bg-[#F7F2E9] transition"
              >
                <span>
                  {p.category?.toLowerCase().includes("blouse")
                    ? "Blouse Atelier Craft & Specifications"
                    : "Product Details & Fabric"}
                </span>
                {openSection === "details" ? (
                  <ChevronUp className="h-4 w-4 text-[#8B1E3F]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                )}
              </button>
              {openSection === "details" && (
                <div className="px-5 pb-4 text-xs text-[#6B7280] space-y-2.5 border-t border-[#E5DCCD]/60 pt-3">
                  {p.category?.toLowerCase().includes("blouse") ? (
                    <>
                      <p>
                        • <strong>Embroidery / Work:</strong>{" "}
                        <span className="text-[#0D1B2A] font-medium">
                          {p.workType || "Intricate Hand Zardozi, Aari & Pearl Bullion"}
                        </span>
                      </p>
                      <p>
                        • <strong>Fabric:</strong>{" "}
                        <Link
                          to={`/listing?fabric=${encodeURIComponent(p.fabric || "Raw Silk")}`}
                          className="text-[#8B1E3F] font-semibold hover:underline"
                        >
                          {p.fabric || "Pure Raw Silk"}
                        </Link>{" "}
                        with Butter Silk Lining
                      </p>
                      <p>
                        • <strong>Neckline:</strong>{" "}
                        <span className="text-[#0D1B2A] font-medium">
                          {p.neckline || "Sweetheart Neckline"}
                        </span>
                      </p>
                      <p>
                        • <strong>Sleeve Style:</strong>{" "}
                        <span className="text-[#0D1B2A] font-medium">
                          {p.sleeve || "Elbow Sleeve with Embellished Borders"}
                        </span>
                      </p>
                      <p>
                        • <strong>Padding:</strong>{" "}
                        <span className="text-[#0D1B2A] font-medium">
                          {p.padding || "Built-in Luxury Structured Cups"}
                        </span>
                      </p>
                      <p>
                        • <strong>Closure:</strong>{" "}
                        <span className="text-[#0D1B2A] font-medium">
                          {p.closure || "Back Hook & Eye with Dori Latkans"}
                        </span>
                      </p>
                      <p>
                        • <strong>Alteration Margin:</strong>{" "}
                        <span className="text-[#2E7D6B] font-semibold">
                          {p.margin || "2 inches extra seam margin on both sides"}
                        </span>
                      </p>
                      <p>
                        • <strong>Occasion:</strong>{" "}
                        <Link
                          to={`/listing?occasion=${encodeURIComponent(p.occasion || "Wedding")}`}
                          className="text-[#8B1E3F] font-semibold hover:underline"
                        >
                          {p.occasion || "Wedding & Bridal Celebrations"}
                        </Link>
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        • <strong>Fabric:</strong>{" "}
                        <Link
                          to={`/listing?fabric=${encodeURIComponent(p.fabric || "Pure Silk")}`}
                          className="text-[#8B1E3F] font-semibold hover:underline"
                        >
                          {p.fabric || "Premium Handcrafted Fabric"}
                        </Link>
                      </p>
                      <p>
                        • <strong>Craftsmanship:</strong> Artisanal tailoring and fine
                        hand-finishing
                      </p>
                      <p>
                        • <strong>Occasion:</strong>{" "}
                        <Link
                          to={`/listing?occasion=${encodeURIComponent(p.occasion || "Celebrations")}`}
                          className="text-[#8B1E3F] font-semibold hover:underline"
                        >
                          {p.occasion || "Celebrations & Comfort Wear"}
                        </Link>
                      </p>
                      <p>
                        • <strong>Fit & Feel:</strong> Designed for an elegant, comfortable drape
                      </p>
                      <p>
                        • <strong>Origin:</strong> Handcrafted by master artisans in India
                      </p>
                    </>
                  )}
                  <p>
                    • <strong>Wash Care:</strong> Dry clean only to preserve metallic zari and
                    embroideries.
                  </p>
                </div>
              )}
            </div>

            {/* Wash & Care Instructions */}
            <div className="border border-[#E5DCCD] rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion("care")}
                className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0D1B2A] hover:bg-[#F7F2E9] transition"
              >
                <span>Wash & Care Instructions</span>
                {openSection === "care" ? (
                  <ChevronUp className="h-4 w-4 text-[#8B1E3F]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                )}
              </button>
              {openSection === "care" && (
                <div className="px-5 pb-4 text-xs text-[#6B7280] space-y-1.5 border-t border-[#E5DCCD]/60 pt-3">
                  <p>• Dry clean only. Do not machine wash.</p>
                  <p>• Store wrapped in a soft muslin or cotton cloth away from moisture.</p>
                  <p>• Iron on low heat on the reverse side or use a steamer.</p>
                </div>
              )}
            </div>

            {/* Shipping, Returns & Authenticity */}
            <div className="border border-[#E5DCCD] rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0D1B2A] hover:bg-[#F7F2E9] transition"
              >
                <span>Shipping, Returns & Authenticity</span>
                {openSection === "shipping" ? (
                  <ChevronUp className="h-4 w-4 text-[#8B1E3F]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#6B7280]" />
                )}
              </button>
              {openSection === "shipping" && (
                <div className="px-5 pb-4 text-xs text-[#6B7280] space-y-1.5 border-t border-[#E5DCCD]/60 pt-3">
                  <p>• Dispatch within 24–48 hours of order confirmation.</p>
                  <p>• Hassle-free 7-day return/exchange from the date of delivery.</p>
                  <p>• Certified with Silk Mark India & HOPO 100% Authenticity Guarantee.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complete the look (Accessories & Complementary Jewelry - Strictly Distinct) */}
      <section className="my-10">
        <SectionHeading eyebrow="STYLE IT WITH" title="Complete the Look" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {COMPLETE_THE_LOOK.map((a) => (
            <ProductCard key={a.id} p={a} />
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section
        id="reviews"
        className="my-10 rounded-3xl border border-[#E5DCCD] bg-white p-6 sm:p-8 shadow-subtle space-y-6"
      >
        <div className="flex items-center justify-between border-b border-[#E5DCCD] pb-4">
          <div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0D1B2A]">
              Customer Reviews
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Real verified ratings from our discerning customers
            </p>
          </div>
          <Link
            to="/reviews"
            className="text-xs font-bold text-[#8B1E3F] hover:underline uppercase tracking-wider"
          >
            View all ({p.reviews.toLocaleString("en-IN")}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#F7F2E9] rounded-2xl border border-[#E5DCCD] text-center">
            <span className="text-4xl font-display font-bold text-[#0D1B2A]">{p.rating}</span>
            <div className="flex my-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-[#C8A96E] text-[#C8A96E]" />
              ))}
            </div>
            <p className="text-xs text-[#6B7280] font-medium">
              {p.reviews.toLocaleString("en-IN")} verified buyer reviews
            </p>
          </div>

          <div className="md:col-span-8 space-y-3">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {REVIEWS.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="w-22 shrink-0 rounded-xl overflow-hidden border border-[#E5DCCD] shadow-xs"
                >
                  <img src={r.image} alt="" className="h-24 w-22 object-cover" />
                </div>
              ))}
            </div>
            <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DCCD]/80">
              <p className="text-xs text-[#0D1B2A] italic">
                "{liveProduct?.customerReviews?.[0]?.comment || REVIEWS[0].text}"
              </p>
              <p className="text-[11px] text-[#8B1E3F] font-bold mt-1">
                — {liveProduct?.customerReviews?.[0]?.author || REVIEWS[0].name}{" "}
                <span className="text-[#2E7D6B] font-normal">• Verified Buyer</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strictly Category-Matched Related Ensembles */}
      <section className="my-10">
        <SectionHeading title={relatedTitle} action="VIEW ALL" actionTo={relatedViewAllUrl} />
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedProducts.map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6B7280]">Explore our full curated couture collections.</p>
        )}
      </section>
    </MobileFrame>
  );
}
export default ProductPage;
