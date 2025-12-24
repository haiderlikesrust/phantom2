'use client'

interface WalletLogoProps {
  size?: number
  className?: string
}

export default function WalletLogo({ size = 40, className = '' }: WalletLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main wallet body */}
      <rect
        x="15"
        y="25"
        width="70"
        height="50"
        rx="8"
        fill="#00FF88"
        stroke="#00CC6A"
        strokeWidth="2"
      />
      
      {/* Top opening/liner */}
      <rect
        x="15"
        y="25"
        width="70"
        height="4"
        rx="2"
        fill="#FFFFFF"
        opacity="0.3"
      />
      
      {/* Stitching lines - top */}
      <line
        x1="20"
        y1="29"
        x2="80"
        y2="29"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        opacity="0.6"
      />
      
      {/* Stitching lines - bottom */}
      <line
        x1="20"
        y1="71"
        x2="80"
        y2="71"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        opacity="0.6"
      />
      
      {/* Stitching lines - left */}
      <line
        x1="19"
        y1="30"
        x2="19"
        y2="70"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        opacity="0.6"
      />
      
      {/* Stitching lines - right */}
      <line
        x1="81"
        y1="30"
        x2="81"
        y2="50"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        opacity="0.6"
      />
      
      {/* Snap closure tab */}
      <rect
        x="70"
        y="40"
        width="20"
        height="20"
        rx="4"
        fill="#00CC6A"
        stroke="#00AA55"
        strokeWidth="2"
      />
      
      {/* Snap button outer ring */}
      <circle
        cx="80"
        cy="50"
        r="6"
        fill="#FFFFFF"
        stroke="#00CC6A"
        strokeWidth="2"
      />
      
      {/* Snap button center */}
      <circle
        cx="80"
        cy="50"
        r="3"
        fill="#00CC6A"
      />
      
      {/* Highlight on wallet body */}
      <rect
        x="17"
        y="27"
        width="50"
        height="2"
        rx="1"
        fill="#FFFFFF"
        opacity="0.4"
      />
      
      {/* Highlight on snap tab */}
      <rect
        x="72"
        y="42"
        width="16"
        height="2"
        rx="1"
        fill="#FFFFFF"
        opacity="0.4"
      />
    </svg>
  )
}

