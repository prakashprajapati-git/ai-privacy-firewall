import React from "react";

/**
 * High-fidelity vector artwork matching the reference image 3D graphics:
 * 1. Virtual Reality neon light vortex rings
 * 2. Game Play futuristic controller
 * 3. 3D Art holographic bust sculpture
 * 4. NFT chrome spheres & neural nodes
 * 5. Recent Add futuristic thumbnails
 * 6. Spirograph rainbow orbit halo for user avatar
 */

export const VrArtwork: React.FC = () => (
  <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <radialGradient id="vrBg" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#25123d" />
        <stop offset="60%" stopColor="#120c24" />
        <stop offset="100%" stopColor="#0a0714" />
      </radialGradient>
      <linearGradient id="ringGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f0ff" />
        <stop offset="50%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#eab308" />
      </linearGradient>
      <linearGradient id="ringGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ff007f" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#00f0ff" />
      </linearGradient>
      <filter id="vrGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Background */}
    <rect width="400" height="200" fill="url(#vrBg)" />

    {/* Glowing particles / starfield */}
    <circle cx="60" cy="40" r="1.5" fill="#ffffff" opacity="0.6" />
    <circle cx="340" cy="60" r="1.5" fill="#00f0ff" opacity="0.7" />
    <circle cx="110" cy="160" r="1" fill="#ec4899" opacity="0.5" />
    <circle cx="280" cy="140" r="1.5" fill="#ffffff" opacity="0.8" />
    <circle cx="180" cy="30" r="2" fill="#00f0ff" opacity="0.4" />

    {/* Concentric Neon Rings */}
    <g filter="url(#vrGlow)" transform="translate(200, 110)">
      {/* Outer Ellipse */}
      <ellipse cx="0" cy="0" rx="140" ry="60" stroke="url(#ringGrad1)" strokeWidth="4" transform="rotate(-15)" fill="none" opacity="0.85" />
      <ellipse cx="0" cy="0" rx="120" ry="50" stroke="url(#ringGrad2)" strokeWidth="3" transform="rotate(10)" fill="none" opacity="0.9" />
      <ellipse cx="0" cy="0" rx="95" ry="38" stroke="url(#ringGrad1)" strokeWidth="3.5" transform="rotate(-5)" fill="none" opacity="0.95" />
      <ellipse cx="0" cy="0" rx="70" ry="28" stroke="#00f0ff" strokeWidth="2.5" transform="rotate(18)" fill="none" opacity="0.9" />
      <ellipse cx="0" cy="0" rx="45" ry="18" stroke="#ff007f" strokeWidth="3" transform="rotate(-12)" fill="none" opacity="1" />
      <ellipse cx="0" cy="0" rx="25" ry="10" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.9" />

      {/* Center vortex core glow */}
      <circle cx="0" cy="0" r="14" fill="#00f0ff" filter="blur(8px)" opacity="0.8" />
      <circle cx="0" cy="0" r="6" fill="#ffffff" />
    </g>
  </svg>
);

