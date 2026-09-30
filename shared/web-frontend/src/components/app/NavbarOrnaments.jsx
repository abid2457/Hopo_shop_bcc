import React from "react";
/**
 * Botanical Left Ornament for HOPO SHOP Luxury Curved Navbar
 * Features champagne gold foliage, burgundy lanceolate leaves, and a delicate blossom.
 */
export function NavbarLeftOrnament({ className = "h-full w-auto" }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
    >
      <defs>
        {/* Champagne Gold Gradients */}
        <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DFC38A" />
          <stop offset="50%" stopColor="#C8A96E" />
          <stop offset="100%" stopColor="#A88448" />
        </linearGradient>
        <linearGradient id="goldGradSoft" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EFE3C6" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#D8BE87" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B69352" stopOpacity="0.7" />
        </linearGradient>
        {/* Rich Burgundy / Wine Gradients */}
        <linearGradient id="wineGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4D0B1B" />
          <stop offset="60%" stopColor="#7A1C35" />
          <stop offset="100%" stopColor="#9B2A47" />
        </linearGradient>
        <linearGradient id="wineGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6E162D" />
          <stop offset="100%" stopColor="#3F0714" />
        </linearGradient>
      </defs>

      {/* Outer Golden Curving Leaf hugging the top-left curve */}
      <path
        d="M 2,24 C 6,10 18,2 38,2 C 48,2 62,8 74,18 C 58,18 42,24 30,36 C 18,48 10,64 4,82 C 1,60 1,40 2,24 Z"
        fill="url(#goldGradSoft)"
        stroke="#B38F52"
        strokeWidth="0.75"
        strokeOpacity="0.6"
      />
      {/* Delicate leaf vein line */}
      <path
        d="M 12,18 Q 38,14 68,17"
        stroke="#967339"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* Main Arching Golden Leaf (Art Nouveau style) */}
      <path
        d="M 3,42 C 12,28 32,24 54,34 C 70,42 82,58 88,78 C 68,72 50,60 38,48 C 22,54 12,68 6,88 C 3,72 2,56 3,42 Z"
        fill="url(#goldGrad1)"
        stroke="#967339"
        strokeWidth="0.75"
        strokeOpacity="0.5"
      />
      {/* Internal Vein */}
      <path
        d="M 18,36 Q 48,36 84,72"
        stroke="#7D5E27"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />

      {/* Secondary Soft Gold Leaf curving inwards */}
      <path
        d="M 28,52 C 44,48 64,56 76,70 C 60,76 46,74 34,68 Z"
        fill="url(#goldGradSoft)"
        opacity="0.85"
      />

      {/* Burgundy Leaf 1 - Sweeping upwards from bottom curve */}
      <path
        d="M 4,78 C 8,62 18,52 32,46 C 30,58 24,72 16,84 C 10,92 6,98 2,106 C 2,96 3,86 4,78 Z"
        fill="url(#wineGrad1)"
        stroke="#5A1224"
        strokeWidth="0.5"
      />
      {/* Burgundy Leaf 2 - Deep wine accent pointing right */}
      <path
        d="M 14,80 C 22,70 36,66 48,70 C 40,78 30,86 20,94 C 15,90 14,84 14,80 Z"
        fill="url(#wineGrad2)"
      />
      {/* Burgundy Leaf 3 - Bottom anchor leaf */}
      <path
        d="M 6,96 C 14,90 28,92 38,102 C 24,106 14,106 4,114 C 3,108 4,102 6,96 Z"
        fill="url(#wineGrad1)"
      />

      {/* Elegant 5-Petal Flower Blossom in Burgundy & Gold */}
      <g transform="translate(56, 86)">
        {/* Flower Petals */}
        <ellipse cx="0" cy="-9" rx="4.5" ry="6.5" fill="url(#wineGrad1)" />
        <ellipse
          cx="8"
          cy="-3"
          rx="4.5"
          ry="6.5"
          transform="rotate(72 8 -3)"
          fill="url(#wineGrad1)"
        />
        <ellipse
          cx="5"
          cy="7"
          rx="4.5"
          ry="6.5"
          transform="rotate(144 5 7)"
          fill="url(#wineGrad2)"
        />
        <ellipse
          cx="-5"
          cy="7"
          rx="4.5"
          ry="6.5"
          transform="rotate(216 -5 7)"
          fill="url(#wineGrad2)"
        />
        <ellipse
          cx="-8"
          cy="-3"
          rx="4.5"
          ry="6.5"
          transform="rotate(288 -8 -3)"
          fill="url(#wineGrad1)"
        />

        {/* Blossom Center: Warm Gold Core */}
        <circle cx="0" cy="0" r="3.2" fill="#DFC38A" stroke="#7A1C35" strokeWidth="0.75" />
        <circle cx="0" cy="0" r="1.4" fill="#7A1C35" />

        {/* Tiny Gold Stamens / Beads around core */}
        <circle cx="0" cy="-4" r="0.8" fill="#F3E5C8" />
        <circle cx="3.8" cy="-1.2" r="0.8" fill="#F3E5C8" />
        <circle cx="2.4" cy="3.2" r="0.8" fill="#F3E5C8" />
        <circle cx="-2.4" cy="3.2" r="0.8" fill="#F3E5C8" />
        <circle cx="-3.8" cy="-1.2" r="0.8" fill="#F3E5C8" />
      </g>

      {/* Fine Golden Tendril with Delicate Pearls */}
      <path
        d="M 68,88 Q 82,90 94,84 Q 106,78 114,82"
        stroke="#C8A96E"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="94" cy="84" r="1.8" fill="#DFC38A" stroke="#967339" strokeWidth="0.5" />
      <circle cx="106" cy="80" r="1.4" fill="#DFC38A" />
      <circle cx="114" cy="82" r="2" fill="#DFC38A" stroke="#967339" strokeWidth="0.5" />

      {/* Floating Accent Buds */}
      <circle cx="48" cy="40" r="1.5" fill="#7A1C35" />
      <circle cx="76" cy="38" r="1.8" fill="#C8A96E" />
      <circle cx="86" cy="52" r="1.4" fill="#C8A96E" />
    </svg>
  );
}
/**
 * Botanical Right Ornament for HOPO SHOP Luxury Curved Navbar
 * Mirrored champagne gold and burgundy botanical flourish hugging the right curved corner.
 */
