import Link from 'next/link';
import ImageWithFallback from './ImageWithFallback';

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  deletedAt?: string;
  imageUrl?: string;
}

interface ArticleContentProps {
  article: Article;
}

export default function ArticleContent({ article }: ArticleContentProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      <ImageWithFallback
        src={article.imageUrl}
        alt={article.title}
        className="w-full h-96 object-cover"
      />
      <div className="p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <div className="text-sm text-gray-500 mb-6">
          Published on {new Date(article.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {article.content}
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href={`/edit/${article.id}`}
            prefetch={true}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mr-4"
          >
            Edit Article
          </Link>
        </div>
      </div>
    </article>
  );
}