export const GamePlayArtwork: React.FC = () => (
  <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="gameBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#042f2e" />
        <stop offset="40%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#2e1065" />
      </linearGradient>
      <linearGradient id="controllerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14b8a6" />
        <stop offset="50%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
      <filter id="gameGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <rect width="400" height="200" fill="url(#gameBg)" />

    {/* Ambient Glow */}
    <circle cx="280" cy="90" r="90" fill="#06b6d4" opacity="0.3" filter="blur(35px)" />
    <circle cx="140" cy="110" r="80" fill="#a855f7" opacity="0.3" filter="blur(30px)" />

    {/* Futuristic Gamepad Body */}
    <g transform="translate(195, 95) rotate(-8) scale(1.15)" filter="url(#gameGlow)">
      {/* Shell */}
      <path
        d="M -75,-15 C -65,-45 -20,-50 0,-38 C 20,-50 65,-45 75,-15 C 85,15 95,50 70,60 C 50,68 35,45 25,35 C 10,28 -10,28 -25,35 C -35,45 -50,68 -70,60 C -95,50 -85,15 -75,-15 Z"
        fill="url(#controllerGrad)"
        stroke="#ffffff"
        strokeWidth="2"
        strokeOpacity="0.7"
      />
      {/* Handles highlight */}
      <path d="M -65,10 C -55,35 -45,45 -60,52" stroke="#00f0ff" strokeWidth="3" strokeLinecap="round" />
      <path d="M 65,10 C 55,35 45,45 60,52" stroke="#e0e7ff" strokeWidth="3" strokeLinecap="round" />

      {/* D-Pad Left */}
      <path d="M -42,-10 L -34,-10 L -34,-18 L -28,-18 L -28,-10 L -20,-10 L -20,-4 L -28,-4 L -28,4 L -34,4 L -34,-4 L -42,-4 Z" fill="#ffffff" opacity="0.9" />

      {/* Right Action Buttons */}
      <circle cx="32" cy="-14" r="4.5" fill="#f43f5e" />
      <circle cx="42" cy="-6" r="4.5" fill="#38bdf8" />
      <circle cx="22" cy="-6" r="4.5" fill="#34d399" />
      <circle cx="32" cy="2" r="4.5" fill="#fbbf24" />

      {/* Analog Thumbsticks */}
      <circle cx="-16" cy="10" r="10" fill="#0f172a" stroke="#00f0ff" strokeWidth="2" />
      <circle cx="-16" cy="10" r="4" fill="#00f0ff" />
      <circle cx="16" cy="10" r="10" fill="#0f172a" stroke="#c084fc" strokeWidth="2" />
      <circle cx="16" cy="10" r="4" fill="#c084fc" />

      {/* Touchpad / Lightbar */}
      <rect x="-16" y="-30" width="32" height="12" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
      <line x1="-10" y1="-24" x2="10" y2="-24" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

export const ArtBustArtwork: React.FC = () => (
  <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="bustBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0b0819" />
        <stop offset="100%" stopColor="#1f113a" />
      </linearGradient>
      <linearGradient id="neonCyanPink" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f0ff" />
        <stop offset="100%" stopColor="#e1358f" />
      </linearGradient>
      <filter id="bustGlow">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <rect width="200" height="150" fill="url(#bustBg)" />

    {/* Holographic Wireframe Bust Silhouette */}
    <g transform="translate(95, 75) scale(0.9)" filter="url(#bustGlow)">
      {/* Head & Neck Wireframe Polygons */}
      <path d="M 0,-50 L 20,-35 L 25,-10 L 15,20 L 0,38 L -15,20 L -25,-10 L -20,-35 Z" stroke="url(#neonCyanPink)" strokeWidth="2" fill="rgba(0, 240, 255, 0.08)" />
      {/* Facial Features Wireframe */}
      <path d="M -15,-20 L 0,-15 L 15,-20" stroke="#00f0ff" strokeWidth="1.5" />
      <path d="M 0,-15 L 0,8 L -6,14 L 6,14 Z" stroke="#e1358f" strokeWidth="1.5" fill="none" />
      <path d="M -10,24 L 0,22 L 10,24 L 0,28 Z" stroke="#00f0ff" strokeWidth="1.5" fill="none" />
      {/* Shoulders & Pedestal */}
      <path d="M -45,55 L -20,38 L 0,42 L 20,38 L 45,55 L -45,55 Z" stroke="url(#neonCyanPink)" strokeWidth="2" fill="rgba(225, 53, 143, 0.15)" />
      {/* Contour Grid Rings */}
      <ellipse cx="0" cy="-30" rx="18" ry="6" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" fill="none" />
      <ellipse cx="0" cy="0" rx="22" ry="7" stroke="#e1358f" strokeWidth="1" strokeDasharray="3 2" fill="none" />
      <ellipse cx="0" cy="30" rx="16" ry="5" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" fill="none" />
    </g>
  </svg>
);

export const NftSpheresArtwork: React.FC = () => (
  <svg viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="nftBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#070a1e" />
        <stop offset="100%" stopColor="#141a3a" />
      </linearGradient>
      <radialGradient id="chromeBall1" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#cbd5e1" />
        <stop offset="60%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>
      <radialGradient id="chromeBall2" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#a5f3fc" />
        <stop offset="30%" stopColor="#38bdf8" />
        <stop offset="70%" stopColor="#1e3a8a" />
        <stop offset="100%" stopColor="#090d1f" />
      </radialGradient>
    </defs>

    <rect width="200" height="150" fill="url(#nftBg)" />

    {/* Neural Network Grid Web */}
    <g stroke="rgba(255, 255, 255, 0.18)" strokeWidth="1">
      <line x1="40" y1="40" x2="120" y2="70" />
      <line x1="120" y1="70" x2="160" y2="35" />
      <line x1="120" y1="70" x2="100" y2="125" />
      <line x1="40" y1="40" x2="100" y2="125" />
      <line x1="160" y1="35" x2="185" y2="110" />
      <line x1="100" y1="125" x2="185" y2="110" />
    </g>

    {/* Shiny Chrome 3D Spheres */}
    <circle cx="45" cy="45" r="26" fill="url(#chromeBall1)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.5" />
    <circle cx="120" cy="72" r="34" fill="url(#chromeBall2)" stroke="#38bdf8" strokeWidth="2" />
    <circle cx="165" cy="38" r="16" fill="url(#chromeBall1)" />
    <circle cx="95" cy="126" r="22" fill="url(#chromeBall1)" />
    <circle cx="178" cy="112" r="18" fill="url(#chromeBall2)" />

    {/* Light reflections */}
    <circle cx="112" cy="62" r="6" fill="#ffffff" opacity="0.8" filter="blur(2px)" />
    <circle cx="38" cy="38" r="5" fill="#ffffff" opacity="0.7" />
  </svg>
);

export const SpirographHalo: React.FC = () => (
  <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <defs>
      <linearGradient id="spiroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f0ff" />
        <stop offset="35%" stopColor="#ec4899" />
        <stop offset="70%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="spiroGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
      <filter id="spiroGlow">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <g transform="translate(70, 70)" filter="url(#spiroGlow)">
      {/* Orbit Rings rotated at multiple angles */}
      <ellipse cx="0" cy="0" rx="58" ry="24" stroke="url(#spiroGrad1)" strokeWidth="1.8" transform="rotate(0)" />
      <ellipse cx="0" cy="0" rx="58" ry="24" stroke="url(#spiroGrad2)" strokeWidth="1.8" transform="rotate(22.5)" />
      <ellipse cx="0" cy="0" rx="58" ry="24" stroke="url(#spiroGrad1)" strokeWidth="1.8" transform="rotate(45)" />
      <ellipse cx="0" cy="0" rx="58" ry="24" stroke="url(#spiroGrad2)" strokeWidth="1.8" transform="rotate(67.5)" />
      <ellipse cx="0" cy="0" rx="58" ry="24" stroke="url(#spiroGrad1)" strokeWidth="1.8" transform="rotate(90)" />
      <ellipse cx="0" cy="0" rx="58" ry="24" stroke="url(#spiroGrad2)" strokeWidth="1.8" transform="rotate(112.5)" />
      <ellipse cx="0" cy="0" rx="58" ry="24" stroke="url(#spiroGrad1)" strokeWidth="1.8" transform="rotate(135)" />
      <ellipse cx="0" cy="0" rx="58" ry="24" stroke="url(#spiroGrad2)" strokeWidth="1.8" transform="rotate(157.5)" />
    </g>
  </svg>
);

export const FloatingBadgeAvatar: React.FC<{ type?: "avatar" | "controller" | "statue" | "nft" }> = ({ type = "avatar" }) => {
  return (
    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#1d1637]">
      {type === "avatar" && (
        <svg viewBox="0 0 40 40" fill="none" className="w-7 h-7">
          <circle cx="20" cy="15" r="7" fill="#00f0ff" />
          <path d="M 8,34 C 8,26 14,24 20,24 C 26,24 32,26 32,34" fill="#a855f7" />
        </svg>
      )}
      {type === "controller" && (
        <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
          <rect x="10" y="14" width="20" height="12" rx="4" fill="#ec4899" />
          <circle cx="16" cy="20" r="2" fill="#ffffff" />
          <circle cx="24" cy="20" r="2" fill="#00f0ff" />
        </svg>
      )}
      {type === "statue" && (
        <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
          <circle cx="20" cy="14" r="5" fill="#38bdf8" />
          <path d="M 14,30 L 26,30 L 23,21 L 17,21 Z" fill="#6366f1" />
        </svg>
      )}
      {type === "nft" && (
        <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
          <circle cx="20" cy="20" r="8" fill="#10b981" />
          <circle cx="17" cy="17" r="3" fill="#ffffff" />
        </svg>
      )}
    </div>
  );
};
