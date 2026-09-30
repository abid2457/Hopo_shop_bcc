import { Link } from "react-router-dom";
import { useState } from "react";
import { MobileFrame, AppHeader, BottomNav } from "@/components/app/MobileShell";
import { useDynamicCategories, categoryToSlug } from "@/lib/catalog-service";
import { ArrowRight, Sparkles } from "lucide-react";
export function Categories() {
  const [active, setActive] = useState(0);
  const { categories, loading } = useDynamicCategories();
  const safeActive = Math.min(active, Math.max(0, categories.length - 1));
  const cat = categories[safeActive] || categories[0] || {};
  return (
    <MobileFrame>
      <AppHeader title="Haute Couture Categories" />

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 mt-2">
        {/* Category Selector List */}
        <aside className="bg-white rounded-3xl border border-[#E5DCCD] p-2.5 shadow-subtle space-y-1.5 h-fit">
          {categories.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setActive(i)}
              className={`flex items-center gap-3 w-full text-left px-3.5 py-3 text-xs font-bold rounded-2xl transition ${
                i === active
                  ? "bg-[#8B1E3F] text-white shadow-xs"
                  : "text-[#6B7280] hover:bg-[#F7F2E9] hover:text-[#0D1B2A]"
              }`}
            >
              <div className="h-8 w-8 rounded-full overflow-hidden bg-[#F7F2E9] border border-[#E5DCCD] shrink-0">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="truncate block">{c.name}</span>
                <span
                  className={`text-[10px] font-normal block ${i === safeActive ? "text-white/80" : "text-[#82786D]"}`}
                >
                  {c.count ?? 0} {(c.count ?? 0) === 1 ? "Product" : "Products"}
                </span>
              </div>
            </button>
          ))}
        </aside>

        {/* Category Content Area */}
        <main className="space-y-6">
          {/* Header Banner */}
          <div className="relative min-h-[160px] sm:min-h-[200px] rounded-3xl overflow-hidden shadow-luxury border border-[#C8A96E]/40">
            <img
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/95 via-[#0D1B2A]/70 to-transparent" />
            <div className="relative z-10 flex flex-col justify-center px-6 sm:px-10 py-6 text-white space-y-2 max-w-md">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#C8A96E] uppercase">
                {cat.count ?? 0} {(cat.count ?? 0) === 1 ? "Product" : "Products"}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {cat.slug === "night-suits" ? "Relax in Style" : cat.title || cat.name}
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">{cat.description}</p>
              <div className="pt-2">
                <Link
                  to={`/category/${cat.slug || categoryToSlug(cat.name)}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C8A96E] text-[#0D1B2A] text-xs font-bold uppercase tracking-wider hover:brightness-110 transition shadow-md"
                >
                  <span>
                    {cat.slug === "night-suits"
                      ? "SHOP NIGHT SUITS"
                      : `Explore All ${cat.name} (${cat.count ?? 0})`}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Subcategories Grid or Clean Empty State */}
          {(cat.subs && cat.subs.length > 0) || (cat.subcategories && cat.subcategories.length > 0) ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(cat.subs || cat.subcategories).map((subItem) => {
                const subName = typeof subItem === "string" ? subItem : subItem.name;
                const subImg = typeof subItem === "object" && subItem.image ? subItem.image : cat.image;
                return (
                  <Link
                    to={`/listing?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(subName)}`}
                    key={subName}
                    className="group rounded-3xl border border-[#E5DCCD] bg-white overflow-hidden hover:border-[#8B1E3F]/40 hover:shadow-luxury transition-all duration-300 shadow-subtle flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-[#F7F2E9] overflow-hidden">
                      <img
                        src={subImg}
                        alt={subName}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                    <div className="p-3.5 text-center space-y-1">
                      <p className="text-xs font-bold text-[#0D1B2A] group-hover:text-[#8B1E3F] transition truncate">
                        {subName}
                      </p>
                      <p className="text-[10px] font-semibold text-[#8B1E3F] uppercase tracking-wider flex items-center justify-center gap-1 pt-0.5">
                        <span>Explore</span>
                        <ArrowRight className="h-2.5 w-2.5" />
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-[#E5DCCD] bg-white p-10 sm:p-14 text-center shadow-subtle space-y-3">
              <div className="h-12 w-12 rounded-full bg-[#FAF6F0] border border-[#E5DCCD] flex items-center justify-center mx-auto text-[#8B1E3F]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#0D1B2A]">
                New {cat.name} Collection Arriving Soon
              </h3>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto leading-relaxed">
                Our atelier designers are currently crafting handpicked luxury styles for this
                collection. Explore our available Bridal Blouses and Lehengas in the meantime.
              </p>
              <div className="pt-2">
                <Link
                  to="/listing"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0D1B2A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8B1E3F] transition shadow-xs"
                >
                  <span>Explore Available Collections</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>

      <BottomNav active="categories" />
    </MobileFrame>
  );
}
export default Categories;
