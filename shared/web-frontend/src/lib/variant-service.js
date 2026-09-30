/**
 * HOPO SHOP — Product Variant & Inventory Service
 *
 * Single Source of Truth for product variants, authentic color swatches,
 * size-level live inventory, and dynamic price calculations.
 */
/**
 * Standard size templates
 */
const APPAREL_SIZES = [
  { size: "XS", stock: 3 },
  { size: "S", stock: 5 },
  { size: "M", stock: 4 },
  { size: "L", stock: 2 },
  { size: "XL", stock: 1 },
  { size: "XXL", stock: 0 }, // Demonstrates out-of-stock size
];
const SAREE_SIZES = [{ size: "Free Size", stock: 6 }];
const FOOTWEAR_SIZES = [
  { size: "36", stock: 2 },
  { size: "37", stock: 4 },
  { size: "38", stock: 5 },
  { size: "39", stock: 3 },
  { size: "40", stock: 1 },
];
const ACCESSORY_SIZES = [{ size: "Free Size", stock: 8 }];
/**
 * Canonical product variants registry mapping product ID to authentic colorways and stock.
 */
export const CANONICAL_VARIANTS = {
  // --- BRIDAL BLOUSES ---
  p3: [
    {
      id: "p3-crimson",
      colorName: "Crimson Red",
      colorHex: "#8B1E3F",
      image: "/images/bridal_blouse_crimson_peacock.png",
      images: [
        "/images/bridal_blouse_crimson_peacock.png",
        "/images/bridal_blouse_emerald_back.png",
        "/images/bridal_blouse_maroon_velvet.png",
      ],
      price: 6999,
      mrp: 11999,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 5 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p3-emerald",
      colorName: "Emerald Green",
      colorHex: "#1B4D3E",
      image: "/images/bridal_blouse_emerald_back.png",
      images: [
        "/images/bridal_blouse_emerald_back.png",
        "/images/bridal_blouse_crimson_peacock.png",
        "/images/bridal_blouse_maroon_velvet.png",
      ],
      price: 6999,
      mrp: 11999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 4 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
    {
      id: "p3-maroon",
      colorName: "Royal Maroon",
      colorHex: "#58111A",
      image: "/images/bridal_blouse_maroon_velvet.png",
      images: [
        "/images/bridal_blouse_maroon_velvet.png",
        "/images/bridal_blouse_crimson_peacock.png",
        "/images/bridal_blouse_purple_banarasi.png",
      ],
      price: 6999,
      mrp: 11999,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 3 },
        { size: "M", stock: 5 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 2 },
        { size: "XXL", stock: 0 },
      ],
    },
  ],
  // --- WEDDING BLOUSES ---
  p5: [
    {
      id: "p5-crimson",
      colorName: "Crimson Red",
      colorHex: "#8B1E3F",
      image: "/images/wedding_blouse_crimson_deep_v.png",
      images: [
        "/images/wedding_blouse_crimson_deep_v.png",
        "/images/wedding_blouse_crimson_floral.png",
        "/images/wedding_blouse_pink_lattice.png",
      ],
      price: 5499,
      mrp: 8999,
      sizes: [
        { size: "XS", stock: 4 },
        { size: "S", stock: 6 },
        { size: "M", stock: 5 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p5-floral",
      colorName: "Crimson Floral",
      colorHex: "#991B1B",
      image: "/images/wedding_blouse_crimson_floral.png",
      images: [
        "/images/wedding_blouse_crimson_floral.png",
        "/images/wedding_blouse_crimson_zardozi.png",
        "/images/wedding_blouse_pink_lattice.png",
      ],
      price: 5499,
      mrp: 8999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 3 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
    {
      id: "p5-ruby",
      colorName: "Ruby Pink Lattice",
      colorHex: "#BE185D",
      image: "/images/wedding_blouse_pink_lattice.png",
      images: [
        "/images/wedding_blouse_pink_lattice.png",
        "/images/wedding_blouse_crimson_deep_v.png",
        "/images/wedding_blouse_burgundy_sheer.png",
      ],
      price: 5499,
      mrp: 8999,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 2 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
  ],
  p8: [
    {
      id: "p8-maroon",
      colorName: "Royal Maroon",
      colorHex: "#5E0F27",
      image: "/images/bridal_blouse_maroon_velvet.png",
      images: [
        "/images/bridal_blouse_maroon_velvet.png",
        "/images/bridal_blouse_crimson_peacock.png",
        "/images/bridal_blouse_purple_banarasi.png",
      ],
      price: 5999,
      mrp: 9499,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 4 },
        { size: "M", stock: 3 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p8-crimson",
      colorName: "Crimson Red",
      colorHex: "#8B1E3F",
      image: "/images/bridal_blouse_crimson_peacock.png",
      images: [
        "/images/bridal_blouse_crimson_peacock.png",
        "/images/bridal_blouse_maroon_velvet.png",
      ],
      price: 5999,
      mrp: 9499,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 5 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
    {
      id: "p8-purple",
      colorName: "Royal Purple",
      colorHex: "#4C1D95",
      image: "/images/bridal_blouse_purple_banarasi.png",
      images: [
        "/images/bridal_blouse_purple_banarasi.png",
        "/images/bridal_blouse_maroon_velvet.png",
      ],
      price: 5999,
      mrp: 9499,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 2 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
  ],
  p9: [
    {
      id: "p9-ruby",
      colorName: "Ruby Rose Pink",
      colorHex: "#BE185D",
      image: "/images/wedding_blouse_pink_lattice.png",
      images: [
        "/images/wedding_blouse_pink_lattice.png",
        "/images/wedding_blouse_crimson_deep_v.png",
        "/images/wedding_blouse_burgundy_sheer.png",
      ],
      price: 4899,
      mrp: 7999,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 4 },
        { size: "M", stock: 5 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p9-crimson",
      colorName: "Crimson Red",
      colorHex: "#8B1E3F",
      image: "/images/wedding_blouse_crimson_deep_v.png",
      images: [
        "/images/wedding_blouse_crimson_deep_v.png",
        "/images/wedding_blouse_pink_lattice.png",
      ],
      price: 4899,
      mrp: 7999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 3 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
    {
      id: "p9-burgundy",
      colorName: "Burgundy Maroon",
      colorHex: "#4A0E17",
      image: "/images/wedding_blouse_burgundy_sheer.png",
      images: [
        "/images/wedding_blouse_burgundy_sheer.png",
        "/images/wedding_blouse_pink_lattice.png",
      ],
      price: 4899,
      mrp: 7999,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 2 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
  ],
  p10: [
    {
      id: "p10-crimson",
      colorName: "Crimson Red",
      colorHex: "#8B1E3F",
      image: "/images/wedding_blouse_crimson_floral.png",
      images: [
        "/images/wedding_blouse_crimson_floral.png",
        "/images/wedding_blouse_crimson_zardozi.png",
        "/images/wedding_blouse_pink_lattice.png",
      ],
      price: 4299,
      mrp: 6999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 5 },
        { size: "M", stock: 4 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p10-heritage",
      colorName: "Heritage Crimson",
      colorHex: "#991B1B",
      image: "/images/wedding_blouse_crimson_zardozi.png",
      images: [
        "/images/wedding_blouse_crimson_zardozi.png",
        "/images/wedding_blouse_crimson_floral.png",
      ],
      price: 4299,
      mrp: 6999,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 3 },
        { size: "M", stock: 3 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
    {
      id: "p10-ruby",
      colorName: "Ruby Pink",
      colorHex: "#BE185D",
      image: "/images/wedding_blouse_pink_lattice.png",
      images: [
        "/images/wedding_blouse_pink_lattice.png",
        "/images/wedding_blouse_crimson_floral.png",
      ],
      price: 4299,
      mrp: 6999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 2 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
  ],
  p11: [
    {
      id: "p11-crimson",
      colorName: "Royal Crimson",
      colorHex: "#991B1B",
      image: "/images/wedding_blouse_crimson_zardozi.png",
      images: [
        "/images/wedding_blouse_crimson_zardozi.png",
        "/images/wedding_blouse_burgundy_sheer.png",
        "/images/wedding_blouse_crimson_deep_v.png",
      ],
      price: 5299,
      mrp: 8499,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 4 },
        { size: "M", stock: 6 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p11-burgundy",
      colorName: "Burgundy Velvet",
      colorHex: "#4A0E17",
      image: "/images/wedding_blouse_burgundy_sheer.png",
      images: [
        "/images/wedding_blouse_burgundy_sheer.png",
        "/images/wedding_blouse_crimson_zardozi.png",
      ],
      price: 5299,
      mrp: 8499,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 3 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
  ],
  p20: [
    {
      id: "p20-burgundy",
      colorName: "Burgundy Maroon",
      colorHex: "#4A0E17",
      image: "/images/wedding_blouse_burgundy_sheer.png",
      images: [
        "/images/wedding_blouse_burgundy_sheer.png",
        "/images/wedding_blouse_crimson_zardozi.png",
        "/images/wedding_blouse_crimson_floral.png",
      ],
      price: 4999,
      mrp: 7999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 4 },
        { size: "M", stock: 5 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p20-crimson",
      colorName: "Royal Crimson",
      colorHex: "#991B1B",
      image: "/images/wedding_blouse_crimson_zardozi.png",
      images: [
        "/images/wedding_blouse_crimson_zardozi.png",
        "/images/wedding_blouse_burgundy_sheer.png",
      ],
      price: 4999,
      mrp: 7999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 3 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
  ],
  p12: [
    {
      id: "p12-emerald",
      colorName: "Emerald Green",
      colorHex: "#1B4D3E",
      image: "/images/bridal_blouse_emerald_back.png",
      images: [
        "/images/bridal_blouse_emerald_back.png",
        "/images/bridal_blouse_pastel_couture.png",
        "/images/bridal_blouse_maroon_velvet.png",
      ],
      price: 6499,
      mrp: 10499,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 5 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p12-pastel",
      colorName: "Pastel Turquoise",
      colorHex: "#5F9EA0",
      image: "/images/bridal_blouse_pastel_couture.png",
      images: [
        "/images/bridal_blouse_pastel_couture.png",
        "/images/bridal_blouse_emerald_back.png",
      ],
      price: 6499,
      mrp: 10499,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 3 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
    {
      id: "p12-maroon",
      colorName: "Royal Maroon",
      colorHex: "#58111A",
      image: "/images/bridal_blouse_maroon_velvet.png",
      images: ["/images/bridal_blouse_maroon_velvet.png", "/images/bridal_blouse_emerald_back.png"],
      price: 6499,
      mrp: 10499,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 2 },
        { size: "M", stock: 4 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
  ],
  p18: [
    {
      id: "p18-pastel",
      colorName: "Pastel Turquoise",
      colorHex: "#5F9EA0",
      image: "/images/bridal_blouse_pastel_couture.png",
      images: [
        "/images/bridal_blouse_pastel_couture.png",
        "/images/bridal_blouse_emerald_back.png",
        "/images/bridal_blouse_purple_banarasi.png",
      ],
      price: 6299,
      mrp: 9999,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 4 },
        { size: "M", stock: 3 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p18-emerald",
      colorName: "Emerald Green",
      colorHex: "#1B4D3E",
      image: "/images/bridal_blouse_emerald_back.png",
      images: [
        "/images/bridal_blouse_emerald_back.png",
        "/images/bridal_blouse_pastel_couture.png",
      ],
      price: 6299,
      mrp: 9999,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 3 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
    {
      id: "p18-purple",
      colorName: "Royal Purple",
      colorHex: "#4C1D95",
      image: "/images/bridal_blouse_purple_banarasi.png",
      images: [
        "/images/bridal_blouse_purple_banarasi.png",
        "/images/bridal_blouse_pastel_couture.png",
      ],
      price: 6299,
      mrp: 9999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 2 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
  ],
  p19: [
    {
      id: "p19-purple",
      colorName: "Royal Purple",
      colorHex: "#4C1D95",
      image: "/images/bridal_blouse_purple_banarasi.png",
      images: [
        "/images/bridal_blouse_purple_banarasi.png",
        "/images/bridal_blouse_pastel_couture.png",
        "/images/bridal_blouse_crimson_peacock.png",
      ],
      price: 5799,
      mrp: 9299,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 4 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p19-pastel",
      colorName: "Pastel Turquoise",
      colorHex: "#5F9EA0",
      image: "/images/bridal_blouse_pastel_couture.png",
      images: [
        "/images/bridal_blouse_pastel_couture.png",
        "/images/bridal_blouse_purple_banarasi.png",
      ],
      price: 5799,
      mrp: 9299,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 3 },
        { size: "M", stock: 2 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
    {
      id: "p19-crimson",
      colorName: "Crimson Red",
      colorHex: "#8B1E3F",
      image: "/images/bridal_blouse_crimson_peacock.png",
      images: [
        "/images/bridal_blouse_crimson_peacock.png",
        "/images/bridal_blouse_purple_banarasi.png",
      ],
      price: 5799,
      mrp: 9299,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 3 },
        { size: "M", stock: 5 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
  ],
  // --- SAREES ---
  p1: [
    {
      id: "p1-wine",
      colorName: "Wine Maroon",
      colorHex: "#58111A",
      image: "/images/saree_wine_maroon_silk.png",
      images: [
        "/images/saree_wine_maroon_silk.png",
        "/images/saree_rust_orange_banarasi.png",
        "/images/saree_black_silver_zari.png",
      ],
      price: 8499,
      mrp: 13999,
      sizes: [{ size: "Free Size", stock: 7 }],
    },
    {
      id: "p1-rust",
      colorName: "Rust Gold",
      colorHex: "#B76E3E",
      image: "/images/saree_rust_orange_banarasi.png",
      images: ["/images/saree_rust_orange_banarasi.png", "/images/saree_wine_maroon_silk.png"],
      price: 8499,
      mrp: 13999,
      sizes: [{ size: "Free Size", stock: 4 }],
    },
    {
      id: "p1-black",
      colorName: "Midnight Black",
      colorHex: "#1A1A1A",
      image: "/images/saree_black_silver_zari.png",
      images: ["/images/saree_black_silver_zari.png", "/images/saree_wine_maroon_silk.png"],
      price: 8499,
      mrp: 13999,
      sizes: [{ size: "Free Size", stock: 3 }],
    },
  ],
  p6: [
    {
      id: "p6-rust",
      colorName: "Rust Gold",
      colorHex: "#B76E3E",
      image: "/images/saree_rust_orange_banarasi.png",
      images: [
        "/images/saree_rust_orange_banarasi.png",
        "/images/saree_metallic_copper_tissue.png",
        "/images/saree_ivory_embroidered_organza.png",
      ],
      price: 9499,
      mrp: 15999,
      sizes: [{ size: "Free Size", stock: 6 }],
    },
    {
      id: "p6-copper",
      colorName: "Metallic Copper",
      colorHex: "#AD6C4A",
      image: "/images/saree_metallic_copper_tissue.png",
      images: [
        "/images/saree_metallic_copper_tissue.png",
        "/images/saree_rust_orange_banarasi.png",
      ],
      price: 9499,
      mrp: 15999,
      sizes: [{ size: "Free Size", stock: 4 }],
    },
    {
      id: "p6-ivory",
      colorName: "Ivory Cream",
      colorHex: "#F7F2E9",
      image: "/images/saree_ivory_embroidered_organza.png",
      images: [
        "/images/saree_ivory_embroidered_organza.png",
        "/images/saree_rust_orange_banarasi.png",
      ],
      price: 9499,
      mrp: 15999,
      sizes: [{ size: "Free Size", stock: 3 }],
    },
  ],
  p21: [
    {
      id: "p21-black",
      colorName: "Midnight Black",
      colorHex: "#1A1A1A",
      image: "/images/saree_black_silver_zari.png",
      images: [
        "/images/saree_black_silver_zari.png",
        "/images/saree_metallic_copper_tissue.png",
        "/images/saree_wine_maroon_silk.png",
      ],
      price: 7999,
      mrp: 12999,
      sizes: [{ size: "Free Size", stock: 5 }],
    },
    {
      id: "p21-copper",
      colorName: "Metallic Copper",
      colorHex: "#AD6C4A",
      image: "/images/saree_metallic_copper_tissue.png",
      images: ["/images/saree_metallic_copper_tissue.png", "/images/saree_black_silver_zari.png"],
      price: 7999,
      mrp: 12999,
      sizes: [{ size: "Free Size", stock: 3 }],
    },
    {
      id: "p21-wine",
      colorName: "Wine Maroon",
      colorHex: "#58111A",
      image: "/images/saree_wine_maroon_silk.png",
      images: ["/images/saree_wine_maroon_silk.png", "/images/saree_black_silver_zari.png"],
      price: 7999,
      mrp: 12999,
      sizes: [{ size: "Free Size", stock: 4 }],
    },
  ],
  p22: [
    {
      id: "p22-copper",
      colorName: "Metallic Copper",
      colorHex: "#AD6C4A",
      image: "/images/saree_metallic_copper_tissue.png",
      images: [
        "/images/saree_metallic_copper_tissue.png",
        "/images/saree_black_silver_zari.png",
        "/images/saree_rust_orange_banarasi.png",
      ],
      price: 8999,
      mrp: 14499,
      sizes: [{ size: "Free Size", stock: 6 }],
    },
    {
      id: "p22-black",
      colorName: "Midnight Black",
      colorHex: "#1A1A1A",
      image: "/images/saree_black_silver_zari.png",
      images: ["/images/saree_black_silver_zari.png", "/images/saree_metallic_copper_tissue.png"],
      price: 8999,
      mrp: 14499,
      sizes: [{ size: "Free Size", stock: 4 }],
    },
    {
      id: "p22-rust",
      colorName: "Rust Gold",
      colorHex: "#B76E3E",
      image: "/images/saree_rust_orange_banarasi.png",
      images: [
        "/images/saree_rust_orange_banarasi.png",
        "/images/saree_metallic_copper_tissue.png",
      ],
      price: 8999,
      mrp: 14499,
      sizes: [{ size: "Free Size", stock: 2 }],
    },
  ],
  p23: [
    {
      id: "p23-ivory",
      colorName: "Ivory Cream",
      colorHex: "#F7F2E9",
      image: "/images/saree_ivory_embroidered_organza.png",
      images: [
        "/images/saree_ivory_embroidered_organza.png",
        "/images/saree_rust_orange_banarasi.png",
        "/images/saree_wine_maroon_silk.png",
      ],
      price: 9999,
      mrp: 16999,
      sizes: [{ size: "Free Size", stock: 5 }],
    },
    {
      id: "p23-rust",
      colorName: "Rust Gold",
      colorHex: "#B76E3E",
      image: "/images/saree_rust_orange_banarasi.png",
      images: [
        "/images/saree_rust_orange_banarasi.png",
        "/images/saree_ivory_embroidered_organza.png",
      ],
      price: 9999,
      mrp: 16999,
      sizes: [{ size: "Free Size", stock: 3 }],
    },
    {
      id: "p23-wine",
      colorName: "Wine Maroon",
      colorHex: "#58111A",
      image: "/images/saree_wine_maroon_silk.png",
      images: ["/images/saree_wine_maroon_silk.png", "/images/saree_ivory_embroidered_organza.png"],
      price: 9999,
      mrp: 16999,
      sizes: [{ size: "Free Size", stock: 4 }],
    },
  ],
  // --- LEHENGAS ---
  p2: [
    {
      id: "p2-crimson",
      colorName: "Crimson Red",
      colorHex: "#8B1E3F",
      image: "/images/lehenga_crimson_royal_bridal.png",
      images: [
        "/images/lehenga_crimson_royal_bridal.png",
        "/images/lehenga_ruby_rose_embroidered.png",
      ],
      price: 24999,
      mrp: 39999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 3 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p2-ruby",
      colorName: "Ruby Rose Pink",
      colorHex: "#BE185D",
      image: "/images/lehenga_ruby_rose_embroidered.png",
      images: [
        "/images/lehenga_ruby_rose_embroidered.png",
        "/images/lehenga_crimson_royal_bridal.png",
      ],
      price: 24999,
      mrp: 39999,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 2 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
  ],
  p24: [
    {
      id: "p24-ruby",
      colorName: "Ruby Rose Pink",
      colorHex: "#BE185D",
      image: "/images/lehenga_ruby_rose_embroidered.png",
      images: [
        "/images/lehenga_ruby_rose_embroidered.png",
        "/images/lehenga_crimson_royal_bridal.png",
      ],
      price: 22999,
      mrp: 36999,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 4 },
        { size: "M", stock: 3 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p24-crimson",
      colorName: "Crimson Red",
      colorHex: "#8B1E3F",
      image: "/images/lehenga_crimson_royal_bridal.png",
      images: [
        "/images/lehenga_crimson_royal_bridal.png",
        "/images/lehenga_ruby_rose_embroidered.png",
      ],
      price: 22999,
      mrp: 36999,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 2 },
        { size: "M", stock: 4 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
  ],
  // --- SALWAR SUITS ---
  p13: [
    {
      id: "p13-beige",
      colorName: "Beige & Pink",
      colorHex: "#D2B48C",
      image: "/images/salwar_suit_beige_pink_printed.png",
      images: [
        "/images/salwar_suit_beige_pink_printed.png",
        "/images/salwar_suit_rose_patiala_embroidered.png",
      ],
      price: 6499,
      mrp: 9999,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 4 },
        { size: "M", stock: 5 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p13-rose",
      colorName: "Dusty Rose Pink",
      colorHex: "#D48296",
      image: "/images/salwar_suit_rose_patiala_embroidered.png",
      images: [
        "/images/salwar_suit_rose_patiala_embroidered.png",
        "/images/salwar_suit_beige_pink_printed.png",
      ],
      price: 6499,
      mrp: 9999,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 3 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
  ],
  p14: [
    {
      id: "p14-rose",
      colorName: "Dusty Rose Pink",
      colorHex: "#D48296",
      image: "/images/salwar_suit_rose_patiala_embroidered.png",
      images: [
        "/images/salwar_suit_rose_patiala_embroidered.png",
        "/images/salwar_suit_beige_pink_printed.png",
      ],
      price: 7499,
      mrp: 11999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 5 },
        { size: "M", stock: 4 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p14-beige",
      colorName: "Beige & Pink",
      colorHex: "#D2B48C",
      image: "/images/salwar_suit_beige_pink_printed.png",
      images: [
        "/images/salwar_suit_beige_pink_printed.png",
        "/images/salwar_suit_rose_patiala_embroidered.png",
      ],
      price: 7499,
      mrp: 11999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 2 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
  ],
  // --- INDO-WESTERN ---
  p15: [
    {
      id: "p15-rust",
      colorName: "Terracotta Rust",
      colorHex: "#CC4E33",
      image: "/images/indo_western_rust_peplum_set.png",
      images: [
        "/images/indo_western_rust_peplum_set.png",
        "/images/indo_western_ivory_jacket_set.png",
      ],
      price: 11999,
      mrp: 17999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 4 },
        { size: "M", stock: 3 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p15-ivory",
      colorName: "Ivory & Turquoise",
      colorHex: "#FFFFF0",
      image: "/images/indo_western_ivory_jacket_set.png",
      images: [
        "/images/indo_western_ivory_jacket_set.png",
        "/images/indo_western_rust_peplum_set.png",
      ],
      price: 11999,
      mrp: 17999,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 2 },
        { size: "M", stock: 4 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
  ],
  p16: [
    {
      id: "p16-ivory",
      colorName: "Ivory & Turquoise",
      colorHex: "#FFFFF0",
      image: "/images/indo_western_ivory_jacket_set.png",
      images: [
        "/images/indo_western_ivory_jacket_set.png",
        "/images/indo_western_rust_peplum_set.png",
      ],
      price: 13499,
      mrp: 19999,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 3 },
        { size: "M", stock: 5 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p16-rust",
      colorName: "Terracotta Rust",
      colorHex: "#CC4E33",
      image: "/images/indo_western_rust_peplum_set.png",
      images: [
        "/images/indo_western_rust_peplum_set.png",
        "/images/indo_western_ivory_jacket_set.png",
      ],
      price: 13499,
      mrp: 19999,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 2 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
  ],
  // --- FESTIVE WEAR (Features p4 from user screenshot!) ---
  p17: [
    {
      id: "p17-plum",
      colorName: "Royal Plum & Gold",
      colorHex: "#581845",
      image: "/images/festive_wear_plum_zari_silk.png",
      images: [
        "/images/festive_wear_plum_zari_silk.png",
        "/images/festive_wear_teal_velvet_shawl.png",
      ],
      price: 14999,
      mrp: 21999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 4 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p17-teal",
      colorName: "Peacock Teal",
      colorHex: "#005F73",
      image: "/images/festive_wear_teal_velvet_shawl.png",
      images: [
        "/images/festive_wear_teal_velvet_shawl.png",
        "/images/festive_wear_plum_zari_silk.png",
      ],
      price: 14999,
      mrp: 21999,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 3 },
        { size: "M", stock: 3 },
        { size: "L", stock: 1 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
  ],
  p4: [
    {
      id: "p4-teal",
      colorName: "Peacock Teal",
      colorHex: "#005F73",
      image: "/images/festive_wear_teal_velvet_shawl.png",
      images: [
        "/images/festive_wear_teal_velvet_shawl.png",
        "/images/festive_wear_plum_zari_silk.png",
      ],
      price: 16999,
      mrp: 24999,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 5 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
        { size: "XXL", stock: 0 },
      ],
    },
    {
      id: "p4-plum",
      colorName: "Royal Plum & Gold",
      colorHex: "#581845",
      image: "/images/festive_wear_plum_zari_silk.png",
      images: [
        "/images/festive_wear_plum_zari_silk.png",
        "/images/festive_wear_teal_velvet_shawl.png",
      ],
      price: 16999,
      mrp: 24999,
      sizes: [
        { size: "XS", stock: 1 },
        { size: "S", stock: 2 },
        { size: "M", stock: 3 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 0 },
        { size: "XXL", stock: 1 },
      ],
    },
  ],
  // --- ACCESSORIES / COMPLETE THE LOOK ---
  a1: [
    {
      id: "a1-gold",
      colorName: "Antique Gold",
      colorHex: "#D4AF37",
      image: "/images/gold_polki_jhumkas.png",
      price: 3499,
      mrp: 4999,
      sizes: ACCESSORY_SIZES,
    },
  ],
  a2: [
    {
      id: "a2-maroon",
      colorName: "Royal Maroon",
      colorHex: "#58111A",
      image: "/images/maroon_potli.png",
      price: 2199,
      mrp: 3299,
      sizes: ACCESSORY_SIZES,
    },
  ],
  a3: [
    {
      id: "a3-gold",
      colorName: "Antique Gold",
      colorHex: "#D4AF37",
      image: "/images/gold_block_heel_juttis.png",
      price: 2899,
      mrp: 3999,
      sizes: FOOTWEAR_SIZES,
    },
  ],
  a4: [
    {
      id: "a4-gold",
      colorName: "Temple Gold",
      colorHex: "#C59B27",
      image: "/images/temple_necklace_set.png",
      price: 4999,
      mrp: 7499,
      sizes: ACCESSORY_SIZES,
    },
  ],
  // --- NIGHT SUITS ---
  p25: [
    {
      id: "p25-dusty-rose",
      colorName: "Dusty Rose Pink",
      colorHex: "#BE185D",
      image: "/images/night_suit_1.jpg",
      images: ["/images/night_suit_1.jpg"],
      price: 3499,
      mrp: 5999,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 5 },
        { size: "M", stock: 4 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 2 },
      ],
    },
  ],
  p26: [
    {
      id: "p26-pearl-white",
      colorName: "Pearl White & Black Trim",
      colorHex: "#F7F2E9",
      image: "/images/night_suit_2.jpg",
      images: ["/images/night_suit_2.jpg"],
      price: 3899,
      mrp: 6499,
      sizes: [
        { size: "XS", stock: 2 },
        { size: "S", stock: 4 },
        { size: "M", stock: 5 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
      ],
    },
  ],
  p27: [
    {
      id: "p27-navy",
      colorName: "Midnight Navy Blue",
      colorHex: "#0F2042",
      image: "/images/night_suit_3.jpg",
      images: ["/images/night_suit_3.jpg"],
      price: 3299,
      mrp: 5499,
      sizes: [
        { size: "XS", stock: 4 },
        { size: "S", stock: 6 },
        { size: "M", stock: 6 },
        { size: "L", stock: 4 },
        { size: "XL", stock: 2 },
      ],
    },
  ],
  p28: [
    {
      id: "p28-striped-pink",
      colorName: "Blush Pink & White Stripe",
      colorHex: "#F2B8C6",
      image: "/images/night_suit_4.jpg",
      images: ["/images/night_suit_4.jpg"],
      price: 2499,
      mrp: 3999,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 5 },
        { size: "M", stock: 5 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 2 },
      ],
    },
  ],
  p29: [
    {
      id: "p29-crimson",
      colorName: "Deep Crimson Red",
      colorHex: "#8B1E3F",
      image: "/images/night_suit_5.jpg",
      images: ["/images/night_suit_5.jpg"],
      price: 3699,
      mrp: 5999,
      sizes: [
        { size: "XS", stock: 3 },
        { size: "S", stock: 5 },
        { size: "M", stock: 4 },
        { size: "L", stock: 2 },
        { size: "XL", stock: 1 },
      ],
    },
  ],
  p31: [
    {
      id: "p31-berry-cream",
      colorName: "Berry Cream",
      colorHex: "#F5EBE1",
      image: "/images/night_suit_6.jpg",
      images: ["/images/night_suit_6.jpg"],
      price: 2999,
      mrp: 4999,
      sizes: [
        { size: "XS", stock: 4 },
        { size: "S", stock: 6 },
        { size: "M", stock: 5 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 2 },
      ],
    },
  ],
  p32: [
    {
      id: "p32-sky-blue",
      colorName: "Sky Blue Floral",
      colorHex: "#A3D1E4",
      image: "/images/night_suit_7.jpg",
      images: ["/images/night_suit_7.jpg"],
      price: 3299,
      mrp: 5499,
      sizes: [
        { size: "XS", stock: 4 },
        { size: "S", stock: 6 },
        { size: "M", stock: 5 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 2 },
      ],
    },
  ],
  p33: [
    {
      id: "p33-peach-floral",
      colorName: "Soft Peach Floral",
      colorHex: "#EAD7CD",
      image: "/images/night_suit_8.jpg",
      images: ["/images/night_suit_8.jpg"],
      price: 3299,
      mrp: 5499,
      sizes: [
        { size: "XS", stock: 4 },
        { size: "S", stock: 6 },
        { size: "M", stock: 5 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 2 },
      ],
    },
  ],
  p34: [
    {
      id: "p34-mint-stripe",
      colorName: "Mint & White Stripe",
      colorHex: "#D1E8DF",
      image: "/images/night_suit_9.jpg",
      images: ["/images/night_suit_9.jpg"],
      price: 2999,
      mrp: 4999,
      sizes: [
        { size: "XS", stock: 4 },
        { size: "S", stock: 6 },
        { size: "M", stock: 5 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 2 },
      ],
    },
  ],
  p35: [
    {
      id: "p35-peach-orange",
      colorName: "Peach Orange",
      colorHex: "#F8BBA4",
      image: "/images/night_suit_10.jpg",
      images: ["/images/night_suit_10.jpg"],
      price: 3599,
      mrp: 5999,
      sizes: [
        { size: "XS", stock: 4 },
        { size: "S", stock: 6 },
        { size: "M", stock: 5 },
        { size: "L", stock: 3 },
        { size: "XL", stock: 2 },
      ],
    },
  ],
};
/**
 * Returns product-specific variants.
 * Strictly avoids generic colors.
 */
export function getProductVariants(product) {
  if (product.variants && product.variants.length > 0) {
    return product.variants;
  }
  if (CANONICAL_VARIANTS[product.id]) {
    return CANONICAL_VARIANTS[product.id];
  }
  // Authentic fallback: create a single variant from product's actual color and images
  const defaultColor = product.color || "Standard";
  const defaultHex = getColorHexFromName(defaultColor);
  const isSaree = (product.category || "").toLowerCase().includes("saree");
  return [
    {
      id: `${product.id}-default`,
      colorName: defaultColor,
      colorHex: defaultHex,
      image: product.image,
      images: product.images ?? [product.image],
      price: product.price,
      mrp: product.mrp,
      sizes: isSaree ? SAREE_SIZES : APPAREL_SIZES,
    },
  ];
}
/**
 * Maps known luxury color names to accurate hex codes
 */
export function getColorHexFromName(colorName) {
  const lower = colorName.toLowerCase();
  if (lower.includes("crimson") || lower.includes("red")) return "#8B1E3F";
  if (lower.includes("emerald") || lower.includes("green")) return "#1B4D3E";
  if (lower.includes("maroon") || lower.includes("wine") || lower.includes("burgundy"))
    return "#58111A";
  if (lower.includes("teal") || lower.includes("peacock")) return "#005F73";
  if (lower.includes("plum") || lower.includes("purple")) return "#581845";
  if (lower.includes("pink") || lower.includes("rose")) return "#BE185D";
  if (lower.includes("rust") || lower.includes("terracotta") || lower.includes("orange"))
    return "#B76E3E";
  if (lower.includes("copper")) return "#AD6C4A";
  if (lower.includes("ivory") || lower.includes("cream") || lower.includes("white"))
    return "#F7F2E9";
  if (lower.includes("black") || lower.includes("midnight")) return "#1A1A1A";
  if (lower.includes("gold") || lower.includes("zari") || lower.includes("antique"))
    return "#D4AF37";
  if (lower.includes("turquoise") || lower.includes("pastel")) return "#5F9EA0";
  if (lower.includes("beige")) return "#D2B48C";
  return "#8B1E3F"; // HOPO Signature Crimson fallback
}
/**
 * Returns exact available stock for a (color, size) configuration
 */
export function getVariantStock(product, colorName, size) {
  const variants = getProductVariants(product);
  const variant =
    variants.find((v) => v.colorName.toLowerCase() === colorName.toLowerCase()) || variants[0];
  if (!variant) return 0;
  const sizeInfo = variant.sizes.find((s) => s.size.toLowerCase() === size.toLowerCase());
  return sizeInfo ? sizeInfo.stock : 0;
}
/**
 * Returns whether a size is in stock for a given color
 */
export function isSizeAvailable(product, colorName, size) {
  return getVariantStock(product, colorName, size) > 0;
}
/**
 * Finds the first available size that has stock > 0 for this color
 */
export function getFirstAvailableSize(product, colorName, preferredSize) {
  const variants = getProductVariants(product);
  const variant =
    variants.find((v) => v.colorName.toLowerCase() === colorName.toLowerCase()) || variants[0];
  if (!variant) return "M";
  // If preferred size is in stock, preserve it
  if (preferredSize) {
    const preferredMatch = variant.sizes.find(
      (s) => s.size.toLowerCase() === preferredSize.toLowerCase() && s.stock > 0,
    );
    if (preferredMatch) return preferredMatch.size;
  }
  // Otherwise return first size with stock > 0
  const inStock = variant.sizes.find((s) => s.stock > 0);
  return inStock ? inStock.size : variant.sizes[0]?.size || "M";
}
/**
 * Calculates item total in real-time
 */
export function calculateItemTotal(unitPrice, quantity) {
  return Math.max(0, unitPrice * Math.max(1, quantity));
}
