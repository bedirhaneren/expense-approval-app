/** Skeleton shown while a page's data is loading. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Yükleniyor" className="animate-pulse">
      <div className="mb-2 h-8 w-56 rounded-lg bg-surface-muted" />
      <div className="mb-6 h-4 w-80 rounded bg-surface-muted" />
      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-6">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-10 rounded-lg bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
