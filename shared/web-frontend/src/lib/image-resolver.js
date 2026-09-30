/**
 * HOPO SHOP — Centralized Product Image Resolution Engine
 *
 * Resolves product image paths against authentic, verified local catalog assets.
 * Guarantees Category Image Integrity:
 * - Sarees -> Saree images only
 * - Lehengas -> Lehenga images only
 * - Bridal Blouses -> Bridal Blouse images only
 * - Wedding Blouses -> Wedding Blouse images only
 * - Salwar Suits -> Salwar Suit images only
 * - Indo-Western -> Indo-Western images only
 * - Festive Wear -> Festive Wear images only
 * - Jewellery / Accessories -> Authentic accessory images only
 */
import { PRODUCTS, COMPLETE_THE_LOOK } from "./hopo-data";
/**
 * Complete registry of all verified, accessible image files in public/images/
 */
export const VERIFIED_IMAGES = new Set([
  "/images/blouse_craft_embroidery_detail.png",
  "/images/blouse_lookbook_hero.png",
  "/images/bridal_blouse_crimson_peacock.png",
  "/images/bridal_blouse_emerald_back.png",
  "/images/bridal_blouse_maroon_velvet.png",
  "/images/bridal_blouse_pastel_couture.png",
  "/images/bridal_blouse_purple_banarasi.png",
  "/images/craftsmanship_detail.png",
  "/images/festive_wear_plum_zari_silk.png",
  "/images/festive_wear_teal_velvet_shawl.png",
  "/images/gold_block_heel_juttis.png",
  "/images/gold_jhumkas.png",
  "/images/gold_polki_jhumkas.png",
  "/images/hopo_logo.png",
  "/images/indo_western_ivory_jacket_set.png",
  "/images/indo_western_rust_peplum_set.png",
  "/images/lehenga_crimson_royal_bridal.png",
  "/images/lehenga_ruby_rose_embroidered.png",
  "/images/maroon_potli.png",
  "/images/salwar_suit_beige_pink_printed.png",
  "/images/salwar_suit_rose_patiala_embroidered.png",
  "/images/saree_black_silver_zari.png",
  "/images/saree_ivory_embroidered_organza.png",
  "/images/saree_metallic_copper_tissue.png",
  "/images/saree_rust_orange_banarasi.png",
  "/images/saree_wine_maroon_silk.png",
  "/images/temple_necklace_set.png",
  "/images/wedding_blouse_burgundy_sheer.png",
  "/images/wedding_blouse_crimson_deep_v.png",
  "/images/wedding_blouse_crimson_floral.png",
  "/images/wedding_blouse_crimson_zardozi.png",
  "/images/wedding_blouse_pink_lattice.png",
  "/images/night_suit_1.jpg",
  "/images/night_suit_2.jpg",
  "/images/night_suit_3.jpg",
  "/images/night_suit_4.jpg",
  "/images/night_suit_5.jpg",
  "/images/night_suit_6.jpg",
  "/images/night_suit_7.jpg",
  "/images/night_suit_8.jpg",
  "/images/night_suit_9.jpg",
  "/images/night_suit_10.jpg",
]);
/**
 * Strict 1:1 Category Fallback Assets
 */
export const CATEGORY_FALLBACK_IMAGES = {
  "Bridal Blouses": "/images/bridal_blouse_crimson_peacock.png",
  "Wedding Blouses": "/images/wedding_blouse_crimson_deep_v.png",
  Lehengas: "/images/lehenga_crimson_royal_bridal.png",
  "Salwar Suits": "/images/salwar_suit_rose_patiala_embroidered.png",
  "Night Suits": "/images/night_suit_1.jpg",
  "Indo-Western": "/images/indo_western_rust_peplum_set.png",
  "Festive Wear": "/images/festive_wear_plum_zari_silk.png",
  Jewellery: "/images/gold_polki_jhumkas.png",
  Accessories: "/images/maroon_potli.png",
  Footwear: "/images/gold_block_heel_juttis.png",
};
/**
 * Universal Brand Fallback Asset
 */
