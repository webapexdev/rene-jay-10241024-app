/** Map pin marker; inherits brand color from the field icon wrapper. */
export function GoogleMapsPinIcon({
  className = "h-4 w-4 shrink-0 text-brand",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      />
      <circle fill="#fff" cx="12" cy="9" r="2.5" />
    </svg>
  );
}
