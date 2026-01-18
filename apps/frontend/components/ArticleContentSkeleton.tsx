export default function ArticleContentSkeleton() {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-96 bg-gray-200" />
      <div className="p-8">
        <div className="h-10 bg-gray-200 rounded mb-4 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-6 w-1/4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-4/5" />
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </article>
  );
}
