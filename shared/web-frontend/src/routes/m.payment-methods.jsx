import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { PAYMENT_METHODS } from "@/lib/hopo-extra";
import { CreditCard, Smartphone, Wallet, Plus, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/business-config";
export function PaymentMethodsPage() {
  return (
    <MobileFrame>
      <AppHeader title="Payment methods" back showSearch={false} showBell={false} />

      <section className="px-4">
        <h2 className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Cards</h2>
        <div className="space-y-3">
          {PAYMENT_METHODS.filter((p) => p.type === "card").map((p) => (
            <article
              key={p.id}
              className="rounded-xl bg-gradient-royal text-primary-foreground p-4 shadow-elevated"
            >
              <div className="flex items-center justify-between">
                <CreditCard className="h-5 w-5 text-gold" />
                {p.isDefault && (
                  <span className="text-[10px] uppercase tracking-wider bg-gold-soft text-gold-foreground px-1.5 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>
              <p className="font-display text-lg mt-3 tracking-[0.3em]">•••• {p.last4}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] opacity-90">
                <span>{p.brand}</span>
                <span>Exp {p.expiry}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 mt-5">
        <h2 className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">UPI</h2>
        {PAYMENT_METHODS.filter((p) => p.type === "upi").map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border bg-card p-3"
          >
            <div className="flex items-center gap-3">
              <span className="grid place-items-center h-9 w-9 rounded-full bg-primary-soft text-primary">
                <Smartphone className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{p.handle}</p>
                <p className="text-[11px] text-muted-foreground">UPI · HDFC Bank</p>
              </div>
            </div>
            <button aria-label="Remove" className="p-2 text-muted-foreground">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      <section className="px-4 mt-5">
        <h2 className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Wallets</h2>
        {PAYMENT_METHODS.filter((p) => p.type === "wallet").map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border bg-card p-3"
          >
            <div className="flex items-center gap-3">
              <span className="grid place-items-center h-9 w-9 rounded-full bg-gold-soft text-gold-foreground">
                <Wallet className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{p.brand}</p>
                <p className="text-[11px] text-muted-foreground">Balance {formatINR(p.balance)}</p>
              </div>
            </div>
            <button className="text-xs text-primary font-medium">Top up</button>
          </div>
        ))}
      </section>

      <section className="px-4 mt-5 mb-8">
        <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-soft/40 py-3 text-sm font-medium text-primary">
          <Plus className="h-4 w-4" /> Add new card or UPI
        </button>
      </section>
    </MobileFrame>
  );
}
export default PaymentMethodsPage;
