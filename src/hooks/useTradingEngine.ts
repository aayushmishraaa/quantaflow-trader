import { useState, useCallback, useEffect } from 'react';
import { Trade, Position, Portfolio, TradingStrategy, Stock, MarketData } from '@/types/trading';
import { useToast } from '@/hooks/use-toast';

export const useTradingEngine = () => {
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: 100000,
    cash: 100000,
    dayPnl: 0,
    totalPnl: 0,
    positions: []
  });
  
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeStrategies, setActiveStrategies] = useState<TradingStrategy[]>([
    {
      id: '1',
      name: 'Moving Average Crossover',
      description: 'Buy when SMA20 crosses above SMA50, sell when below',
      isActive: false,
      params: { fastPeriod: 20, slowPeriod: 50 }
    },
    {
      id: '2',
      name: 'RSI Mean Reversion',
      description: 'Buy when RSI < 30, sell when RSI > 70',
      isActive: false,
      params: { oversoldLevel: 30, overboughtLevel: 70 }
    },
    {
      id: '3',
      name: 'Volume Breakout',
      description: 'Trade on volume spikes with price momentum',
      isActive: false,
      params: { volumeMultiplier: 2, priceThreshold: 0.02 }
    }
  ]);

  const executeTrade = useCallback((trade: Omit<Trade, 'id' | 'timestamp' | 'status'>) => {
    const newTrade: Trade = {
      ...trade,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'EXECUTED'
    };

    const totalCost = trade.quantity * trade.price;
    
    if (trade.type === 'BUY' && totalCost > portfolio.cash) {
      toast({
        title: "Insufficient Funds",
        description: `Not enough cash to buy ${trade.quantity} shares of ${trade.symbol}`,
        variant: "destructive"
      });
      return false;
    }

    setTrades(prev => [newTrade, ...prev]);
    
    setPortfolio(prev => {
      const newPortfolio = { ...prev };
      
      if (trade.type === 'BUY') {
        newPortfolio.cash -= totalCost;
        
        const existingPosition = newPortfolio.positions.find(p => p.symbol === trade.symbol);
        if (existingPosition) {
          const totalQuantity = existingPosition.quantity + trade.quantity;
          const totalValue = (existingPosition.quantity * existingPosition.avgPrice) + totalCost;
          existingPosition.quantity = totalQuantity;
          existingPosition.avgPrice = totalValue / totalQuantity;
        } else {
          newPortfolio.positions.push({
            symbol: trade.symbol,
            quantity: trade.quantity,
            avgPrice: trade.price,
            currentPrice: trade.price,
            unrealizedPnl: 0,
            unrealizedPnlPercent: 0,
            marketValue: totalCost
          });
        }
      } else {
        const position = newPortfolio.positions.find(p => p.symbol === trade.symbol);
        if (position && position.quantity >= trade.quantity) {
          newPortfolio.cash += totalCost;
          position.quantity -= trade.quantity;
          
          if (position.quantity === 0) {
            newPortfolio.positions = newPortfolio.positions.filter(p => p.symbol !== trade.symbol);
          }
        }
      }
      
      return newPortfolio;
    });

    toast({
      title: "Trade Executed",
      description: `${trade.type} ${trade.quantity} shares of ${trade.symbol} at $${trade.price.toFixed(2)}`,
      variant: "default"
    });

    return true;
  }, [portfolio.cash, toast]);

  const updatePositions = useCallback((stocks: Stock[]) => {
    setPortfolio(prev => {
      const updatedPositions = prev.positions.map(position => {
        const stock = stocks.find(s => s.symbol === position.symbol);
        if (stock) {
          const currentPrice = stock.price;
          const marketValue = position.quantity * currentPrice;
          const unrealizedPnl = marketValue - (position.quantity * position.avgPrice);
          const unrealizedPnlPercent = (unrealizedPnl / (position.quantity * position.avgPrice)) * 100;

          return {
            ...position,
            currentPrice,
            marketValue,
            unrealizedPnl,
            unrealizedPnlPercent
          };
        }
        return position;
      });

      const totalPositionValue = updatedPositions.reduce((sum, pos) => sum + pos.marketValue, 0);
      const totalValue = prev.cash + totalPositionValue;
      const dayPnl = updatedPositions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);

      return {
        ...prev,
        positions: updatedPositions,
        totalValue,
        dayPnl
      };
    });
  }, []);

  // Trading Strategies Implementation
  const executeStrategy = useCallback((strategy: TradingStrategy, marketData: MarketData[], stocks: Stock[]) => {
    if (!strategy.isActive) return;

    marketData.forEach(data => {
      const stock = stocks.find(s => s.symbol === data.symbol);
      if (!stock) return;

      const currentPosition = portfolio.positions.find(p => p.symbol === data.symbol);
      
      switch (strategy.name) {
        case 'Moving Average Crossover':
          if (data.indicators.sma20 && data.indicators.sma50) {
            const sma20 = data.indicators.sma20[data.indicators.sma20.length - 1];
            const sma50 = data.indicators.sma50[data.indicators.sma50.length - 1];
            
            if (sma20 > sma50 && !currentPosition) {
              // Buy signal
              const quantity = Math.floor(portfolio.cash * 0.1 / stock.price);
              if (quantity > 0) {
                executeTrade({
                  symbol: data.symbol,
                  type: 'BUY',
                  quantity,
                  price: stock.price,
                  strategy: strategy.name
                });
              }
            } else if (sma20 < sma50 && currentPosition) {
              // Sell signal
              executeTrade({
                symbol: data.symbol,
                type: 'SELL',
                quantity: currentPosition.quantity,
                price: stock.price,
                strategy: strategy.name
              });
            }
          }
          break;

        case 'RSI Mean Reversion':
          if (data.indicators.rsi) {
            const rsi = data.indicators.rsi[data.indicators.rsi.length - 1];
            
            if (rsi < strategy.params.oversoldLevel && !currentPosition) {
              // Buy signal - oversold
              const quantity = Math.floor(portfolio.cash * 0.05 / stock.price);
              if (quantity > 0) {
                executeTrade({
                  symbol: data.symbol,
                  type: 'BUY',
                  quantity,
                  price: stock.price,
                  strategy: strategy.name
                });
              }
            } else if (rsi > strategy.params.overboughtLevel && currentPosition) {
              // Sell signal - overbought
              executeTrade({
                symbol: data.symbol,
                type: 'SELL',
                quantity: currentPosition.quantity,
                price: stock.price,
                strategy: strategy.name
              });
            }
          }
          break;

        case 'Volume Breakout':
          const avgVolume = data.volumes.slice(-20).reduce((sum, vol) => sum + vol, 0) / 20;
          const currentVolume = data.volumes[data.volumes.length - 1];
          const priceChange = Math.abs(stock.changePercent / 100);
          
          if (currentVolume > avgVolume * strategy.params.volumeMultiplier && 
              priceChange > strategy.params.priceThreshold && 
              stock.changePercent > 0 && 
              !currentPosition) {
            // Buy on volume breakout with positive price momentum
            const quantity = Math.floor(portfolio.cash * 0.08 / stock.price);
            if (quantity > 0) {
              executeTrade({
                symbol: data.symbol,
                type: 'BUY',
                quantity,
                price: stock.price,
                strategy: strategy.name
              });
            }
          }
          break;
      }
    });
  }, [portfolio, executeTrade]);

  const toggleStrategy = useCallback((strategyId: string) => {
    setActiveStrategies(prev => 
      prev.map(strategy => 
        strategy.id === strategyId 
          ? { ...strategy, isActive: !strategy.isActive }
          : strategy
      )
    );
  }, []);

  return {
    portfolio,
    trades,
    activeStrategies,
    executeTrade,
    updatePositions,
    executeStrategy,
    toggleStrategy,
    setPortfolio
  };
};