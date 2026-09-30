import React from "react";
import { HopoEmblem } from "./MobileShell";

export function LuxuryPageLoader({ title = "Loading Collection..." }) {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Glowing Pulsing Aura */}
        <div className="absolute h-20 w-20 rounded-full bg-[#D4AF37]/20 blur-xl animate-pulse" />

        {/* Outer Rotating Halo */}
        <div className="h-16 w-16 rounded-full border border-[#D4AF37]/30 border-t-[#8B1E3F] animate-spin" />

        {/* Inner Emblem */}
        <div className="absolute">
          <HopoEmblem className="h-8 w-8 text-[#8B1E3F] animate-pulse" />
        </div>
      </div>

      <p className="mt-4 font-serif text-sm text-[#3D0D1B] tracking-wider uppercase font-semibold">
        HOPO SHOP INDIA
      </p>
      <p className="text-xs text-[#7A1C35]/70 mt-0.5 tracking-wide font-light">{title}</p>
    </div>
  );
}

export default LuxuryPageLoader;
