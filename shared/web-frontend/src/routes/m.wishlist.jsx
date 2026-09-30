import { Link } from "react-router-dom";
import { MobileFrame, AppHeader, BottomNav, PriceTag } from "@/components/app/MobileShell";
import { EmptyState } from "@/components/app/EmptyState";
import { Heart, ShoppingBag } from "lucide-react";
import { useStoreSync, getWishlist, toggleWishlist, addToCart } from "@/lib/store";
import { normalizeCategoryName } from "@/lib/catalog-service";
import { HopoImage } from "@/components/app/HopoImage";
export function Wishlist() {
  useStoreSync();
  const items = getWishlist();
  const handleMoveToBag = (product) => {
    addToCart(product, "M", 1);
    toggleWishlist(product);
  };
  return (
    <MobileFrame>
      <AppHeader title="My Saved Wishlist" />

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Explore our festive edits and save the luxury pieces you adore."
          actionLabel="Explore New Arrivals"
          actionTo="/home"
        />
      ) : (
        <>
          <div className="flex items-center justify-between -mt-2">
            <p className="text-xs text-[#6B7280] font-medium">
              <strong className="text-[#0D1B2A]">{items.length}</strong> saved{" "}
              {items.length === 1 ? "piece" : "pieces"} in your private collection
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 mt-4 pb-6">
            {items.map((p) => (
              <div
                key={p.id}
                className="rounded-3xl border border-[#E5DCCD] bg-white overflow-hidden shadow-subtle group hover:border-[#8B1E3F]/40 hover:shadow-luxury transition"
              >
                <Link to={`/product/${p.id}`} className="block relative">
                  <div className="aspect-[3/4] overflow-hidden bg-[#F7F2E9]">
                    <HopoImage
                      src={p.image}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      alt={p.title}
                      productId={p.id}
                      title={p.title}
                      category={p.category}
                      brand={p.brand}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(p);
                    }}
                    className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-xs p-2 text-[#8B1E3F] shadow-xs hover:scale-110 transition"
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="h-4 w-4 fill-[#8B1E3F]" />
                  </button>
                </Link>

                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-bold text-[#8B1E3F] tracking-widest uppercase">
                    {normalizeCategoryName(p.category) || p.category || "Couture"}
                  </p>
                  <p className="text-xs text-[#0D1B2A] truncate font-medium">{p.title}</p>
                  <PriceTag price={p.price} mrp={p.mrp} />

                  <button
                    onClick={() => handleMoveToBag(p)}
                    className="mt-3 flex items-center justify-center gap-2 w-full rounded-full bg-[#8B1E3F] text-white py-2.5 text-xs uppercase font-bold tracking-wider shadow-xs hover:bg-[#5E0F27] transition active:scale-95"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <BottomNav active="wishlist" />
    </MobileFrame>
  );
}
export default Wishlist;
