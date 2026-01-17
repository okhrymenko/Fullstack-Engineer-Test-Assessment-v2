import { GetServerSideProps } from 'next';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { createApolloClient } from '../lib/apollo-client-ssr';
import { GET_ARTICLES_PAGE } from '../graphql/queries';
import { DELETE_ARTICLE } from '../graphql/mutations';
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
}

interface ArticlesPageData {
  articlesPage: {
    articles: Article[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ArticlesPageProps {
  initialPage: ArticlesPageData['articlesPage'];
  initialPageNum: number;
}

const PAGE_SIZE = 10;

export default function ArticlesPage({ initialPage, initialPageNum }: ArticlesPageProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const pageNum = useMemo(
    () => (typeof router.query.page === 'string' ? parseInt(router.query.page, 10) : initialPageNum),
    [router.query.page, initialPageNum]
  );
  const safePage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;

  const { data, loading, refetch } = useQuery<ArticlesPageData>(GET_ARTICLES_PAGE, {
    variables: { page: safePage, limit: PAGE_SIZE },
    ssr: false,
  });

  const page = data?.articlesPage || initialPage;
  const articles = page.articles;

  const [deleteArticle] = useMutation(DELETE_ARTICLE, {
    onCompleted: () => {
      refetch();
      setError(null);
    },
    onError: (err) => {
      setError(err.message || 'Failed to delete article');
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle({ variables: { id } });
      } catch (err) {
        // Error handled in onError
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sports Articles</h1>
          <Link
            href="/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Create Article
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No articles found. Create your first article!</p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
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
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </Link>
                      <Link
                        href={`/edit/${article.id}`}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
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

          {page.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              <Link
                href={page.hasPrevPage ? `/?page=${page.page - 1}` : '/?page=1'}
                className={`px-4 py-2 rounded-lg font-medium ${
                  page.hasPrevPage
                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                Previous
              </Link>
              <span className="px-4 py-2 text-gray-600">
                Page {page.page} of {page.totalPages} ({page.totalCount} articles)
              </span>
              <Link
                href={page.hasNextPage ? `/?page=${page.page + 1}` : `/?page=${page.totalPages}`}
                className={`px-4 py-2 rounded-lg font-medium ${
                  page.hasNextPage
                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                }`}
              >
                Next
              </Link>
            </nav>
          )}
          </>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const apolloClient = createApolloClient();
  const pageParam = context.query.page;
  const pageNum = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
  const safePage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;

  try {
    const { data } = await apolloClient.query({
      query: GET_ARTICLES_PAGE,
      variables: { page: safePage, limit: PAGE_SIZE },
    });

    return {
      props: {
        initialPage: data.articlesPage,
        initialPageNum: safePage,
      },
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      props: {
        initialPage: {
          articles: [],
          totalCount: 0,
          page: 1,
          limit: PAGE_SIZE,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        initialPageNum: 1,
      },
    };
  }
};
