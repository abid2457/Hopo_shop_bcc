import React, { useState, useEffect } from "react";
import {
  resolveProductImage,
  getCategoryFallback,
  DEFAULT_BRAND_FALLBACK,
} from "@/lib/image-resolver";
/**
 * HopoImage — Resilient Luxury Image Component
 *
 * Automatically resolves image URLs against verified catalog assets,
 * protects against broken 404 links, maintains container aspect ratio and border styling,
 * and seamlessly recovers via category-specific and brand fallbacks.
 */
export function HopoImage({
  src,
  alt = "HOPO Haute Couture",
  className = "",
  category,
  productId,
  title,
  brand,
  fallbackSrc,
  loading = "lazy",
  onError,
  ...rest
}) {
  // Resolve initial image URL using the centralized resolver
  const initialResolved = resolveProductImage({
    id: productId,
    image: src,
    title,
    category,
    brand,
  });
  const [currentSrc, setCurrentSrc] = useState(initialResolved);
  const [stage, setStage] = useState(0);
  // Synchronize when key inputs change
  useEffect(() => {
    const nextResolved = resolveProductImage({
      id: productId,
      image: src,
      title,
      category,
      brand,
    });
    setCurrentSrc(nextResolved);
    setStage(0);
  }, [src, productId, title, category, brand]);
  const handleError = (e) => {
    if (onError) {
      onError(e);
    }
    if (stage === 0) {
      // Stage 1: Attempt strict category-matched fallback
      const catFallback = fallbackSrc || getCategoryFallback(category);
      if (catFallback && catFallback !== currentSrc) {
        setStage(1);
        setCurrentSrc(catFallback);
        return;
      }
      // If category fallback is same as failed image, proceed to brand fallback
      setStage(2);
      setCurrentSrc(DEFAULT_BRAND_FALLBACK);
      return;
    }
    if (stage === 1) {
      // Stage 2: Fallback to universal luxury brand asset
      if (currentSrc !== DEFAULT_BRAND_FALLBACK) {
        setStage(2);
        setCurrentSrc(DEFAULT_BRAND_FALLBACK);
        return;
      }
      setStage(3);
      setCurrentSrc("/images/hopo_logo.png");
      return;
    }
    if (stage === 2) {
      // Stage 3: Hopo brand logo
      setStage(3);
      setCurrentSrc("/images/hopo_logo.png");
      return;
    }
    // Stop to prevent infinite error loops
  };
  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      onError={handleError}
      className={className}
      {...rest}
    />
  );
}
export default HopoImage;
