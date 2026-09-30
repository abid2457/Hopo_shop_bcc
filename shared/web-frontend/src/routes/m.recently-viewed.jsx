import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { ProductCard } from "@/components/app/ProductCard";
import { RECENTLY_VIEWED_IDS } from "@/lib/hopo-extra";
import { findProduct } from "@/lib/hopo-data";
import { Trash2 } from "lucide-react";
export function RecentlyViewedPage() {
  const items = RECENTLY_VIEWED_IDS.map(findProduct);
  return (
    <MobileFrame>
      <AppHeader title="Recently viewed" back showSearch={false} showBell={false} />

      <div className="px-4 flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">{items.length} items in the last 30 days</p>
        <button className="inline-flex items-center gap-1 text-xs text-destructive">
          <Trash2 className="h-3.5 w-3.5" /> Clear all
        </button>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3 pb-8">
        {items.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </MobileFrame>
  );
}
export default RecentlyViewedPage;
