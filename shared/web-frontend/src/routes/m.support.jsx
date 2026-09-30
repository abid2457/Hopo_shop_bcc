import { Link } from "react-router-dom";
import { AppHeader, MobileFrame, BottomNav } from "@/components/app/MobileShell";
import { SUPPORT_TOPICS } from "@/lib/hopo-extra";
import { MessageSquare, Mail, ChevronRight, HelpCircle, ShieldCheck } from "lucide-react";
import { useStoreSync, getAuthUser } from "@/lib/store";
import { BUSINESS_CONFIG } from "@/lib/business-config";
export function SupportPage() {
  useStoreSync();
  const user = getAuthUser();
  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  return (
    <MobileFrame>
      <AppHeader title="Help & Support" back showSearch={false} showBell={false} />

      <section className="mb-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#3d0d1b] via-[#5e0f27] to-[#8B1E3F] text-white p-6 sm:p-8 shadow-luxury border border-[#C8A96E]/40">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Hi {firstName}, how can our concierge help?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-2 leading-relaxed">
              Our luxury atelier support is active {BUSINESS_CONFIG.contact.supportHours}. Average
              response time is under 2 minutes.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs sm:text-sm font-semibold max-w-md">
            <Link
              to="/support-chat"
              className="rounded-2xl bg-white/10 hover:bg-white/20 transition py-3.5 flex flex-col items-center gap-2 shadow-xs border border-white/10"
            >
              <MessageSquare className="h-5 w-5 text-[#C8A96E]" /> Live Chat
            </Link>
            <a
              href={`mailto:${BUSINESS_CONFIG.contact.email}`}
              className="rounded-2xl bg-white/10 hover:bg-white/20 transition py-3.5 flex flex-col items-center gap-2 shadow-xs border border-white/10"
            >
              <Mail className="h-5 w-5 text-[#C8A96E]" /> Email Care
            </a>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-display text-lg font-bold text-[#0D1B2A] mb-3">
          Browse Support Topics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUPPORT_TOPICS.map((t) => (
            <Link
              key={t.title}
              to="/support-chat"
              className="rounded-2xl border border-[#E5DCCD] bg-white p-4 flex flex-col gap-2 hover:border-[#8B1E3F]/50 transition shadow-xs group"
            >
              <span className="text-2xl">{t.icon}</span>
              <p className="text-sm font-bold text-[#0D1B2A] group-hover:text-[#8B1E3F] transition">
                {t.title}
              </p>
              <p className="text-xs text-[#6B7280] leading-relaxed">{t.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/faq"
          className="flex items-center justify-between rounded-2xl border border-[#E5DCCD] bg-white p-5 hover:border-[#8B1E3F]/50 transition shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-[#C8A96E]/15 p-2.5 text-[#C8A96E]">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0D1B2A]">Frequently Asked Questions</p>
              <p className="text-xs text-[#6B7280]">
                Quick solutions for payments, sizing, & delivery
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[#6B7280]" />
        </Link>

        <Link
          to="/delivery-check"
          className="flex items-center justify-between rounded-2xl border border-[#E5DCCD] bg-white p-5 hover:border-[#8B1E3F]/50 transition shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="rounded-xl bg-[#8B1E3F]/10 p-2.5 text-[#8B1E3F]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0D1B2A]">Check Delivery Timelines</p>
              <p className="text-xs text-[#6B7280]">Verify pincode serviceability across India</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[#6B7280]" />
        </Link>
      </section>

      <BottomNav active="profile" />
    </MobileFrame>
  );
}
export default SupportPage;
