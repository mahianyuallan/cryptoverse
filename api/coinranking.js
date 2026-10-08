// Vercel serverless function: forwards the app's requests to the Coinranking API on RapidAPI and adds the API key here,
// on the server, so the key never ships to the browser. Under `npm start`, src/setupProxy.js serves this same file.
const API_HOST = 'coinranking1.p.rapidapi.com';

// Only the Coinranking endpoints the app uses, so this function can't be used to reach anything else with the key
const ALLOWED_PATH = /^(coins|coin\/[\w-]+(\/history)?)$/;

module.exports = async (req, res) => {
  const { path = '', ...params } = req.query;

  if (req.method !== 'GET' || !ALLOWED_PATH.test(path)) {
    return res.status(404).json({ message: 'Not found' });
  }
  if (!process.env.RAPIDAPI_KEY) {
    return res.status(500).json({ message: 'RAPIDAPI_KEY is not set' });
  }

  const url = new URL(`https://${API_HOST}/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  try {
    const upstream = await fetch(url, { headers: { 'x-rapidapi-host': API_HOST, 'x-rapidapi-key': process.env.RAPIDAPI_KEY } });

    // Let Vercel's CDN reuse successful answers for a minute: visitors share requests, so the RapidAPI quota lasts longer
    res.setHeader('Cache-Control', upstream.ok ? 's-maxage=60, stale-while-revalidate=300' : 'no-store');
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(await upstream.text());
  } catch (error) {
    return res.status(502).json({ message: 'Could not reach the Coinranking API' });
  }
};
