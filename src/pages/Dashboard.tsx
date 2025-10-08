import React, { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Users, Package, Calendar, TrendingUp, Scissors, Droplets, AlertTriangle } from 'lucide-react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  totalRevenue: number;
  totalSales: number;
  activeStaff: number;
  lowStockAlerts: number;
  recentSales: any[];
  lowStockItems: any[];
  revenueData: any[];
}

export const Dashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [data, setData] = useState<DashboardData>({
    totalRevenue: 0,
    totalSales: 0,
    activeStaff: 0,
    lowStockAlerts: 0,
    recentSales: [],
    lowStockItems: [],
    revenueData: [],
  });
  const [loading, setLoading] = useState(true);
  const { selectedBusiness } = useBusinessContext();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedBusiness) {
      fetchDashboardData();
    }
  }, [selectedBusiness, timeframe]);

  const fetchDashboardData = async () => {
    if (!selectedBusiness) return;
    
    setLoading(true);
    try {
      const { data: salesData } = await supabase
        .from('sales')
        .select('*, profiles!sales_staff_id_fkey(full_name)')
        .eq('business_id', selectedBusiness.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', selectedBusiness.id);

      // Filter low stock items client-side
      const lowStockProducts = productsData?.filter(p => p.stock_quantity <= p.low_stock_threshold) || [];

      const { data: staffData } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('business_id', selectedBusiness.id);

      const totalRevenue = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

      setData({
        totalRevenue,
        totalSales: salesData?.length || 0,
        activeStaff: staffData?.length || 0,
        lowStockAlerts: lowStockProducts.length,
        recentSales: salesData || [],
        lowStockItems: lowStockProducts,
        revenueData: generateMockRevenueData(timeframe),
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockRevenueData = (timeframe: string) => {
    const mockData = {
      daily: [
        { name: 'Mon', total: 12500 },
        { name: 'Tue', total: 15800 },
        { name: 'Wed', total: 13200 },
        { name: 'Thu', total: 16500 },
        { name: 'Fri', total: 19200 },
        { name: 'Sat', total: 22000 },
        { name: 'Sun', total: 18500 },
      ],
      weekly: [
        { name: 'Week 1', total: 85000 },
        { name: 'Week 2', total: 92000 },
        { name: 'Week 3', total: 88000 },
        { name: 'Week 4', total: 95000 },
      ],
      monthly: [
        { name: 'Jan', total: 340000 },
        { name: 'Feb', total: 360000 },
        { name: 'Mar', total: 380000 },
        { name: 'Apr', total: 395000 },
        { name: 'May', total: 410000 },
        { name: 'Jun', total: 425000 },
      ],
    };
    return mockData[timeframe];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Please select a business to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with {selectedBusiness.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`KSh ${data.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Total Sales"
          value={data.totalSales}
          icon={ShoppingCart}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Active Staff"
          value={data.activeStaff}
          icon={Users}
        />
        <StatsCard
          title="Low Stock Alerts"
          value={data.lowStockAlerts}
          icon={AlertTriangle}
          className={data.lowStockAlerts > 0 ? 'border-warning' : ''}
        />
      </div>

      <RevenueChart data={data.revenueData} timeframe={timeframe} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest transactions from {selectedBusiness.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentSales.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sales yet</p>
              ) : (
                data.recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        selectedBusiness.type === 'triplek' ? 'bg-triplek text-triplek-foreground' : 'bg-swan text-swan-foreground'
                      }`}>
                        {selectedBusiness.type === 'triplek' ? <Scissors className="h-4 w-4" /> : <Droplets className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">
                          {sale.profiles?.full_name || 'Staff Member'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sale.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">KSh {Number(sale.total_amount).toLocaleString()}</p>
                      <Badge variant="outline" className="mt-1">
                        {sale.payment_method}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {data.lowStockItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                All items are well stocked
              </p>
            ) : (
              <div className="space-y-3">
                {data.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-warning/20 rounded-lg bg-warning/5">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {item.stock_quantity} • Threshold: {item.low_stock_threshold}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-warning text-warning">
                      Low Stock
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};