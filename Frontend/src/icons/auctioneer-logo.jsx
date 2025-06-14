import React from 'react';
/**
 * AuctioneerLogo component (plain React JSX)
 * Renders a simplified gavel icon.
 */
export default function AuctioneerLogo(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      {...props}
    >
      {/* Simplified Gavel Icon */}
      <path d="M85,30H60V10A5,5,0,0,0,55,5H45A5,5,0,0,0,40,10V30H15A5,5,0,0,0,10,35V45A5,5,0,0,0,15,50H40V70A5,5,0,0,0,45,75H55A5,5,0,0,0,60,70V50H85A5,5,0,0,0,90,45V35A5,5,0,0,0,85,30Z M55,70H45V10H55Z" />
      <path d="M50,80a15,15,0,0,0,15-15H35A15,15,0,0,0,50,80Z" />
      <rect x="30" y="80" width="40" height="10" rx="3" />
    </svg>
  );
}