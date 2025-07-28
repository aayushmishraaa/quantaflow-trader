import React from 'react';
import { Portfolio as PortfolioType } from '@/types/trading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioProps {
  portfolio: PortfolioType;
  detailed?: boolean;
}

export const Portfolio: React.FC<PortfolioProps> = ({ portfolio, detailed = false }) => {
  if (!detailed) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Cash</div>
            <div className="text-lg font-bold">${portfolio.cash.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Positions</div>
            <div className="text-lg font-bold">{portfolio.positions.length}</div>
          </div>
        </div>
        
        {portfolio.positions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Top Positions</h4>
            {portfolio.positions.slice(0, 3).map((position) => (
              <div key={position.symbol} className="flex justify-between items-center p-2 rounded border border-border">
                <div>
                  <div className="font-medium">{position.symbol}</div>
                  <div className="text-sm text-muted-foreground">{position.quantity} shares</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${position.marketValue.toFixed(2)}</div>
                  <div className={`text-sm ${position.unrealizedPnl >= 0 ? 'profit-text' : 'loss-text'}`}>
                    {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="text-xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Cash Available</div>
              <div className="text-xl font-bold">${portfolio.cash.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Day P&L</div>
              <div className={`text-xl font-bold ${portfolio.dayPnl >= 0 ? 'profit-text' : 'loss-text'}`}>
                {portfolio.dayPnl >= 0 ? '+' : ''}${portfolio.dayPnl.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total P&L</div>
              <div className={`text-xl font-bold ${portfolio.totalPnl >= 0 ? 'profit-text' : 'loss-text'}`}>
                {portfolio.totalPnl >= 0 ? '+' : ''}${portfolio.totalPnl.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Positions ({portfolio.positions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio.positions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No open positions
            </div>
          ) : (
            <div className="space-y-3">
              {portfolio.positions.map((position) => (
                <div
                  key={position.symbol}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{position.symbol}</h4>
                      {position.unrealizedPnl >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-profit" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-loss" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {position.quantity} shares @ ${position.avgPrice.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="text-center mx-4">
                    <div className="text-sm text-muted-foreground">Current</div>
                    <div className="font-medium">${position.currentPrice.toFixed(2)}</div>
                  </div>
                  
                  <div className="text-center mx-4">
                    <div className="text-sm text-muted-foreground">Market Value</div>
                    <div className="font-medium">${position.marketValue.toFixed(2)}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold ${position.unrealizedPnl >= 0 ? 'profit-text' : 'loss-text'}`}>
                      {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                    </div>
                    <div className={`text-sm ${position.unrealizedPnlPercent >= 0 ? 'profit-text' : 'loss-text'}`}>
                      ({position.unrealizedPnlPercent >= 0 ? '+' : ''}{position.unrealizedPnlPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};