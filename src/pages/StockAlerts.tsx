import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Package, TrendingDown, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StockAlert {
  id: string;
  name: string;
  quantity: number;
  low_stock_threshold: number;
  unit: string;
  category?: string;
}

export const StockAlerts: React.FC = () => {
  const { selectedBusiness } = useBusinessContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [criticalCount, setCriticalCount] = useState(0);
  const [lowCount, setLowCount] = useState(0);

  useEffect(() => {
    if (selectedBusiness) {
      fetchStockAlerts();
    }
  }, [selectedBusiness]);

  const fetchStockAlerts = async () => {
    if (!selectedBusiness) return;

    try {
      setLoading(true);
      
      // Fetch inventory items with low stock
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, quantity, low_stock_threshold, unit, category')
        .eq('business_id', selectedBusiness.id)
        .eq('is_active', true)
        .order('quantity', { ascending: true });

      if (error) throw error;

      // Filter items below threshold
      const lowStockItems = (data || []).filter(
        (item) => item.quantity <= item.low_stock_threshold
      );

      setAlerts(lowStockItems);

      // Count critical (below 50) and low (50-100)
      const critical = lowStockItems.filter((item) => item.quantity < 50).length;
      const low = lowStockItems.filter(
        (item) => item.quantity >= 50 && item.quantity <= item.low_stock_threshold
      ).length;

      setCriticalCount(critical);
      setLowCount(low);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAlertLevel = (quantity: number) => {
    if (quantity < 50) return { level: 'critical', color: 'bg-red-500', label: 'Critical' };
    if (quantity < 100) return { level: 'low', color: 'bg-yellow-500', label: 'Low' };
    return { level: 'normal', color: 'bg-green-500', label: 'Normal' };
  };

  const getStockPercentage = (quantity: number, threshold: number) => {
    return Math.round((quantity / threshold) * 100);
  };

  if (!selectedBusiness) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please select a business</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            Stock Alerts
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor low stock items across your inventory
          </p>
        </div>

        <Button onClick={() => navigate('/inventory')}>
          <Package className="h-4 w-4 mr-2" />
          Go to Inventory
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Items below threshold
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700">Critical Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{criticalCount}</div>
            <p className="text-xs text-red-600 mt-1">
              Below 50 units
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-700">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{lowCount}</div>
            <p className="text-xs text-yellow-600 mt-1">
              50-100 units
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">All stock levels are healthy!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stock Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => {
                  const alertLevel = getAlertLevel(alert.quantity);
                  const percentage = getStockPercentage(alert.quantity, alert.low_stock_threshold);
                  
                  return (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.name}</TableCell>
                      <TableCell>{alert.category || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{alert.quantity}</span>
                          <span className="text-muted-foreground text-sm">{alert.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-muted-foreground" />
                          <span>{alert.low_stock_threshold} {alert.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={alertLevel.color}>
                          {alertLevel.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${alertLevel.color}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Action Required</h3>
                <p className="text-sm text-blue-700 mb-3">
                  You have {alerts.length} item{alerts.length > 1 ? 's' : ''} that need restocking.
                  Consider creating purchase orders to replenish inventory.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/suppliers')}
                  className="border-blue-300"
                >
                  Create Purchase Order
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
