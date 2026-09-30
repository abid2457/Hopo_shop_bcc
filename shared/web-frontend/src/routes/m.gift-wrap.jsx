import { Link } from "react-router-dom";
import { useState } from "react";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { GIFT_WRAP_OPTIONS } from "@/lib/hopo-extra";
import { Gift } from "lucide-react";
import { formatINR } from "@/lib/business-config";
export function GiftWrapPage() {
  const [picked, setPicked] = useState("g1");
  return (
    <MobileFrame>
      <AppHeader title="Gift wrapping" back showSearch={false} showBell={false} />

      <div className="px-4 pb-32 space-y-4">
        <div className="rounded-xl bg-gradient-gold text-gold-foreground p-4 flex items-center gap-3">
          <Gift className="h-6 w-6" />
          <div>
            <p className="font-display text-base">Make it a gift</p>
            <p className="text-[11px]">Hand‑finished wrap, no price tags, free message card.</p>
          </div>
        </div>

        <div className="space-y-3">
          {GIFT_WRAP_OPTIONS.map((g) => {
            const active = picked === g.id;
            return (
              <label
                key={g.id}
                className={`flex items-center gap-3 rounded-xl border bg-card p-3 ${active ? "border-primary ring-1 ring-ring/30" : ""}`}
              >
                <div className="h-16 w-16 rounded-md bg-secondary grid place-items-center text-[10px] text-muted-foreground">
                  WRAP
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{g.title}</p>
                  <p className="text-[11px] text-muted-foreground">{g.desc}</p>
                  <p className="text-sm mt-1">+ {formatINR(g.price)}</p>
                </div>
                <input
                  type="radio"
                  name="wrap"
                  checked={active}
                  onChange={() => setPicked(g.id)}
                  className="accent-[var(--primary)]"
                />
              </label>
            );
          })}
        </div>

        <section>
          <h2 className="font-display text-base mb-2">Personal message</h2>
          <textarea
            rows={4}
            maxLength={200}
            placeholder="Happy Diwali, Maa! With all my love…"
            className="w-full rounded-md border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
          <p className="text-[11px] text-muted-foreground mt-1 text-right">0 / 200</p>
        </section>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" defaultChecked className="accent-[var(--primary)]" />
          Hide the price on the invoice slip
        </label>
      </div>

      <div className="fixed md:absolute bottom-0 left-0 right-0 border-t bg-card px-4 py-3 flex gap-2">
        <Link to="/cart" className="flex-1 rounded-md border py-2.5 text-center text-sm">
          Skip
        </Link>
        <Link
          to="/checkout"
          className="flex-1 rounded-md bg-primary text-primary-foreground py-2.5 text-center text-sm font-medium"
        >
          Add gift wrap
        </Link>
      </div>
    </MobileFrame>
  );
}
export default GiftWrapPage;
