import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Note: The tutorial's Bing News API no longer works (it returns 404). rss2json turns a news RSS feed
// into JSON the browser can fetch without an API key. Its free tier returns up to 10 articles per feed.
const coinDeskFeed = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
const bingSearchFeed = (query) => `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`;

const createRequest = (feedUrl) => `/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

export const cryptoNewsApi = createApi({
  reducerPath: 'cryptoNewsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.rss2json.com/v1' }),
  endpoints: (builder) => ({
    // CoinDesk's feed has images but can't be searched, so it covers the general 'Cryptocurrency' category.
    // Any other category (e.g. a coin name) is searched through Bing's news RSS, which has no images.
    getCryptoNews: builder.query({
      query: ({ newsCategory }) => createRequest(newsCategory === 'Cryptocurrency' ? coinDeskFeed : bingSearchFeed(newsCategory)),
    }),
  }),
});

export const { useGetCryptoNewsQuery } = cryptoNewsApi;
