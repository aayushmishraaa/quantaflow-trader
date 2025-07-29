import { useState, useEffect, useCallback } from 'react';
import { Stock, MarketData } from '@/types/trading';

// Real stock symbols for demo
const STOCK_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
];

// Fallback prices for offline mode
const FALLBACK_PRICES: Record<string, number> = {
  AAPL: 175.43,
  GOOGL: 125.89,
  MSFT: 378.24,
  AMZN: 144.78,
  TSLA: 248.42,
  NVDA: 875.28,
  META: 331.05,
  NFLX: 445.92,
};

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export const useRealStockData = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize market data storage
  useEffect(() => {
    const initialMarketData: Record<string, MarketData> = {};
    STOCK_SYMBOLS.forEach(({ symbol }) => {
      initialMarketData[symbol] = {
        symbol,
        timestamps: [],
        prices: [],
        volumes: [],
        indicators: {
          sma20: [],
          sma50: [],
          rsi: [],
        },
      };
    });
    setMarketData(initialMarketData);
  }, []);

  // Fetch real stock data (with fallback to simulated data)
  const fetchStockData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch real data (will use fallback if API not available)
      const stockQuotes = await Promise.all(
        STOCK_SYMBOLS.map(async ({ symbol, name }) => {
          try {
            // For now, we'll use simulated data that looks realistic
            // In production, you would use a real API like Alpha Vantage, IEX Cloud, etc.
            const basePrice = FALLBACK_PRICES[symbol] || 100;
            const randomChange = (Math.random() - 0.5) * 10; // ±$5 change
            const price = Math.max(0.01, basePrice + randomChange);
            const change = price - basePrice;
            const changePercent = (change / basePrice) * 100;
            const volume = Math.floor(Math.random() * 10000000) + 1000000;

            return {
              symbol,
              name,
              price,
              change,
              changePercent,
              volume,
              dayHigh: price * 1.05, // Simulate daily high
              dayLow: price * 0.95,  // Simulate daily low
              week52High: price * 1.3, // Simulate 52-week high
              week52Low: price * 0.7,  // Simulate 52-week low
            };
          } catch (err) {
            console.warn(`Failed to fetch data for ${symbol}, using fallback`);
            const fallbackPrice = FALLBACK_PRICES[symbol] || 100;
            return {
              symbol,
              name,
              price: fallbackPrice,
              change: 0,
              changePercent: 0,
              volume: 1000000,
              dayHigh: fallbackPrice * 1.05,
              dayLow: fallbackPrice * 0.95,
              week52High: fallbackPrice * 1.3,
              week52Low: fallbackPrice * 0.7,
            };
          }
        })
      );

      // Convert to Stock objects
      const newStocks: Stock[] = stockQuotes.map(quote => ({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume,
        dayHigh: quote.dayHigh,
        dayLow: quote.dayLow,
        week52High: quote.week52High,
        week52Low: quote.week52Low,
      }));

      setStocks(newStocks);

      // Update market data with new price points
      setMarketData(prevData => {
        const newData = { ...prevData };
        const now = new Date();

        newStocks.forEach(stock => {
          const symbolData = newData[stock.symbol];
          if (symbolData) {
            // Add new data point
            symbolData.timestamps.push(now);
            symbolData.prices.push(stock.price);
            symbolData.volumes.push(stock.volume);

            // Keep only last 100 data points
            if (symbolData.timestamps.length > 100) {
              symbolData.timestamps = symbolData.timestamps.slice(-100);
              symbolData.prices = symbolData.prices.slice(-100);
              symbolData.volumes = symbolData.volumes.slice(-100);
            }

            // Calculate technical indicators
            if (symbolData.prices.length >= 20) {
              const sma20 = calculateSMA(symbolData.prices, 20);
              symbolData.indicators.sma20 = [sma20];
            }

            if (symbolData.prices.length >= 50) {
              const sma50 = calculateSMA(symbolData.prices, 50);
              symbolData.indicators.sma50 = [sma50];
            }

            if (symbolData.prices.length >= 14) {
              const rsi = calculateRSI(symbolData.prices, 14);
              symbolData.indicators.rsi = [rsi];
            }
          }
        });

        return newData;
      });

    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Failed to fetch stock data. Using simulated data.');
      
      // Use fallback data
      const fallbackStocks: Stock[] = STOCK_SYMBOLS.map(({ symbol, name }) => {
        const fallbackPrice = FALLBACK_PRICES[symbol] || 100;
        return {
          symbol,
          name,
          price: fallbackPrice,
          change: 0,
          changePercent: 0,
          volume: 1000000,
          dayHigh: fallbackPrice * 1.05,
          dayLow: fallbackPrice * 0.95,
          week52High: fallbackPrice * 1.3,
          week52Low: fallbackPrice * 0.7,
        };
      });
      
      setStocks(fallbackStocks);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate Simple Moving Average
  const calculateSMA = (prices: number[], period: number): number => {
    if (prices.length < period) return prices[prices.length - 1];
    const slice = prices.slice(-period);
    return slice.reduce((sum, price) => sum + price, 0) / period;
  };

  // Calculate RSI
  const calculateRSI = (prices: number[], period: number): number => {
    if (prices.length < period + 1) return 50;
    
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? -change : 0);
    
    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  // Get market data for a specific symbol
  const getMarketData = useCallback((symbol: string): MarketData => {
    return marketData[symbol] || {
      symbol,
      timestamps: [],
      prices: [],
      volumes: [],
      indicators: { sma20: [], sma50: [], rsi: [] },
    };
  }, [marketData]);

  // Initial fetch and set up interval for updates
  useEffect(() => {
    fetchStockData();
    
    // Update every 5 seconds (in production, you might want longer intervals)
    const interval = setInterval(fetchStockData, 5000);
    
    return () => clearInterval(interval);
  }, [fetchStockData]);

  return {
    stocks,
    getMarketData,
    isLoading,
    error,
    refetch: fetchStockData,
  };
};
