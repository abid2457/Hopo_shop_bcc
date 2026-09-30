import { Link } from "react-router-dom";
import { useState } from "react";
import { AppHeader, MobileFrame, BottomNav } from "@/components/app/MobileShell";
import { Sparkles, CheckCircle2, Scissors } from "lucide-react";
const BLOUSE_SIZES = [
  {
    size: "XS (32)",
    bust: 32,
    underbust: 26,
    waist: 24,
    shoulder: 13.5,
    armhole: 14.5,
    length: 14,
  },
  {
    size: "S (34)",
    bust: 34,
    underbust: 28,
    waist: 26,
    shoulder: 14.0,
    armhole: 15.5,
    length: 14.5,
  },
  { size: "M (36)", bust: 36, underbust: 30, waist: 28, shoulder: 14.5, armhole: 16.5, length: 15 },
  {
    size: "L (38)",
    bust: 38,
    underbust: 32,
    waist: 30,
    shoulder: 15.0,
    armhole: 17.5,
    length: 15.5,
  },
  {
    size: "XL (40)",
    bust: 40,
    underbust: 34,
    waist: 32,
    shoulder: 15.5,
    armhole: 18.5,
    length: 16,
  },
  {
    size: "XXL (42)",
    bust: 42,
    underbust: 36,
    waist: 34,
    shoulder: 16.0,
    armhole: 19.5,
    length: 16.5,
  },
];
const LEHENGA_SIZES = [
  { size: "XS", waist: 26, hip: 36, length: 42, flair: 4.5 },
  { size: "S", waist: 28, hip: 38, length: 42, flair: 4.8 },
  { size: "M", waist: 30, hip: 40, length: 43, flair: 5.0 },
  { size: "L", waist: 32, hip: 42, length: 43, flair: 5.2 },
  { size: "XL", waist: 34, hip: 44, length: 44, flair: 5.5 },
  { size: "XXL", waist: 36, hip: 46, length: 44, flair: 5.5 },
];
const NIGHT_SUIT_SIZES = [
  { size: "XS", bust: 34, waist: 28, hip: 38, topLength: 26, pajamaLength: 38 },
  { size: "S", bust: 36, waist: 30, hip: 40, topLength: 26.5, pajamaLength: 38.5 },
  { size: "M", bust: 38, waist: 32, hip: 42, topLength: 27, pajamaLength: 39 },
  { size: "L", bust: 40, waist: 34, hip: 44, topLength: 27.5, pajamaLength: 39.5 },
  { size: "XL", bust: 42, waist: 36, hip: 46, topLength: 28, pajamaLength: 40 },
  { size: "XXL", bust: 44, waist: 38, hip: 48, topLength: 28.5, pajamaLength: 40 },
];
export function SizeGuidePage() {
  const [activeCategory, setActiveCategory] = useState("blouses");
  const [unit, setUnit] = useState("in");
  const toUnit = (valInInches) => {
    if (unit === "in") return `${valInInches}"`;
    return `${(valInInches * 2.54).toFixed(1)} cm`;
  };
  return (
    <MobileFrame>
      <AppHeader title="Atelier Size Guide" back />

      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-r from-[#3d0d1b] via-[#5e0f27] to-[#8B1E3F] text-white p-6 shadow-luxury border border-[#C8A96E]/40 mb-6">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A96E] mb-2">
          <Sparkles className="h-3 w-3" />
          <span>BESPOKE INDIAN ATELIER FIT</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Standard & Custom Sizing</h1>
        <p className="text-xs text-white/80 mt-1 max-w-md">
          Every HOPO SHOP bridal blouse and royal lehenga is crafted with built-in padding and
          2-inch alteration seam margins.
        </p>
      </div>

      {/* Category selector & Unit toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DCCD] pb-4 mb-6">
        <div className="flex rounded-2xl bg-[#F7F2E9] border border-[#E5DCCD] p-1 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveCategory("blouses")}
            className={`px-4 py-2 rounded-xl transition ${activeCategory === "blouses" ? "bg-[#8B1E3F] text-white shadow-xs" : "text-[#6B7280] hover:text-[#0D1B2A]"}`}
          >
            Bridal & Wedding Blouses
          </button>
          <button
            onClick={() => setActiveCategory("lehengas")}
            className={`px-4 py-2 rounded-xl transition ${activeCategory === "lehengas" ? "bg-[#8B1E3F] text-white shadow-xs" : "text-[#6B7280] hover:text-[#0D1B2A]"}`}
          >
            Royal Lehengas
          </button>
          <button
            onClick={() => setActiveCategory("nightsuits")}
            className={`px-4 py-2 rounded-xl transition ${activeCategory === "nightsuits" ? "bg-[#8B1E3F] text-white shadow-xs" : "text-[#6B7280] hover:text-[#0D1B2A]"}`}
          >
            Night Suits
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Unit:</span>
          <div className="flex rounded-xl border border-[#E5DCCD] bg-white p-0.5 text-xs font-bold shadow-xs">
            <button
              onClick={() => setUnit("in")}
              className={`px-3 py-1 rounded-lg transition ${unit === "in" ? "bg-[#0D1B2A] text-white" : "text-[#6B7280]"}`}
            >
              Inches (IN)
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={`px-3 py-1 rounded-lg transition ${unit === "cm" ? "bg-[#0D1B2A] text-white" : "text-[#6B7280]"}`}
            >
              Centimeters (CM)
            </button>
          </div>
        </div>
      </div>

      {/* 1. Blouses Table */}
      {activeCategory === "blouses" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E5DCCD] bg-white overflow-hidden shadow-subtle">
            <div className="p-4 border-b border-[#E5DCCD] bg-[#FAF6EE] flex items-center justify-between">
              <h2 className="font-display font-bold text-sm text-[#0D1B2A]">
                Blouse Sizing Specifications
              </h2>
              <span className="text-[10px] font-bold text-[#2E7D6B] bg-[#2E7D6B]/10 px-2.5 py-0.5 rounded-full">
                +2" Alteration Margin
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F2E9] text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5DCCD]">
                  <tr>
                    <th className="py-3 px-4">Size Tag</th>
                    <th className="py-3 px-4">Bust</th>
                    <th className="py-3 px-4">Underbust</th>
                    <th className="py-3 px-4">Waist</th>
                    <th className="py-3 px-4">Shoulder</th>
                    <th className="py-3 px-4">Armhole</th>
                    <th className="py-3 px-4">Blouse Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DCCD]/60 font-medium text-[#0D1B2A]">
                  {BLOUSE_SIZES.map((r, idx) => (
                    <tr key={r.size} className={idx % 2 === 1 ? "bg-[#FAF6EE]/50" : "bg-white"}>
                      <td className="py-3 px-4 font-bold text-[#8B1E3F]">{r.size}</td>
                      <td className="py-3 px-4">{toUnit(r.bust)}</td>
                      <td className="py-3 px-4">{toUnit(r.underbust)}</td>
                      <td className="py-3 px-4">{toUnit(r.waist)}</td>
                      <td className="py-3 px-4">{toUnit(r.shoulder)}</td>
                      <td className="py-3 px-4">{toUnit(r.armhole)}</td>
                      <td className="py-3 px-4">{toUnit(r.length)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-[#E5DCCD] bg-white p-5 shadow-subtle space-y-2.5">
              <h3 className="font-display font-bold text-sm text-[#0D1B2A] flex items-center gap-1.5">
                <Scissors className="h-4 w-4 text-[#8B1E3F]" />
                How to Measure Your Blouse
              </h3>
              <ul className="text-xs text-[#6B7280] space-y-1.5">
                <li>
                  • <strong>Bust:</strong> Measure around the fullest part of your chest with bra
                  on.
                </li>
                <li>
                  • <strong>Underbust:</strong> Measure directly below the bust line around the
                  ribcage.
                </li>
                <li>
                  • <strong>Shoulder:</strong> Measure straight from one shoulder bone corner to the
                  other.
                </li>
                <li>
                  • <strong>Armhole:</strong> Measure around the top of the shoulder down under the
                  armpit.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-[#C8A96E]/40 bg-[#FAF6EE] p-5 shadow-subtle space-y-2.5">
              <h3 className="font-display font-bold text-sm text-[#0D1B2A] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#2E7D6B]" />
                Atelier Fit Guarantee
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                All HOPO SHOP ready-to-wear blouses come with built-in high density padding cups and
                extra side seam allowances allowing easy local alteration up to 2 full sizes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Lehengas Table */}
      {activeCategory === "lehengas" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E5DCCD] bg-white overflow-hidden shadow-subtle">
            <div className="p-4 border-b border-[#E5DCCD] bg-[#FAF6EE] flex items-center justify-between">
              <h2 className="font-display font-bold text-sm text-[#0D1B2A]">
                Lehenga Skirt Sizing Specifications
              </h2>
              <span className="text-[10px] font-bold text-[#C8A96E] bg-[#C8A96E]/15 px-2.5 py-0.5 rounded-full">
                Drawstring Adjustable Waist
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F2E9] text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5DCCD]">
                  <tr>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Waist (Navel)</th>
                    <th className="py-3 px-4">Hip</th>
                    <th className="py-3 px-4">Skirt Length</th>
                    <th className="py-3 px-4">Flair / Ghera (Meters)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DCCD]/60 font-medium text-[#0D1B2A]">
                  {LEHENGA_SIZES.map((r, idx) => (
                    <tr key={r.size} className={idx % 2 === 1 ? "bg-[#FAF6EE]/50" : "bg-white"}>
                      <td className="py-3 px-4 font-bold text-[#8B1E3F]">{r.size}</td>
                      <td className="py-3 px-4">{toUnit(r.waist)}</td>
                      <td className="py-3 px-4">{toUnit(r.hip)}</td>
                      <td className="py-3 px-4">{toUnit(r.length)}</td>
                      <td className="py-3 px-4 font-bold text-[#0D1B2A]">{r.flair} m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Night Suits Specs */}
      {activeCategory === "nightsuits" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#E5DCCD] bg-white p-6 shadow-subtle space-y-4">
            <div>
              <h2 className="font-display font-bold text-base text-[#0D1B2A]">
                Night Suits & Loungewear Size Chart
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Relaxed comfort silhouette designed for luxury slumber and lounge wear.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DCCD] text-[#6B7280] font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Bust</th>
                    <th className="py-2.5 px-3">Waist</th>
                    <th className="py-2.5 px-3">Hip</th>
                    <th className="py-2.5 px-3">Top Length</th>
                    <th className="py-2.5 px-3">Pajama Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DCCD]/50 text-[#0D1B2A]">
                  {NIGHT_SUIT_SIZES.map((row) => (
                    <tr key={row.size} className="hover:bg-[#FAF6EE] transition">
                      <td className="py-2.5 px-3 font-bold text-[#8B1E3F]">{row.size}</td>
                      <td className="py-2.5 px-3">{toUnit(row.bust)}</td>
                      <td className="py-2.5 px-3">{toUnit(row.waist)}</td>
                      <td className="py-2.5 px-3">{toUnit(row.hip)}</td>
                      <td className="py-2.5 px-3">{toUnit(row.topLength)}</td>
                      <td className="py-2.5 px-3">{toUnit(row.pajamaLength)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Concierge Callout */}
      <div className="mt-8 rounded-3xl bg-[#FAF6EE] border border-[#C8A96E]/40 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-subtle mb-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-display font-bold text-sm text-[#0D1B2A]">
            Need Custom Bridal Measurements?
          </h3>
          <p className="text-xs text-[#6B7280]">
            Connect with our master atelier stylist on WhatsApp for custom tailoring assistance.
          </p>
        </div>
        <Link
          to="/support-chat"
          className="px-6 py-2.5 rounded-full bg-[#8B1E3F] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#5E0F27] transition shadow-xs shrink-0"
        >
          Stylist Assistance
        </Link>
      </div>

      <BottomNav active="home" />
    </MobileFrame>
  );
}
export default SizeGuidePage;
