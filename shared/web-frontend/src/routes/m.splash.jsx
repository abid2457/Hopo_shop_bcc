import { Link } from "react-router-dom";
import { MobileFrame, StatusBar, Logo } from "@/components/app/MobileShell";
export function Splash() {
  return (
    <MobileFrame bg="bg-[#FAF6EE]">
      <div className="relative h-full min-h-[860px] text-[#0D1B2A]">
        <StatusBar />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
          <div className="relative flex flex-col items-center">
            <p className="text-[11px] tracking-[0.4em] uppercase text-[#C8A96E] mb-6 font-bold">
              Maison · Est. 2026
            </p>
            <div className="py-2 flex items-center justify-center">
              <Logo className="w-56 sm:w-64 max-w-xs h-auto" to="/home" />
            </div>
            <div className="mt-8 h-px w-28 mx-auto bg-[#C8A96E]/60" />
            <p className="mt-4 text-sm text-[#6B7280] font-light">
              Haute Couture & Heritage Indian Fashion
            </p>
          </div>
        </div>
        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-3 px-8">
          <Link
            to="/onboarding"
            className="w-full rounded-full bg-[#8B1E3F] text-white py-3 text-sm font-semibold text-center hover:bg-[#5E0F27] transition shadow-md"
          >
            Get started
          </Link>
          <Link
            to="/home"
            className="text-xs text-[#6B7280] hover:text-[#8B1E3F] font-medium transition"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}
export default Splash;
