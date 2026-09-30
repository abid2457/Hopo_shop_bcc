import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { MobileFrame, AppHeader } from "@/components/app/MobileShell";
import { HopoImage } from "@/components/app/HopoImage";
import {
  Sparkles,
  Send,
  RefreshCw,
  Heart,
  ShoppingBag,
  Eye,
  CheckCircle2,
  AlertCircle,
  Star,
} from "lucide-react";
import { addToCart, toggleWishlist, isInWishlist, useStoreSync } from "@/lib/store";
import { formatINR } from "@/lib/business-config";
import { normalizeCategoryName } from "@/lib/catalog-service";
import { processStylistMessage } from "@/lib/style-assistant-service";
import { productApi } from "@/services/api/index";
const INITIAL_SUGGESTIONS = [
  "Red bridal blouse under ₹10,000",
  "Satin night suit set",
  "Royal velvet reception blouse",
  "Festive outfits under ₹15,000",
  "Elegant Indo-Western looks",
];
const INITIAL_MESSAGE = {
  id: "msg-init",
  role: "assistant",
  text: "Namaste! I am your HOPO Couture AI Stylist. Tell me your upcoming celebration, preferred silhouette (Bridal Blouse, Wedding Blouse, Night Suits, Lehenga, Salwar Suit, or Indo-Western), color, fabric, or budget, and I will curate authentic handcrafted pieces from our collection.",
  suggestions: INITIAL_SUGGESTIONS,
  timestamp: "Just now",
};
export function Assistant() {
  useStoreSync();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [context, setContext] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [addedItemMap, setAddedItemMap] = useState({});
  const [liveProducts, setLiveProducts] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    productApi
      .getProducts({ limit: 100 })
      .then((res) => {
        if (res && res.success && Array.isArray(res.data?.products)) {
          setLiveProducts(res.data.products);
        }
      })
      .catch(() => {});
  }, []);
  // Auto-scroll to bottom smoothly when messages change or while typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);
  // Handle Add to Bag with instant visual feedback
  const handleQuickAdd = (p) => {
    addToCart(p, "M", 1);
    setAddedItemMap((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [p.id]: false }));
    }, 2500);
  };
  // Send query to AI Stylist Service
  const handleSend = async (textToSend) => {
    const q = (textToSend || inputValue).trim();
    if (!q || isTyping) return;
    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      role: "user",
      text: q,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    try {
      const response = await processStylistMessage(q, context, liveProducts);
      setContext(response.updatedContext);
      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg = {
        id: aiMsgId,
        role: "assistant",
        text: response.message,
        products: response.products,
        isNearMatch: response.isNearMatch,
        nearMatchExplanation: response.nearMatchExplanation,
        isClarification: response.isClarificationNeeded,
        suggestions: response.followUpSuggestions,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: "assistant",
        text: "I am having trouble accessing the atelier catalog at this moment. Please try again or ask for another style.",
        suggestions: INITIAL_SUGGESTIONS,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };
  // Clear session to start fresh
  const handleResetSession = () => {
    setContext({});
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: "assistant",
        text: "Styling session refreshed. What celebration or silhouette would you like to explore next?",
        suggestions: INITIAL_SUGGESTIONS,
        timestamp: "Just now",
      },
    ]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  // Get active suggestion chips from the latest assistant message
  const latestAiMessage = [...messages].reverse().find((m) => m.role === "assistant");
  const activeSuggestions =
    latestAiMessage?.suggestions && latestAiMessage.suggestions.length > 0
      ? latestAiMessage.suggestions
      : INITIAL_SUGGESTIONS;
  return (
    <MobileFrame>
      <AppHeader title="HOPO AI Stylist" back showSearch={false} showBell={false} />

      {/* Main Page Layout with dedicated bottom clearance */}
      <div className="relative min-h-[calc(100vh-140px)] flex flex-col pb-44 sm:pb-40">
        {/* Premium AI Concierge Header */}
        <header className="rounded-3xl border border-[#C8A96E]/40 bg-gradient-to-br from-[#3d0d1b] via-[#5e0f27] to-[#8B1E3F] text-white p-5 sm:p-6 shadow-luxury -mt-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[#C8A96E] text-[#0D1B2A] flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="font-display text-lg sm:text-xl font-bold text-white tracking-wide">
                  HOPO Couture Concierge
                </h1>
                <p className="text-xs sm:text-sm font-medium text-[#C8A96E] mt-0.5">
                  Your Personal AI Fashion Stylist
                </p>
                <p className="text-[11px] sm:text-xs text-white/80 mt-1 max-w-xl leading-relaxed">
                  Tell us what you're looking for, and we'll curate the right pieces from the HOPO
                  SHOP collection.
                </p>
              </div>
            </div>

            {/* Reset Session Button */}
            <button
              onClick={handleResetSession}
              title="Start New Styling Session"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition shrink-0"
            >
              <RefreshCw className="h-3 w-3 text-[#C8A96E]" />
              <span className="hidden sm:inline">New Session</span>
            </button>
          </div>

          {/* Active Context Indicators */}
          {(context.category || context.color || context.maxPrice || context.occasion) && (
            <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center gap-2 flex-wrap text-[11px]">
              <span className="text-white/70 font-semibold uppercase tracking-wider text-[10px]">
                Active Filters:
              </span>
              {context.category && (
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white font-medium">
                  {context.category}
                </span>
              )}
              {context.color && (
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white font-medium">
                  Color: {context.color}
                </span>
              )}
              {context.maxPrice && (
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white font-medium">
                  Under {formatINR(context.maxPrice)}
                </span>
              )}
              {context.occasion && (
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white font-medium">
                  {context.occasion}
                </span>
              )}
            </div>
          )}
        </header>

        {/* Conversation Stream */}
        <div className="space-y-6 my-6 flex-1">
          {messages.map((m) => (
            <div key={m.id} className="space-y-3">
              {m.role === "user" ? (
                /* User Message */
                <div className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl rounded-br-xs bg-[#8B1E3F] text-white px-5 py-3 text-xs sm:text-sm font-medium shadow-subtle leading-relaxed">
                    {m.text}
                  </div>
                </div>
              ) : (
                /* Stylist Assistant Message */
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <span className="h-8 w-8 rounded-full bg-[#C8A96E] text-[#0D1B2A] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div className="max-w-[90%] sm:max-w-[85%] space-y-2">
                      <div className="rounded-3xl rounded-tl-xs bg-white border border-[#E5DCCD] px-5 py-3.5 text-xs sm:text-sm text-[#0D1B2A] shadow-subtle leading-relaxed">
                        {m.text}
                      </div>

                      {/* Near-Match Alert Banner */}
                      {m.isNearMatch && m.nearMatchExplanation && (
                        <div className="flex items-start gap-2 rounded-2xl bg-[#FAF6EE] border border-[#C8A96E]/50 p-3 text-xs text-[#0D1B2A] shadow-xs">
                          <AlertCircle className="h-4 w-4 text-[#8B1E3F] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-[#8B1E3F] text-[11px] uppercase tracking-wider">
                              Atelier Notice
                            </p>
                            <p className="text-xs text-[#6B7280] mt-0.5">
                              {m.nearMatchExplanation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Curated Product Cards Grid */}
                  {m.products && m.products.length > 0 && (
                    <div className="ml-11">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {m.products.map((p) => {
                          const isSaved = isInWishlist(p.id);
                          const isAdded = addedItemMap[p.id];
                          const discount = p.mrp
                            ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
                            : 0;
                          return (
                            <div
                              key={p.id}
                              className="group flex flex-col bg-white rounded-2xl border border-[#E5DCCD] overflow-hidden shadow-subtle hover:border-[#8B1E3F]/40 hover:shadow-luxury transition duration-300"
                            >
                              {/* Photo container */}
                              <div className="relative aspect-[3/4] bg-[#F7F2E9] overflow-hidden">
                                <Link to={`/product/${p.id}`} className="block h-full w-full">
                                  <HopoImage
                                    src={p.image}
                                    alt={p.title}
                                    productId={p.id}
                                    title={p.title}
                                    category={p.category}
                                    brand={p.brand}
                                    className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                                  />
                                </Link>

                                {/* Top Badges */}
                                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                                  {p.tag && (
                                    <span className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#8B1E3F] text-white shadow-xs">
                                      {p.tag.replace(/\bEDIT\b/gi, "").trim()}
                                    </span>
                                  )}
                                  {p.fabric && (
                                    <span className="rounded-md px-1.5 py-0.5 text-[8.5px] font-medium bg-black/60 text-white backdrop-blur-xs w-fit">
                                      {p.fabric}
                                    </span>
                                  )}
                                </div>

                                {/* Wishlist Heart */}
                                <button
                                  aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleWishlist(p);
                                  }}
                                  className={`absolute top-2.5 right-2.5 rounded-full p-2 backdrop-blur-md transition shadow-xs z-10 ${
                                    isSaved
                                      ? "bg-[#8B1E3F] text-white"
                                      : "bg-white/85 text-[#0D1B2A]/80 hover:text-[#8B1E3F] hover:bg-white"
                                  }`}
                                >
                                  <Heart
                                    className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`}
                                  />
                                </button>
                              </div>

                              {/* Details */}
                              <div className="p-3.5 flex flex-col flex-1 justify-between space-y-3">
                                <div>
                                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#8B1E3F]">
                                    <span>
                                      {normalizeCategoryName(p.category) || p.category || "Couture"}
                                    </span>
                                    {p.rating && (
                                      <span className="flex items-center gap-0.5 text-[#0D1B2A] bg-[#C8A96E]/15 px-1.5 py-0.5 rounded">
                                        <Star className="h-2.5 w-2.5 fill-[#C8A96E] text-[#C8A96E]" />
                                        {p.rating}
                                      </span>
                                    )}
                                  </div>

                                  <Link to={`/product/${p.id}`} className="block mt-1">
                                    <h3 className="text-xs sm:text-sm font-medium text-[#0D1B2A] line-clamp-2 hover:text-[#8B1E3F] transition-colors leading-snug">
                                      {p.title}
                                    </h3>
                                  </Link>
                                </div>

                                {/* Price & Actions */}
                                <div className="space-y-2 pt-2 border-t border-[#E5DCCD]/60">
                                  <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-sm sm:text-base font-bold text-[#0D1B2A]">
                                      {formatINR(p.price)}
                                    </span>
                                    {p.mrp && p.mrp > p.price && (
                                      <>
                                        <span className="text-[11px] text-[#6B7280] line-through">
                                          {formatINR(p.mrp)}
                                        </span>
                                        <span className="text-[10px] font-semibold text-[#2E7D6B] bg-emerald-50 border border-emerald-200 px-1 rounded">
                                          {discount}% OFF
                                        </span>
                                      </>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="grid grid-cols-2 gap-2 pt-1">
                                    <Link
                                      to={`/product/${p.id}`}
                                      className="text-center py-2 px-2.5 rounded-xl border border-[#E5DCCD] bg-[#FAF6EE] text-[#0D1B2A] text-xs font-semibold hover:border-[#8B1E3F] hover:text-[#8B1E3F] transition flex items-center justify-center gap-1"
                                    >
                                      <Eye className="h-3 w-3" />
                                      <span>View</span>
                                    </Link>

                                    <button
                                      onClick={() => handleQuickAdd(p)}
                                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-white transition flex items-center justify-center gap-1 shadow-xs ${
                                        isAdded ? "bg-[#2E7D6B]" : "bg-[#8B1E3F] hover:bg-[#5E0F27]"
                                      }`}
                                    >
                                      {isAdded ? (
                                        <>
                                          <CheckCircle2 className="h-3 w-3" />
                                          <span>Added ✓</span>
                                        </>
                                      ) : (
                                        <>
                                          <ShoppingBag className="h-3 w-3" />
                                          <span>Add to Bag</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#6B7280] ml-11 py-1">
              <Sparkles className="h-4 w-4 animate-spin text-[#C8A96E]" />
              <span className="italic font-medium">HOPO Stylist is curating your collection…</span>
            </div>
          )}

          {/* Dedicated anchor to ensure bottom clearance */}
          <div ref={messagesEndRef} className="h-6" />
        </div>

        {/* Fixed Bottom Input Composer Area */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/98 to-transparent pt-4 pb-4 px-3 sm:px-6 pointer-events-none">
          <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-2 pointer-events-auto">
            {/* Dynamic Suggestion Chips */}
            {activeSuggestions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 px-1">
                {activeSuggestions.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    disabled={isTyping}
                    className="shrink-0 rounded-full border border-[#E5DCCD] bg-white/95 hover:bg-[#8B1E3F] hover:text-white hover:border-[#8B1E3F] px-3.5 py-1.5 text-xs font-semibold text-[#0D1B2A] transition shadow-xs disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Composer Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 rounded-full border border-[#E5DCCD] bg-white/95 backdrop-blur-xl px-4 py-1.5 shadow-luxury focus-within:ring-2 focus-within:ring-[#8B1E3F]/30 focus-within:border-[#8B1E3F]"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask your HOPO Stylist for occasions, colors, fabrics, budgets…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-transparent text-xs sm:text-sm text-[#0D1B2A] placeholder-[#9CA3AF] outline-none py-2"
              />

              <button
                type="submit"
                disabled={isTyping || !inputValue.trim()}
                aria-label="Send query"
                className="rounded-full bg-[#8B1E3F] text-white p-2.5 hover:bg-[#5E0F27] shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </MobileFrame>
  );
}
export default Assistant;
