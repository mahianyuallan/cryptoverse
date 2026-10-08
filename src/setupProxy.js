// Create React App's dev server loads this file when `npm start` begins. It serves /api/coinranking with the same function
// Vercel runs in production (api/coinranking.js), so local development works the same way and the API key stays server-side.
const coinranking = require('../api/coinranking');

module.exports = (app) => {
  app.get('/api/coinranking', coinranking);
};
