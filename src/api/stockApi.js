const BASE_URL = "http://20.244.56.144/evaluation-service";

const cache = {
  stocks: null,
  prices: {}
};

export async function fetchStocks() {
  if (cache.stocks) {
    return cache.stocks;
  }
  const response = await fetch(`${BASE_URL}/stocks`);
  if (!response.ok) {
    throw new Error("Failed to fetch stocks");
  }
  const data = await response.json();
  cache.stocks = data.stocks;
  return data.stocks;
}

export async function fetchStockPrice(ticker, minutes) {
  const cacheKey = `${ticker}_${minutes || 'all'}`;
  if (cache.prices[cacheKey]) {
    return cache.prices[cacheKey];
  }
  const url = minutes
    ? `${BASE_URL}/stocks/${ticker}?minutes=${minutes}`
    : `${BASE_URL}/stocks/${ticker}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch stock price");
  }
  const data = await response.json();
  const result = data.stock || data;
  cache.prices[cacheKey] = result;
  return result;
}