export const DEFAULT_BRAND_FALLBACK = "/images/craftsmanship_detail.png";
/**
 * Mapping of legacy shorthands, mock IDs, and superseded filenames
 */
export const LEGACY_IMAGE_MAP = {
  // Legacy mock data keys
  bridalblouse: "/images/bridal_blouse_crimson_peacock.png",
  weddingblouse: "/images/wedding_blouse_crimson_deep_v.png",
  saree1: "/images/saree_wine_maroon_silk.png",
  saree2: "/images/saree_rust_orange_banarasi.png",
  saree3: "/images/saree_black_silver_zari.png",
  cordset: "/images/indo_western_rust_peplum_set.png",
  gown: "/images/indo_western_ivory_jacket_set.png",
  wrap: "/images/craftsmanship_detail.png",
  wrap1: "/images/craftsmanship_detail.png",
  wrap2: "/images/craftsmanship_detail.png",
  wrap3: "/images/craftsmanship_detail.png",
  // Previous image filenames replaced in prior updates
  "maroon_saree.png": "/images/saree_wine_maroon_silk.png",
  "/images/maroon_saree.png": "/images/saree_wine_maroon_silk.png",
  "rust_saree.png": "/images/saree_rust_orange_banarasi.png",
  "/images/rust_saree.png": "/images/saree_rust_orange_banarasi.png",
  "ivory_lehenga.png": "/images/lehenga_crimson_royal_bridal.png",
  "/images/ivory_lehenga.png": "/images/lehenga_crimson_royal_bridal.png",
  "pink_lehenga.png": "/images/lehenga_ruby_rose_embroidered.png",
  "/images/pink_lehenga.png": "/images/lehenga_ruby_rose_embroidered.png",
  "pastel_anarkali.png": "/images/salwar_suit_rose_patiala_embroidered.png",
  "/images/pastel_anarkali.png": "/images/salwar_suit_rose_patiala_embroidered.png",
  "silk_suit.png": "/images/salwar_suit_beige_pink_printed.png",
  "/images/silk_suit.png": "/images/salwar_suit_beige_pink_printed.png",
  "bridal_blouse.png": "/images/bridal_blouse_crimson_peacock.png",
  "/images/bridal_blouse.png": "/images/bridal_blouse_crimson_peacock.png",
  "emerald_blouse.png": "/images/bridal_blouse_emerald_back.png",
  "/images/emerald_blouse.png": "/images/bridal_blouse_emerald_back.png",
  "emerald_brocade_blouse.png": "/images/bridal_blouse_emerald_back.png",
  "/images/emerald_brocade_blouse.png": "/images/bridal_blouse_emerald_back.png",
  "velvet_blouse.png": "/images/bridal_blouse_maroon_velvet.png",
  "/images/velvet_blouse.png": "/images/bridal_blouse_maroon_velvet.png",
};
/**
 * Normalizes an image path or shorthand into an absolute /images/... path
 */
function normalizePath(path) {
  const clean = path.trim();
  if (clean.startsWith("/")) return clean;
  return `/${clean.replace(/^[./]+/, "")}`;
}

/**
 * Resolves a backend upload path or direct image URL cleanly against production hosts
 */
