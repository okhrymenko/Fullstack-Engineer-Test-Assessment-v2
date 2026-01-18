import { GetServerSideProps } from 'next';
import { useQuery, useMutation } from '@apollo/client';
import { createApolloClient } from '../lib/apollo-client-ssr';
import { GET_ARTICLES_PAGE } from '../graphql/queries';
import { DELETE_ARTICLE } from '../graphql/mutations';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import ArticlesGridSkeleton from '../components/ArticlesGridSkeleton';
import LoadingSpinner from '../components/LoadingSpinner';

// Dynamically import ArticlesGrid with no SSR for client-side streaming
const ArticlesGrid = dynamic(() => import('../components/ArticlesGrid'), {
  loading: () => <ArticlesGridSkeleton />,
  ssr: false,
});

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
            <Suspense fallback={<ArticlesGridSkeleton />}>
              <ArticlesGrid articles={allArticles} onDelete={handleDelete} />
            </Suspense>

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="h-20 flex items-center justify-center mt-8">
              {loading && hasMore && (
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                  <LoadingSpinner size="lg" />
                  <p className="text-gray-500 text-sm">Loading more articles...</p>
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
