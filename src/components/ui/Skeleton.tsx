export function SkeletonAttractionCard() {
  return (
    <div className="card overflow-hidden animate-pulse" aria-hidden="true">
      <div className="h-32 bg-mist dark:bg-[#28403F]" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-mist dark:bg-[#28403F] rounded" />
        <div className="h-3 w-1/2 bg-mist dark:bg-[#28403F] rounded" />
        <div className="h-3 w-full bg-mist dark:bg-[#28403F] rounded" />
        <div className="h-9 w-full bg-mist dark:bg-[#28403F] rounded-lg mt-2" />
      </div>
    </div>
  );
}

export function SkeletonAttractionGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-[18px]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonAttractionCard key={i} />)}
    </div>
  );
}

export function SkeletonTrail() {
  return (
    <div className="space-y-5 animate-pulse" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="w-[42px] h-[42px] rounded-full bg-mist dark:bg-[#28403F] flex-shrink-0" />
          <div className="card px-[18px] py-[14px] flex-1 space-y-2">
            <div className="h-3 w-16 bg-mist dark:bg-[#28403F] rounded" />
            <div className="h-4 w-2/3 bg-mist dark:bg-[#28403F] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
