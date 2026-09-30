import { Link } from "react-router-dom";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { FileText, Download, Share2 } from "lucide-react";
export function GSTInvoicePage() {
  return (
    <MobileFrame>
      <AppHeader title="GST invoice" back showSearch={false} showBell={false} />

      <div className="px-4 pb-32 space-y-4">
        <div className="rounded-xl bg-primary-soft text-primary p-3 text-[11px]">
          Add business details once to claim GST input credit on every eligible order.
        </div>

        <form className="space-y-3">
          <Field label="Registered business name" placeholder="Lotus Trading LLP" />
          <Field label="GSTIN" placeholder="27ABCDE1234F1Z5" />
          <Field label="Business email" placeholder="accounts@lotustrading.in" />
          <Field label="Billing address (registered)" placeholder="Same as delivery address" />
        </form>

        <section>
          <h2 className="font-display text-base mb-2">Order summary</h2>
          <div className="rounded-xl border bg-card p-4 text-sm space-y-1.5">
            <Row label="Order" value="LX‑10487" />
            <Row label="Sub‑total" value="₹7,201.69" />
            <Row label="CGST @ 2.5%" value="₹180.04" />
            <Row label="SGST @ 2.5%" value="₹180.04" />
            <div className="border-t my-1" />
            <Row label="Invoice total" value="₹7,561.77" bold />
          </div>
        </section>

        <div className="rounded-xl border bg-card divide-y">
          <Link to="/orders" className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Preview invoice
            </span>
            <span className="text-xs text-primary">Open</span>
          </Link>
          <button className="w-full flex items-center justify-between px-4 py-3 text-sm">
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" /> Download PDF
            </span>
            <span className="text-xs text-muted-foreground">2.1 MB</span>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3 text-sm">
            <span className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-primary" /> Email to accounts team
            </span>
            <span className="text-xs text-muted-foreground">accounts@…</span>
          </button>
        </div>
      </div>

      <div className="fixed md:absolute bottom-0 left-0 right-0 border-t bg-card px-4 py-3">
        <button className="w-full rounded-md bg-primary text-primary-foreground py-2.5 text-sm font-medium">
          Save & request GST invoice
        </button>
      </div>
    </MobileFrame>
  );
}
function Field({ label, placeholder }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}
function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
export default GSTInvoicePage;
