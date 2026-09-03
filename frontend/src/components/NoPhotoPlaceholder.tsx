export default function NoPhotoPlaceholder({ category }: { category?: "car" | "motorcycle" }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-300">
      {category === "motorcycle" ? (
        <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="5" cy="17" r="2.5" />
          <circle cx="18" cy="17" r="2.5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 17l3.5-6h4l2 3.5h3.5M9 11l1.5-3h3M14.5 14.5L17 8h2"
          />
        </svg>
      ) : (
        <svg className="h-9 w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.5 16.5v-3l2-4.5a2 2 0 011.85-1.25h9.3a2 2 0 011.85 1.25l2 4.5v3"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 16.5h17M6 13h12" />
          <circle cx="7" cy="16.5" r="1.6" />
          <circle cx="17" cy="16.5" r="1.6" />
        </svg>
      )}
      <span className="text-xs font-medium">No photo yet</span>
    </div>
  );
}
