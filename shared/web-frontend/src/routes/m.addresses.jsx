import { Link } from "react-router-dom";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { ADDRESSES } from "@/lib/hopo-extra";
import { Home, Briefcase, MapPin, Plus, Pencil, Trash2, Check } from "lucide-react";
const icon = (t) => (t === "Home" ? Home : t === "Work" ? Briefcase : MapPin);
export function AddressesPage() {
  return (
    <MobileFrame>
      <AppHeader title="Addresses" back showSearch={false} showBell={false} />
      <div className="px-4 pb-4 space-y-3">
        {ADDRESSES.map((a) => {
          const Icon = icon(a.type);
          return (
            <article key={a.id} className="rounded-xl border bg-card p-4 shadow-soft">
              <header className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="grid place-items-center h-8 w-8 rounded-full bg-primary-soft text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      {a.label}
                      {a.isDefault && (
                        <span className="text-[10px] uppercase tracking-wider bg-gold-soft text-gold-foreground px-1.5 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{a.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Link
                    to={`/address-edit?id=${encodeURIComponent(a.id)}`}
                    aria-label="Edit"
                    className="p-2 rounded-md hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button aria-label="Delete" className="p-2 rounded-md hover:bg-muted">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </header>
              <p className="text-sm">
                {a.name} • {a.phone}
              </p>
              <p className="text-sm text-muted-foreground">
                {a.line1}, {a.line2}, {a.city}, {a.state} – {a.pincode}
              </p>
              {!a.isDefault && (
                <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Check className="h-3.5 w-3.5" /> Set as default
                </button>
              )}
            </article>
          );
        })}

        <Link
          to="/address-edit?id=new"
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-soft/40 py-4 text-sm font-medium text-primary"
        >
          <Plus className="h-4 w-4" /> Add new address
        </Link>
      </div>
    </MobileFrame>
  );
}
export default AddressesPage;
