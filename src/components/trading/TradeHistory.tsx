import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/types/trading';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface TradeHistoryProps {
  trades: Trade[];
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Trade History ({trades.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No trades executed yet
          </div>
        ) : (
          <div className="space-y-3">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${trade.type === 'BUY' ? 'bg-profit/10' : 'bg-loss/10'}`}>
                    {trade.type === 'BUY' ? (
                      <TrendingUp className="h-4 w-4 text-profit" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-loss" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{trade.symbol}</span>
                      <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                        {trade.type}
                      </Badge>
                      {trade.strategy && (
                        <Badge variant="outline" className="text-xs">
                          {trade.strategy}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trade.quantity} shares @ ${trade.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    ${(trade.quantity * trade.price).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(trade.timestamp)} {formatTime(trade.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {trades.length > 10 && (
              <div className="text-center pt-4">
                <button className="text-primary hover:underline text-sm">
                  Load more trades
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};