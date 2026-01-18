import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
}

interface ArticlesGridProps {
  articles: Article[];
  onDelete: (id: string) => void;
}

export default function ArticlesGrid({ articles, onDelete }: ArticlesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <div
          key={article.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <ImageWithFallback
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 line-clamp-2">
              {article.title}
            </h2>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {article.content}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {new Date(article.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/article/${article.id}`}
                  prefetch={true}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View
                </Link>
                <Link
                  href={`/edit/${article.id}`}
                  prefetch={true}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(article.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
