import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect, useCallback } from "react";
import { MobileFrame } from "@/components/app/MobileShell";
import { EmptyState } from "@/components/app/EmptyState";
import { ProductCard } from "@/components/app/ProductCard";
import { PRODUCTS } from "@/lib/hopo-data";
import { searchCatalog, POPULAR_SEARCH_SUGGESTIONS } from "@/lib/search-engine";
import { getCategoryUrl, useDynamicCategories } from "@/lib/catalog-service";
import { productApi } from "@/services/api/index";
import {
  ChevronLeft,
  Search,
  Clock,
  TrendingUp,
  X,
  Sparkles,
  Tag,
  ArrowUpDown,
} from "lucide-react";
const recent = [
  "Bridal blouse",
  "Wedding lehenga",
  "Night suits",
  "Zardozi bridal blouse",
  "Gold jhumkas",
];
const trending = [
  "Bridal blouse",
  "Wedding lehenga",
  "Designer salwar suit",
  "Night suits",
  "Gold juttis",
  "Festive wear",
];
export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQ || "");
  const [selectedSort, setSelectedSort] = useState("relevance");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);
  const { categories: dynamicCategories } = useDynamicCategories();
  const [liveProducts, setLiveProducts] = useState(null);

  const fetchLiveProducts = useCallback(async () => {
    try {
      const res = await productApi.getProducts({ limit: 100 });
      if (res && res.success && Array.isArray(res.data?.products)) {
        setLiveProducts(res.data.products);
      }
    } catch {
      // fallback
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

  // Sync state if URL query changes
  useEffect(() => {
    if (initialQ !== undefined && initialQ !== query) {
      setQuery(initialQ);
    }
  }, [initialQ]);

  // Execute catalog search over dynamic products & categories
  const searchResults = useMemo(() => {
    return searchCatalog(query, 50, liveProducts, dynamicCategories);
  }, [query, liveProducts, dynamicCategories]);
  // Filter and sort product items
  const displayProducts = useMemo(() => {
    let items = [...searchResults.products];
    if (activeCategoryFilter) {
      items = items.filter(
        (it) =>
          it.product.category === activeCategoryFilter ||
          it.product.subcategory === activeCategoryFilter ||
          it.product.occasion === activeCategoryFilter ||
          it.product.fabric === activeCategoryFilter,
      );
    }
    if (selectedSort === "price_asc") {
      items.sort((a, b) => a.product.price - b.product.price);
    } else if (selectedSort === "price_desc") {
      items.sort((a, b) => b.product.price - a.product.price);
    } else if (selectedSort === "rating") {
      items.sort((a, b) => b.product.rating - a.product.rating);
    }
    return items;
  }, [searchResults, activeCategoryFilter, selectedSort]);
  const handleQueryChange = (newQ) => {
    setQuery(newQ);
    setActiveCategoryFilter(null);
    setSearchParams(newQ.trim() ? { q: newQ.trim() } : {}, { replace: true });
  };
  const handleClear = () => {
    setQuery("");
    setActiveCategoryFilter(null);
    setSearchParams({}, { replace: true });
  };
  return (
    <MobileFrame>
      {/* Header Search Input */}
      <div className="flex items-center gap-3 pt-2">
        <Link
          to="/home"
          className="rounded-full p-2 hover:bg-muted transition"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2 flex-1 rounded-full border bg-card px-4 py-2.5 shadow-xs focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search bridal blouses, lehengas, night suits, festive wear…"
            aria-label="Search catalog products, categories, fabrics, and occasions"
            className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={handleClear}
              aria-label="Clear search"
              className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {query.trim() ? (
        <div className="mt-6 pb-8 space-y-5">
          {/* Results Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
            <div>
              <h1 className="text-base font-semibold text-foreground">
                Search Results for "<span className="text-primary">{query}</span>"
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {displayProducts.length} {displayProducts.length === 1 ? "item" : "items"} found ·
                Sorted by {selectedSort}
              </p>
            </div>

            {/* Sort & Filter Actions */}
            {searchResults.products.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs text-muted-foreground">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="bg-transparent text-foreground font-medium outline-none cursor-pointer text-xs"
                    aria-label="Sort search results"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Related Category Filter Pills */}
          {searchResults.categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Tag className="h-3 w-3 text-gold" /> Filter:
              </span>
              <button
                type="button"
                onClick={() => setActiveCategoryFilter(null)}
                className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition ${
                  activeCategoryFilter === null
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border bg-card text-foreground hover:bg-muted"
                }`}
              >
                All Results ({searchResults.products.length})
              </button>
              {searchResults.categories.map((cat) => {
                const isActive = activeCategoryFilter === cat.title;
                return (
                  <button
                    type="button"
                    key={cat.title}
                    onClick={() => setActiveCategoryFilter(isActive ? null : cat.title)}
                    className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.title}
                  </button>
                );
              })}
            </div>
          )}

          {/* Results Grid or Empty State */}
          {displayProducts.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={Search}
                title="No Search Results Found"
                description={`We couldn't find any products matching "${query}". Try searching for categories like "blouse", "lehenga", "salwar", "night suit", or "jewellery".`}
                actionLabel="Clear Search"
                onAction={handleClear}
              />
              <div className="max-w-md mx-auto mt-6 p-4 rounded-2xl border bg-card/60">
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-gold" /> Popular Search Queries
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCH_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleQueryChange(sug)}
                      className="rounded-full bg-secondary hover:bg-primary-soft hover:text-primary px-3 py-1.5 text-xs text-foreground font-medium transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {displayProducts.map((item) => (
                <ProductCard key={item.product.id} p={item.product} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Empty / Idle State */
        <div className="space-y-6 mt-4 pb-8">
          <section>
            <p className="text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1.5 mb-2.5">
              <Clock className="h-3.5 w-3.5 text-gold" /> Recent Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQueryChange(r)}
                  className="rounded-full bg-muted/70 hover:bg-primary-soft hover:text-primary px-3.5 py-1.5 text-xs text-foreground font-medium transition"
                >
                  {r}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[10px] uppercase tracking-widest text-gold font-bold flex items-center gap-1.5 mb-2.5">
              <TrendingUp className="h-3.5 w-3.5 text-gold" /> Trending Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {trending.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQueryChange(r)}
                  className="rounded-full border border-primary/20 hover:border-primary hover:bg-primary-soft px-3.5 py-1.5 text-xs text-foreground font-medium transition"
                >
                  {r}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">
              Popular Categories
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {dynamicCategories.slice(0, 6).map((c) => (
                <Link
                  key={c.name}
                  to={getCategoryUrl(c.name)}
                  className="rounded-2xl overflow-hidden relative h-24 group border shadow-xs"
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <span className="absolute bottom-2 left-2.5 text-primary-foreground text-xs font-bold leading-tight">
                    {c.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3">
              Curated Visual Edits
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {PRODUCTS.slice(0, 6).map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted border group shadow-xs"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </MobileFrame>
  );
}
export default SearchPage;
