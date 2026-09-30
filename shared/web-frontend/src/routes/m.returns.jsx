import { Link } from "react-router-dom";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { RETURN_REASONS, ORDERS } from "@/lib/hopo-extra";
export function ReturnsPage() {
  const order = ORDERS[2]; // returned example
  return (
    <MobileFrame>
      <AppHeader title="Start a return" back showSearch={false} showBell={false} />

      <div className="px-4 pb-32 space-y-5">
        <section className="rounded-xl border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Order</p>
          <p className="text-sm font-medium mt-1">
            {order.id} • {order.items[0].title}
          </p>
          <p className="text-[11px] text-muted-foreground">Delivered on {order.deliveredOn}</p>
          <p className="mt-2 text-[11px] text-success">Eligible for return until 20 Apr 2026</p>
        </section>

        <section>
          <h2 className="font-display text-base mb-2">Pick a reason</h2>
          <div className="space-y-2">
            {RETURN_REASONS.map((r, i) => (
              <label
                key={r}
                className="flex items-center justify-between rounded-lg border bg-card px-3 py-3 text-sm"
              >
                <span>{r}</span>
                <input
                  type="radio"
                  name="reason"
                  defaultChecked={i === 0}
                  className="accent-[var(--primary)]"
                />
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-base mb-2">Add photos (optional)</h2>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-md border border-dashed grid place-items-center text-[10px] text-muted-foreground"
              >
                +
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-base mb-2">Refund to</h2>
          <div className="space-y-2 text-sm">
            <label className="flex items-center justify-between rounded-lg border bg-card px-3 py-3">
              Original payment (ICICI **** 4521){" "}
              <input
                type="radio"
                name="refund"
                defaultChecked
                className="accent-[var(--primary)]"
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border bg-card px-3 py-3">
              HOPO SHOP Wallet (instant){" "}
              <input type="radio" name="refund" className="accent-[var(--primary)]" />
            </label>
          </div>
        </section>

        <section className="rounded-xl bg-primary-soft p-3 text-[11px] text-primary">
          Free reverse pickup will be scheduled within 24h. Keep the product unused with original
          tags.
        </section>
      </div>

      <div className="fixed md:absolute bottom-0 left-0 right-0 border-t bg-card px-4 py-3 flex gap-2">
        <Link to="/orders" className="flex-1 rounded-md border py-2.5 text-center text-sm">
          Cancel
        </Link>
        <Link
          to="/refund-tracking"
          className="flex-1 rounded-md bg-primary text-primary-foreground py-2.5 text-center text-sm font-medium"
        >
          Confirm return
        </Link>
      </div>
    </MobileFrame>
  );
}
export default ReturnsPage;
