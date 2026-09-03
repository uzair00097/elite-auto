export default function PageSpinner() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" />
    </div>
  );
}
