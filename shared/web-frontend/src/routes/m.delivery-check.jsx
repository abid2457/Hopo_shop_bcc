import { useState } from "react";
import { AppHeader, MobileFrame, BottomNav } from "@/components/app/MobileShell";
import { Truck, IndianRupee, RotateCcw, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  checkPincodeServiceability,
  BUSINESS_CONFIG,
  formatINR,
  getEstimatedDeliveryDate,
} from "@/lib/business-config";
export function DeliveryCheckPage() {
  const [pin, setPin] = useState("400050");
  const [result, setResult] = useState(() => checkPincodeServiceability("400050"));
  const handleCheck = (e) => {
    if (e) e.preventDefault();
    setResult(checkPincodeServiceability(pin));
  };
  const deliveryEst = getEstimatedDeliveryDate(result.estimatedDays || 3);
  return (
    <MobileFrame>
      <AppHeader title="Delivery Availability" back showSearch={false} showBell={false} />

      <div className="space-y-5">
        <div className="rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-6 shadow-subtle space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#0D1B2A]">
            Enter Postal PIN Code
          </label>
          <form onSubmit={handleCheck} className="flex gap-2">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              className="flex-1 rounded-2xl border border-[#E5DCCD] bg-[#FAF6EE] px-4 py-3 text-xs sm:text-sm font-bold text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#8B1E3F]/30"
              placeholder="e.g. 560001, 110001, 400050"
            />
            <button
              type="submit"
              className="rounded-2xl bg-[#8B1E3F] text-white px-6 text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] transition shadow-xs"
            >
              Check
            </button>
          </form>
        </div>

        {result.isServiceable ? (
          <div className="rounded-3xl border border-[#E5DCCD] bg-white overflow-hidden shadow-subtle">
            <div className="bg-[#2E7D6B]/10 text-[#2E7D6B] px-5 py-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b border-[#2E7D6B]/20">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Express Delivery is available to {result.city}, {result.state} ({pin})
              </span>
            </div>
            <ul className="divide-y divide-[#E5DCCD]/60 text-xs sm:text-sm text-[#0D1B2A]">
              <Row
                I={Truck}
                label="Standard Pan-India Delivery"
                value={`Estimated by ${deliveryEst.formattedDate}`}
              />
              <Row
                I={Zap}
                label="Free Shipping Eligibility"
                value={`Free on orders over ${formatINR(BUSINESS_CONFIG.ecommerce.freeShippingThreshold)}`}
              />
              <Row
                I={IndianRupee}
                label="Cash on Delivery (COD)"
                value={`Available up to ${formatINR(BUSINESS_CONFIG.ecommerce.codLimitMax)}`}
              />
              <Row
                I={RotateCcw}
                label="Atelier Returns & Exchange"
                value={`${BUSINESS_CONFIG.ecommerce.returnWindowDays}-day hassle-free policy`}
              />
            </ul>
          </div>
        ) : (
          <div className="rounded-3xl border border-[#E5DCCD] bg-white p-6 text-center space-y-2 shadow-subtle">
            <AlertCircle className="h-7 w-7 text-[#8B1E3F] mx-auto" />
            <p className="text-sm font-bold text-[#0D1B2A]">{result.message}</p>
            <p className="text-xs text-[#6B7280]">
              We are rapidly expanding our express luxury delivery coverage across India.
            </p>
          </div>
        )}

        <div className="rounded-2xl bg-[#FAF6EE] border border-[#C8A96E]/40 p-4 text-xs text-[#6B7280] space-y-1">
          <p className="font-bold text-[#0D1B2A] uppercase tracking-wider text-[10px]">
            Sample Serviceable Hubs
          </p>
          <p>
            Try Mumbai (400050), Bengaluru (560001), Delhi NCR (110001), Jaipur (302001), Kolkata
            (700001), Hyderabad (500001).
          </p>
        </div>
      </div>

      <BottomNav active="home" />
    </MobileFrame>
  );
}
function Row({ I, label, value }) {
  return (
    <li className="px-5 py-3.5 flex items-center justify-between">
      <span className="flex items-center gap-2.5 text-[#6B7280]">
        <I className="h-4 w-4 text-[#8B1E3F]" /> {label}
      </span>
      <span className="font-semibold text-[#0D1B2A]">{value}</span>
    </li>
  );
}
export default DeliveryCheckPage;
