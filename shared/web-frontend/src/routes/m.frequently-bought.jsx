import { Link } from "react-router-dom";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { FREQUENTLY_BOUGHT } from "@/lib/hopo-extra";
import { findProduct } from "@/lib/hopo-data";
import { normalizeCategoryName } from "@/lib/catalog-service";
import { Plus } from "lucide-react";
import { useState } from "react";
import { formatINR } from "@/lib/business-config";
export function FBTPage() {
  const items = FREQUENTLY_BOUGHT.map((f) => ({ ...findProduct(f.id), reason: f.reason }));
  const [picked, setPicked] = useState(Object.fromEntries(items.map((i) => [i.id, true])));
  const total = items.filter((i) => picked[i.id]).reduce((s, i) => s + i.price, 0);
  const savings = items.filter((i) => picked[i.id]).reduce((s, i) => s + (i.mrp - i.price), 0);
  return (
    <MobileFrame>
      <AppHeader title="Frequently bought together" back showSearch={false} showBell={false} />

      <div className="px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {items.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 shrink-0">
              <div className="w-24">
                <img src={p.image} alt={p.title} className="h-32 w-24 rounded-lg object-cover" />
              </div>
              {i < items.length - 1 && <Plus className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-gold-soft text-gold-foreground px-3 py-2 text-xs">
          Bundle and save {formatINR(savings)} when bought together.
        </div>

        <ul className="mt-4 space-y-3">
          {items.map((p) => (
            <li key={p.id} className="flex items-start gap-3 rounded-xl border bg-card p-3">
              <input
                type="checkbox"
                checked={!!picked[p.id]}
                onChange={(e) => setPicked((s) => ({ ...s, [p.id]: e.target.checked }))}
                className="mt-1 accent-[var(--primary)]"
              />
              <img src={p.image} alt={p.title} className="h-16 w-16 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground">
                  {normalizeCategoryName(p.category) || p.category || "Couture"}
                </p>
                <p className="text-sm line-clamp-2">{p.title}</p>
                <p className="text-[11px] text-gold mt-0.5">{p.reason}</p>
              </div>
              <p className="text-sm font-medium whitespace-nowrap">
                {formatINR(p.price)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="fixed md:absolute bottom-0 left-0 right-0 border-t bg-card px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Bundle total</p>
          <p className="font-semibold">{formatINR(total)}</p>
        </div>
        <Link
          to="/cart"
          className="flex-1 rounded-md bg-primary text-primary-foreground py-2.5 text-center text-sm font-medium"
        >
          Add bundle to bag
        </Link>
      </div>
    </MobileFrame>
  );
}
export default FBTPage;
