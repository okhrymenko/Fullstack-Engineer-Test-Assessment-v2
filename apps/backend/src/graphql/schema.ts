import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import { resolvers } from './resolvers';
import { SportsArticleType, ArticlesPageType } from './types';
import { ArticleInputType } from './inputs';
import { GraphQLNonNull, GraphQLList, GraphQLID, GraphQLBoolean, GraphQLInt } from 'graphql';

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    articles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SportsArticleType))),
      resolve: resolvers.Query.articles,
    },
    articlesPage: {
      type: new GraphQLNonNull(ArticlesPageType),
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 10 },
      },
      resolve: resolvers.Query.articlesPage,
    },
    article: {
      type: SportsArticleType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: resolvers.Query.article,
    },
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createArticle: {
      type: new GraphQLNonNull(SportsArticleType),
      args: {
        input: { type: new GraphQLNonNull(ArticleInputType) },
      },
      resolve: resolvers.Mutation.createArticle,
    },
    updateArticle: {
      type: new GraphQLNonNull(SportsArticleType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(ArticleInputType) },
      },
      resolve: resolvers.Mutation.updateArticle,
    },
    deleteArticle: {
      type: new GraphQLNonNull(GraphQLBoolean),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve: resolvers.Mutation.deleteArticle,
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
