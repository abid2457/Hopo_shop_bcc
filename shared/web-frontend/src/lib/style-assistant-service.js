/**
 * HOPO SHOP — Real-Time AI Shopping Agent & Style Concierge Service
 *
 * Single Source of Truth intelligent shopping assistant that:
 * 1. Parses natural language intent, category, occasion, color, fabric, style, budget, and size.
 * 2. Maintains multi-turn conversation memory and contextual refinements.
 * 3. Queries the ACTUAL HOPO SHOP catalog (PRODUCTS + COMPLETE_THE_LOOK) deterministically.
 * 4. Strictly enforces category, color, budget, and occasion relevance (NO "show everything").
 * 5. Handles smart near-matches with clear explanations when exact matches don't exist.
 * 6. Generates bespoke luxury fashion styling commentary and dynamic follow-up chips.
 */
import { PRODUCTS, COMPLETE_THE_LOOK } from "./hopo-data";
import { getProductVariants } from "./variant-service";
import { formatINR } from "./business-config";
// Master list of all authentic products
export const ALL_PRODUCTS = [...PRODUCTS, ...COMPLETE_THE_LOOK];
// Canonical categories
export const CANONICAL_CATEGORIES = [
  "Bridal Blouses",
  "Wedding Blouses",
  "Night Suits",
  "Lehengas",
  "Salwar Suits",
  "Indo-Western",
  "Festive Wear",
];
// --- NATURAL LANGUAGE INTENT EXTRACTION HELPERS ---
/** Parse number that may have 'k' suffix, e.g. "10k" -> 10000, "15,000" -> 15000 */
function parsePriceValue(valStr) {
  if (!valStr) return null;
  const clean = valStr.trim().toLowerCase().replace(/,/g, "");
  if (clean.endsWith("k")) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? null : Math.round(num * 1000);
  }
  const num = parseFloat(clean);
  return isNaN(num) ? null : Math.round(num);
}
/** Extract budget bounds from text */
export function extractBudget(text) {
  const lower = text.toLowerCase();
  let minPrice;
  let maxPrice;
  let sortIntent;
  // Comparative sort intent
  if (
    lower.includes("cheapest") ||
    lower.includes("lowest price") ||
    lower.includes("budget friendly") ||
    lower.includes("cheaper")
  ) {
    sortIntent = "price_asc";
  } else if (
    lower.includes("most expensive") ||
    lower.includes("highest price") ||
    lower.includes("luxury") ||
    lower.includes("costliest")
  ) {
    sortIntent = "price_desc";
  }
  // "between 10000 and 20000" or "from 5k to 15k"
  const rangeMatch = lower.match(
    /(?:between|from)\s*(?:₹|rs\.?|inr)?\s*([\d,]+k?)\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*([\d,]+k?)/i,
  );
  if (rangeMatch) {
    const p1 = parsePriceValue(rangeMatch[1]);
    const p2 = parsePriceValue(rangeMatch[2]);
    if (p1 !== null && p2 !== null) {
      minPrice = Math.min(p1, p2);
      maxPrice = Math.max(p1, p2);
      return { minPrice, maxPrice, sortIntent };
    }
  }
  // "around 8000" or "approx 10k"
  const aroundMatch = lower.match(
    /(?:around|approx(?:imately)?|about|near)\s*(?:₹|rs\.?|inr)?\s*([\d,]+k?)/i,
  );
  if (aroundMatch) {
    const base = parsePriceValue(aroundMatch[1]);
    if (base !== null) {
      minPrice = Math.max(0, Math.round(base * 0.75));
      maxPrice = Math.round(base * 1.25);
      return { minPrice, maxPrice, sortIntent };
    }
  }
  // "under 10000", "below 15k", "less than 8000", "within 20k", "max 10000"
  const underMatch = lower.match(
    /(?:under|below|less than|within|up to|max(?:imum)?)\s*(?:₹|rs\.?|inr)?\s*([\d,]+k?)/i,
  );
  if (underMatch) {
    const p = parsePriceValue(underMatch[1]);
    if (p !== null) {
      maxPrice = p;
      return { minPrice, maxPrice, sortIntent };
    }
  }
  // "above 15000", "more than 10k", "over 8000", "min 5000"
  const overMatch = lower.match(
    /(?:above|over|more than|greater than|min(?:imum)?)\s*(?:₹|rs\.?|inr)?\s*([\d,]+k?)/i,
  );
  if (overMatch) {
    const p = parsePriceValue(overMatch[1]);
    if (p !== null) {
      minPrice = p;
      return { minPrice, maxPrice, sortIntent };
    }
  }
  // Raw number with ₹ or rs: "₹10,000" or "rs 8000"
  const rawPriceMatch = lower.match(/(?:₹|rs\.?|inr)\s*([\d,]+k?)/i);
  if (rawPriceMatch && !underMatch && !overMatch && !aroundMatch && !rangeMatch) {
    const p = parsePriceValue(rawPriceMatch[1]);
    if (p !== null) {
      // Default to upper bound if single price specified with currency
      maxPrice = p;
    }
  }
  return { minPrice, maxPrice, sortIntent };
}
/** Extract category from text */
export function extractCategory(text) {
  const lower = text.toLowerCase();
  // 1. Bridal Blouses vs Wedding Blouses vs general Blouse
  if (
    lower.includes("bridal blouse") ||
    lower.includes("bridal choli") ||
    lower.includes("zardozi blouse") ||
    lower.includes("bridal atelier")
  ) {
    return "Bridal Blouses";
  }
  if (
    lower.includes("wedding blouse") ||
    lower.includes("reception blouse") ||
    lower.includes("brocade blouse") ||
    lower.includes("velvet blouse")
  ) {
    return "Wedding Blouses";
  }
  if (lower.includes("blouse") || lower.includes("choli")) {
    if (lower.includes("bridal") || lower.includes("bride") || lower.includes("dulhan")) {
      return "Bridal Blouses";
    }
    return "Bridal Blouses";
  }
  // 2. Night Suits
  if (
    lower.includes("night suit") ||
    lower.includes("nightsuit") ||
    lower.includes("pajama") ||
    lower.includes("pyjama") ||
    lower.includes("sleepwear") ||
    lower.includes("lounge")
  ) {
    return "Night Suits";
  }
  // 3. Lehengas
  if (lower.includes("lehenga") || lower.includes("ghagra") || lower.includes("chaniya choli")) {
    return "Lehengas";
  }
  // 4. Salwar Suits
  if (
    lower.includes("salwar") ||
    lower.includes("suit") ||
    lower.includes("patiala") ||
    lower.includes("palazzo") ||
    lower.includes("kameez")
  ) {
    return "Salwar Suits";
  }
  // 5. Indo-Western
  if (
    lower.includes("indo-western") ||
    lower.includes("indo western") ||
    lower.includes("fusion") ||
    lower.includes("peplum") ||
    lower.includes("jacket set") ||
    lower.includes("crop jacket")
  ) {
    return "Indo-Western";
  }
  // 6. Festive Wear
  if (
    lower.includes("festive") ||
    lower.includes("diwali") ||
    lower.includes("kurta set") ||
    lower.includes("celebration wear") ||
    lower.includes("festive ensemble")
  ) {
    return "Festive Wear";
  }
  // 7. Jewellery / Accessories
  if (
    lower.includes("jewel") ||
    lower.includes("jhumka") ||
    lower.includes("earring") ||
    lower.includes("necklace") ||
    lower.includes("potli") ||
    lower.includes("jutti")
  ) {
    return "Accessories";
  }
  return undefined;
}
/** Extract color from text */
export function extractColor(text) {
  const lower = text.toLowerCase();
  // Known catalog colors and synonyms
  if (lower.includes("crimson") || lower.includes("ruby red")) return "Crimson Red";
  if (lower.includes("maroon") || lower.includes("wine") || lower.includes("burgundy"))
    return "Maroon";
  if (lower.includes("red")) return "Red";
  if (lower.includes("emerald") || lower.includes("dark green")) return "Emerald Green";
  if (lower.includes("green")) return "Green";
  if (lower.includes("teal") || lower.includes("peacock")) return "Peacock Teal";
  if (lower.includes("plum") || lower.includes("purple") || lower.includes("violet"))
    return "Royal Plum & Gold";
  if (lower.includes("rose") || lower.includes("pink") || lower.includes("rani"))
    return "Ruby Pink";
  if (lower.includes("rust") || lower.includes("terracotta") || lower.includes("orange"))
    return "Rust Gold";
  if (
    lower.includes("gold") ||
    lower.includes("golden") ||
    lower.includes("zari") ||
    lower.includes("yellow") ||
    lower.includes("mustard")
  )
    return "Gold";
  if (lower.includes("ivory") || lower.includes("cream") || lower.includes("white"))
    return "Ivory Cream";
  if (lower.includes("black") || lower.includes("midnight")) return "Midnight Black";
  if (lower.includes("copper")) return "Metallic Copper";
  if (lower.includes("turquoise") || lower.includes("pastel blue") || lower.includes("pastel"))
    return "Pastel Turquoise";
  if (lower.includes("beige") || lower.includes("nude")) return "Beige";
  return undefined;
}
/** Extract occasion from text */
export function extractOccasion(text) {
  const lower = text.toLowerCase();
  if (lower.includes("wedding") || lower.includes("shaadi") || lower.includes("marriage"))
    return "Wedding";
  if (lower.includes("bridal") || lower.includes("bride") || lower.includes("dulhan"))
    return "Wedding";
  if (lower.includes("reception") || lower.includes("cocktail")) return "Reception";
  if (lower.includes("sangeet")) return "Sangeet";
  if (lower.includes("mehendi") || lower.includes("mehndi")) return "Mehendi";
  if (lower.includes("haldi")) return "Haldi";
  if (
    lower.includes("festive") ||
    lower.includes("diwali") ||
    lower.includes("puja") ||
    lower.includes("eid")
  )
    return "Festive Wear";
  if (lower.includes("party")) return "Party Wear";
  return undefined;
}
/** Extract fabric from text */
export function extractFabric(text) {
  const lower = text.toLowerCase();
  if (lower.includes("raw silk")) return "Raw Silk";
  if (lower.includes("banarasi") || lower.includes("brocade")) return "Banarasi Brocade";
  if (lower.includes("velvet") || lower.includes("micro velvet")) return "Royal Velvet";
  if (lower.includes("chanderi")) return "Chanderi Silk";
  if (lower.includes("organza") || lower.includes("sheer")) return "Organza Sheer";
  if (lower.includes("georgette")) return "Georgette";
  if (lower.includes("tissue")) return "Tissue Silk";
  if (lower.includes("linen") || lower.includes("khadi")) return "Linen";
  if (lower.includes("silk") || lower.includes("pure silk") || lower.includes("katan"))
    return "Pure Silk";
  return undefined;
}
/** Extract brand/designer from text */
export function extractBrand(text) {
  const lower = text.toLowerCase();
  if (lower.includes("sabyasachi")) return "Sabyasachi";
  if (lower.includes("tarun") || lower.includes("tahiliani")) return "Tarun Tahiliani";
  if (lower.includes("raw mango") || lower.includes("mango")) return "Raw Mango";
  if (lower.includes("anita dongre") || lower.includes("dongre")) return "Anita Dongre";
  if (lower.includes("manish") || lower.includes("malhotra")) return "Manish Malhotra";
  if (lower.includes("ritu kumar")) return "Ritu Kumar";
  if (lower.includes("torani")) return "Torani";
  return undefined;
}
/** Extract size from text */
export function extractSize(text) {
  const upper = text.toUpperCase();
  const tokens = upper.split(/\s+/);
  const validSizes = ["XS", "S", "M", "L", "XL", "XXL"];
  for (const s of validSizes) {
    if (tokens.includes(s) || upper.includes(`SIZE ${s}`) || upper.includes(`IN ${s}`)) {
      return s;
    }
  }
  return undefined;
}
// --- CONVERSATION CONTEXT PARSER ---
/** Merges incoming query attributes into existing conversation context */
export function updateContextWithQuery(prevContext, query) {
  const lower = query.toLowerCase();
  const next = { ...prevContext };
  // 1. Check for resets / broad restarts
  if (lower.includes("start over") || lower.includes("reset") || lower.includes("clear")) {
    return {};
  }
  // 2. Check for pagination: "show more", "next", "more options"
  if (
    lower.includes("show more") ||
    lower.includes("more options") ||
    lower.includes("see more") ||
    lower.includes("next")
  ) {
    next.page = (prevContext.page || 1) + 1;
    return next;
  } else {
    next.page = 1;
  }
  // 3. Extract Category
  const cat = extractCategory(query);
  if (cat) {
    next.category = cat;
  }
  // 4. Extract Color
  if (lower.includes("any color") || lower.includes("different color")) {
    delete next.color;
  } else {
    const col = extractColor(query);
    if (col) next.color = col;
  }
  // 5. Extract Occasion
  const occ = extractOccasion(query);
  if (occ) next.occasion = occ;
  // 6. Extract Fabric
  if (lower.includes("remove velvet") || lower.includes("no velvet")) {
    if (next.fabric?.toLowerCase().includes("velvet")) delete next.fabric;
  } else {
    const fab = extractFabric(query);
    if (fab) next.fabric = fab;
  }
  // 7. Extract Budget
  const budget = extractBudget(query);
  if (budget.maxPrice !== undefined) next.maxPrice = budget.maxPrice;
  if (budget.minPrice !== undefined) next.minPrice = budget.minPrice;
  if (budget.sortIntent) next.sortBy = budget.sortIntent;
  if (lower.includes("cheaper") && !budget.maxPrice) {
    if (next.maxPrice) {
      next.maxPrice = Math.round(next.maxPrice * 0.8);
    }
    next.sortBy = "price_asc";
  }
  if ((lower.includes("more expensive") || lower.includes("luxury")) && !budget.minPrice) {
    next.sortBy = "price_desc";
  }
  // 8. Extract Brand
  const brand = extractBrand(query);
  if (brand) next.preferredBrand = brand;
  // 9. Extract Size
  const size = extractSize(query);
  if (size) next.size = size;
  return next;
}
// --- CATALOG SEARCH & RELEVANCE FILTERING ---
/** Checks if a product matches a target color (including its authentic variants) */
function productMatchesColor(product, targetColor) {
  const normTarget = targetColor.toLowerCase();
  // 1. Direct product color
  const pColor = (product.color || "").toLowerCase();
  if (pColor.includes(normTarget) || normTarget.includes(pColor)) return true;
  // 2. Product title
  const pTitle = product.title.toLowerCase();
  if (pTitle.includes(normTarget)) return true;
  // 3. Variant colors
  const variants = getProductVariants(product);
  for (const v of variants) {
    const vColor = v.colorName.toLowerCase();
    if (vColor.includes(normTarget) || normTarget.includes(vColor)) return true;
  }
  // Color aliases
  if (
    normTarget === "red" &&
    (pColor.includes("crimson") || pColor.includes("maroon") || pColor.includes("ruby"))
  )
    return true;
  if (normTarget === "green" && pColor.includes("emerald")) return true;
  if (normTarget === "gold" && (pColor.includes("zari") || pColor.includes("rust"))) return true;
  if (normTarget === "pink" && pColor.includes("rose")) return true;
  if (normTarget === "purple" && pColor.includes("plum")) return true;
  if (normTarget === "teal" && pColor.includes("peacock")) return true;
  return false;
}
/** Checks if a product matches a target fabric */
function productMatchesFabric(product, targetFabric) {
  const normTarget = targetFabric.toLowerCase();
  const pFabric = (product.fabric || "").toLowerCase();
  const pTitle = product.title.toLowerCase();
  if (pFabric.includes(normTarget) || pTitle.includes(normTarget)) return true;
  if (
    normTarget.includes("silk") &&
    (pFabric.includes("silk") ||
      pFabric.includes("katan") ||
      pFabric.includes("chanderi") ||
      pFabric.includes("brocade"))
  )
    return true;
  if (normTarget.includes("velvet") && pFabric.includes("velvet")) return true;
  if (
    normTarget.includes("brocade") &&
    (pFabric.includes("brocade") || pFabric.includes("banarasi"))
  )
    return true;
  return false;
}
/** Checks if a product matches a target occasion */
function productMatchesOccasion(product, targetOccasion) {
  const normTarget = targetOccasion.toLowerCase();
  const pOccasion = (product.occasion || "").toLowerCase();
  const pTitle = product.title.toLowerCase();
  const pTag = (product.tag || "").toLowerCase();
  if (pOccasion.includes(normTarget) || pTitle.includes(normTarget) || pTag.includes(normTarget))
    return true;
  if (
    normTarget.includes("wedding") &&
    (pOccasion.includes("wedding") || pTitle.includes("bridal") || pTag.includes("bridal"))
  )
    return true;
  if (
    normTarget.includes("reception") &&
    (pOccasion.includes("reception") || pTitle.includes("velvet"))
  )
    return true;
  if (
    normTarget.includes("festive") &&
    (product.category === "Festive Wear" || pOccasion.includes("festive"))
  )
    return true;
  return false;
}
/** Performs strict relevance search against real catalog */
export function queryCatalog(context, customPool = null) {
  let pool = Array.isArray(customPool) && customPool.length > 0 ? customPool : ALL_PRODUCTS;
  // 1. Strict Category Filter
  if (context.category) {
    const targetCat = context.category.toLowerCase();
    pool = pool.filter((p) => {
      const pCat = (p.category || "").toLowerCase();
      if (targetCat === "accessories") {
        return (
          pCat === "jewellery" || pCat === "accessories" || pCat === "footwear" || pCat === "bags"
        );
      }
      return pCat === targetCat || pCat.includes(targetCat) || targetCat.includes(pCat);
    });
  }
  // 2. Strict Color Filter
  let colorFiltered = pool;
  if (context.color) {
    colorFiltered = pool.filter((p) => productMatchesColor(p, context.color));
  }
  // 3. Strict Fabric Filter
  let fabricFiltered = colorFiltered;
  if (context.fabric) {
    fabricFiltered = colorFiltered.filter((p) => productMatchesFabric(p, context.fabric));
  }
  // 4. Strict Occasion Filter
  let occasionFiltered = fabricFiltered;
  if (context.occasion) {
    occasionFiltered = fabricFiltered.filter((p) => productMatchesOccasion(p, context.occasion));
  }
  // 5. Strict Brand Filter
  let brandFiltered = occasionFiltered;
  if (context.preferredBrand) {
    const targetBrand = context.preferredBrand.toLowerCase();
    brandFiltered = occasionFiltered.filter((p) => p.brand.toLowerCase().includes(targetBrand));
  }
  // 6. Strict Price Bounds
  let budgetFiltered = brandFiltered;
  if (context.maxPrice !== undefined) {
    budgetFiltered = budgetFiltered.filter((p) => p.price <= context.maxPrice);
  }
  if (context.minPrice !== undefined) {
    budgetFiltered = budgetFiltered.filter((p) => p.price >= context.minPrice);
  }
  // 7. Sort Order
  let sorted = [...budgetFiltered];
  if (context.sortBy === "price_asc") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (context.sortBy === "price_desc") {
    sorted.sort((a, b) => b.price - a.price);
  } else if (context.sortBy === "rating") {
    sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else {
    sorted.sort(
      (a, b) =>
        (b.rating || 4.5) * 100 +
        (b.reviews || 0) * 0.1 -
        ((a.rating || 4.5) * 100 + (a.reviews || 0) * 0.1),
    );
  }
  // If exact matches exist, return them!
  if (sorted.length > 0) {
    const criteriaParts = [];
    if (context.category) criteriaParts.push(context.category);
    if (context.color) criteriaParts.push(`in ${context.color}`);
    if (context.fabric) criteriaParts.push(`crafted in ${context.fabric}`);
    if (context.occasion) criteriaParts.push(`for your ${context.occasion}`);
    if (context.maxPrice) criteriaParts.push(`under ${formatINR(context.maxPrice)}`);
    const criteriaStr = criteriaParts.join(" ") || "luxury ensembles";
    return {
      exactMatches: sorted,
      nearMatches: [],
      isNearMatch: false,
      explanation: `I curated ${sorted.length} authentic ${criteriaStr} from the HOPO SHOP collection:`,
    };
  }
  // If no exact matches exist, construct intelligent, transparent NEAR-MATCHES
  let nearMatches = [];
  let explanation = "";
  if (context.category && context.maxPrice !== undefined && brandFiltered.length > 0) {
    const closestByPrice = [...brandFiltered].sort((a, b) => a.price - b.price);
    nearMatches = closestByPrice.slice(0, 4);
    const lowestPrice = nearMatches[0]?.price || 0;
    explanation = `I couldn't find an exact ${context.color || ""} ${context.category} under ${formatINR(context.maxPrice)}. In our handcrafted couture collection, authentic pieces start from ${formatINR(lowestPrice)}. Here are the closest options:`;
  } else if (context.category && context.color && pool.length > 0) {
    nearMatches = pool.slice(0, 4);
    explanation = `While we don't currently have ${context.category} in ${context.color}, here are the signature handcrafted shades available in ${context.category}:`;
  } else if (context.category) {
    nearMatches = pool.slice(0, 4);
    explanation = `Here are our most celebrated heirloom pieces in ${context.category}:`;
  } else {
    nearMatches = ALL_PRODUCTS.slice(0, 4);
    explanation = `I couldn't find an exact match for your specific criteria. Here are signature bestselling pieces from the atelier:`;
  }
  return {
    exactMatches: [],
    nearMatches,
    isNearMatch: true,
    explanation,
  };
}
// --- CONVERSATION RESPONSE GENERATOR ---
/** Formulates dynamic follow-up suggestion chips based on the current context */
function generateFollowUpChips(context, resultCount) {
  const chips = [];
  if (!context.category) {
    return [
      "Red bridal blouse under ₹10,000",
      "Satin night suit set",
      "Royal velvet reception blouse",
      "Heritage Lehengas",
      "Festive outfits under ₹15,000",
    ];
  }
  if (!context.color) {
    chips.push("Show in Crimson Red", "Show in Royal Maroon", "Show in Emerald Green");
  }
  if (!context.maxPrice) {
    chips.push("Under ₹8,000", "Under ₹15,000", "Show luxury couture");
  } else {
    chips.push("Show cheaper options", "Show more traditional");
  }
  if (!context.fabric) {
    chips.push("Only in Pure Silk", "Show in Royal Velvet");
  }
  if (resultCount > 4) {
    chips.push("Show more matching styles");
  }
  if (context.category === "Bridal Blouses") {
    chips.push("View Wedding Blouses", "View Bridal Lehengas");
  } else if (context.category === "Night Suits") {
    chips.push("Explore Satin Night Suits", "View Cotton Nightwear");
  }
  return chips.slice(0, 5);
}
/**
 * Main AI Shopping Agent Handler
 * Takes a user message and existing conversation context,
 * runs NLP parsing, catalog querying, and generates natural stylist responses.
 */
export async function processStylistMessage(userMessage, prevContext = {}, customPool = null) {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const trimmed = userMessage.trim();
  const lower = trimmed.toLowerCase();
  // 1. Handle Greetings / Broad Intro
  if (
    trimmed === "" ||
    lower === "hi" ||
    lower === "hello" ||
    lower === "namaste" ||
    lower === "hey"
  ) {
    return {
      message:
        "Namaste! I am your HOPO Couture AI Stylist. Tell me your upcoming celebration, preferred silhouette (Bridal Blouses, Wedding Blouses, Night Suits, Lehengas, Salwar Suits, or Indo-Western), color, or budget, and I'll curate pieces from our handcrafted collection.",
      products: [],
      totalMatches: 0,
      isNearMatch: false,
      isClarificationNeeded: true,
      followUpSuggestions: [
        "Red bridal blouse under ₹10,000",
        "Satin night suit set",
        "Royal velvet reception blouse",
        "Festive outfits under ₹15,000",
      ],
      updatedContext: prevContext,
    };
  }
  // 2. Parse and update context
  const updatedContext = updateContextWithQuery(prevContext, trimmed);
  // 3. Handle vague queries that need clarification rather than showing everything
  if (
    !updatedContext.category &&
    !updatedContext.color &&
    !updatedContext.fabric &&
    !updatedContext.occasion &&
    updatedContext.maxPrice !== undefined
  ) {
    return {
      message: `Absolutely! We have exquisite handcrafted ensembles within your ${formatINR(updatedContext.maxPrice)} budget. Which silhouette do you have in mind?`,
      products: [],
      totalMatches: 0,
      isNearMatch: false,
      isClarificationNeeded: true,
      followUpSuggestions: [
        `Bridal Blouses under ${formatINR(updatedContext.maxPrice)}`,
        `Night Suits under ${formatINR(updatedContext.maxPrice)}`,
        `Salwar Suits under ${formatINR(updatedContext.maxPrice)}`,
        `Festive Wear under ${formatINR(updatedContext.maxPrice)}`,
      ],
      updatedContext,
    };
  }
  // 4. Query Catalog deterministically
  const queryResult = queryCatalog(updatedContext, customPool);
  const pageSize = 4;
  const page = updatedContext.page || 1;
  const sourceList =
    queryResult.exactMatches.length > 0 ? queryResult.exactMatches : queryResult.nearMatches;
  const paginatedProducts = sourceList.slice(0, page * pageSize);
  const followUpSuggestions = generateFollowUpChips(updatedContext, sourceList.length);
  return {
    message: queryResult.explanation,
    products: paginatedProducts,
    totalMatches: sourceList.length,
    isNearMatch: queryResult.isNearMatch,
    nearMatchExplanation: queryResult.isNearMatch ? queryResult.explanation : undefined,
    isClarificationNeeded: false,
    followUpSuggestions,
    updatedContext,
  };
}
