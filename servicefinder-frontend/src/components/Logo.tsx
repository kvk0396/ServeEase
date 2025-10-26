import { useId } from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

// ServeEase logomark: two linked nodes connected by interlocking S-shaped connectors
export default function Logo({ size = 32, className }: LogoProps) {
  const bgGradientId = useId();
  const strokeGradientId = useId();
  const nodeGradientId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ServeEase logo"
      className={className}
    >
      <defs>
        {/* Brand background gradient */}
        <linearGradient id={bgGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C73866" />
          <stop offset="100%" stopColor="#FE676E" />
        </linearGradient>
        {/* Light stroke gradient for connectors */}
        <linearGradient id={strokeGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
        </linearGradient>
        {/* Node inner highlight */}
        <radialGradient id={nodeGradientId} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
        </radialGradient>
      </defs>

      {/* Rounded square background */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill={`url(#${bgGradientId})`} />

      {/* Interlocking connectors forming an abstract S (linking customers ↔ providers) */}
      {/* Upper connector */}
      <path
        d="M18 26 C 26 14, 42 14, 46 22"
        fill="none"
        stroke={`url(#${strokeGradientId})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      {/* Lower connector */}
      <path
        d="M18 42 C 22 50, 38 50, 46 38"
        fill="none"
        stroke={`url(#${strokeGradientId})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      {/* Overlap accent to suggest interlock (short cross stroke) */}
      <path
        d="M30 32 C 33 29, 35 29, 38 32"
        fill="none"
        stroke={`url(#${strokeGradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Nodes (customer / provider) */}
      <g>
        {/* Customer node - top-left */}
        <circle cx="16" cy="20" r="6.5" fill="rgba(255,255,255,0.25)" />
        <circle cx="16" cy="20" r="4.5" fill={`url(#${nodeGradientId})`} stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="1.5" />
        {/* Provider node - bottom-right */}
        <circle cx="48" cy="44" r="6.5" fill="rgba(255,255,255,0.25)" />
        <circle cx="48" cy="44" r="4.5" fill={`url(#${nodeGradientId})`} stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="1.5" />
      </g>

      {/* Subtle trust tick near provider node */}
      <path
        d="M43 46 l3 3 l6 -6"
        fill="none"
        stroke={`url(#${strokeGradientId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
    </svg>
  );
} 