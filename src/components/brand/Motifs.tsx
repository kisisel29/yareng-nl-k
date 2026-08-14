export function BrandMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" fill="#111110" />
      <text x="16" y="21" textAnchor="middle" fill="#FFFFFF" fontFamily="Georgia, serif" fontSize="13" fontWeight="600">
        GS
      </text>
    </svg>
  );
}
