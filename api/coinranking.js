// Vercel serverless function: forwards the app's requests to the Coinranking API on RapidAPI and adds the API key here,
// on the server, so the key never ships to the browser. Under `npm start`, src/setupProxy.js serves this same file.
const API_HOST = 'coinranking1.p.rapidapi.com';

// Only the Coinranking endpoints the app uses, so this function can't be used to reach anything else with the key
const ALLOWED_PATH = /^(coins|coin\/[\w-]+(\/history)?)$/;

// Coin lists arrive with heavy fields the app never shows (each coin's 24-point sparkline alone is ~40% of the payload),
// so list responses keep only these fields, making them about 6x smaller. Add a field here before using it in the app.
const COIN_LIST_FIELDS = ['uuid', 'rank', 'name', 'symbol', 'iconUrl', 'price', 'marketCap', 'change'];

const slimCoinList = (body) => {
  try {
    const json = JSON.parse(body);
    json.data.coins = json.data.coins.map((coin) => Object.fromEntries(COIN_LIST_FIELDS.map((field) => [field, coin[field]])));
    return JSON.stringify(json);
  } catch (error) {
    return body;
  }
};

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
    const body = await upstream.text();
    return res.status(upstream.status).send(upstream.ok && path === 'coins' ? slimCoinList(body) : body);
  } catch (error) {
    return res.status(502).json({ message: 'Could not reach the Coinranking API' });
  }
};
