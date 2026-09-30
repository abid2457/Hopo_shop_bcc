import { useState, useEffect, useCallback, useMemo } from "react";
import { PRODUCTS } from "./hopo-data";
import { productApi } from "../services/api/index";

export const CANONICAL_CATEGORIES = [
  {
    id: 1,
    name: "Bridal Blouses",
    slug: "bridal-blouses",
    title: "Bridal Blouses",
    subtitle: "Heirloom Zardozi & Handcrafted Wedding Creations",
    eyebrow: "HAUTE COUTURE BLOUSE ATELIER",
    description:
      "Hand-embroidered gold bullion, dabka, aari, and pearl necklines tailored in pure crimson raw silk and royal velvet.",
    image: "/images/bridal_blouse_crimson_peacock.png",
    count: 10,
    subs: [
      "Zardozi Bridal Blouses",
      "Velvet Bridal Blouses",
      "Backless Designer Blouses",
      "Hand-Embroidered Blouses",
      "Brocade Blouses",
      "Zari Woven Blouses",
      "Temple Border Blouses",
      "Custom Fit Blouses",
    ],
    subcategories: [
      "Zardozi Bridal Blouses",
      "Velvet Bridal Blouses",
      "Backless Designer Blouses",
      "Hand-Embroidered Blouses",
      "Brocade Blouses",
      "Zari Woven Blouses",
      "Temple Border Blouses",
      "Custom Fit Blouses",
    ],
    status: "active",
  },
  {
    id: 2,
    name: "Lehengas",
    slug: "lehengas",
    title: "Lehengas",
    subtitle: "Regal Bridal & Wedding Ensembles",
    eyebrow: "ROYAL BRIDAL COUTURE",
    description:
      "Multi-panelled swirling gheras, intricate zardozi motifs, resham embroidery and gossamer dupattas crafted for royal brides.",
    image: "/images/lehenga_crimson_royal_bridal.png",
    count: 2,
    subs: ["Bridal Lehengas", "Wedding Lehengas"],
    subcategories: ["Bridal Lehengas", "Wedding Lehengas"],
    status: "active",
  },
  {
    id: 3,
    name: "Salwar Suits",
    slug: "salwar-suits",
    title: "Salwar Suits",
    subtitle: "Designer Straight-Cut, Palazzo & Patiala Sets",
    eyebrow: "FESTIVE COUTURE",
    description:
      "Graceful silhouettes in Chanderi silk and georgette with delicate resham threadwork, gota patti and matching dupattas.",
    image: "/images/salwar_suit_beige_pink_printed.png",
    count: 2,
    subs: ["Straight-Cut Suits", "Designer Salwar Suits"],
    subcategories: ["Straight-Cut Suits", "Designer Salwar Suits"],
    status: "active",
  },
  {
    id: 4,
    name: "Night Suits",
    slug: "night-suits",
    title: "Night Suits",
    subtitle: "Relax in Style",
    eyebrow: "LOUNGE & SLEEPWEAR",
    description:
      "Soft fabrics, elegant designs and everyday comfort — because comfort looks good on you.",
    image: "/images/night_suit_1.jpg",
    count: 10,
    subs: ["Luxury Silk Pajamas", "Cotton Lounge Sets", "Satin Nightwear Sets"],
    subcategories: ["Luxury Silk Pajamas", "Cotton Lounge Sets", "Satin Nightwear Sets"],
    status: "active",
  },
];

// In-Memory dynamic cache initialized from localStorage or canonical
const DYNAMIC_CATEGORIES_KEY = "hopo_dynamic_categories_cache";

