import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, Sparkles, Tag, ArrowRight, Star } from "lucide-react";
import { searchCatalog, POPULAR_SEARCH_SUGGESTIONS } from "@/lib/search-engine";
import { normalizeCategoryName } from "@/lib/catalog-service";
import { formatINR } from "@/lib/business-config";
export function GlobalSearch({
  variant = "navbar",
  onNavigate,
  autoFocus = false,
  placeholder = "Search bridal blouses, lehengas...",
  className = "",
  initialQuery = "",
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  // Sync initial query if updated externally
  useEffect(() => {
    if (initialQuery !== undefined && initialQuery !== query) {
      setQuery(initialQuery);
      setDebouncedQuery(initialQuery);
    }
  }, [initialQuery]);
  // Debounce search query
  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery("");
      setResults(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      const res = searchCatalog(query);
      setResults(res);
      setIsLoading(false);
      setSelectedIndex(-1);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);
  // Outside click listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);
  // Calculate total navigable items in dropdown
  const categoryCount = results?.categories.length || 0;
  const productCount = results?.products.length || 0;
  const hasViewAll = (results?.totalCount || 0) > 0;
  const totalNavItems = categoryCount + productCount + (hasViewAll ? 1 : 0);
  // Execute navigation for a selected item
  const handleSelectNavigableItem = (index) => {
    if (!results) return;
    if (index < categoryCount) {
      // Category selected
      const cat = results.categories[index];
      setIsOpen(false);
      onNavigate?.();
      const searchStr = cat.searchParam
        ? `?${new URLSearchParams(cat.searchParam).toString()}`
        : "";
      navigate(`${cat.to}${searchStr}`);
    } else if (index < categoryCount + productCount) {
      // Product selected
      const prod = results.products[index - categoryCount].product;
      setIsOpen(false);
      onNavigate?.();
      navigate(`/product/${prod.id}`);
    } else {
      // View all results
      handleViewAll();
    }
  };
  const handleViewAll = () => {
    if (!query.trim()) return;
    setIsOpen(false);
    onNavigate?.();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (totalNavItems > 0) {
          setSelectedIndex((prev) => (prev + 1) % totalNavItems);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (totalNavItems > 0) {
          setSelectedIndex((prev) => (prev - 1 + totalNavItems) % totalNavItems);
        }
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < totalNavItems) {
          handleSelectNavigableItem(selectedIndex);
        } else {
          handleViewAll();
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };
  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setResults(null);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };
  const isDropdownVisible = isOpen && query.trim().length > 0;
  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <div
        className={`flex items-center gap-1.5 sm:gap-2 rounded-full border transition-all duration-200 ${
          variant === "expanded"
            ? "bg-white px-4 py-2.5 shadow-subtle border-[#E5DCCD] focus-within:ring-2 focus-within:ring-[#8B1E3F]/30 focus-within:border-[#8B1E3F]"
            : "bg-[#EFE9DF]/90 hover:bg-[#EFE9DF] px-2.5 sm:px-3 py-1 h-8.5 xl:h-9 border-[#E0D5C1] focus-within:border-[#C8A96E] focus-within:ring-2 focus-within:ring-[#C8A96E]/20 focus-within:bg-[#FAF6F0]"
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[#8B1E3F] animate-spin shrink-0" />
        ) : (
          <Search
            className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[#4A4036] shrink-0 cursor-pointer"
            onClick={() => inputRef.current?.focus()}
          />
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={isDropdownVisible}
          aria-autocomplete="list"
          aria-controls="global-search-dropdown"
          aria-label="Search catalog products, categories, fabrics, and occasions"
          className="bg-transparent outline-none text-xs sm:text-[12.5px] xl:text-[13px] w-full text-[#1E293B] placeholder:text-[#82786D] tracking-normal min-w-0"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            className="rounded-full p-1 text-[#6B7280] hover:text-[#0D1B2A] transition hover:bg-[#E2D8C7]/50"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isDropdownVisible && (
        <div
          id="global-search-dropdown"
          role="listbox"
          className={`absolute top-full mt-2 rounded-2xl border border-[#E5DCCD] bg-white shadow-luxury z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 divide-y divide-[#E5DCCD]/50 max-h-[min(520px,75vh)] overflow-y-auto ${
            variant === "expanded"
              ? "left-0 right-0 w-full"
              : "left-0 sm:left-auto right-0 w-[calc(100vw-2rem)] sm:w-[440px] md:w-[470px] max-w-[calc(100vw-1.5rem)]"
          }`}
        >
          {isLoading && !results ? (
            <div className="p-6 text-center text-xs text-[#6B7280] flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#8B1E3F]" /> Searching HOPO SHOP
              catalog…
            </div>
          ) : results && (results.products.length > 0 || results.categories.length > 0) ? (
            <>
              {/* Categories & Collections Section */}
              {results.categories.length > 0 && (
                <div className="p-3 bg-[#F7F2E9]">
                  <p className="text-[10px] uppercase tracking-widest text-[#6B7280] font-bold px-2 mb-2 flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-[#C8A96E]" /> Categories & Collections
                  </p>
                  <div className="space-y-1">
                    {results.categories.map((cat, idx) => {
                      const isHighlighted = selectedIndex === idx;
                      return (
                        <button
                          type="button"
                          key={`${cat.type}-${cat.title}`}
                          role="option"
                          aria-selected={isHighlighted}
                          onClick={() => handleSelectNavigableItem(idx)}
                          className={`w-full flex items-center gap-3 px-2.5 py-1.5 rounded-xl text-left transition ${isHighlighted ? "bg-[#8B1E3F] text-white font-semibold shadow-xs" : "hover:bg-white text-[#0D1B2A]"}`}
                        >
                          {cat.image && (
                            <img
                              src={cat.image}
                              alt={cat.title}
                              className="h-7 w-7 rounded-lg object-cover border border-[#E5DCCD] shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium truncate block">{cat.title}</span>
                            {cat.subtitle && (
                              <span
                                className={`text-[10px] truncate block ${isHighlighted ? "text-white/80" : "text-[#6B7280]"}`}
                              >
                                {cat.subtitle}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded capitalize shrink-0 ${isHighlighted ? "bg-white/20 text-white" : "bg-[#EDE6D8] text-[#6B7280]"}`}
                          >
                            {cat.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Products Section */}
              {results.products.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] uppercase tracking-widest text-[#6B7280] font-bold px-3 py-1.5 flex items-center justify-between">
                    <span>Products ({results.totalCount})</span>
                    <span className="text-[9px] lowercase font-normal text-[#6B7280]">
                      relevance sorted
                    </span>
                  </p>
                  <div className="space-y-0.5">
                    {results.products.map((item, idx) => {
                      const overallIndex = categoryCount + idx;
                      const isHighlighted = selectedIndex === overallIndex;
                      const p = item.product;
                      const discount =
                        p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
                      return (
                        <button
                          type="button"
                          key={p.id}
                          role="option"
                          aria-selected={isHighlighted}
                          onClick={() => handleSelectNavigableItem(overallIndex)}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition ${isHighlighted ? "bg-[#8B1E3F]/10 border border-[#8B1E3F]/30 shadow-xs" : "hover:bg-[#F7F2E9]"}`}
                        >
                          {/* Thumbnail */}
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-[#EDE6D8] shrink-0 border border-[#E5DCCD]">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-semibold text-[#8B1E3F] uppercase tracking-wider truncate max-w-[140px]">
                                {normalizeCategoryName(p.category) || p.category || "Couture"}
                              </span>
                              {p.tag && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#C8A96E]/20 text-[#0D1B2A] truncate max-w-[120px]">
                                  {p.tag.replace(/\bEDIT\b/gi, "").trim()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-[#0D1B2A] truncate mt-0.5">
                              {p.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] flex-wrap">
                              <span className="font-bold text-[#0D1B2A] shrink-0">
                                {formatINR(p.price)}
                              </span>
                              {p.mrp > p.price && (
                                <span className="line-through text-[#6B7280] text-[10px] shrink-0">
                                  {formatINR(p.mrp)}
                                </span>
                              )}
                              {discount > 0 && (
                                <span className="text-[#2E7D6B] text-[10px] font-semibold shrink-0">
                                  {discount}% off
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="text-right shrink-0">
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F7F2E9] text-[#0D1B2A] border border-[#E5DCCD]">
                              <Star className="h-2.5 w-2.5 fill-[#C8A96E] text-[#C8A96E]" />{" "}
                              {p.rating}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* View All Footer */}
              <button
                type="button"
                role="option"
                aria-selected={selectedIndex === totalNavItems - 1}
                onClick={handleViewAll}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-semibold transition ${
                  selectedIndex === totalNavItems - 1
                    ? "bg-[#8B1E3F] text-white"
                    : "bg-[#F7F2E9]/60 hover:bg-[#8B1E3F]/10 hover:text-[#8B1E3F] text-[#0D1B2A]"
                }`}
              >
                <span>
                  View all {results.totalCount} results for "{query}"
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            /* Empty State */
            <div className="p-6 text-center space-y-4">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#8B1E3F]/10 text-[#8B1E3F]">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D1B2A]">
                  No results found for "<span className="text-[#8B1E3F]">{query}</span>"
                </p>
                <p className="text-xs text-[#6B7280] mt-1">
                  Try checking for spelling or search general categories like "bridal blouse",
                  "wedding lehenga", "night suits", "under 5000".
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5DCCD] text-left">
                <p className="text-[10px] uppercase tracking-widest text-[#C8A96E] font-bold mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Popular Searches
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SEARCH_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setQuery(sug);
                        inputRef.current?.focus();
                      }}
                      className="rounded-full bg-[#F7F2E9] hover:bg-[#8B1E3F] hover:text-white px-3 py-1 text-xs text-[#0D1B2A] font-medium transition border border-[#E5DCCD]"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
