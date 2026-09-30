import { Link } from "react-router-dom";
import { AlertTriangle, RefreshCw, WifiOff, ShieldAlert, FileQuestion } from "lucide-react";
const ERROR_CONFIG = {
  network: {
    icon: WifiOff,
    title: "Connection Lost",
    description: "Please check your internet connection and try refreshing the page.",
  },
  server: {
    icon: AlertTriangle,
    title: "Service Temporarily Unavailable",
    description: "We are experiencing technical issues. Our engineering team has been notified.",
  },
  404: {
    icon: FileQuestion,
    title: "Page Not Found",
    description: "The page or item you are looking for might have been moved or deleted.",
  },
  payment: {
    icon: ShieldAlert,
    title: "Payment Unsuccessful",
    description:
      "Your payment attempt failed. No money was deducted. Please try another payment method.",
  },
  generic: {
    icon: AlertTriangle,
    title: "Something Went Wrong",
    description: "An unexpected error occurred while loading this section.",
  },
};
export function ErrorState({ type = "generic", title, description, onRetry }) {
  const config = ERROR_CONFIG[type];
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const displayDesc = description || config.description;
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-destructive/20 bg-destructive/5 max-w-md mx-auto my-8 space-y-4">
      <div className="rounded-full bg-destructive/15 p-4 text-destructive">
        <Icon className="h-8 w-8" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display text-xl font-bold text-foreground">{displayTitle}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
          {displayDesc}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8B1E3F] px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#5E0F27] transition"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
        )}
        <Link
          to="/home"
          className="inline-flex items-center justify-center rounded-full border border-[#E5DCCD] bg-white px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0D1B2A] hover:bg-[#F7F2E9] transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
