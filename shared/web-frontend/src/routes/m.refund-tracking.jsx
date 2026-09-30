import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { REFUND_TIMELINE } from "@/lib/hopo-extra";
import { CheckCircle2, Clock } from "lucide-react";
export function RefundTrackingPage() {
  return (
    <MobileFrame>
      <AppHeader title="Refund tracking" back showSearch={false} showBell={false} />

      <section className="px-4 pt-2">
        <div className="rounded-xl bg-gradient-royal text-primary-foreground p-5 shadow-elevated">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Refund of</p>
          <p className="font-display text-3xl mt-1">₹18,999</p>
          <p className="text-[11px] mt-1 opacity-90">Order LX‑10311 • Champagne sequin gown</p>
          <p className="text-[11px] mt-2 bg-gold-soft text-gold-foreground inline-block px-2 py-1 rounded">
            Expected by 09 Apr 2026
          </p>
        </div>
      </section>

      <section className="px-4 mt-5">
        <h2 className="font-display text-base mb-3">Status</h2>
        <ol className="space-y-3">
          {REFUND_TIMELINE.map((s, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`grid place-items-center h-7 w-7 rounded-full ${s.done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {s.done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </span>
                {i < REFUND_TIMELINE.length - 1 && (
                  <span className={`w-px flex-1 ${s.done ? "bg-success/40" : "bg-border"}`} />
                )}
              </div>
              <div className="pb-2">
                <p className={`text-sm ${s.done ? "" : "text-muted-foreground"}`}>{s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.time}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-4 mt-6 mb-8">
        <div className="rounded-xl border bg-card p-4 text-xs space-y-1">
          <p>
            <span className="text-muted-foreground">Refund mode:</span> ICICI **** 4521
          </p>
          <p>
            <span className="text-muted-foreground">Reference:</span> RFD-2604-1188
          </p>
          <p>
            <span className="text-muted-foreground">Settlement TAT:</span> 3–5 business days
          </p>
        </div>
      </section>
    </MobileFrame>
  );
}
export default RefundTrackingPage;
