import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Stock, MarketData } from '@/types/trading';
import { BarChart3 } from 'lucide-react';

interface ChartPanelProps {
  stocks: Stock[];
  getMarketData: (symbol: string) => MarketData;
}

export const ChartPanel: React.FC<ChartPanelProps> = ({ stocks, getMarketData }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(stocks[0]?.symbol || '');
  
  const chartData = useMemo(() => {
    if (!selectedSymbol) return [];
    
    const marketData = getMarketData(selectedSymbol);
    const currentStock = stocks.find(s => s.symbol === selectedSymbol);
    
    return marketData.timestamps.map((timestamp, index) => ({
      time: timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      price: marketData.prices[index],
      volume: marketData.volumes[index],
      sma20: marketData.indicators.sma20?.[0] || null,
      sma50: marketData.indicators.sma50?.[0] || null,
      rsi: marketData.indicators.rsi?.[0] || null
    })).slice(-50); // Show last 50 data points
  }, [selectedSymbol, getMarketData, stocks]);

  const currentStock = stocks.find(s => s.symbol === selectedSymbol);

  return (
    <div className="space-y-6">
      <Card className="trading-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Price Chart
            </CardTitle>
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select stock" />
              </SelectTrigger>
              <SelectContent>
                {stocks.map((stock) => (
                  <SelectItem key={stock.symbol} value={stock.symbol}>
                    {stock.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {currentStock && (
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{currentStock.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{currentStock.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${currentStock.price.toFixed(2)}</div>
                  <div className={`text-sm ${currentStock.changePercent >= 0 ? 'profit-text' : 'loss-text'}`}>
                    {currentStock.changePercent >= 0 ? '+' : ''}${currentStock.change.toFixed(2)} 
                    ({currentStock.changePercent >= 0 ? '+' : ''}{currentStock.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                
                {/* Price Line */}
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name="Price"
                />
                
                {/* Moving Averages */}
                {chartData.some(d => d.sma20) && (
                  <Line
                    type="monotone"
                    dataKey="sma20"
                    stroke="hsl(var(--profit))"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="SMA 20"
                  />
                )}
                
                {chartData.some(d => d.sma50) && (
                  <Line
                    type="monotone"
                    dataKey="sma50"
                    stroke="hsl(var(--warning))"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="SMA 50"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-sm">RSI (14)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {chartData[chartData.length - 1]?.rsi?.toFixed(2) || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">
                {chartData[chartData.length - 1]?.rsi < 30 && 'Oversold'}
                {chartData[chartData.length - 1]?.rsi > 70 && 'Overbought'}
                {chartData[chartData.length - 1]?.rsi >= 30 && chartData[chartData.length - 1]?.rsi <= 70 && 'Neutral'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-sm">SMA 20</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                ${chartData[chartData.length - 1]?.sma20?.toFixed(2) || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">
                20-period moving average
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="text-sm">Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {currentStock?.volume.toLocaleString() || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">
                Today's volume
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};