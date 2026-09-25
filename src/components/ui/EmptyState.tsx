export function EmptyState({
  title, body, actionLabel, onAction
}: { title: string; body: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="w-14 h-14 rounded-full bg-mist dark:bg-[#28403F] flex items-center justify-center mx-auto mb-4 text-2xl" aria-hidden="true">
        ⌾
      </div>
      <h3 className="font-display text-lg font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-harbor/60 dark:text-[#A9BBB5] max-w-sm mx-auto mb-5">{body}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-outline">{actionLabel}</button>
      )}
    </div>
  );
}
