import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import {
  Calculator,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Download,
  CheckCircle,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Commission {
  id: string;
  barberId: string;
  barberName: string;
  saleId: string;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'paid';
  saleDate: string;
  customerName?: string;
}

interface BarberSummary {
  id: string;
  name: string;
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  salesCount: number;
}

export const Commission: React.FC = () => {
  const { selectedBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedBarber, setSelectedBarber] = useState('all');

  // Mock data - in real app, this would come from Supabase
  const commissions: Commission[] = [
    {
      id: '1',
      barberId: '1',
      barberName: 'Mike Johnson',
      saleId: 'S001',
      saleAmount: 1500,
      commissionRate: 40,
      commissionAmount: 600,
      status: 'pending',
      saleDate: '2024-01-15',
      customerName: 'John Doe'
    },
    {
      id: '2',
      barberId: '1',
      barberName: 'Mike Johnson',
      saleId: 'S002',
      saleAmount: 800,
      commissionRate: 40,
      commissionAmount: 320,
      status: 'paid',
      saleDate: '2024-01-14',
      customerName: 'Jane Smith'
    },
    {
      id: '3',
      barberId: '2',
      barberName: 'David Brown',
      saleId: 'S003',
      saleAmount: 1200,
      commissionRate: 35,
      commissionAmount: 420,
      status: 'pending',
      saleDate: '2024-01-15',
      customerName: 'Bob Wilson'
    },
    {
      id: '4',
      barberId: '3',
      barberName: 'Alex Wilson',
      saleId: 'S004',
      saleAmount: 2000,
      commissionRate: 45,
      commissionAmount: 900,
      status: 'pending',
      saleDate: '2024-01-15',
      customerName: 'Sarah Johnson'
    },
  ];

  // Calculate barber summaries
  const barberSummaries: BarberSummary[] = [
    {
      id: '1',
      name: 'Mike Johnson',
      commissionRate: 40,
      totalSales: 15000,
      totalCommission: 6000,
      pendingCommission: 2400,
      paidCommission: 3600,
      salesCount: 12
    },
    {
      id: '2',
      name: 'David Brown',
      commissionRate: 35,
      totalSales: 12000,
      totalCommission: 4200,
      pendingCommission: 1800,
      paidCommission: 2400,
      salesCount: 10
    },
    {
      id: '3',
      name: 'Alex Wilson',
      commissionRate: 45,
      totalSales: 18000,
      totalCommission: 8100,
      pendingCommission: 3200,
      paidCommission: 4900,
      salesCount: 15
    },
  ];

  const chartData = barberSummaries.map(barber => ({
    name: barber.name.split(' ')[0],
    pending: barber.pendingCommission,
    paid: barber.paidCommission,
    total: barber.totalCommission
  }));

  const filteredCommissions = commissions.filter(commission => {
    if (selectedBarber !== 'all' && commission.barberId !== selectedBarber) {
      return false;
    }
    return true;
  });

  const payCommission = (commissionId: string) => {
    toast({
      title: "Commission Paid",
      description: "Commission has been marked as paid",
    });
  };

  const payAllPendingForBarber = (barberId: string) => {
    toast({
      title: "All Commissions Paid",
      description: "All pending commissions for this barber have been paid",
    });
  };

  const exportCommissionReport = () => {
    toast({
      title: "Export Started",
      description: "Commission report is being generated...",
    });
  };

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;

  if (!selectedBusiness || selectedBusiness.type !== 'triplek') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select TrippleK Barbershop to access commission tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Commission Management</h1>
          <p className="text-muted-foreground">Track and manage barber commissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCommissionReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisWeek">This Week</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Barber</label>
              <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Barbers</SelectItem>
                  {barberSummaries.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
                <p className="text-2xl font-bold">{formatCurrency(18300)}</p>
              </div>
              <Calculator className="h-8 w-8 text-triplek" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{formatCurrency(7400)}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(10900)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Barbers</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Users className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Overview by Barber</CardTitle>
          <CardDescription>Pending vs paid commissions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="pending" fill="hsl(var(--warning))" name="Pending" />
              <Bar dataKey="paid" fill="hsl(var(--success))" name="Paid" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Barber Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {barberSummaries.map((barber) => (
          <Card key={barber.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {barber.name}
                <Badge className="bg-triplek text-triplek-foreground">
                  {barber.commissionRate}%
                </Badge>
              </CardTitle>
              <CardDescription>{barber.salesCount} sales this period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Sales</p>
                  <p className="font-bold">{formatCurrency(barber.totalSales)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Commission</p>
                  <p className="font-bold">{formatCurrency(barber.totalCommission)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pending</p>
                  <p className="font-bold text-warning">{formatCurrency(barber.pendingCommission)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paid</p>
                  <p className="font-bold text-success">{formatCurrency(barber.paidCommission)}</p>
                </div>
              </div>
              
              {barber.pendingCommission > 0 && (
                <Button 
                  onClick={() => payAllPendingForBarber(barber.id)}
                  className="w-full"
                  size="sm"
                >
                  Pay Pending {formatCurrency(barber.pendingCommission)}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Individual Commissions */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Commission Records</CardTitle>
          <CardDescription>Detailed commission breakdown by sale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCommissions.map((commission) => (
              <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{commission.barberName}</p>
                      <p className="text-sm text-muted-foreground">
                        Sale #{commission.saleId} • {commission.saleDate}
                      </p>
                      {commission.customerName && (
                        <p className="text-sm text-muted-foreground">
                          Customer: {commission.customerName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right mr-4">
                  <p className="font-medium">{formatCurrency(commission.saleAmount)}</p>
                  <p className="text-sm text-muted-foreground">Sale Amount</p>
                </div>
                
                <div className="text-right mr-4">
                  <p className="font-bold">{formatCurrency(commission.commissionAmount)}</p>
                  <p className="text-sm text-muted-foreground">{commission.commissionRate}% commission</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={commission.status === 'paid' ? 'default' : 'secondary'}>
                    {commission.status}
                  </Badge>
                  {commission.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => payCommission(commission.id)}
                    >
                      Pay
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};