function getStoredCategories() {
  if (typeof window === "undefined") return CANONICAL_CATEGORIES;
  try {
    const raw = localStorage.getItem(DYNAMIC_CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return CANONICAL_CATEGORIES;
}

let liveCategoriesCache = getStoredCategories();

/** Category Slug to Definition Map */
const SLUG_MAP = new Map();
/** Category Name to Definition Map (case-insensitive) */
const NAME_MAP = new Map();

// Synonyms and plural variations mapping to canonical category name
const CATEGORY_ALIASES = {
  "bridal blouse": "Bridal Blouses",
  "bridal-blouse": "Bridal Blouses",
  "bridal-blouses": "Bridal Blouses",
  "bridal blouses": "Bridal Blouses",
  "wedding blouse": "Bridal Blouses",
  "wedding-blouse": "Bridal Blouses",
  "wedding-blouses": "Bridal Blouses",
  "wedding blouses": "Bridal Blouses",
  "night suit": "Night Suits",
  "night-suit": "Night Suits",
  "night-suits": "Night Suits",
  "night suits": "Night Suits",
  sleepwear: "Night Suits",
  loungewear: "Night Suits",
  pajama: "Night Suits",
  pajamas: "Night Suits",
  lehenga: "Lehengas",
  lehengas: "Lehengas",
  salwar: "Salwar Suits",
  "salwar suit": "Salwar Suits",
  "salwar suits": "Salwar Suits",
  "salwar-suit": "Salwar Suits",
  "salwar-suits": "Salwar Suits",
  suits: "Salwar Suits",
  suit: "Salwar Suits",
};

export function registerDynamicCategories(cats) {
  if (!Array.isArray(cats) || cats.length === 0) return;
  const activeCats = cats.filter((c) => c.status !== "inactive" && c.status !== "archived");
  const normalizedList = activeCats.map((cat, idx) => {
    const subs = Array.isArray(cat.subs)
      ? cat.subs
      : Array.isArray(cat.subcategories)
        ? cat.subcategories
        : [];
    const count = typeof cat.count === "number" ? cat.count : typeof cat.product_count === "number" ? cat.product_count : 0;
    return {
      id: cat.id || idx + 1,
      name: cat.name,
      slug: cat.slug || categoryToSlug(cat.name),
      title: cat.title || cat.name,
      subtitle: cat.subtitle || "",
      eyebrow: cat.eyebrow || "ATELIER COLLECTION",
      description: cat.description || "",
      image: cat.image || cat.image_url || "/images/brand_logo.png",
      count: count,
      product_count: count,
      subs: subs,
      subcategories: subs,
      status: cat.status || "active",
      display_order: cat.display_order ?? idx + 1,
    };
  });

  liveCategoriesCache = normalizedList;

  // Re-populate maps
  SLUG_MAP.clear();
  NAME_MAP.clear();

  // First seed canonical
  CANONICAL_CATEGORIES.forEach((cat) => {
    SLUG_MAP.set(cat.slug.toLowerCase(), cat);
    NAME_MAP.set(cat.name.toLowerCase(), cat);
  });

  // Then overwrite with live categories
  normalizedList.forEach((cat) => {
    SLUG_MAP.set(cat.slug.toLowerCase(), cat);
    NAME_MAP.set(cat.name.toLowerCase(), cat);
  });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DYNAMIC_CATEGORIES_KEY, JSON.stringify(normalizedList));
    } catch {
      // storage quota
    }
  }
}

// Initial populate
registerDynamicCategories(liveCategoriesCache);

export function getLiveCategories() {
  return [...liveCategoriesCache];
}

/** Global notifier to sync frontend everywhere when admin updates products/categories */
export function notifyCatalogUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("hopo-catalog-update"));
    window.dispatchEvent(new Event("hopo-store-update"));
  }
}

/**
 * Reactive Hook for Dynamic Categories and Real-Time Counts
 */
