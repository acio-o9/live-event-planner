export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 h-8 w-8 ${className ?? ""}`}
      role="status"
      aria-label="読み込み中"
    />
  );
}
