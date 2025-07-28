import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TradingStrategy } from '@/types/trading';
import { Bot, Settings, Play, Pause } from 'lucide-react';

interface StrategyPanelProps {
  strategies: TradingStrategy[];
  onToggleStrategy: (strategyId: string) => void;
}

export const StrategyPanel: React.FC<StrategyPanelProps> = ({ strategies, onToggleStrategy }) => {
  return (
    <div className="space-y-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Automated Trading Strategies
          </CardTitle>
          <CardDescription>
            Industry-standard algorithms for automated intraday trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            {strategies.filter(s => s.isActive).length} of {strategies.length} strategies active
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className={`trading-card border-2 ${strategy.isActive ? 'border-profit' : 'border-border'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{strategy.name}</CardTitle>
                <div className="flex items-center gap-2">
                  {strategy.isActive ? (
                    <Play className="h-4 w-4 text-profit" />
                  ) : (
                    <Pause className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={strategy.isActive}
                    onCheckedChange={() => onToggleStrategy(strategy.id)}
                  />
                </div>
              </div>
              <CardDescription>{strategy.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className={`text-sm font-medium ${strategy.isActive ? 'text-profit' : 'text-muted-foreground'}`}>
                  Status: {strategy.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Parameters:</h4>
                  <div className="text-xs space-y-1">
                    {Object.entries(strategy.params).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Strategy Explanations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-profit">Moving Average Crossover</h4>
              <p className="text-muted-foreground">
                Classic momentum strategy that buys when the 20-period SMA crosses above the 50-period SMA 
                and sells when it crosses below. Effective in trending markets.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-profit">RSI Mean Reversion</h4>
              <p className="text-muted-foreground">
                Contrarian strategy that buys oversold stocks (RSI &lt; 30) and sells overbought stocks (RSI &gt; 70). 
                Works well in sideways markets with clear support/resistance levels.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-profit">Volume Breakout</h4>
              <p className="text-muted-foreground">
                Momentum strategy that identifies potential breakouts by monitoring unusual volume spikes 
                combined with significant price movements. Captures early trend reversals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};