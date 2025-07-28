import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStockData } from '@/hooks/useStockData';
import { useTradingEngine } from '@/hooks/useTradingEngine';
import { StockList } from './StockList';
import { Portfolio } from './Portfolio';
import { TradingForm } from './TradingForm';
import { StrategyPanel } from './StrategyPanel';
import { TradeHistory } from './TradeHistory';
import { ChartPanel } from './ChartPanel';
import { TrendingUp, DollarSign, Activity, Target } from 'lucide-react';

export const TradingDashboard: React.FC = () => {
  const { stocks, getMarketData, isLoading } = useStockData();
  const { 
    portfolio, 
    trades, 
    activeStrategies, 
    executeTrade, 
    updatePositions, 
    executeStrategy, 
    toggleStrategy 
  } = useTradingEngine();

  useEffect(() => {
    updatePositions(stocks);
  }, [stocks, updatePositions]);

  useEffect(() => {
    // Execute automated strategies
    const marketDataArray = stocks.map(stock => getMarketData(stock.symbol));
    marketDataArray.forEach((_, index) => {
      activeStrategies.forEach(strategy => {
        if (strategy.isActive) {
          executeStrategy(strategy, [marketDataArray[index]], [stocks[index]]);
        }
      });
    });
  }, [stocks, activeStrategies, executeStrategy, getMarketData]);

  const totalPnlColor = portfolio.dayPnl >= 0 ? 'profit-text' : 'loss-text';
  const pnlIcon = portfolio.dayPnl >= 0 ? 'animate-pulse-profit' : 'animate-pulse-loss';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Trading Dashboard</h1>
            <p className="text-muted-foreground">Professional algorithmic trading platform</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Portfolio Value</div>
            <div className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="trading-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Portfolio total</p>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Day P&L</CardTitle>
              <TrendingUp className={`h-4 w-4 ${portfolio.dayPnl >= 0 ? 'text-profit' : 'text-loss'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalPnlColor} ${pnlIcon}`}>
                {portfolio.dayPnl >= 0 ? '+' : ''}${portfolio.dayPnl.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {((portfolio.dayPnl / portfolio.totalValue) * 100).toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolio.positions.length}</div>
              <p className="text-xs text-muted-foreground">Open positions</p>
            </CardContent>
          </Card>

          <Card className="trading-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeStrategies.filter(s => s.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">Running algorithms</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Market Overview</CardTitle>
                  <CardDescription>Real-time stock prices and movements</CardDescription>
                </CardHeader>
                <CardContent>
                  <StockList stocks={stocks} isLoading={isLoading} />
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Portfolio Summary</CardTitle>
                  <CardDescription>Your current positions and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Portfolio portfolio={portfolio} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trading">
            <TradingForm stocks={stocks} onTrade={executeTrade} />
          </TabsContent>

          <TabsContent value="portfolio">
            <Portfolio portfolio={portfolio} detailed />
          </TabsContent>

          <TabsContent value="strategies">
            <StrategyPanel 
              strategies={activeStrategies} 
              onToggleStrategy={toggleStrategy}
            />
          </TabsContent>

          <TabsContent value="history">
            <TradeHistory trades={trades} />
          </TabsContent>

          <TabsContent value="charts">
            <ChartPanel stocks={stocks} getMarketData={getMarketData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};