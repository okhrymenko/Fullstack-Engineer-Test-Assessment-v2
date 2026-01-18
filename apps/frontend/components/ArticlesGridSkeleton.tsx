export default function ArticlesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div className="w-full h-48 bg-gray-200" />
          <div className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="flex gap-2">
                <div className="h-4 bg-gray-200 rounded w-12" />
                <div className="h-4 bg-gray-200 rounded w-12" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
