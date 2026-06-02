export function UsFlag({ className = "h-4 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" fill="#fff" />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} y={i * 2 + 1} width="24" height="1" fill="#b22234" />
      ))}
      <rect width="10" height="8" fill="#3c3b6e" />
    </svg>
  );
}
