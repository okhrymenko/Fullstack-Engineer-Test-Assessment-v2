import { GetServerSideProps } from 'next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { createApolloClient } from '../../lib/apollo-client-ssr';
import { GET_ARTICLE } from '../../graphql/queries';
import Link from 'next/link';

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
          className="text-blue-600 hover:text-blue-800 font-medium mb-6 inline-block"
        >
          ← Back to Articles
        </Link>

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-96 object-cover"
            />
          )}
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
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors mr-4"
              >
                Edit Article
              </Link>
            </div>
          </div>
        </article>
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
