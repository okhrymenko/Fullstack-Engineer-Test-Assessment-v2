import { GetServerSideProps } from 'next';
import { useQuery, useMutation } from '@apollo/client';
import { createApolloClient } from '../lib/apollo-client-ssr';
import { GET_ARTICLES_PAGE } from '../graphql/queries';
import { DELETE_ARTICLE } from '../graphql/mutations';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import ImageWithFallback from '../components/ImageWithFallback';

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
}

const PAGE_SIZE = 10;

export default function ArticlesPage({ initialPage }: ArticlesPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPage.hasNextPage);
  const observerTarget = useRef<HTMLDivElement>(null);
  const deletedArticleId = useRef<string | null>(null);

  const { data, loading, fetchMore } = useQuery<ArticlesPageData>(GET_ARTICLES_PAGE, {
    variables: { page: 1, limit: PAGE_SIZE },
    ssr: false,
    notifyOnNetworkStatusChange: true,
  });

  // Get all articles from Apollo cache or use initial data
  const allArticles = data?.articlesPage?.articles || initialPage.articles;

  // Update hasMore and currentPage when data changes
  useEffect(() => {
    if (data?.articlesPage) {
      setHasMore(data.articlesPage.hasNextPage);
      setCurrentPage(data.articlesPage.page);
    }
  }, [data]);

  // Load more articles when scrolling to bottom
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      await fetchMore({
        variables: {
          page: currentPage + 1,
          limit: PAGE_SIZE,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.articlesPage) return prev;

          return {
            articlesPage: {
              ...fetchMoreResult.articlesPage,
              articles: [
                ...prev.articlesPage.articles,
                ...fetchMoreResult.articlesPage.articles,
              ],
            },
          };
        },
      });
    } catch (err) {
      console.error('Error loading more articles:', err);
    }
  }, [currentPage, hasMore, loading, fetchMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadMore]);

  const [deleteArticle] = useMutation(DELETE_ARTICLE, {
    onCompleted: () => {
      setError(null);
      deletedArticleId.current = null;
      // Reset pagination state after delete
      setCurrentPage(1);
    },
    onError: (err) => {
      setError(err.message || 'Failed to delete article');
      deletedArticleId.current = null;
    },
    refetchQueries: [
      {
        query: GET_ARTICLES_PAGE,
        variables: { page: 1, limit: PAGE_SIZE },
      },
    ],
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      deletedArticleId.current = id;
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

        {!data && loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : allArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No articles found. Create your first article!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allArticles.map((article) => (
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

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center mt-8">
              {loading && hasMore && (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading more articles...</p>
                </div>
              )}
              {!hasMore && allArticles.length > 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500">No more articles to load</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const apolloClient = createApolloClient();

  try {
    const { data } = await apolloClient.query({
      query: GET_ARTICLES_PAGE,
      variables: { page: 1, limit: PAGE_SIZE },
    });

    return {
      props: {
        initialPage: data.articlesPage,
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
      },
    };
  }
};
