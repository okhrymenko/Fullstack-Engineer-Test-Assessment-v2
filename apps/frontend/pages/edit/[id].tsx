import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_ARTICLE } from '../../graphql/queries';
import { UPDATE_ARTICLE } from '../../graphql/mutations';
import Link from 'next/link';

export default function EditArticlePage() {
  const router = useRouter();
  const { id } = router.query;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<{ title?: string; content?: string; general?: string }>({});

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
        setTitle(data.article.title);
        setContent(data.article.content);
        setImageUrl(data.article.imageUrl || '');
      }
    },
  });

  const [updateArticle, { loading: mutationLoading }] = useMutation(UPDATE_ARTICLE, {
    onCompleted: (data) => {
      router.push(`/article/${data.updateArticle.id}`);
    },
    onError: (error) => {
      setErrors({ general: error.message || 'Failed to update article' });
    },
  });

  const validate = () => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate() || !id || typeof id !== 'string') {
      return;
    }

    try {
      await updateArticle({
        variables: {
          id,
          input: {
            title: title.trim(),
            content: content.trim(),
            imageUrl: imageUrl.trim() || undefined,
          },
        },
      });
    } catch (err) {
      // Error handled in onError
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

          {errors.general && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter article title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter article content"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={mutationLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                {mutationLoading ? 'Updating...' : 'Update Article'}
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
      </div>
    </div>
  );
}
