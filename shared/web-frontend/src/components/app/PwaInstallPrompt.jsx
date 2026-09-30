import React, { useState, useEffect } from "react";
import { Download, X, Sparkles, Smartphone, Check } from "lucide-react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if already in standalone (installed) mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed the prompt recently
    const dismissedAt = localStorage.getItem("hopo_pwa_dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 1000 * 60 * 60 * 24 * 3) {
      // Dismissed within last 3 days
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a slight delay for pleasant UX
      setTimeout(() => setShowPrompt(true), 2500);
    };

    const manualOpenHandler = () => {
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("pwa-open-install-prompt", manualOpenHandler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log("[PWA] Hopo Shop App was installed successfully!");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("pwa-open-install-prompt", manualOpenHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setInstallSuccess(true);
      setTimeout(() => {
        setShowPrompt(false);
        setIsInstalled(true);
      }, 2000);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("hopo_pwa_dismissed", Date.now().toString());
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="Install Hopo Shop Application"
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#1A0B13] border border-[#D4AF37]/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-white relative overflow-hidden">
        {/* Luxury Gold Ambient Glow */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3 relative z-10">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B1E3F] to-[#3D0D1B] border border-[#D4AF37]/50 flex items-center justify-center shrink-0 shadow-md">
            <img src="/icons/icon-96x96.png" alt="Hopo Shop" className="h-8 w-8 object-contain" />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#D4AF37]">
                Official App
              </span>
            </div>
            <h4 className="font-serif font-bold text-sm text-[#FAF6EE] leading-snug mt-0.5">
              Install HOPO SHOP App
            </h4>
            <p className="text-[11px] text-[#FAF6EE]/75 mt-0.5 leading-tight">
              Enjoy lightning-fast bridal shopping, offline mode & exclusive launches.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Close install prompt"
            className="text-[#FAF6EE]/50 hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center gap-2 relative z-10">
          <button
            onClick={handleDismiss}
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium text-[#FAF6EE]/70 hover:text-white hover:bg-white/5 transition-colors text-center"
          >
            Maybe Later
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#D4AF37] text-[#1A0B13] hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
          >
            {installSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-900" />
                <span>Installed!</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Install Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
