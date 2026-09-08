import React from "react";

interface VFLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  textColor?: string;
}

export function VFLogo({ className = "h-8 w-auto", size = 36, showText = true, textColor = "text-white" }: VFLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={typeof size === "number" ? size : size}
        height={typeof size === "number" ? size : size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow"
      >
        <defs>
          {/* Green Metallic Gradient */}
          <linearGradient id="vfGreenMetallic" x1="20" y1="20" x2="300" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="25%" stopColor="#10b981" />
            <stop offset="55%" stopColor="#059669" />
            <stop offset="85%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* Green Inner Swoosh Gradient */}
          <linearGradient id="vfGreenHighlight" x1="100" y1="50" x2="280" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="40%" stopColor="#34d399" />
            <stop offset="80%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* Gold Metallic Gradient Main */}
          <linearGradient id="vfGoldMetallic" x1="220" y1="40" x2="490" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#eab308" />
            <stop offset="50%" stopColor="#ca8a04" />
            <stop offset="75%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          {/* Gold Metallic Accent */}
          <linearGradient id="vfGoldAccent" x1="260" y1="200" x2="450" y2="300" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Bevel Highlight */}
          <linearGradient id="vfGoldLight" x1="240" y1="40" x2="480" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#fef08a" />
            <stop offset="80%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
        </defs>

        {/* --- GOLD 'F' TOP CHEVRON --- */}
        <polygon points="240,45 490,45 440,105 295,105" fill="url(#vfGoldLight)" />
        <polygon points="240,45 295,105 265,200 240,45" fill="url(#vfGoldMetallic)" />

        {/* --- GOLD 'F' MIDDLE BAR --- */}
        <polygon points="285,150 425,150 380,205 285,205" fill="url(#vfGoldAccent)" />

        {/* --- GREEN MAIN LEFT WING ('V') --- */}
        <path
          d="M 15 45 C 50 20 120 40 210 170 C 245 220 260 300 270 460 C 240 400 215 320 180 230 C 130 110 50 70 15 45 Z"
          fill="url(#vfGreenMetallic)"
        />

        {/* Inner Gold Contour Accent line inside V */}
        <path
          d="M 170 140 C 210 200 242 300 265 425 C 253 380 232 305 198 215 C 160 140 100 85 170 140 Z"
          fill="url(#vfGoldMetallic)"
          opacity="0.9"
        />

        {/* Main Body of V right side swoop */}
        <path
          d="M 15 45 C 80 30 190 120 245 280 C 265 340 270 420 270 460 C 240 410 200 270 135 150 C 80 60 40 50 15 45 Z"
          fill="url(#vfGreenHighlight)"
        />

        {/* Right branch of V connecting down */}
        <path
          d="M 240 200 L 340 370 L 270 460 Z"
          fill="url(#vfGreenMetallic)"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-lg ${textColor}`}>
            VitaForge
          </span>
          <span className="text-[10px] tracking-widest text-emerald-400 font-semibold uppercase">
            Resume Builder
          </span>
        </div>
      )}
    </div>
  );
}
