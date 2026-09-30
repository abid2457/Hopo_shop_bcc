import { PRODUCTS, COMPLETE_THE_LOOK, CATEGORIES, OCCASIONS, FABRICS, BRANDS } from "./hopo-data";
import { getCategoryUrl } from "./catalog-service";
// Unified master catalog
export const ALL_CATALOG_PRODUCTS = [
  ...PRODUCTS.map((p) => ({
    ...p,
    category:
      p.category ||
      (p.title.toLowerCase().includes("bridal blouse")
        ? "Bridal Blouses"
        : p.title.toLowerCase().includes("lehenga")
          ? "Lehengas"
          : p.title.toLowerCase().includes("salwar")
            ? "Salwar Suits"
            : p.title.toLowerCase().includes("night")
              ? "Night Suits"
              : p.title.toLowerCase().includes("indo")
                ? "Indo-Western"
                : p.title.toLowerCase().includes("festive")
                  ? "Festive Wear"
                  : "Bridal Blouses"),
    subcategory:
      p.subcategory ||
      (p.title.toLowerCase().includes("lehenga")
        ? "Lehengas"
        : p.title.toLowerCase().includes("bridal blouse")
          ? "Bridal Blouses"
          : p.title.toLowerCase().includes("wedding blouse") ||
              p.title.toLowerCase().includes("blouse")
            ? "Bridal Blouses"
            : p.title.toLowerCase().includes("night")
              ? "Satin Nightwear Sets"
              : p.title.toLowerCase().includes("co-ord")
                ? "Co-ord Sets"
                : p.title.toLowerCase().includes("gown") || p.title.toLowerCase().includes("dress")
                  ? "Dresses"
                  : undefined),
    color:
      p.color ||
      (p.title.toLowerCase().includes("maroon")
        ? "Maroon"
        : p.title.toLowerCase().includes("ivory")
          ? "Ivory"
          : p.title.toLowerCase().includes("pink")
            ? "Pink"
            : p.title.toLowerCase().includes("mustard") || p.title.toLowerCase().includes("gold")
              ? "Gold"
              : p.title.toLowerCase().includes("champagne")
                ? "Champagne"
                : p.title.toLowerCase().includes("green") ||
                    p.title.toLowerCase().includes("emerald")
                  ? "Green"
                  : undefined),
  })),
  ...COMPLETE_THE_LOOK.map((p) => ({
    ...p,
    category:
      p.category ||
      (p.title.toLowerCase().includes("earring") ||
      p.title.toLowerCase().includes("necklace") ||
      p.title.toLowerCase().includes("jhumka")
        ? "Jewellery"
        : p.title.toLowerCase().includes("potli") || p.title.toLowerCase().includes("bag")
          ? "Bags"
          : p.title.toLowerCase().includes("juttis") || p.title.toLowerCase().includes("heel")
            ? "Footwear"
            : "Accessories"),
    subcategory:
      p.subcategory ||
      (p.title.toLowerCase().includes("jhumka") || p.title.toLowerCase().includes("earring")
        ? "Earrings"
        : p.title.toLowerCase().includes("necklace")
          ? "Necklaces"
          : p.title.toLowerCase().includes("potli")
            ? "Potlis"
            : p.title.toLowerCase().includes("juttis")
              ? "Juttis"
              : undefined),
    color:
      p.color ||
      (p.title.toLowerCase().includes("gold")
        ? "Gold"
        : p.title.toLowerCase().includes("maroon")
          ? "Maroon"
          : undefined),
  })),
];
// Synonyms, plural forms, and related semantic keywords
const SYNONYMS = {
  blouse: ["blouse", "blouses", "choli", "crop top", "designer blouse"],
  blouses: ["blouse", "blouses", "choli", "crop top", "designer blouse"],
  "bridal blouse": ["bridal blouse", "bridal blouses", "zardozi blouse", "aari blouse", "choli"],
  "wedding blouse": ["wedding blouse", "wedding blouses", "brocade blouse", "silk blouse", "choli"],
  zardozi: ["zardozi", "aari", "hand-embroidered", "embroidery", "bridal blouse", "crimson"],
  sweetheart: ["sweetheart", "sweetheart neck", "sweetheart neckline", "bridal blouse"],
  boat: ["boat", "boat neck", "boat neckline", "brocade blouse"],
  backless: ["backless", "back design", "dori", "latkan", "statement back", "blouse"],
  sleeveless: ["sleeveless", "cut sleeve", "strappy", "sangeet blouse"],
  sangeet: ["sangeet", "mirror work", "rani pink", "sangeet blouse", "festive"],
  haldi: ["haldi", "mustard", "yellow", "gota patti", "haldi blouse"],
  mehendi: ["mehendi", "teal", "green", "zari blouse", "mehendi blouse"],
  reception: ["reception", "velvet", "velvet blouse", "cocktail", "maroon"],
  brocade: ["brocade", "banarasi", "banarasi silk", "brocade blouse"],
  velvet: ["velvet", "micro velvet", "velvet blouse", "reception blouse"],
  lehenga: ["lehenga", "lehengas", "choli", "ghagra", "bridal lehenga", "wedding lehenga"],
  lehengas: ["lehenga", "lehengas", "choli", "ghagra", "bridal lehenga", "wedding lehenga"],
  dress: ["dress", "dresses", "gown", "gowns", "one-piece", "frock"],
  dresses: ["dress", "dresses", "gown", "gowns"],
  gown: ["gown", "gowns", "dress", "dresses", "party gown"],
  earring: ["earring", "earrings", "jhumka", "jhumkas", "polki", "studs"],
  earrings: ["earring", "earrings", "jhumka", "jhumkas", "polki", "studs"],
  jhumka: ["jhumka", "jhumkas", "earring", "earrings"],
  necklace: ["necklace", "necklaces", "choker", "temple necklace", "jewellery"],
  jutti: ["jutti", "juttis", "mojari", "footwear", "heels", "shoes"],
  juttis: ["jutti", "juttis", "mojari", "footwear", "heels", "shoes"],
  potli: ["potli", "potlis", "bag", "bags", "clutch", "purse"],
  red: ["red", "maroon", "crimson", "scarlet", "ruby"],
  maroon: ["maroon", "red", "wine", "burgundy"],
  gold: ["gold", "golden", "zari", "polki", "champagne"],
  wedding: ["wedding", "marriage", "shaadi", "reception"],
  bridal: ["bridal", "bride", "shaadi", "dulhan"],
  festive: ["festive", "festivals", "diwali", "puja", "eid", "navratri", "celebration"],
  party: ["party", "cocktail", "evening", "glam"],
  summer: ["summer", "linen", "casual", "cotton"],
  casual: ["casual", "daily", "cotton", "everyday", "office"],
  salwar: [
    "salwar",
    "salwar suit",
    "salwar suits",
    "kameez",
    "punjabi suit",
    "palazzo suit",
    "suit set",
  ],
  "salwar suit": [
    "salwar",
    "salwar suit",
    "salwar suits",
    "kameez",
    "punjabi suit",
    "palazzo suit",
    "suit set",
  ],
  "night suit": [
    "night suit",
    "night suits",
    "pajama",
    "pajamas",
    "sleepwear",
    "loungewear",
    "satin night suit",
    "cotton night suit",
  ],
  "night suits": [
    "night suit",
    "night suits",
    "pajama",
    "pajamas",
    "sleepwear",
    "loungewear",
    "satin night suit",
    "cotton night suit",
  ],
  nightsuit: ["night suit", "night suits", "pajama", "sleepwear", "loungewear"],
  nightsuits: ["night suit", "night suits", "pajama", "sleepwear", "loungewear"],
  pajama: ["night suit", "night suits", "pajama", "pajamas", "sleepwear", "loungewear"],
  pajamas: ["night suit", "night suits", "pajama", "pajamas", "sleepwear", "loungewear"],
  sleepwear: ["night suit", "night suits", "pajama", "sleepwear", "loungewear"],
  loungewear: ["night suit", "night suits", "pajama", "sleepwear", "loungewear"],
  "indo-western": [
    "indo-western",
    "indo western",
    "fusion",
    "draped gown",
    "jacket lehenga",
    "crop top skirt",
    "fusion wear",
  ],
  "festive wear": [
    "festive wear",
    "festive",
    "sharara",
    "celebration wear",
    "diwali",
    "puja",
    "eid",
  ],
};
/** Normalizes a text string for matching */
export function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
/** Extracts unique search tokens from query */
export function tokenizeQuery(query) {
  const norm = normalizeText(query);
  if (!norm) return [];
  return norm.split(" ").filter((t) => t.length > 0);
}
/** Check if any token matches target text directly or through synonyms */
function matchTokenInField(token, fieldValue) {
  if (!fieldValue) return false;
  const normField = normalizeText(fieldValue);
  if (normField.includes(token)) return true;
  // Check synonyms
  const syns = SYNONYMS[token] || [];
  for (const s of syns) {
    if (normField.includes(s)) return true;
  }
  return false;
}
/** Extracts price bounds if user typed e.g. "under 5000", "below 10000", "above 2000" */
function extractPriceBounds(query) {
  let clean = query;
  let maxPrice;
  let minPrice;
  const underMatch = query.match(/(?:under|below|less than|within)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
  if (underMatch) {
    maxPrice = parseInt(underMatch[1], 10);
    clean = clean.replace(underMatch[0], "").trim();
  }
  const aboveMatch = query.match(/(?:above|over|more than)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
  if (aboveMatch) {
    minPrice = parseInt(aboveMatch[1], 10);
    clean = clean.replace(aboveMatch[0], "").trim();
  }
  return { maxPrice, minPrice, cleanQuery: clean };
}
/** Main scoring algorithm for a product */
function scoreProduct(p, query, tokens, bounds) {
  const normQuery = normalizeText(query);
  const normTitle = normalizeText(p.title);
  const normBrand = normalizeText(p.brand);
  const normCategory = normalizeText(p.category || "");
  const normSub = normalizeText(p.subcategory || "");
  const normFabric = normalizeText(p.fabric || "");
  const normOccasion = normalizeText(p.occasion || "");
  const normTag = normalizeText(p.tag || "");
  const normColor = normalizeText(p.color || "");
  let score = 0;
  const highlights = [];
  // Price boundary verification
  if (bounds?.maxPrice !== undefined && p.price > bounds.maxPrice) {
    return { score: 0, highlights: [] };
  }
  if (bounds?.minPrice !== undefined && p.price < bounds.minPrice) {
    return { score: 0, highlights: [] };
  }
  // If pure price query and within bounds, award high baseline
  if (bounds?.maxPrice !== undefined || bounds?.minPrice !== undefined) {
    score += 50;
    if (bounds.maxPrice) highlights.push(`Under ₹${bounds.maxPrice.toLocaleString("en-IN")}`);
    if (bounds.minPrice) highlights.push(`Above ₹${bounds.minPrice.toLocaleString("en-IN")}`);
  }
  // 1. Exact match on full query
  if (normQuery && normTitle === normQuery) {
    score += 150;
    highlights.push("Exact title match");
  } else if (normQuery && normTitle.startsWith(normQuery)) {
    score += 90;
    highlights.push("Title begins with query");
  } else if (normQuery && normTitle.includes(normQuery)) {
    score += 65;
    highlights.push("Title contains query");
  }
  if (normQuery && normBrand.includes(normQuery)) {
    score += 55;
    highlights.push(`Brand: ${p.brand}`);
  }
  // 2. Token-level matching
  let matchedTokens = 0;
  for (const token of tokens) {
    let tokenMatched = false;
    // Check title
    if (matchTokenInField(token, normTitle)) {
      score += 30;
      tokenMatched = true;
    }
    // Check brand
    if (matchTokenInField(token, normBrand)) {
      score += 20;
      tokenMatched = true;
      if (!highlights.includes(`Brand: ${p.brand}`)) highlights.push(`Brand: ${p.brand}`);
    }
    // Check subcategory / category
    if (matchTokenInField(token, normSub) || matchTokenInField(token, normCategory)) {
      score += 25;
      tokenMatched = true;
      if (p.subcategory && !highlights.includes(p.subcategory)) highlights.push(p.subcategory);
    }
    // Check fabric
    if (matchTokenInField(token, normFabric)) {
      score += 20;
      tokenMatched = true;
      if (p.fabric && !highlights.includes(`Fabric: ${p.fabric}`))
        highlights.push(`Fabric: ${p.fabric}`);
    }
    // Check occasion
    if (matchTokenInField(token, normOccasion)) {
      score += 20;
      tokenMatched = true;
      if (p.occasion && !highlights.includes(`Occasion: ${p.occasion}`))
        highlights.push(`Occasion: ${p.occasion}`);
    }
    // Check color
    if (matchTokenInField(token, normColor)) {
      score += 18;
      tokenMatched = true;
      if (p.color && !highlights.includes(`Color: ${p.color}`))
        highlights.push(`Color: ${p.color}`);
    }
    // Check tag
    if (matchTokenInField(token, normTag)) {
      score += 15;
      tokenMatched = true;
      if (p.tag && !highlights.includes(p.tag)) highlights.push(p.tag);
    }
    if (tokenMatched) {
      matchedTokens++;
    }
  }
  // If multi-token query, bonus for matching all tokens
  if (tokens.length > 1 && matchedTokens === tokens.length) {
    score += 40;
  }
  // Minimum qualification: if multi-word with no price bound, at least 1 token must match
  if (tokens.length > 0 && matchedTokens === 0 && !bounds?.maxPrice && !bounds?.minPrice) {
    score = 0;
  }
  // Minor tie-breaker: rating and reviews
  if (score > 0) {
    score += (p.rating || 4.0) * 2;
  }
  return { score, highlights };
}
/** Search matching categories, subcategories, occasions, and fabrics */
function searchCategoriesAndFacets(query, tokens, dynamicCategories = null) {
  const normQuery = normalizeText(query);
  const results = [];
  const seen = new Set();
  const categoryPool = Array.isArray(dynamicCategories) && dynamicCategories.length > 0
    ? dynamicCategories
    : CATEGORIES;

  // 1. Search parent categories and subcategories in live dynamic categories
  for (const cat of categoryPool) {
    // Check parent category FIRST so primary category takes top priority
    const normCat = normalizeText(cat.name);
    const catSubs = Array.isArray(cat.subs)
      ? cat.subs
      : Array.isArray(cat.subcategories)
        ? cat.subcategories
        : [];
    if (
      (normCat.includes(normQuery) || tokens.some((t) => matchTokenInField(t, normCat))) &&
      !seen.has(cat.name)
    ) {
      seen.add(cat.name);
      results.push({
        type: "category",
        title: cat.name,
        subtitle: `${catSubs.length} subcategories`,
        image: cat.image,
        to: getCategoryUrl(cat.name),
      });
    }
    // Then check subcategories
    for (const sub of catSubs) {
      const normSub = normalizeText(sub);
      const isMatch =
        normSub.includes(normQuery) || tokens.some((t) => matchTokenInField(t, normSub));
      if (isMatch && !seen.has(sub)) {
        seen.add(sub);
        const matchingProd = PRODUCTS.find(
          (p) => p.subcategory?.toLowerCase() === sub.toLowerCase(),
        );
        const subImage = matchingProd?.image || cat.image;
        results.push({
          type: "subcategory",
          title: sub,
          subtitle: `in ${cat.name}`,
          image: subImage,
          to: "/listing",
          searchParam: { category: cat.name, subcategory: sub },
        });
      }
    }
  }
  // 2. Search Occasions
  for (const occ of OCCASIONS) {
    const normOcc = normalizeText(occ.name);
    if (
      (normOcc.includes(normQuery) || tokens.some((t) => matchTokenInField(t, normOcc))) &&
      !seen.has(occ.name)
    ) {
      seen.add(occ.name);
      results.push({
        type: "occasion",
        title: occ.name,
        subtitle: "Curated Collection",
        image: occ.image,
        to: "/listing",
        searchParam: { occasion: occ.name },
      });
    }
  }
  // 3. Search Fabrics
  for (const fab of FABRICS) {
    const normFab = normalizeText(fab.name);
    if (
      (normFab.includes(normQuery) || tokens.some((t) => matchTokenInField(t, normFab))) &&
      !seen.has(fab.name)
    ) {
      seen.add(fab.name);
      results.push({
        type: "fabric",
        title: `Pure ${fab.name}`,
        subtitle: "Fabric Collection",
        image: fab.image,
        to: "/listing",
        searchParam: { fabric: fab.name },
      });
    }
  }
  // 4. Search Brands
  for (const brand of BRANDS) {
    const normBrand = normalizeText(brand);
    if (
      (normBrand.includes(normQuery) || tokens.some((t) => matchTokenInField(t, normBrand))) &&
      !seen.has(brand)
    ) {
      seen.add(brand);
      results.push({
        type: "brand",
        title: brand,
        subtitle: "Designer House",
        to: "/listing",
        searchParam: { designer: brand },
      });
    }
  }
  return results.slice(0, 6);
}
/** Fallback suggestions for zero results */
export const POPULAR_SEARCH_SUGGESTIONS = [
  "Bridal blouse",
  "Zardozi blouse",
  "Wedding lehenga",
  "Salwar suit",
  "Night suits",
  "Velvet blouse",
  "Gold jhumkas",
];
/**
 * Main global search function with support for dynamic live products and categories
 */
export function searchCatalog(query, limit = 8, sourceProducts = null, dynamicCategories = null) {
  const normQuery = normalizeText(query);
  if (!normQuery) {
    return {
      query: "",
      products: [],
      categories: [],
      totalCount: 0,
      suggestions: POPULAR_SEARCH_SUGGESTIONS,
    };
  }
  const { maxPrice, minPrice, cleanQuery } = extractPriceBounds(normQuery);
  const searchTarget = cleanQuery || normQuery;
  const tokens = tokenizeQuery(searchTarget);

  const productPool = Array.isArray(sourceProducts) && sourceProducts.length > 0
    ? sourceProducts.filter((p) => !p.isArchived && !p.is_archived && (!p.status || p.status === "active"))
    : ALL_CATALOG_PRODUCTS;

  // Score all products
  const scoredItems = [];
  for (const p of productPool) {
    const { score, highlights } = scoreProduct(p, searchTarget, tokens, { maxPrice, minPrice });
    if (score > 0) {
      scoredItems.push({ product: p, score, matchHighlights: highlights });
    }
  }
  // Sort descending by score
  scoredItems.sort((a, b) => b.score - a.score);
  // Search matching categories and facets
  const matchingCategories = searchCategoriesAndFacets(searchTarget, tokens, dynamicCategories);
  return {
    query,
    products: scoredItems.slice(0, limit),
    categories: matchingCategories,
    totalCount: scoredItems.length,
    suggestions: scoredItems.length === 0 ? POPULAR_SEARCH_SUGGESTIONS : undefined,
  };
}