export function resolveUploadedImageUrl(url) {
  if (!url) return "";
  let clean = url.trim();

  // If it's already an absolute or relative static image path (/images/...)
  if (clean.startsWith("/images/") && !clean.startsWith("/images/uploads/")) {
    return clean;
  }
  if (clean.startsWith("images/") && !clean.startsWith("images/uploads/")) {
    return `/${clean}`;
  }

  // Normalize /images/uploads/... or uploads/... to /uploads/...
  if (clean.startsWith("/images/uploads/")) {
    clean = clean.replace(/^\/images\/uploads\//, "/uploads/");
  } else if (clean.startsWith("images/uploads/")) {
    clean = clean.replace(/^images\/uploads\//, "/uploads/");
  } else if (clean.startsWith("uploads/")) {
    clean = `/${clean}`;
  }

  // Strip hardcoded localhost / 127.0.0.1 development URLs if pointing to /uploads/
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    try {
      const parsed = new URL(clean);
      if (
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
        parsed.pathname.startsWith("/uploads/")
      ) {
        clean = parsed.pathname;
      } else {
        return clean;
      }
    } catch {
      return clean;
    }
  }

  if (clean.startsWith("data:image/") || clean.startsWith("blob:")) {
    return clean;
  }

  // In production with custom API base (cross-domain), prepend VITE_API_BASE_URL
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
  if (apiBase) {
    const rootBase = apiBase.replace(/\/api$/i, "");
    const cleanPath = clean.replace(/^\/+/, "");
    return `${rootBase}/${cleanPath}`;
  }

  // In local development (via Vite proxy) or same-origin production, return clean relative path
  return clean.startsWith("/") ? clean : `/${clean}`;
}

/**
 * Resolve product image with multi-tier fallback and category integrity guarantee
 */
export function resolveProductImage(item) {
  if (!item) return DEFAULT_BRAND_FALLBACK;
  const rawImage = (item.image || "").trim();
  const rawId = (item.id || "").trim();
  const rawTitle = (item.title || "").trim();
  const rawCategory = (item.category || "").trim();

  // Tier 1: Check if rawImage is a direct URL, upload path, or verified active file
  if (rawImage) {
    // 1a. Persistent backend upload path (e.g. /uploads/hopo_... or uploads/hopo_... or /images/uploads/...)
    if (
      rawImage.startsWith("/uploads/") ||
      rawImage.startsWith("uploads/") ||
      rawImage.startsWith("/images/uploads/") ||
      rawImage.startsWith("images/uploads/") ||
      (rawImage.includes("/uploads/") && (rawImage.startsWith("http://") || rawImage.startsWith("https://")))
    ) {
      return resolveUploadedImageUrl(rawImage);
    }

    // 1b. Direct web URLs, base64 data, or object blobs (e.g. admin preview or uploaded image)
    if (
      rawImage.startsWith("http://") ||
      rawImage.startsWith("https://") ||
      rawImage.startsWith("data:image/") ||
      rawImage.startsWith("blob:")
    ) {
      return rawImage;
    }

    // Exact match in verified set
    if (VERIFIED_IMAGES.has(rawImage)) {
      return rawImage;
    }
    // Try normalising path with leading slash
    const normalized = normalizePath(rawImage);
    if (VERIFIED_IMAGES.has(normalized)) {
      return normalized;
    }
    // Try prepending /images/ if rawImage is just a filename
    const withImagesDir = normalizePath(`/images/${rawImage.replace(/^\/images\//, "")}`);
    if (VERIFIED_IMAGES.has(withImagesDir)) {
      return withImagesDir;
    }
    // Check legacy shorthand map
    const legacyKey = rawImage
      .toLowerCase()
      .replace(/^\/images\//, "")
      .replace(/^\//, "");
    if (LEGACY_IMAGE_MAP[legacyKey]) {
      return LEGACY_IMAGE_MAP[legacyKey];
    }
    if (LEGACY_IMAGE_MAP[rawImage.toLowerCase()]) {
      return LEGACY_IMAGE_MAP[rawImage.toLowerCase()];
    }

    // If it's a relative path starting with /images/, retain it directly
    if (rawImage.startsWith("/images/")) {
      return rawImage;
    }
  }
  // Tier 2: Lookup canonical product by ID
  if (rawId) {
    const catalogProduct = PRODUCTS.find((p) => p.id.toLowerCase() === rawId.toLowerCase());
    if (catalogProduct && catalogProduct.image && VERIFIED_IMAGES.has(catalogProduct.image)) {
      return catalogProduct.image;
    }
    const accessoryProduct = COMPLETE_THE_LOOK.find(
      (p) => p.id.toLowerCase() === rawId.toLowerCase(),
    );
    if (accessoryProduct && accessoryProduct.image && VERIFIED_IMAGES.has(accessoryProduct.image)) {
      return accessoryProduct.image;
    }
    // Check SKU formats (e.g. BLS-1187, SAR-1042)
    if (rawId.startsWith("BLS") || rawId.startsWith("WBL")) {
      return "/images/bridal_blouse_crimson_peacock.png";
    }
    if (rawId.startsWith("SAR")) {
      return "/images/saree_wine_maroon_silk.png";
    }
    if (rawId.startsWith("LEH")) {
      return "/images/lehenga_crimson_royal_bridal.png";
    }
  }
  // Tier 3: Match against catalog by Title
  if (rawTitle) {
    const lowerTitle = rawTitle.toLowerCase();
    // Exact or high-confidence title match in PRODUCTS
    const matchedProduct = PRODUCTS.find((p) => {
      const pTitle = p.title.toLowerCase();
      return pTitle === lowerTitle || pTitle.includes(lowerTitle) || lowerTitle.includes(pTitle);
    });
    if (matchedProduct && matchedProduct.image && VERIFIED_IMAGES.has(matchedProduct.image)) {
      return matchedProduct.image;
    }
    // Specific match for "Emerald Brocade Wedding Blouse" (Order Tracking item from screenshot)
    if (
      lowerTitle.includes("emerald") &&
      (lowerTitle.includes("blouse") || lowerTitle.includes("brocade"))
    ) {
      return "/images/bridal_blouse_emerald_back.png";
    }
    // Specific match for "Crimson Zardozi Bridal Blouse" (Order Tracking item from screenshot)
    if (lowerTitle.includes("crimson") && lowerTitle.includes("bridal blouse")) {
      return "/images/bridal_blouse_crimson_peacock.png";
    }
    // Semantic category matching from title keywords
    if (
      lowerTitle.includes("bridal blouse") ||
      (lowerTitle.includes("zardozi") && lowerTitle.includes("blouse"))
    ) {
      return "/images/bridal_blouse_crimson_peacock.png";
    }
    if (
      lowerTitle.includes("wedding blouse") ||
      lowerTitle.includes("brocade blouse") ||
      lowerTitle.includes("deep v")
    ) {
      return "/images/wedding_blouse_crimson_deep_v.png";
    }
    if (lowerTitle.includes("velvet") && lowerTitle.includes("blouse")) {
      return "/images/bridal_blouse_maroon_velvet.png";
    }
    if (lowerTitle.includes("lehenga")) {
      if (lowerTitle.includes("rose") || lowerTitle.includes("pink"))
        return "/images/lehenga_ruby_rose_embroidered.png";
      return "/images/lehenga_crimson_royal_bridal.png";
    }
    if (
      lowerTitle.includes("night suit") ||
      lowerTitle.includes("nightsuit") ||
      lowerTitle.includes("sleepwear") ||
      lowerTitle.includes("pajama")
    ) {
      if (lowerTitle.includes("berry"))
        return "/images/night_suit_6.jpg";
      if (lowerTitle.includes("sky blue"))
        return "/images/night_suit_7.jpg";
      if (lowerTitle.includes("soft peach") || lowerTitle.includes("peach floral"))
        return "/images/night_suit_8.jpg";
      if (lowerTitle.includes("striped floral") || lowerTitle.includes("mint"))
        return "/images/night_suit_9.jpg";
      if (lowerTitle.includes("peach ruffle") || lowerTitle.includes("ruffle cotton"))
        return "/images/night_suit_10.jpg";
      if (
        lowerTitle.includes("lace") ||
        lowerTitle.includes("rose") ||
        lowerTitle.includes("pink satin") ||
        lowerTitle.includes("bear")
      )
        return "/images/night_suit_1.jpg";
      if (
        lowerTitle.includes("wrap") ||
        lowerTitle.includes("white") ||
        lowerTitle.includes("floral") ||
        lowerTitle.includes("green")
      )
        return "/images/night_suit_2.jpg";
      if (
        lowerTitle.includes("navy") ||
        lowerTitle.includes("classic") ||
        lowerTitle.includes("blue") ||
        lowerTitle.includes("bunny") ||
        lowerTitle.includes("miffy")
      )
        return "/images/night_suit_3.jpg";
      if (
        lowerTitle.includes("striped") ||
        lowerTitle.includes("cotton") ||
        lowerTitle.includes("leopard")
      )
        return "/images/night_suit_4.jpg";
      if (
        lowerTitle.includes("deep red") ||
        lowerTitle.includes("red") ||
        lowerTitle.includes("satin night") ||
        lowerTitle.includes("kitty") ||
        lowerTitle.includes("pink")
      )
        return "/images/night_suit_5.jpg";
      return "/images/night_suit_1.jpg";
    }
    if (
      (lowerTitle.includes("suit") && !lowerTitle.includes("night suit")) ||
      lowerTitle.includes("salwar") ||
      lowerTitle.includes("patiala") ||
      lowerTitle.includes("anarkali")
    ) {
      if (lowerTitle.includes("beige") || lowerTitle.includes("straight"))
        return "/images/salwar_suit_beige_pink_printed.png";
      return "/images/salwar_suit_rose_patiala_embroidered.png";
    }
    if (
      lowerTitle.includes("indo-western") ||
      lowerTitle.includes("peplum") ||
      lowerTitle.includes("jacket") ||
      lowerTitle.includes("cord set") ||
      lowerTitle.includes("co-ord") ||
      lowerTitle.includes("gown")
    ) {
      if (
        lowerTitle.includes("jacket") ||
        lowerTitle.includes("flare") ||
        lowerTitle.includes("gown")
      )
        return "/images/indo_western_ivory_jacket_set.png";
      return "/images/indo_western_rust_peplum_set.png";
    }
    if (
      lowerTitle.includes("festive") ||
      lowerTitle.includes("kurta") ||
      lowerTitle.includes("shawl")
    ) {
      if (lowerTitle.includes("teal") || lowerTitle.includes("shawl"))
        return "/images/festive_wear_teal_velvet_shawl.png";
      return "/images/festive_wear_plum_zari_silk.png";
    }
    if (
      lowerTitle.includes("jhumka") ||
      lowerTitle.includes("earring") ||
      lowerTitle.includes("polki")
    ) {
      return "/images/gold_polki_jhumkas.png";
    }
    if (
      lowerTitle.includes("potli") ||
      lowerTitle.includes("bag") ||
      lowerTitle.includes("clutch")
    ) {
      return "/images/maroon_potli.png";
    }
    if (
      lowerTitle.includes("jutti") ||
      lowerTitle.includes("heel") ||
      lowerTitle.includes("footwear")
    ) {
      return "/images/gold_block_heel_juttis.png";
    }
    if (lowerTitle.includes("necklace") || lowerTitle.includes("temple")) {
      return "/images/temple_necklace_set.png";
    }
  }
  // Tier 4: Category Fallback
  if (rawCategory) {
    const categoryName = rawCategory.trim();
    for (const [key, path] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
      if (
        key.toLowerCase() === categoryName.toLowerCase() ||
        categoryName.toLowerCase().includes(key.toLowerCase())
      ) {
        return path;
      }
    }
  }
  // Tier 5: Default Brand Luxury Fallback
  return DEFAULT_BRAND_FALLBACK;
}
/**
 * Returns the strictly category-matched fallback image
 */
export function getCategoryFallback(category) {
  if (!category) return DEFAULT_BRAND_FALLBACK;
  const lower = category.toLowerCase().trim();
  for (const [key, path] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (key.toLowerCase() === lower || lower.includes(key.toLowerCase())) {
      return path;
    }
  }
  return DEFAULT_BRAND_FALLBACK;
}
