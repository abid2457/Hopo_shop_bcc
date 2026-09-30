/**
 * HOPO SHOP INDIA — Centralized Business Configuration & Rules
 * Single source of truth for business data, operational rules, policies, and calculations.
 */
export const BUSINESS_CONFIG = {
  brandName: "HOPO SHOP INDIA",
  legalEntity: "Hopo Shop Luxury Private Limited",
  tagline: "Haute Couture & Heritage Indian Fashion",
  gstin: "27AABCH1234F1Z5",
  contact: {
    email: "hoposhoponline@gmail.com",
    supportHours: "Monday – Saturday, 10:00 AM – 7:00 PM IST",
    headquarters: "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
  },
  social: {
    instagram: "https://www.instagram.com/hoposhoponline/",
  },
  ecommerce: {
    freeShippingThreshold: 1999, // ₹1,999 for free Pan-India delivery
    standardShippingFee: 149,
    expressShippingFee: 299,
    gstRatePercentage: 5, // 5% GST for Indian ethnic apparel below ₹10k
    returnWindowDays: 7, // 7-day hassle-free returns
    refundProcessingDays: "3 to 5 business days",
    codLimitMax: 15000, // Cash on delivery up to ₹15,000
    loyaltyRewardRate: 0.05, // 5% cashback as Hopo Coins
  },
};
/**
 * Validates and checks serviceability for 6-digit Indian PIN codes.
 */
export function checkPincodeServiceability(pincode) {
  const clean = pincode.trim();
  if (!/^\d{6}$/.test(clean)) {
    return {
      isValid: false,
      isServiceable: false,
      isCodAvailable: false,
      estimatedDays: 0,
      message: "Please enter a valid 6-digit Indian postal PIN code.",
    };
  }
  // Major Indian Pin Code prefixes
  const prefix = parseInt(clean.substring(0, 2), 10);
  // Non-serviceable remote test ranges
  if (clean.startsWith("00") || clean === "999999" || clean === "111111") {
    return {
      isValid: true,
      isServiceable: false,
      isCodAvailable: false,
      estimatedDays: 0,
      message: `Pincode ${clean} is currently not serviceable for express courier delivery.`,
    };
  }
  let city = "Metro Region";
  let state = "India";
  let days = 3;
  if (prefix >= 11 && prefix <= 13) {
    city = "Delhi NCR";
    state = "Delhi";
    days = 2;
  } else if (prefix >= 14 && prefix <= 16) {
    city = "Chandigarh / Punjab";
    state = "Punjab";
    days = 3;
  } else if (prefix >= 17 && prefix <= 19) {
    city = "Shimla / HP";
    state = "Himachal Pradesh";
    days = 4;
  } else if (prefix >= 20 && prefix <= 28) {
    city = "Varanasi / Lucknow";
    state = "Uttar Pradesh";
    days = 3;
  } else if (prefix >= 30 && prefix <= 34) {
    city = "Jaipur / Udaipur";
    state = "Rajasthan";
    days = 2;
  } else if (prefix >= 36 && prefix <= 39) {
    city = "Ahmedabad / Surat";
    state = "Gujarat";
    days = 2;
  } else if (prefix >= 40 && prefix <= 44) {
    city = "Mumbai / Pune";
    state = "Maharashtra";
    days = 2;
  } else if (prefix >= 45 && prefix <= 49) {
    city = "Indore / Bhopal";
    state = "Madhya Pradesh";
    days = 3;
  } else if (prefix >= 50 && prefix <= 53) {
    city = "Hyderabad";
    state = "Telangana";
    days = 2;
  } else if (prefix >= 56 && prefix <= 59) {
    city = "Bengaluru";
    state = "Karnataka";
    days = 2;
  } else if (prefix >= 60 && prefix <= 64) {
    city = "Chennai / Coimbatore";
    state = "Tamil Nadu";
    days = 2;
  } else if (prefix >= 67 && prefix <= 69) {
    city = "Kochi / Trivandrum";
    state = "Kerala";
    days = 3;
  } else if (prefix >= 70 && prefix <= 74) {
    city = "Kolkata";
    state = "West Bengal";
    days = 3;
  } else {
    city = "India Region";
    state = "India";
    days = 4;
  }
  return {
    isValid: true,
    isServiceable: true,
    isCodAvailable: true,
    city,
    state,
    estimatedDays: days,
    message: `Available for Express Delivery to ${city}, ${state} in ${days}-${days + 1} business days. Cash on Delivery available.`,
  };
}
/**
 * Formats a numeric price to Indian Rupee (INR) format e.g. ₹8,499
 * Uses the standard Unicode Indian Rupee Sign (U+20B9) with Indian numbering grouping.
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined || amount === "") {
    return "₹0";
  }
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) {
    return "₹0";
  }
  return `₹${Math.round(numeric).toLocaleString("en-IN")}`;
}

/**
 * Formats a monetary amount with 2 decimal places e.g. ₹7,201.69
 */
export function formatINRWithDecimals(amount) {
  if (amount === null || amount === undefined || amount === "") {
    return "₹0.00";
  }
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) {
    return "₹0.00";
  }
  return `₹${numeric.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
/**
 * Generates an estimated delivery date range based on days offset
 */
export function getEstimatedDeliveryDate(daysOffset = 3) {
  const now = new Date();
  now.setDate(now.getDate() + daysOffset);
  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  return {
    formattedDate: now.toLocaleDateString("en-IN", options),
    dayName: now.toLocaleDateString("en-IN", { weekday: "long" }),
  };
}
