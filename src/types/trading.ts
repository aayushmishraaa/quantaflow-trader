export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  dayHigh: number;
  dayLow: number;
  week52High: number;
  week52Low: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: Date;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  strategy?: string;
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  marketValue: number;
}

export interface Portfolio {
  totalValue: number;
  cash: number;
  dayPnl: number;
  totalPnl: number;
  positions: Position[];
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  params: Record<string, any>;
}

export interface MarketData {
  symbol: string;
  prices: number[];
  volumes: number[];
  timestamps: Date[];
  indicators: {
    sma20?: number[];
    sma50?: number[];
    rsi?: number[];
    macd?: number[];
    bollinger?: {
      upper: number[];
      middle: number[];
      lower: number[];
    };
  };
}

export interface Alert {
  id: string;
  symbol: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'VOLUME_SPIKE' | 'RSI_OVERSOLD' | 'RSI_OVERBOUGHT';
  condition: number;
  isActive: boolean;
  timestamp: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  accountType: 'DEMO' | 'LIVE';
  portfolio: Portfolio;
  watchlist: string[];
  strategies: TradingStrategy[];
  alerts: Alert[];
}