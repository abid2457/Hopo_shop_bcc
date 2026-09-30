import { Link } from "react-router-dom";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { REWARDS } from "@/lib/hopo-extra";
import { Sparkles, Crown, Gift } from "lucide-react";
export function RewardsPage() {
  const pct = (REWARDS.points / (REWARDS.points + REWARDS.pointsToNext)) * 100;
  return (
    <MobileFrame>
      <AppHeader title="HOPO SHOP Rewards" back showSearch={false} showBell={false} />

      <section className="px-4">
        <div className="rounded-2xl bg-gradient-royal text-primary-foreground p-5 shadow-elevated">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Member tier</p>
              <p className="font-display text-2xl flex items-center gap-2 mt-1">
                <Crown className="h-5 w-5 text-gold" /> {REWARDS.tier}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] opacity-80">HOPO SHOP Points</p>
              <p className="font-display text-3xl">{REWARDS.points.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] opacity-90">
              {REWARDS.pointsToNext.toLocaleString("en-IN")} points to {REWARDS.nextTier}
            </p>
            <div className="mt-1.5 h-1.5 rounded-full bg-primary-foreground/20 overflow-hidden">
              <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 mt-5">
        <h2 className="font-display text-base mb-2 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-gold" /> Your perks
        </h2>
        <ul className="rounded-xl border bg-card divide-y">
          {REWARDS.perks.map((p) => (
            <li key={p} className="px-4 py-3 text-sm flex items-start gap-2">
              <span className="text-gold mt-0.5">✦</span> {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-base">Recent activity</h2>
          <Link to="/coupons" className="text-xs text-primary inline-flex items-center gap-1">
            <Gift className="h-3.5 w-3.5" /> Coupon wallet
          </Link>
        </div>
        <div className="rounded-xl border bg-card divide-y">
          {REWARDS.history.map((h, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between text-sm">
              <div>
                <p>{h.text}</p>
                <p className="text-[11px] text-muted-foreground">{h.date}</p>
              </div>
              <span
                className={`font-medium ${h.delta.startsWith("-") ? "text-destructive" : "text-success"}`}
              >
                {h.delta}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="px-4 mt-6 mb-8">
        <Link
          to="/checkout"
          className="block w-full text-center rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold shadow-md hover:bg-primary/90 transition"
        >
          Redeem at checkout
        </Link>
      </div>
    </MobileFrame>
  );
}
export default RewardsPage;
