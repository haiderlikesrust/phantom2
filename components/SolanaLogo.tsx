'use client'

interface SolanaLogoProps {
  size?: number
  className?: string
}

export default function SolanaLogo({ size = 24, className = '' }: SolanaLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top parallelogram - teal to green gradient */}
      <path
        d="M4.5 7L12 2L19.5 7L12 12L4.5 7Z"
        fill="url(#solana-gradient-1)"
      />
      {/* Middle parallelogram - blue to purple gradient */}
      <path
        d="M4.5 12L12 7L19.5 12L12 17L4.5 12Z"
        fill="url(#solana-gradient-2)"
      />
      {/* Bottom parallelogram - purple to dark purple gradient */}
      <path
        d="M4.5 17L12 12L19.5 17L12 22L4.5 17Z"
        fill="url(#solana-gradient-3)"
      />
      <defs>
        <linearGradient id="solana-gradient-1" x1="4.5" y1="7" x2="19.5" y2="7" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14F195" />
          <stop offset="1" stopColor="#00D4AA" />
        </linearGradient>
        <linearGradient id="solana-gradient-2" x1="4.5" y1="12" x2="19.5" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00D4AA" />
          <stop offset="1" stopColor="#9945FF" />
        </linearGradient>
        <linearGradient id="solana-gradient-3" x1="4.5" y1="17" x2="19.5" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" />
          <stop offset="1" stopColor="#7B2CBF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

