import React from 'react';
import { Stock } from '@/types/trading';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StockListProps {
  stocks: Stock[];
  isLoading: boolean;
}

export const StockList: React.FC<StockListProps> = ({ stocks, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-4">Loading stocks...</div>;
  }

  return (
    <div className="space-y-3">
      {stocks.map((stock) => (
        <div
          key={stock.symbol}
          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{stock.symbol}</h4>
              {stock.changePercent >= 0 ? (
                <TrendingUp className="h-4 w-4 text-profit" />
              ) : (
                <TrendingDown className="h-4 w-4 text-loss" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
          </div>
          
          <div className="text-right">
            <div className="font-bold text-foreground">
              ${stock.price.toFixed(2)}
            </div>
            <div className={`text-sm ${stock.changePercent >= 0 ? 'profit-text' : 'loss-text'}`}>
              {stock.changePercent >= 0 ? '+' : ''}${stock.change.toFixed(2)} 
              ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};