import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { WebFooter, Logo } from "@/components/app/MobileShell";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { authenticateUserAsync, registerCustomerAsync } from "@/lib/store";
import { BUSINESS_CONFIG } from "@/lib/business-config";
export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/profile";
  // Auth Mode: "signin" | "signup"
  const [mode, setMode] = useState("signin");
  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState(null);
  // Sign Up Form State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState(null);
  // Forgot Password Dialog Modal
  const [forgotOpen, setForgotOpen] = useState(false);
  // Email regex validation helper
  const isValidEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };
  // 1. Handle SIGN IN
  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInError(null);
    if (!signInEmail.trim()) {
      setSignInError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(signInEmail)) {
      setSignInError("Please enter a valid email address.");
      return;
    }
    if (!signInPassword) {
      setSignInError("Please enter your password.");
      return;
    }
    setSignInLoading(true);
    try {
      const result = await authenticateUserAsync(signInEmail, signInPassword);
      if (result.success && result.user) {
        if (result.user.role === "ADMIN") {
          navigate("/admin", { replace: true });
        } else {
          navigate(redirectTarget, { replace: true });
        }
      } else {
        setSignInError(result.error || "Email or password is incorrect.");
      }
    } catch {
      setSignInError("Something went wrong. Please try again.");
    } finally {
      setSignInLoading(false);
    }
  };
  // 2. Handle SIGN UP
  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError(null);
    if (!signUpName.trim()) {
      setSignUpError("Please enter your full name.");
      return;
    }
    if (!signUpEmail.trim()) {
      setSignUpError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(signUpEmail)) {
      setSignUpError("Please enter a valid email address.");
      return;
    }
    if (!signUpPassword) {
      setSignUpError("Please enter a password.");
      return;
    }
    if (signUpPassword.length < 6) {
      setSignUpError("Password must be at least 6 characters.");
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError("Passwords do not match.");
      return;
    }
    setSignUpLoading(true);
    try {
      const result = await registerCustomerAsync(signUpName, signUpEmail, signUpPassword);
      if (result.success && result.user) {
        navigate(redirectTarget, { replace: true });
      } else {
        setSignUpError(result.error || "Registration failed. Please try again.");
      }
    } catch {
      setSignUpError("Something went wrong. Please try again.");
    } finally {
      setSignUpLoading(false);
    }
  };
  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] flex flex-col justify-between text-[#1E293B]">
      {/* Top Bar: HOPO SHOP Logo & Continue Shopping */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E5DCCD] bg-[#FAF6F0]/95 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4">
          <Logo className="w-[105px] sm:w-[124px] max-w-[140px] h-auto" to="/home" />
          <Link
            to="/home"
            className="group inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#7A1C35] hover:text-[#5E0F27] uppercase tracking-widest transition"
          >
            <span>CONTINUE SHOPPING</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </header>

      {/* Main Luxury Authentication Experience */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-140px)]">
        {/* LEFT SIDE: Authentic Indian Lehenga Couture Visual (approx 50% width on desktop) */}
        <section className="lg:col-span-6 xl:col-span-6 relative overflow-hidden bg-[#2D0714] min-h-[320px] sm:min-h-[400px] lg:min-h-full flex flex-col justify-between p-6 sm:p-10 xl:p-14 text-white">
          {/* Authentic High-Res Indian Lehenga Photography */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/lehenga_crimson_royal_bridal.png"
              alt="HOPO Couture Bridal Lehenga"
              className="w-full h-full object-cover object-top filter brightness-[0.88] contrast-[1.05] transition-transform duration-700 hover:scale-105"
            />
            {/* Elegant Luxury Vignette & Royal Maroon Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#25040E]/95 via-[#3D0A1A]/45 to-[#25040E]/30" />
          </div>

          {/* Top Brand Pill on Visual */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-[#C8A96E]/40 text-[#F5E6CC] text-[10px] font-bold tracking-[0.2em] uppercase">
              <Sparkles className="h-3 w-3 text-[#C8A96E]" />
              <span>HOPO SHOP · HAUTE COUTURE</span>
            </div>
          </div>

          {/* Bottom Brand Narrative Overlay */}
          <div className="relative z-10 space-y-3.5 max-w-lg mt-auto pt-16">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#C8A96E]">
              WEAR YOUR STORY
            </p>
            <h2 className="font-display text-2xl sm:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white leading-tight">
              Timeless Indian craftsmanship, <br className="hidden sm:inline" />
              curated for every celebration.
            </h2>
            <p className="text-xs sm:text-sm text-[#F7F2E9]/80 font-light leading-relaxed">
              Explore authentic Banarasi silk weaves, handcrafted zardozi bridal blouses, and royal
              wedding lehengas crafted for modern royalty.
            </p>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/15 text-[11px] text-[#F7F2E9]/90">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C8A96E]" />
                <span>100% Certified Pure Silk</span>
              </div>
              <span className="opacity-40">•</span>
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="h-3.5 w-3.5 text-[#C8A96E]" />
                <span>Atelier Craft Guarantee</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE: Luxury Customer Authentication Card (approx 50% width on desktop) */}
        <section className="lg:col-span-6 xl:col-span-6 flex items-center justify-center p-4 sm:p-8 xl:p-14">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5DCCD] p-6 sm:p-10 shadow-[0_8px_30px_rgba(45,24,32,0.06)] space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Header / Brand Greeting */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex justify-center sm:justify-start">
                <Logo className="w-[108px] h-auto mb-1" to="/home" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0D1B2A] tracking-tight">
                Welcome to HOPO SHOP
              </h1>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Your destination for timeless Indian luxury.
              </p>
            </div>

            {/* Primary Authentication Tabs: SIGN IN | SIGN UP */}
            <div className="grid grid-cols-2 rounded-2xl bg-[#FAF6F0] p-1 border border-[#E5DCCD] text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setSignInError(null);
                }}
                className={`py-2.5 rounded-xl transition uppercase tracking-wider text-[11px] sm:text-xs font-semibold ${
                  mode === "signin"
                    ? "bg-[#7A1C35] text-white shadow-xs"
                    : "text-[#6B7280] hover:text-[#0D1B2A]"
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setSignUpError(null);
                }}
                className={`py-2.5 rounded-xl transition uppercase tracking-wider text-[11px] sm:text-xs font-semibold ${
                  mode === "signup"
                    ? "bg-[#7A1C35] text-white shadow-xs"
                    : "text-[#6B7280] hover:text-[#0D1B2A]"
                }`}
              >
                SIGN UP
              </button>
            </div>

            {/* ========================================================= */}
            {/* 1. SIGN IN FORM                                           */}
            {/* ========================================================= */}
            {mode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                {signInError && (
                  <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#7A1C35] text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{signInError}</span>
                  </div>
                )}

                {/* Email Address Field */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#0D1B2A] uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      autoComplete="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full rounded-2xl border border-[#E5DCCD] bg-[#FAF6F0]/60 px-4 py-3 text-xs sm:text-sm text-[#0D1B2A] outline-none focus:border-[#7A1C35] focus:ring-2 focus:ring-[#7A1C35]/15 transition font-medium"
                    />
                    <Mail className="h-4 w-4 text-[#A0988A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-[#0D1B2A] uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-[11px] font-medium text-[#7A1C35] hover:text-[#5E0F27] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showSignInPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-2xl border border-[#E5DCCD] bg-[#FAF6F0]/60 px-4 py-3 text-xs sm:text-sm text-[#0D1B2A] outline-none focus:border-[#7A1C35] focus:ring-2 focus:ring-[#7A1C35]/15 pr-12 transition font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      aria-label={showSignInPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0988A] hover:text-[#0D1B2A] p-1 transition cursor-pointer"
                    >
                      {showSignInPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={signInLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-[#7A1C35] text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#5E0F27] shadow-md transition transform active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>{signInLoading ? "SIGNING IN..." : "SIGN IN"}</span>
                  {!signInLoading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}

            {/* ========================================================= */}
            {/* 2. SIGN UP FORM                                           */}
            {/* ========================================================= */}
            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                {signUpError && (
                  <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-[#7A1C35] text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{signUpError}</span>
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#0D1B2A] uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoComplete="name"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="Priya Sharma"
                      required
                      className="w-full rounded-2xl border border-[#E5DCCD] bg-[#FAF6F0]/60 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#0D1B2A] outline-none focus:border-[#7A1C35] focus:ring-2 focus:ring-[#7A1C35]/15 transition font-medium"
                    />
                    <User className="h-4 w-4 text-[#A0988A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#0D1B2A] uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      autoComplete="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full rounded-2xl border border-[#E5DCCD] bg-[#FAF6F0]/60 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#0D1B2A] outline-none focus:border-[#7A1C35] focus:ring-2 focus:ring-[#7A1C35]/15 transition font-medium"
                    />
                    <Mail className="h-4 w-4 text-[#A0988A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#0D1B2A] uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showSignUpPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full rounded-2xl border border-[#E5DCCD] bg-[#FAF6F0]/60 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#0D1B2A] outline-none focus:border-[#7A1C35] focus:ring-2 focus:ring-[#7A1C35]/15 pr-12 transition font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A0988A] hover:text-[#0D1B2A] p-1 transition cursor-pointer"
                    >
                      {showSignUpPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-[#0D1B2A] uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showSignUpPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      className="w-full rounded-2xl border border-[#E5DCCD] bg-[#FAF6F0]/60 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#0D1B2A] outline-none focus:border-[#7A1C35] focus:ring-2 focus:ring-[#7A1C35]/15 transition font-medium"
                    />
                    <Lock className="h-4 w-4 text-[#A0988A] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Primary Register Button */}
                <button
                  type="submit"
                  disabled={signUpLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-[#7A1C35] text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#5E0F27] shadow-md transition transform active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>{signUpLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</span>
                  {!signUpLoading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}

            {/* Supporting Text */}
            <p className="text-[11px] text-[#6B7280] text-center leading-relaxed">
              Discover curated bridal blouses, royal lehengas, salwar suits, and luxury night suits.
            </p>

            {/* Terms & Privacy */}
            <p className="text-[10px] text-[#8C827A] text-center leading-relaxed border-t border-[#E5DCCD]/80 pt-4">
              By continuing, you agree to HOPO SHOP’s{" "}
              <Link to="/faq" className="text-[#7A1C35] font-semibold hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/faq" className="text-[#7A1C35] font-semibold hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      {/* Forgot Password Luxury Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-[#E5DCCD] p-6 shadow-luxury space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-[#F5E8EA] text-[#7A1C35] grid place-items-center mx-auto">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#0D1B2A]">
              HOPO Concierge Assistance
            </h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              For customer account security and order privacy, password resets are processed directly
              by our luxury concierge team.
            </p>
            <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E5DCCD] text-xs text-[#0D1B2A] space-y-1 text-left">
              <p className="font-bold text-[#7A1C35]">Concierge Desk:</p>
              <p>
                Email:{" "}
                <a
                  href={`mailto:${BUSINESS_CONFIG.contact.email}`}
                  className="text-[#7A1C35] underline"
                >
                  {BUSINESS_CONFIG.contact.email}
                </a>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForgotOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#7A1C35] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Website Footer */}
      <WebFooter />
    </div>
  );
}
export default Login;
