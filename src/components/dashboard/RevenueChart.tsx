import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
  name: string;
  total: number;
  triplek?: number;
  swan?: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  timeframe: 'daily' | 'weekly' | 'monthly';
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, timeframe }) => {
  const getTimeframeText = () => {
    switch (timeframe) {
      case 'daily':
        return 'Last 7 days';
      case 'weekly':
        return 'Last 4 weeks';
      case 'monthly':
        return 'Last 6 months';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>{getTimeframeText()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `KSh ${Number(value).toLocaleString()}`,
                  name === 'triplek' ? 'TrippleK' : name === 'swan' ? 'Swan' : 'Total'
                ]}
              />
              <Bar dataKey="triplek" stackId="a" fill="hsl(var(--triplek))" name="triplek" />
              <Bar dataKey="swan" stackId="a" fill="hsl(var(--swan))" name="swan" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};