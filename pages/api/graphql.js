import { gql, ApolloServer } from "apollo-server-micro";
import axios from "axios";

export const baseUrl = "https://hacker-news.firebaseio.com/v0/";
export const newStoriesUrl = `${baseUrl}askstories.json`;
export const storyUrl = `${baseUrl}item/`;

export const selectFields = ({ by, title, text, score }) => ({
  by,
  title,
  text,
  score,
});

const getStory = async (storyId) => {
  const result = await axios.get(`${storyUrl + storyId}.json`);
  return selectFields(result.data);
};

const getStoryIds = async () => {
  const result = await axios.get(newStoriesUrl);
  return result.data;
};

const typeDefs = gql`
  type Post {
    by: String
    title: String
    text: String
    score: String
  }

  type Query {
    feed: [Post!]!
    post(storyId: String!): Post
  }
`;

const resolvers = {
  Query: {
    feed: async (parent, args, ctx) => {
      const storyIds = await getStoryIds();
      const data = await Promise.all(storyIds.map((id) => getStory(id)));

      return data;
    },
    post: (parent, { storyId }, ctx) => {
      return getStory(storyId);
    },
  },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: "/api/graphql" });
