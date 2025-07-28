import { useState, useEffect, useCallback } from 'react';
import { Stock, MarketData } from '@/types/trading';

// Mock data generator for demo purposes
const generateMockPrice = (basePrice: number, volatility: number = 0.02) => {
  const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
  return Math.max(0.01, basePrice + change);
};

const generateIndicators = (prices: number[]) => {
  const sma20 = prices.slice(-20).reduce((sum, price) => sum + price, 0) / Math.min(20, prices.length);
  const sma50 = prices.slice(-50).reduce((sum, price) => sum + price, 0) / Math.min(50, prices.length);
  
  // Simple RSI calculation
  const gains = [];
  const losses = [];
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }
  const avgGain = gains.slice(-14).reduce((sum, gain) => sum + gain, 0) / 14;
  const avgLoss = losses.slice(-14).reduce((sum, loss) => sum + loss, 0) / 14;
  const rs = avgGain / (avgLoss || 1);
  const rsi = 100 - (100 / (1 + rs));

  return { sma20, sma50, rsi };
};

const mockStocks: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.50,
    change: 2.35,
    changePercent: 1.36,
    volume: 45232000,
    marketCap: 2800000000000,
    pe: 28.5,
    dayHigh: 177.20,
    dayLow: 174.10,
    week52High: 198.23,
    week52Low: 124.17
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.85,
    change: -1.24,
    changePercent: -0.86,
    volume: 28445000,
    marketCap: 1800000000000,
    pe: 24.2,
    dayHigh: 144.50,
    dayLow: 141.90,
    week52High: 151.55,
    week52Low: 83.34
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.25,
    change: 4.12,
    changePercent: 1.10,
    volume: 32156000,
    marketCap: 2900000000000,
    pe: 32.1,
    dayHigh: 380.15,
    dayLow: 375.80,
    week52High: 384.30,
    week52Low: 213.43
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.75,
    change: -8.95,
    changePercent: -3.47,
    volume: 89234000,
    marketCap: 790000000000,
    pe: 65.8,
    dayHigh: 258.40,
    dayLow: 245.20,
    week52High: 299.29,
    week52Low: 138.80
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.30,
    change: 15.60,
    changePercent: 1.81,
    volume: 67123000,
    marketCap: 2200000000000,
    pe: 78.3,
    dayHigh: 882.50,
    dayLow: 868.90,
    week52High: 950.02,
    week52Low: 180.96
  }
];

export const useStockData = () => {
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const updatePrices = useCallback(() => {
    setStocks(prevStocks => 
      prevStocks.map(stock => {
        const newPrice = generateMockPrice(stock.price, 0.005);
        const change = newPrice - stock.price;
        const changePercent = (change / stock.price) * 100;
        
        return {
          ...stock,
          price: newPrice,
          change: change,
          changePercent: changePercent
        };
      })
    );
  }, []);

  const getMarketData = useCallback((symbol: string): MarketData => {
    if (!marketData[symbol]) {
      // Generate historical data
      const prices = [];
      const volumes = [];
      const timestamps = [];
      let currentPrice = stocks.find(s => s.symbol === symbol)?.price || 100;
      
      for (let i = 100; i >= 0; i--) {
        const date = new Date();
        date.setMinutes(date.getMinutes() - i);
        timestamps.push(date);
        
        currentPrice = generateMockPrice(currentPrice, 0.01);
        prices.push(currentPrice);
        volumes.push(Math.floor(Math.random() * 1000000) + 100000);
      }

      const indicators = {
        sma20: [generateIndicators(prices).sma20],
        sma50: [generateIndicators(prices).sma50],
        rsi: [generateIndicators(prices).rsi]
      };

      const data: MarketData = {
        symbol,
        prices,
        volumes,
        timestamps,
        indicators
      };

      setMarketData(prev => ({ ...prev, [symbol]: data }));
      return data;
    }
    return marketData[symbol];
  }, [marketData, stocks]);

  useEffect(() => {
    const interval = setInterval(updatePrices, 2000);
    return () => clearInterval(interval);
  }, [updatePrices]);

  return {
    stocks,
    marketData,
    isLoading,
    getMarketData,
    updatePrices
  };
};