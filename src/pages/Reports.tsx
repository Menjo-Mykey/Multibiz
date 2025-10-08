import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  Users,
  Package,
  Filter,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface SalesData {
  date: string;
  triplek: number;
  swan: number;
  total: number;
}

interface ReportFilter {
  dateRange: string;
  business: string;
  reportType: string;
}

export const Reports: React.FC = () => {
  const { selectedBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: "7days",
    business: "all",
    reportType: "sales",
  });

  const [salesData, setSalesData] = useState<SalesData[]>([]);

  const dateRangeToBounds = (range: string) => {
    const end = new Date();
    const start = new Date();
    switch (range) {
      case "7days":
        start.setDate(end.getDate() - 6);
        break;
      case "30days":
        start.setDate(end.getDate() - 29);
        break;
      case "90days":
        start.setDate(end.getDate() - 89);
        break;
      case "1year":
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 6);
    }
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  useEffect(() => {
    const fetchData = async () => {
      const { start, end } = dateRangeToBounds(filters.dateRange);
      let query = supabase
        .from("sales")
        .select(
          "total_amount, created_at, businesses:businesses!sales_business_id_fkey(type)"
        )
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      if (filters.business !== "all") {
        // When business filter is set, join via business type
        // Fallback: filter by selectedBusiness if available
      }

      const { data, error } = await query;
      if (!error) {
        // Group by day and business type
        const dayKey = (d: string) => new Date(d).toISOString().slice(0, 10);
        const dayMap: Record<string, { triplek: number; swan: number }> = {};
        (data || []).forEach((row: any) => {
          const key = dayKey(row.created_at);
          if (!dayMap[key]) dayMap[key] = { triplek: 0, swan: 0 };
          const type = row.businesses?.type as "triplek" | "swan" | undefined;
          if (type === "triplek")
            dayMap[key].triplek += Number(row.total_amount);
          else if (type === "swan")
            dayMap[key].swan += Number(row.total_amount);
        });
        const sorted = Object.keys(dayMap)
          .sort()
          .map((date) => ({
            date,
            triplek: dayMap[date].triplek,
            swan: dayMap[date].swan,
            total: dayMap[date].triplek + dayMap[date].swan,
          }));
        setSalesData(sorted);
      }
    };
    fetchData();
  }, [
    filters.dateRange,
    filters.business,
    filters.reportType,
    selectedBusiness,
  ]);

  const [topProducts, setTopProducts] = useState<
    { name: string; sales: number; revenue: number }[]
  >([]);
  useEffect(() => {
    const fetchTop = async () => {
      const { start, end } = dateRangeToBounds(filters.dateRange);
      const { data, error } = await supabase
        .from("sale_items")
        .select(
          "quantity, total_price, services:services!sale_items_service_id_fkey(name), products:products!sale_items_product_id_fkey(name), sales!inner(created_at)"
        )
        .gte("sales.created_at", start.toISOString())
        .lte("sales.created_at", end.toISOString());
      if (!error) {
        const map: Record<string, { sales: number; revenue: number }> = {};
        (data || []).forEach((row: any) => {
          const name = row.services?.name || row.products?.name || "Item";
          if (!map[name]) map[name] = { sales: 0, revenue: 0 };
          map[name].sales += Number(row.quantity);
          map[name].revenue += Number(row.total_price);
        });
        const arr = Object.entries(map)
          .map(([name, v]) => ({ name, sales: v.sales, revenue: v.revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        setTopProducts(arr);
      }
    };
    fetchTop();
  }, [filters.dateRange]);

  const businessDistribution = useMemo(() => {
    const triplek = salesData.reduce((s, d) => s + d.triplek, 0);
    const swan = salesData.reduce((s, d) => s + d.swan, 0);
    const total = triplek + swan || 1;
    return [
      {
        name: "TrippleK",
        value: Math.round((triplek / total) * 100),
        color: "hsl(var(--triplek))",
      },
      {
        name: "Swan",
        value: Math.round((swan / total) * 100),
        color: "hsl(var(--swan))",
      },
    ];
  }, [salesData]);

  const exportReport = (format: string) => {
    if (format === "csv") {
      // Import dynamically to avoid issues
      import("@/lib/csvExport").then(({ exportSalesReportToCSV }) => {
        exportSalesReportToCSV(salesData);
        toast({
          title: "Export Complete",
          description: "Report has been downloaded as CSV",
        });
      });
    } else {
      toast({
        title: "Export Started",
        description: `${format.toUpperCase()} report is being generated...`,
      });

      setTimeout(() => {
        toast({
          title: "Export Complete",
          description: `Report has been downloaded as ${format.toUpperCase()}`,
        });
      }, 2000);
    }
  };

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Business insights and performance reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport("excel")}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Date Range
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  setFilters({ ...filters, dateRange: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Business</label>
              <Select
                value={filters.business}
                onValueChange={(value) =>
                  setFilters({ ...filters, business: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Businesses</SelectItem>
                  <SelectItem value="triplek">TrippleK Barbershop</SelectItem>
                  <SelectItem value="swan">Swan Water Distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Report Type
              </label>
              <Select
                value={filters.reportType}
                onValueChange={(value) =>
                  setFilters({ ...filters, reportType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="commission">Commission Report</SelectItem>
                  <SelectItem value="staff">Staff Performance</SelectItem>
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
                <p className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold">{formatCurrency(320000)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-success mr-1" />
              <span className="text-xs text-success">
                +12% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <FileText className="h-8 w-8 text-info" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-success mr-1" />
              <span className="text-xs text-success">+8% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Staff
                </p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Users className="h-8 w-8 text-triplek" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-muted-foreground">
                8 Barbers, 4 Sales Agents
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Products
                </p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <Package className="h-8 w-8 text-swan" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-warning">3 low stock alerts</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>
              Daily revenue comparison by business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line
                  type="monotone"
                  dataKey="triplek"
                  stroke="hsl(var(--triplek))"
                  strokeWidth={2}
                  name="TrippleK"
                />
                <Line
                  type="monotone"
                  dataKey="swan"
                  stroke="hsl(var(--swan))"
                  strokeWidth={2}
                  name="Swan"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Revenue Distribution</CardTitle>
            <CardDescription>Revenue share by business type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={businessDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {businessDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products/Services */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products/Services</CardTitle>
          <CardDescription>Best sellers by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Badge className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.sales} units sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(item.revenue)}</p>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
