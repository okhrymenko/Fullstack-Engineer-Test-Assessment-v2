import { GraphQLInputObjectType, GraphQLString, GraphQLNonNull } from 'graphql';

export const ArticleInputType = new GraphQLInputObjectType({
  name: 'ArticleInput',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    imageUrl: { type: GraphQLString },
  }),
});
