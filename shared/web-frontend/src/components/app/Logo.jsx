import { Link } from "react-router-dom";
export const OFFICIAL_LOGO_SRC = "/images/hopo_logo.png";
/**
 * Official HOPO SHOP Global Brand Logo Component
 * Single Source of Truth for the HOPO SHOP brand identity.
 * Uses the exact uploaded official logo asset without alteration, text overlay, or distortion.
 */
export function Logo({
  className = "w-[88px] sm:w-[100px] md:w-[108px] lg:w-[114px] xl:w-[122px] 2xl:w-[132px] max-w-[136px] h-auto",
  to = "/home",
  alt = "HOPO SHOP",
  priority = true,
}) {
  const logoImage = (
    <img
      src={OFFICIAL_LOGO_SRC}
      alt={alt}
      className={`${className} object-contain select-none shrink-0`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
  if (to) {
    return (
      <Link
        to={to}
        aria-label="HOPO SHOP Home"
        className="inline-flex items-center shrink-0 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1E3F]/40 rounded-sm"
      >
        {logoImage}
      </Link>
    );
  }
  return <div className="inline-flex items-center shrink-0">{logoImage}</div>;
}
// Alias for backwards compatibility across existing components
export const HopoLogo = Logo;
export default Logo;
