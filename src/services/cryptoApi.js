import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Requests go to our own /api/coinranking function (api/coinranking.js), which calls the Coinranking API with the
// RapidAPI key on the server, so the key is never sent to the browser. `path` is the Coinranking endpoint to call.
const createRequest = (path, params = {}) => ({ url: 'coinranking', params: { path, ...params } });

export const cryptoApi = createApi({
  reducerPath: 'cryptoApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getCryptos: builder.query({
      query: (count) => createRequest('coins', { limit: count }),
    }),

    getCryptoDetails: builder.query({
      query: (coinId) => createRequest(`coin/${coinId}`),
    }),

    // Note: The query parameter must be spelled timePeriod (capital P). The API silently ignores `timeperiod` and always returns the last 24h.
    getCryptoHistory: builder.query({
      query: ({ coinId, timeperiod }) => createRequest(`coin/${coinId}/history`, { timePeriod: timeperiod }),
    }),
  }),
});

export const {
  useGetCryptosQuery,
  useGetCryptoDetailsQuery,
  useGetCryptoHistoryQuery,
} = cryptoApi;
