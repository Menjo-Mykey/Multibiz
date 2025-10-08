import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Phone, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Delivery {
  id: string;
  delivery_address: string;
  landmark: string | null;
  scheduled_date: string | null;
  scheduled_time: string | null;
  status: string;
  notes: string | null;
  delivery_fee: number;
  sales: {
    total_amount: number;
    customers: {
      first_name: string;
      phone: string;
    } | null;
  };
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDeliveries();
      subscribeToDeliveries();
    }
  }, [user]);

  const fetchDeliveries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        sales (
          total_amount,
          customers (
            first_name,
            phone
          )
        )
      `)
      .eq('driver_id', user.id)
      .in('status', ['pending', 'out_for_delivery'])
      .order('scheduled_date', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load deliveries",
        variant: "destructive",
      });
    } else {
      setDeliveries(data || []);
    }
  };

  const subscribeToDeliveries = () => {
    const channel = supabase
      .channel('driver-deliveries')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deliveries',
          filter: `driver_id=eq.${user?.id}`,
        },
        () => {
          fetchDeliveries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleUpdateStatus = async () => {
    if (!selectedDelivery || !newStatus) return;
    setLoading(true);

    const updates: any = {
      status: newStatus,
    };

    if (newStatus === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    if (newStatus === 'failed' && failureReason) {
      updates.failure_reason = failureReason;
    }

    const { error } = await supabase
      .from('deliveries')
      .update(updates)
      .eq('id', selectedDelivery.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Delivery status updated successfully",
      });

      // Note: Sale status would need the actual sale_id, not total_amount

      setIsDialogOpen(false);
      setSelectedDelivery(null);
      setNewStatus('');
      setFailureReason('');
      await fetchDeliveries();
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Pending' },
      out_for_delivery: { variant: 'default', label: 'Out for Delivery' },
      delivered: { variant: 'default', label: 'Delivered', className: 'bg-green-600' },
      failed: { variant: 'destructive', label: 'Failed' },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const pendingCount = deliveries.filter(d => d.status === 'pending').length;
  const outForDeliveryCount = deliveries.filter(d => d.status === 'out_for_delivery').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Driver Dashboard</h1>
        <p className="text-muted-foreground">Manage your delivery routes</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pending Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Out for Delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{outForDeliveryCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Deliveries</CardTitle>
          <CardDescription>Your assigned delivery routes</CardDescription>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No deliveries assigned</p>
          ) : (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <Card key={delivery.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(delivery.status)}
                          {delivery.scheduled_time && (
                            <Badge variant="outline">
                              <Clock className="mr-1 h-3 w-3" />
                              {delivery.scheduled_time}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg">
                          {delivery.sales.customers?.first_name || 'Walk-in Customer'}
                        </h3>
                        <div className="space-y-2 mt-3">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p>{delivery.delivery_address}</p>
                              {delivery.landmark && (
                                <p className="text-muted-foreground">Landmark: {delivery.landmark}</p>
                              )}
                            </div>
                          </div>
                          {delivery.sales.customers?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <p>{delivery.sales.customers.phone}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">
                            Amount: <span className="font-medium text-foreground">KSh {delivery.sales.total_amount.toFixed(2)}</span>
                          </p>
                          {delivery.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Notes: {delivery.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Dialog open={isDialogOpen && selectedDelivery?.id === delivery.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (!open) {
                        setSelectedDelivery(null);
                        setNewStatus('');
                        setFailureReason('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setNewStatus('');
                            setIsDialogOpen(true);
                          }}
                        >
                          Update Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Delivery Status</DialogTitle>
                          <DialogDescription>
                            Change the status of this delivery
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>New Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {newStatus === 'failed' && (
                            <div className="space-y-2">
                              <Label>Failure Reason</Label>
                              <Textarea
                                value={failureReason}
                                onChange={(e) => setFailureReason(e.target.value)}
                                placeholder="Why did the delivery fail?"
                                rows={3}
                              />
                            </div>
                          )}

                          <Button
                            onClick={handleUpdateStatus}
                            disabled={loading || !newStatus || (newStatus === 'failed' && !failureReason)}
                            className="w-full"
                          >
                            {newStatus === 'delivered' && <CheckCircle className="mr-2 h-4 w-4" />}
                            {newStatus === 'failed' && <XCircle className="mr-2 h-4 w-4" />}
                            Update Status
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
