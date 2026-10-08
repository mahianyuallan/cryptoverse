import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Note: Coinranking's API now only has a one-sentence coin description, and its exchanges endpoint is disabled on the
// free plan, so both come from CoinGecko. Its free API needs no key, but only allows a few requests a minute.
export const coinGeckoApi = createApi({
  reducerPath: 'coinGeckoApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.coingecko.com/api/v3' }),
  endpoints: (builder) => ({
    getCoinDescription: builder.query({
      query: (coinGeckoId) => `/coins/${coinGeckoId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`,
      transformResponse: (response) => ({ coinGeckoId: response.id, text: response.description?.en }),
    }),

    // The top 250 exchanges, ranked by CoinGecko's Trust Score
    getExchanges: builder.query({
      query: () => '/exchanges?per_page=250',
    }),
  }),
});

export const { useGetCoinDescriptionQuery, useGetExchangesQuery } = coinGeckoApi;
