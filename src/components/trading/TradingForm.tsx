import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stock, Trade } from '@/types/trading';
import { ShoppingCart, DollarSign } from 'lucide-react';

interface TradingFormProps {
  stocks: Stock[];
  onTrade: (trade: Omit<Trade, 'id' | 'timestamp' | 'status'>) => boolean;
}

export const TradingForm: React.FC<TradingFormProps> = ({ stocks, onTrade }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<string>('');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState<string>('');

  const selectedStock = stocks.find(s => s.symbol === selectedSymbol);
  const currentPrice = selectedStock?.price || 0;
  const totalValue = parseFloat(quantity) * (orderType === 'LIMIT' ? parseFloat(limitPrice) : currentPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSymbol || !quantity) return;

    const price = orderType === 'LIMIT' ? parseFloat(limitPrice) : currentPrice;
    
    const success = onTrade({
      symbol: selectedSymbol,
      type: tradeType,
      quantity: parseInt(quantity),
      price: price
    });

    if (success) {
      setQuantity('');
      setLimitPrice('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Place Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tradeType">Order Type</Label>
                <Select value={tradeType} onValueChange={(value: 'BUY' | 'SELL') => setTradeType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">Buy</SelectItem>
                    <SelectItem value="SELL">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="orderType">Execution</Label>
                <Select value={orderType} onValueChange={(value: 'MARKET' | 'LIMIT') => setOrderType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKET">Market</SelectItem>
                    <SelectItem value="LIMIT">Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a stock" />
                </SelectTrigger>
                <SelectContent>
                  {stocks.map((stock) => (
                    <SelectItem key={stock.symbol} value={stock.symbol}>
                      {stock.symbol} - ${stock.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Number of shares"
                />
              </div>
              
              {orderType === 'LIMIT' && (
                <div>
                  <Label htmlFor="limitPrice">Limit Price</Label>
                  <Input
                    id="limitPrice"
                    type="number"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="Price per share"
                  />
                </div>
              )}
            </div>

            {selectedStock && quantity && (
              <div className="p-4 bg-accent/10 rounded-lg">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Stock:</span>
                    <span>{selectedStock.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Price:</span>
                    <span>${selectedStock.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantity:</span>
                    <span>{quantity} shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Execute Price:</span>
                    <span>${(orderType === 'LIMIT' ? parseFloat(limitPrice) || 0 : currentPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Total Value:</span>
                    <span>${isNaN(totalValue) ? '0.00' : totalValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className={`w-full ${tradeType === 'BUY' ? 'btn-profit' : 'btn-loss'}`}
              disabled={!selectedSymbol || !quantity || (orderType === 'LIMIT' && !limitPrice)}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {tradeType === 'BUY' ? 'Buy' : 'Sell'} {selectedSymbol}
            </Button>
          </form>
        </CardContent>
      </Card>

      {selectedStock && (
        <Card className="trading-card">
          <CardHeader>
            <CardTitle>{selectedStock.symbol} Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedStock.name}</h3>
                <div className="text-2xl font-bold">
                  ${selectedStock.price.toFixed(2)}
                  <span className={`ml-2 text-lg ${selectedStock.changePercent >= 0 ? 'profit-text' : 'loss-text'}`}>
                    {selectedStock.changePercent >= 0 ? '+' : ''}${selectedStock.change.toFixed(2)} 
                    ({selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Day High</div>
                  <div className="font-medium">${selectedStock.dayHigh.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Day Low</div>
                  <div className="font-medium">${selectedStock.dayLow.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">52W High</div>
                  <div className="font-medium">${selectedStock.week52High.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">52W Low</div>
                  <div className="font-medium">${selectedStock.week52Low.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Volume</div>
                  <div className="font-medium">{selectedStock.volume.toLocaleString()}</div>
                </div>
                {selectedStock.pe && (
                  <div>
                    <div className="text-muted-foreground">P/E Ratio</div>
                    <div className="font-medium">{selectedStock.pe.toFixed(2)}</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};