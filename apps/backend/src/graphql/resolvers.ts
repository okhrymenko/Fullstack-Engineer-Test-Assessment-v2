import { GraphQLError } from 'graphql';
import { IsNull } from 'typeorm';
import { AppDataSource } from '../config/database';
import { SportsArticle } from '../entity/SportsArticle';

const articleRepository = AppDataSource.getRepository(SportsArticle);

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export const resolvers = {
  Query: {
    articles: async () => {
      try {
        const articles = await articleRepository
          .createQueryBuilder('article')
          .where('article.deletedAt IS NULL')
          .orderBy('article.createdAt', 'ASC')
          .getMany();
        return articles.map(formatArticle);
      } catch (error) {
        throw new GraphQLError('Failed to fetch articles', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    articlesPage: async (_: unknown, { page = 1, limit = DEFAULT_LIMIT }: { page?: number; limit?: number }) => {
      try {
        const pageNum = Math.max(1, page);
        const limitNum = Math.min(MAX_LIMIT, Math.max(1, limit));
        const skip = (pageNum - 1) * limitNum;

        const queryBuilder = articleRepository
          .createQueryBuilder('article')
          .where('article.deletedAt IS NULL')
          .orderBy('article.createdAt', 'ASC')
          .skip(skip)
          .take(limitNum);

        const [articles, totalCount] = await queryBuilder.getManyAndCount();

        const totalPages = Math.ceil(totalCount / limitNum);

        return {
          articles: articles.map(formatArticle),
          totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        };
      } catch (error) {
        throw new GraphQLError('Failed to fetch articles', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    article: async (_: unknown, { id }: { id: string }) => {
      try {
        const article = await articleRepository.findOne({
          where: { id, deletedAt: IsNull() },
        });

        if (!article) {
          throw new GraphQLError(`Article with id ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return formatArticle(article);
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError('Failed to fetch article', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },

  Mutation: {
    createArticle: async (_: any, { input }: { input: any }) => {
      try {
        // Validation
        validateArticleInput(input);

        const article = articleRepository.create({
          title: input.title.trim(),
          content: input.content.trim(),
          imageUrl: input.imageUrl?.trim() || undefined,
        });

        const savedArticle = await articleRepository.save(article);
        return formatArticle(savedArticle);
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError('Failed to create article', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    updateArticle: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        // Validation
        validateArticleInput(input);

        const article = await articleRepository.findOne({
          where: { id, deletedAt: IsNull() },
        });

        if (!article) {
          throw new GraphQLError(`Article with id ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        article.title = input.title.trim();
        article.content = input.content.trim();
        if (input.imageUrl !== undefined) {
          article.imageUrl = input.imageUrl?.trim() || undefined;
        }

        const updatedArticle = await articleRepository.save(article);
        return formatArticle(updatedArticle);
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError('Failed to update article', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    deleteArticle: async (_: any, { id }: { id: string }) => {
      try {
        const article = await articleRepository.findOne({
          where: { id, deletedAt: IsNull() },
        });

        if (!article) {
          throw new GraphQLError(`Article with id ${id} not found`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        await articleRepository.softDelete(id);
        return true;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError('Failed to delete article', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },
};

// Helper function to format article dates
function formatArticle(article: SportsArticle) {
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    createdAt: article.createdAt ? article.createdAt.toISOString() : null,
    deletedAt: article.deletedAt ? article.deletedAt.toISOString() : null,
    imageUrl: article.imageUrl || null,
  };
}

// Validation function
function validateArticleInput(input: any) {
  if (!input.title || typeof input.title !== 'string' || input.title.trim().length === 0) {
    throw new GraphQLError('Title is required and cannot be empty', {
      extensions: { code: 'BAD_USER_INPUT', field: 'title' },
    });
  }

  if (!input.content || typeof input.content !== 'string' || input.content.trim().length === 0) {
    throw new GraphQLError('Content is required and cannot be empty', {
      extensions: { code: 'BAD_USER_INPUT', field: 'content' },
    });
  }
}
