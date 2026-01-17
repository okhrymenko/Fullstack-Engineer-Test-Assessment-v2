import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
} from 'graphql';

export const SportsArticleType = new GraphQLObjectType({
  name: 'SportsArticle',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    createdAt: { type: GraphQLString },
    deletedAt: { type: GraphQLString },
    imageUrl: { type: GraphQLString },
  }),
});

export const ArticlesPageType = new GraphQLObjectType({
  name: 'ArticlesPage',
  fields: () => ({
    articles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SportsArticleType))),
    },
    totalCount: { type: new GraphQLNonNull(GraphQLInt) },
    page: { type: new GraphQLNonNull(GraphQLInt) },
    limit: { type: new GraphQLNonNull(GraphQLInt) },
    totalPages: { type: new GraphQLNonNull(GraphQLInt) },
    hasNextPage: { type: new GraphQLNonNull(GraphQLBoolean) },
    hasPrevPage: { type: new GraphQLNonNull(GraphQLBoolean) },
  }),
});
