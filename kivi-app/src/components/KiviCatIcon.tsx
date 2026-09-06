import React from 'react';

interface CatIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  glowingEyes?: boolean;
}

/**
 * Handcrafted Minimalist Cat Icon with expressive pointed ears,
 * cute almond eyes with catchlights, and fine whiskers.
 */
export default function KiviCatIcon({
  size = 20,
  className = '',
  glowingEyes = false,
  ...props
}: CatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Cat Head Silhouette with expressive upright ears */}
      <path
        d="M4.5 9.5L3 3.5L8.5 5.8C9.6 5.3 10.8 5 12 5C13.2 5 14.4 5.3 15.5 5.8L21 3.5L19.5 9.5C20.5 11 21 12.7 21 14.5C21 18.6 17 21 12 21C7 21 3 18.6 3 14.5C3 12.7 3.5 11 4.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Ear details */}
      <path
        d="M5.5 7.5L5 5L7.5 6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M18.5 7.5L19 5L16.5 6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* Cute almond/warm glowing eyes */}
      <ellipse
        cx="8.5"
        cy="13.5"
        rx="1.5"
        ry="1.8"
        fill="currentColor"
        className={glowingEyes ? 'animate-pulse' : ''}
      />
      <ellipse
        cx="15.5"
        cy="13.5"
        rx="1.5"
        ry="1.8"
        fill="currentColor"
        className={glowingEyes ? 'animate-pulse' : ''}
      />
      {/* Eye catchlight / sparkle */}
      <circle cx="8" cy="13" r="0.6" fill="#fff" opacity="0.9" />
      <circle cx="15" cy="13" r="0.6" fill="#fff" opacity="0.9" />
      {/* Cute nose & mouth */}
      <path
        d="M12 15.5L11.2 16.5H12.8L12 15.5Z"
        fill="currentColor"
      />
      <path
        d="M10.8 17C11.2 17.5 11.6 17.7 12 17.7C12.4 17.7 12.8 17.5 13.2 17"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Minimalist Whiskers */}
      <path
        d="M4 14.5L7 15"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M4 16.5L7 16"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M20 14.5L17 15"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M20 16.5L17 16"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
