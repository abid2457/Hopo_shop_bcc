import { MobileFrame, AppHeader } from "@/components/app/MobileShell";
import { REVIEWS } from "@/lib/hopo-data";
import { Star, BadgeCheck, ThumbsUp } from "lucide-react";
const bars = [
  { stars: 5, pct: 72 },
  { stars: 4, pct: 18 },
  { stars: 3, pct: 6 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 2 },
];
export function Reviews() {
  return (
    <MobileFrame>
      <AppHeader title="Reviews" back />

      <div className="mx-4 rounded-2xl border bg-card p-4">
        <div className="flex gap-5 items-center">
          <div className="text-center">
            <p className="font-display text-4xl">4.6</p>
            <div className="flex justify-center mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3 w-3 fill-gold text-gold" />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">1,284 ratings</p>
          </div>
          <div className="flex-1 space-y-1">
            {bars.map((b) => (
              <div key={b.stars} className="flex items-center gap-2 text-[10px]">
                <span className="w-3">{b.stars}</span>
                <Star className="h-2.5 w-2.5 fill-muted-foreground text-muted-foreground" />
                <span className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <span className="block h-full bg-primary" style={{ width: `${b.pct}%` }} />
                </span>
                <span className="w-7 text-right text-muted-foreground">{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 flex gap-2 overflow-x-auto scrollbar-none">
        {["With photos", "5 ★", "4 ★", "Verified", "Most recent"].map((c, i) => (
          <button
            key={c}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 space-y-4 pb-6">
        {[...REVIEWS, ...REVIEWS].map((r, idx) => (
          <article key={idx} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-semibold">
                {r.name.split(" ")[0][0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  {r.name}
                  {r.verified && <BadgeCheck className="h-3.5 w-3.5 text-success" />}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {r.date}
                  {r.verified && " · Verified purchase"}
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-md bg-success/15 text-success px-1.5 py-0.5 text-xs font-semibold">
                <Star className="h-3 w-3 fill-current" /> {r.rating}
              </span>
            </div>
            <p className="text-sm mt-3 leading-relaxed">{r.text}</p>
            <img src={r.image} alt="" className="mt-3 h-32 w-24 object-cover rounded-lg" />
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <button className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({r.helpful})
              </button>
              <button>Report</button>
            </div>
          </article>
        ))}
      </div>
    </MobileFrame>
  );
}
export default Reviews;
