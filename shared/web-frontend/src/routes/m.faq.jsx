import { useState } from "react";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { FAQS } from "@/lib/hopo-extra";
import { ChevronDown, Search } from "lucide-react";
export function FAQPage() {
  const [open, setOpen] = useState(0);
  const [cat, setCat] = useState("All");
  const cats = ["All", "Orders", "Returns", "Payments", "Shipping", "Account"];
  const list = cat === "All" ? FAQS : FAQS.filter((f) => f.cat === cat);
  return (
    <MobileFrame>
      <AppHeader title="FAQs" back showSearch={false} showBell={false} />

      <div className="px-4">
        <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search questions"
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${c === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2 pb-6">
          {list.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-xl border bg-card">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gold">{f.cat}</p>
                    <p className="text-sm font-medium mt-0.5">{f.q}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && <p className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </MobileFrame>
  );
}
export default FAQPage;
