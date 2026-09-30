import { useState } from "react";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { EmptyState } from "@/components/app/EmptyState";
import { COUPONS } from "@/lib/hopo-extra";
import { Copy, Ticket, Check } from "lucide-react";
export function CouponsPage() {
  const [tab, setTab] = useState("active");
  const [copiedCode, setCopiedCode] = useState(null);
  const list = COUPONS.filter((c) => (tab === "active" ? c.active : !c.active));
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  return (
    <MobileFrame>
      <AppHeader title="Coupon Wallet" back showSearch={false} showBell={false} />

      <div className="mb-4">
        <div className="flex items-center gap-2 rounded-xl border bg-card p-1.5 text-xs shadow-xs">
          {["active", "expired"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2 capitalize font-semibold transition ${tab === t ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}{" "}
              {t === "active"
                ? `(${COUPONS.filter((c) => c.active).length})`
                : `(${COUPONS.filter((c) => !c.active).length})`}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={`No ${tab === "active" ? "Active" : "Expired"} Coupons`}
          description="Check back during festive sales to discover promo codes and exclusive cashback rewards."
          actionLabel="Explore New Collection"
          actionTo="/home"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
          {list.map((c) => (
            <article
              key={c.code}
              className="relative rounded-2xl border bg-card overflow-hidden shadow-xs hover:border-primary/50 transition flex"
            >
              <div className="w-28 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-4 flex flex-col items-center justify-center text-center shrink-0">
                <Ticket className="h-5 w-5 text-gold mb-1" />
                <p className="font-display text-base font-bold tracking-wider">{c.code}</p>
              </div>

              <div className="flex-1 p-4 pr-16 space-y-1">
                <p className="text-sm font-bold text-foreground">{c.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                <p
                  className={`text-[11px] font-semibold mt-1 ${c.active ? "text-success" : "text-destructive"}`}
                >
                  {c.expiry}
                </p>
              </div>

              <button
                onClick={() => handleCopy(c.code)}
                className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1.5 text-[10px] font-bold text-foreground hover:bg-muted transition"
                aria-label="Copy coupon code"
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="h-3 w-3 text-success" /> COPIED
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> COPY
                  </>
                )}
              </button>

              {c.tag && (
                <span className="absolute bottom-3 right-3.5 text-[10px] uppercase tracking-wider bg-gold/15 text-gold-foreground px-2 py-0.5 rounded-md font-bold">
                  {c.tag}
                </span>
              )}
            </article>
          ))}
        </div>
      )}
    </MobileFrame>
  );
}
export default CouponsPage;
