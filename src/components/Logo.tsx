import React from "react";

export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 38 38" 
      className={className}
    >
      <rect x="7" y="5" width="16" height="20" rx="3" fill="none" stroke="#6366f1" strokeWidth="1.8"/>
      <line x1="11" y1="11" x2="19" y2="11" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11" y1="15" x2="19" y2="15" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11" y1="19" x2="16" y2="19" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="27" cy="27" r="7" fill="#6366f1"/>
      <path d="M24 27 Q27 23 30 27" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="27" cy="29" r="1.2" fill="#fff"/>
    </svg>
  );
}
