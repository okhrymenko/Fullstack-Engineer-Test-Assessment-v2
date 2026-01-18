import { GetServerSideProps } from 'next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { createApolloClient } from '../../lib/apollo-client-ssr';
import { GET_ARTICLE } from '../../graphql/queries';
import Link from 'next/link';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ArticleContentSkeleton from '../../components/ArticleContentSkeleton';

// Dynamically import ArticleContent for streaming
const ArticleContent = dynamic(() => import('../../components/ArticleContent'), {
  loading: () => <ArticleContentSkeleton />,
  ssr: false,
});

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  deletedAt?: string;
  imageUrl?: string;
}

interface ArticlePageProps {
  initialArticle: Article | null;
}

export default function ArticlePage({ initialArticle }: ArticlePageProps) {
  const router = useRouter();
  const { id } = router.query;

  const { data, loading, error } = useQuery<{ article: Article }>(GET_ARTICLE, {
    variables: { id },
    skip: !id || typeof id !== 'string',
    ssr: false,
  });

  const article = data?.article || initialArticle;

  if (loading && !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error?.message || 'The article you are looking for does not exist.'}
          </p>
          <Link
            href="/"
            prefetch={true}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          prefetch={true}
          className="text-blue-600 hover:text-blue-800 font-medium mb-6 inline-block"
        >
          ← Back to Articles
        </Link>

        <Suspense fallback={<ArticleContentSkeleton />}>
          <ArticleContent article={article} />
        </Suspense>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const apolloClient = createApolloClient();

  try {
    const { data } = await apolloClient.query({
      query: GET_ARTICLE,
      variables: { id },
    });

    return {
      props: {
        initialArticle: data.article || null,
      },
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return {
      props: {
        initialArticle: null,
      },
    };
  }
};
