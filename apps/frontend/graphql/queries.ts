import { gql } from '@apollo/client';

export const GET_ARTICLES = gql`
  query GetArticles {
    articles {
      id
      title
      content
      createdAt
      imageUrl
    }
  }
`;

export const GET_ARTICLES_PAGE = gql`
  query GetArticlesPage($page: Int, $limit: Int) {
    articlesPage(page: $page, limit: $limit) {
      articles {
        id
        title
        content
        createdAt
        imageUrl
      }
      totalCount
      page
      limit
      totalPages
      hasNextPage
      hasPrevPage
    }
  }
`;

export const GET_ARTICLE = gql`
  query GetArticle($id: ID!) {
    article(id: $id) {
      id
      title
      content
      createdAt
      deletedAt
      imageUrl
    }
  }
`;
