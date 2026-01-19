import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_ARTICLE } from '../../graphql/queries';
import { UPDATE_ARTICLE } from '../../graphql/mutations';
import Link from 'next/link';
import Snackbar from '../../components/Snackbar';

interface ArticleFormData {
  title: string;
  content: string;
  imageUrl?: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = router.query;
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ArticleFormData>({
    defaultValues: {
      title: '',
      content: '',
      imageUrl: '',
    },
  });

  const { data, loading: queryLoading, error: queryError } = useQuery<{
    article: {
      id: string;
      title: string;
      content: string;
      imageUrl?: string;
    };
  }>(GET_ARTICLE, {
    variables: { id },
    skip: !id || typeof id !== 'string',
    onCompleted: (data) => {
      if (data?.article) {
        reset({
          title: data.article.title,
          content: data.article.content,
          imageUrl: data.article.imageUrl || '',
        });
      }
    },
    onError: (error) => {
      // Extract error message from GraphQL error
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.networkError?.message ||
        error.message ||
        'Failed to load article';
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    },
  });

  const [updateArticle] = useMutation(UPDATE_ARTICLE, {
    onCompleted: (data) => {
      router.push(`/article/${data.updateArticle.id}`);
    },
    onError: (error) => {
      // Extract error message from GraphQL error
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.networkError?.message ||
        error.message ||
        'Failed to update article';
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    },
  });

  const onSubmit = async (data: ArticleFormData) => {
    if (!id || typeof id !== 'string') {
      return;
    }

    try {
      await updateArticle({
        variables: {
          id,
          input: {
            title: data.title.trim(),
            content: data.content.trim(),
            imageUrl: data.imageUrl?.trim() || undefined,
          },
        },
      });
    } catch (err: any) {
      // Fallback error handling in case onError doesn't catch it
      const errorMessage =
        err?.graphQLErrors?.[0]?.message ||
        err?.networkError?.message ||
        err?.message ||
        'Failed to update article';
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  if (queryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading article...</p>
      </div>
    );
  }

  if (queryError || !data?.article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-4">
            {queryError?.message || 'The article you are looking for does not exist.'}
          </p>
          <Link
            href="/"
            prefetch={true}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Articles
          </Link>
        </div>
        <Snackbar
          message={snackbarMessage || queryError?.message || 'Failed to load article'}
          type="error"
          isOpen={snackbarOpen || !!queryError}
          onClose={() => setSnackbarOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/article/${id}`}
          prefetch={true}
          className="text-blue-600 hover:text-blue-800 font-medium mb-6 inline-block"
        >
          ← Back to Article
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Article</h1>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                {...register('title', {
                  required: 'Title is required',
                  validate: (value) => value.trim().length > 0 || 'Title cannot be empty',
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter article title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                rows={10}
                {...register('content', {
                  required: 'Content is required',
                  validate: (value) => value.trim().length > 0 || 'Content cannot be empty',
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter article content"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                id="imageUrl"
                {...register('imageUrl')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Updating...' : 'Update Article'}
              </button>
              <Link
                href={`/article/${id}`}
                prefetch={true}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <Snackbar
          message={snackbarMessage}
          type="error"
          isOpen={snackbarOpen}
          onClose={() => setSnackbarOpen(false)}
        />
      </div>
    </div>
  );
}