export function NavbarRightOrnament({ className = "h-full w-auto" }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMaxYMid meet"
      aria-hidden="true"
    >
      <defs>
        {/* Champagne Gold Gradients */}
        <linearGradient id="goldGradR1" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DFC38A" />
          <stop offset="50%" stopColor="#C8A96E" />
          <stop offset="100%" stopColor="#A88448" />
        </linearGradient>
        <linearGradient id="goldGradRSoft" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#EFE3C6" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#D8BE87" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B69352" stopOpacity="0.7" />
        </linearGradient>
        {/* Rich Burgundy / Wine Gradients */}
        <linearGradient id="wineGradR1" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#4D0B1B" />
          <stop offset="60%" stopColor="#7A1C35" />
          <stop offset="100%" stopColor="#9B2A47" />
        </linearGradient>
        <linearGradient id="wineGradR2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6E162D" />
          <stop offset="100%" stopColor="#3F0714" />
        </linearGradient>
      </defs>

      {/* Outer Golden Curving Leaf hugging the top-right curve */}
      <path
        d="M 158,24 C 154,10 142,2 122,2 C 112,2 98,8 86,18 C 102,18 118,24 130,36 C 142,48 150,64 156,82 C 159,60 159,40 158,24 Z"
        fill="url(#goldGradRSoft)"
        stroke="#B38F52"
        strokeWidth="0.75"
        strokeOpacity="0.6"
      />
      {/* Delicate leaf vein line */}
      <path
        d="M 148,18 Q 122,14 92,17"
        stroke="#967339"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* Main Arching Golden Leaf */}
      <path
        d="M 157,42 C 148,28 128,24 106,34 C 90,42 78,58 72,78 C 92,72 110,60 122,48 C 138,54 148,68 154,88 C 157,72 158,56 157,42 Z"
        fill="url(#goldGradR1)"
        stroke="#967339"
        strokeWidth="0.75"
        strokeOpacity="0.5"
      />
      {/* Internal Vein */}
      <path
        d="M 142,36 Q 112,36 76,72"
        stroke="#7D5E27"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />

      {/* Secondary Soft Gold Leaf curving inwards */}
      <path
        d="M 132,52 C 116,48 96,56 84,70 C 100,76 114,74 126,68 Z"
        fill="url(#goldGradRSoft)"
        opacity="0.85"
      />

      {/* Burgundy Leaf 1 - Sweeping upwards from bottom curve */}
      <path
        d="M 156,78 C 152,62 142,52 128,46 C 130,58 136,72 144,84 C 150,92 154,98 158,106 C 158,96 157,86 156,78 Z"
        fill="url(#wineGradR1)"
        stroke="#5A1224"
        strokeWidth="0.5"
      />
      {/* Burgundy Leaf 2 - Deep wine accent pointing left */}
      <path
        d="M 146,80 C 138,70 124,66 112,70 C 120,78 130,86 140,94 C 145,90 146,84 146,80 Z"
        fill="url(#wineGradR2)"
      />
      {/* Burgundy Leaf 3 - Bottom anchor leaf */}
      <path
        d="M 154,96 C 146,90 132,92 122,102 C 136,106 146,106 156,114 C 157,108 156,102 154,96 Z"
        fill="url(#wineGradR1)"
      />

      {/* Elegant 5-Petal Flower Blossom in Burgundy & Gold */}
      <g transform="translate(104, 86)">
        {/* Flower Petals */}
        <ellipse cx="0" cy="-9" rx="4.5" ry="6.5" fill="url(#wineGradR1)" />
        <ellipse
          cx="8"
          cy="-3"
          rx="4.5"
          ry="6.5"
          transform="rotate(72 8 -3)"
          fill="url(#wineGradR1)"
        />
        <ellipse
          cx="5"
          cy="7"
          rx="4.5"
          ry="6.5"
          transform="rotate(144 5 7)"
          fill="url(#wineGrad2)"
        />
        <ellipse
          cx="-5"
          cy="7"
          rx="4.5"
          ry="6.5"
          transform="rotate(216 -5 7)"
          fill="url(#wineGrad2)"
        />
        <ellipse
          cx="-8"
          cy="-3"
          rx="4.5"
          ry="6.5"
          transform="rotate(288 -8 -3)"
          fill="url(#wineGradR1)"
        />

        {/* Blossom Center */}
        <circle cx="0" cy="0" r="3.2" fill="#DFC38A" stroke="#7A1C35" strokeWidth="0.75" />
        <circle cx="0" cy="0" r="1.4" fill="#7A1C35" />

        {/* Tiny Gold Stamens / Beads */}
        <circle cx="0" cy="-4" r="0.8" fill="#F3E5C8" />
        <circle cx="3.8" cy="-1.2" r="0.8" fill="#F3E5C8" />
        <circle cx="2.4" cy="3.2" r="0.8" fill="#F3E5C8" />
        <circle cx="-2.4" cy="3.2" r="0.8" fill="#F3E5C8" />
        <circle cx="-3.8" cy="-1.2" r="0.8" fill="#F3E5C8" />
      </g>

      {/* Fine Golden Tendril with Delicate Pearls extending inward */}
      <path
        d="M 92,88 Q 78,90 66,84 Q 54,78 46,82"
        stroke="#C8A96E"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="66" cy="84" r="1.8" fill="#DFC38A" stroke="#967339" strokeWidth="0.5" />
      <circle cx="54" cy="80" r="1.4" fill="#DFC38A" />
      <circle cx="46" cy="82" r="2" fill="#DFC38A" stroke="#967339" strokeWidth="0.5" />

      {/* Floating Accent Buds */}
      <circle cx="112" cy="40" r="1.5" fill="#7A1C35" />
      <circle cx="84" cy="38" r="1.8" fill="#C8A96E" />
      <circle cx="74" cy="52" r="1.4" fill="#C8A96E" />
    </svg>
  );
}
