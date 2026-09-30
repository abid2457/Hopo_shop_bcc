import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { AppHeader, MobileFrame } from "@/components/app/MobileShell";
import { ADDRESSES } from "@/lib/hopo-extra";
import { Home, Briefcase, MapPin } from "lucide-react";
export function Field({ label, value, placeholder, full }) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        defaultValue={value}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}
export function AddressEditPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const a = ADDRESSES.find((x) => x.id === id);
  const isNew = !a;
  const [selectedType, setSelectedType] = useState(a?.type ?? "Home");
  return (
    <MobileFrame>
      <AppHeader
        title={isNew ? "Add address" : "Edit address"}
        back
        showSearch={false}
        showBell={false}
      />
      <form className="px-4 pb-32 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name" value={a?.name} placeholder="Riya Agarwal" full />
          <Field label="Mobile" value={a?.phone} placeholder="+91 …" full />
          <Field label="Pincode" value={a?.pincode} placeholder="400050" />
          <Field label="City" value={a?.city} placeholder="Mumbai" />
          <Field label="State" value={a?.state} placeholder="Maharashtra" full />
          <Field label="House / flat / building" value={a?.line1} full />
          <Field label="Area / street / landmark" value={a?.line2} full />
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Save as</p>
          <div className="flex gap-2">
            {[
              { t: "Home", I: Home },
              { t: "Work", I: Briefcase },
              { t: "Other", I: MapPin },
            ].map(({ t, I }) => {
              const active = selectedType === t;
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm transition ${active ? "border-primary bg-primary-soft text-primary font-medium" : "bg-card hover:bg-muted"}`}
                >
                  <I className="h-4 w-4" /> {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4">
          <Link
            to="/addresses"
            className="block text-center w-full py-3.5 rounded-full bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] shadow-md transition"
          >
            Save Address
          </Link>
        </div>
      </form>
    </MobileFrame>
  );
}
export default AddressEditPage;