export function useDynamicCategories() {
  const [categories, setCategories] = useState(getLiveCategories);
  const [loading, setLoading] = useState(false);

  const fetchLive = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productApi.getCategories();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        registerDynamicCategories(res.data);
        setCategories(getLiveCategories());
      }
    } catch (err) {
      console.warn("Categories sync notice:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const handleUpdate = () => {
      fetchLive();
    };
    window.addEventListener("hopo-catalog-update", handleUpdate);
    window.addEventListener("hopo-store-update", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("hopo-catalog-update", handleUpdate);
      window.removeEventListener("hopo-store-update", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [fetchLive]);

  const totalCategories = categories.length;
  const totalProducts = useMemo(
    () => categories.reduce((sum, c) => sum + (c.count || 0), 0),
    [categories],
  );

  return {
    categories,
    totalCategories,
    totalProducts,
    loading,
    refreshCategories: fetchLive,
  };
}

/** Convert any category name or alias to its canonical name */
export function normalizeCategoryName(input) {
  if (!input) return undefined;
  const clean = String(input).trim().toLowerCase();
  if (NAME_MAP.has(clean)) {
    return NAME_MAP.get(clean).name;
  }
  if (SLUG_MAP.has(clean)) {
    return SLUG_MAP.get(clean).name;
  }
  if (CATEGORY_ALIASES[clean]) {
    return CATEGORY_ALIASES[clean];
  }
  // Check substring or case-insensitive match on live categories
  for (const cat of liveCategoriesCache) {
    if (cat.name.toLowerCase() === clean || cat.slug.toLowerCase() === clean) {
      return cat.name;
    }
  }
  for (const cat of CANONICAL_CATEGORIES) {
    if (cat.name.toLowerCase() === clean || cat.slug.toLowerCase() === clean) {
      return cat.name;
    }
  }
  return undefined;
}

/** Convert a category name to its canonical URL slug */
export function categoryToSlug(categoryName) {
  if (!categoryName) return "";
  const normalized = normalizeCategoryName(categoryName);
  if (normalized) {
    const cat = NAME_MAP.get(normalized.toLowerCase());
    if (cat) return cat.slug;
  }
  return String(categoryName)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** Convert a slug to its canonical category name */
export function slugToCategory(slug) {
  if (!slug) return undefined;
  const clean = String(slug).trim().toLowerCase();
  const cat = SLUG_MAP.get(clean);
  if (cat) return cat.name;
  return normalizeCategoryName(slug);
}

/** Check if a category slug or name is a valid approved category */
export function isValidCategory(input) {
  if (!input) return false;
  return normalizeCategoryName(input) !== undefined;
}

/** Get the canonical category definition object */
export function getCategoryDefinition(input) {
  if (!input) return undefined;
  const canonicalName = normalizeCategoryName(input);
  if (!canonicalName) return undefined;
  return NAME_MAP.get(canonicalName.toLowerCase());
}

/** Generate a clean URL for a category */
export function getCategoryUrl(categoryOrSlug) {
  const slug = categoryToSlug(categoryOrSlug);
  return `/category/${slug}`;
}

/** Generate a faceted URL for a fabric */
export function getFabricUrl(fabric, category) {
  const params = new URLSearchParams();
  if (category) {
    const norm = normalizeCategoryName(category);
    if (norm) params.set("category", norm);
  }
  params.set("fabric", fabric);
  return `/listing?${params.toString()}`;
}

/** Generate a faceted URL for an occasion */
export function getOccasionUrl(occasion, category) {
  const params = new URLSearchParams();
  if (category) {
    const norm = normalizeCategoryName(category);
    if (norm) params.set("category", norm);
  }
  params.set("occasion", occasion);
  return `/listing?${params.toString()}`;
}

/** Generate a faceted URL for a designer/brand */
export function getDesignerUrl(designer) {
  const params = new URLSearchParams();
  params.set("designer", designer);
  return `/listing?${params.toString()}`;
}

/**
 * Main strict filtering engine.
 * STRICT RELEVANCE RULE:
 * 1. When a category is specified, products MUST strictly belong to that category (p.category === canonicalCategory).
 * 2. Inactive or archived products are strictly excluded.
 * 3. Multiple facets use strict boolean AND logic.
 * 4. Zero unrelated product leakage.
 */
export function filterCatalogProducts(options, sourceProducts = null) {
  const targetCategorySlug = options.categorySlug;
  const targetCategoryInput =
    options.category || (targetCategorySlug ? slugToCategory(targetCategorySlug) : undefined);
  const canonicalCategoryName = targetCategoryInput
    ? normalizeCategoryName(targetCategoryInput)
    : undefined;

  // If a slug was passed but could not be resolved to an approved category, flag as not found
  if (targetCategorySlug && !canonicalCategoryName) {
    return {
      products: [],
      totalCount: 0,
      isCategoryNotFound: true,
    };
  }

  const categoryDef = canonicalCategoryName
    ? getCategoryDefinition(canonicalCategoryName)
    : undefined;

  let list =
    sourceProducts && Array.isArray(sourceProducts)
      ? [...sourceProducts]
      : [...PRODUCTS];

  // 0. Exclude inactive or archived products
  list = list.filter((p) => {
    if (p.isArchived || p.is_archived) return false;
    if (p.status && p.status !== "active") return false;
    return true;
  });

  // 1. Strict Category Filter
  if (canonicalCategoryName) {
    list = list.filter((p) => {
      const pCat = p.category || p.category_name;
      if (!pCat) return false;
      const productNormCat = normalizeCategoryName(pCat);
      return productNormCat === canonicalCategoryName;
    });
  }

  // 2. Subcategory Filter
  if (options.subcategory) {
    const normSub = options.subcategory.toLowerCase().trim();
    list = list.filter((p) => p.subcategory && p.subcategory.toLowerCase().trim() === normSub);
  }

  // 3. Fabric Filter (Single or Array)
  const targetFabrics =
    options.fabrics && options.fabrics.length > 0
      ? options.fabrics
      : options.fabric
        ? [options.fabric]
        : [];
  if (targetFabrics.length > 0) {
    const normFabrics = targetFabrics.map((f) => f.toLowerCase().trim());
    list = list.filter((p) => {
      const pFab = (p.fabric || "").toLowerCase();
      const pTitle = (p.title || "").toLowerCase();
      const pSub = (p.subcategory || "").toLowerCase();
      return normFabrics.some(
        (f) => pFab.includes(f) || f.includes(pFab) || pTitle.includes(f) || pSub.includes(f),
      );
    });
  }

  // 4. Occasion Filter (Single or Array)
  const targetOccasions =
    options.occasions && options.occasions.length > 0
      ? options.occasions
      : options.occasion
        ? [options.occasion]
        : [];
  if (targetOccasions.length > 0) {
    const normOccasions = targetOccasions.map((o) => o.toLowerCase().trim());
    list = list.filter((p) => {
      const pOcc = (p.occasion || "").toLowerCase();
      const pTag = (p.tag || "").toLowerCase();
      const pTitle = (p.title || "").toLowerCase();
      return normOccasions.some(
        (o) => pOcc.includes(o) || o.includes(pOcc) || pTag.includes(o) || pTitle.includes(o),
      );
    });
  }

  // 5. Designer / Brand Filter
  const targetBrand = options.designer || options.brand;
  if (targetBrand) {
    const normBrand = targetBrand.toLowerCase().trim();
    list = list.filter((p) => p.brand && p.brand.toLowerCase().trim() === normBrand);
  }

  // 6. Color Filter
  if (options.color) {
    const normColor = options.color.toLowerCase().trim();
    list = list.filter((p) => p.color && p.color.toLowerCase().includes(normColor));
  }

  // 7. Sleeve Filter
  if (options.sleeve) {
    const normSleeve = options.sleeve.toLowerCase().trim();
    list = list.filter((p) => p.sleeve && p.sleeve.toLowerCase().includes(normSleeve));
  }

  // 8. Neckline Filter
  if (options.neckline) {
    const normNeck = options.neckline.toLowerCase().trim();
    list = list.filter((p) => p.neckline && p.neckline.toLowerCase().includes(normNeck));
  }

  // 9. Price Range Filter
  if (options.minPrice !== undefined) {
    list = list.filter((p) => p.price >= options.minPrice);
  }
  if (options.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= options.maxPrice);
  }

  // 10. Discount Only Filter
  if (options.discountOnly) {
    list = list.filter((p) => p.mrp && p.mrp > p.price);
  }

  // 11. Sorting
  const sort = options.sort || "popularity";
  if (sort === "price_asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === "price_desc") {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === "discount") {
    list.sort((a, b) => {
      const discA = a.mrp ? (a.mrp - a.price) / a.mrp : 0;
      const discB = b.mrp ? (b.mrp - b.price) / b.mrp : 0;
      return discB - discA;
    });
  } else if (sort === "newest") {
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }

  return {
    products: list,
    totalCount: list.length,
    activeCategoryName: canonicalCategoryName,
    categoryDefinition: categoryDef,
    isCategoryNotFound: false,
  };
}

/**
 * Strict Relevance Related Products Recommendation Algorithm.
 */
export function getRelatedProducts(product, limit = 5, pool = null) {
  if (!product) return [];
  const canonicalCat = normalizeCategoryName(product.category || product.category_name);
  const sourcePool = Array.isArray(pool) && pool.length > 0 ? pool : PRODUCTS;

  // Strict category pool: must match the product's category and be active
  const categoryPool = sourcePool.filter((p) => {
    if (p.id === product.id) return false;
    if (p.isArchived || p.is_archived || (p.status && p.status !== "active")) return false;
    if (!canonicalCat) return true;
    const pCat = p.category || p.category_name;
    return normalizeCategoryName(pCat) === canonicalCat;
  });

  const scored = categoryPool.map((candidate) => {
    let score = 100;
    if (
      product.subcategory &&
      candidate.subcategory &&
      product.subcategory.toLowerCase() === candidate.subcategory.toLowerCase()
    ) {
      score += 40;
    }
    if (
      product.fabric &&
      candidate.fabric &&
      product.fabric.toLowerCase() === candidate.fabric.toLowerCase()
    ) {
      score += 25;
    }
    if (
      product.occasion &&
      candidate.occasion &&
      product.occasion.toLowerCase() === candidate.occasion.toLowerCase()
    ) {
      score += 20;
    }
    if (
      product.brand &&
      candidate.brand &&
      product.brand.toLowerCase() === candidate.brand.toLowerCase()
    ) {
      score += 15;
    }
    const priceDiffRatio = Math.abs(candidate.price - product.price) / (product.price || 1);
    if (priceDiffRatio <= 0.3) {
      score += 10;
    }
    return { product: candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.product);
}

/**
 * Dynamic Breadcrumb Builder for Product Detail Page
 */
export function getProductBreadcrumbs(product) {
  const crumbs = [{ label: "Home", to: "/home" }];
  const canonicalCat = normalizeCategoryName(product?.category || product?.category_name);
  if (canonicalCat) {
    const slug = categoryToSlug(canonicalCat);
    crumbs.push({ label: canonicalCat, to: `/category/${slug}` });
  } else {
    crumbs.push({ label: "Collections", to: "/listing" });
  }
  crumbs.push({ label: product?.title || "Product" });
  return crumbs;
}

/**
 * Dynamic Category & Subcategory Catalog Engine.
 */
export function getDynamicCategoryCatalog() {
  const liveCats = getLiveCategories();
  return liveCats.map((catDef) => {
    const subs = Array.isArray(catDef.subs)
      ? catDef.subs
      : Array.isArray(catDef.subcategories)
        ? catDef.subcategories
        : [];
    const subcategoryList = subs.map((subName) => ({
      name: subName,
      count: 0,
      image: catDef.image,
    }));
    return {
      id: catDef.id,
      name: catDef.name,
      slug: catDef.slug || categoryToSlug(catDef.name),
      title: catDef.title || catDef.name,
      subtitle: catDef.subtitle || "",
      eyebrow: catDef.eyebrow || "ATELIER COLLECTION",
      description: catDef.description || "",
      image: catDef.image,
      totalCount: catDef.count || 0,
      count: catDef.count || 0,
      subcategories: subcategoryList,
      subs: subs,
    };
  });
}

/**
 * Get dynamic category information for a specific category name or slug
 */
export function getDynamicCategoryInfo(categoryOrSlug) {
  const categories = getDynamicCategoryCatalog();
  const normalized = normalizeCategoryName(categoryOrSlug);
  if (normalized) {
    return categories.find((c) => c.name.toLowerCase() === normalized.toLowerCase());
  }
  const slug = categoryToSlug(categoryOrSlug);
  return categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
}
