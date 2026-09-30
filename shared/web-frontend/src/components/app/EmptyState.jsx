import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
export function EmptyState({
  icon: Icon = ShoppingBag,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  secondaryLabel,
  secondaryTo,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl border border-dashed border-[#E5DCCD] bg-white/60 max-w-md mx-auto my-8 space-y-4 shadow-subtle">
      <div className="rounded-full bg-[#8B1E3F]/10 p-4 text-[#8B1E3F]">
        <Icon className="h-8 w-8" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display text-xl font-bold text-[#0D1B2A]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
        {actionLabel && actionTo && (
          <Link
            to={actionTo}
            className="inline-flex items-center justify-center rounded-full bg-[#8B1E3F] px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#5E0F27] transition"
          >
            {actionLabel}
          </Link>
        )}
        {actionLabel && onAction && !actionTo && (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center rounded-full bg-[#8B1E3F] px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#5E0F27] transition"
          >
            {actionLabel}
          </button>
        )}
        {secondaryLabel && secondaryTo && (
          <Link
            to={secondaryTo}
            className="inline-flex items-center justify-center rounded-full border border-[#E5DCCD] bg-white px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0D1B2A] hover:bg-[#F7F2E9] transition"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
