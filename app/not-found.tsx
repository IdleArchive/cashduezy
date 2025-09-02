// app/not-found.tsx
export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
      <h1 className="text-3xl font-bold">Page Not Found</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Sorry, the page you’re looking for doesn’t exist.
      </p>
    </div>
  );
}