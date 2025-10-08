import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, Search, Phone, MapPin, Package, Award } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Customer {
  id: string;
  first_name: string;
  phone: string;
  email?: string;
  address?: string;
  landmark?: string;
  notes?: string;
  total_orders: number;
  business_id: string;
  created_at: string;
}

interface CustomerOrder {
  id: string;
  total_amount: number;
  created_at: string;
  status: string;
  payment_method: string;
}

export const Customers: React.FC = () => {
  const { selectedBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    phone: '',
    email: '',
    address: '',
    landmark: '',
    notes: '',
  });

  useEffect(() => {
    if (selectedBusiness) {
      fetchCustomers();
    }
  }, [selectedBusiness]);

  const fetchCustomers = async () => {
    if (!selectedBusiness) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', selectedBusiness.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
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

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('id, total_amount, created_at, status, payment_method')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddCustomer = async () => {
    if (!selectedBusiness || !formData.first_name || !formData.phone) {
      toast({
        title: 'Error',
        description: 'Name and phone are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('customers').insert([
        {
          ...formData,
          business_id: selectedBusiness.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Customer added successfully',
      });

      setIsAddDialogOpen(false);
      setFormData({
        first_name: '',
        phone: '',
        email: '',
        address: '',
        landmark: '',
        notes: '',
      });
      fetchCustomers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getLoyaltyBadge = (totalOrders: number) => {
    if (totalOrders >= 50) return { label: 'Gold', color: 'bg-yellow-500' };
    if (totalOrders >= 20) return { label: 'Silver', color: 'bg-gray-400' };
    if (totalOrders >= 5) return { label: 'Bronze', color: 'bg-orange-600' };
    return null;
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

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
            <Users className="h-8 w-8" />
            Customer Database
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer relationships
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label>Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0712345678"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Delivery address"
                />
              </div>
              <div>
                <Label>Landmark</Label>
                <Input
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Near..."
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              <Button onClick={handleAddCustomer} className="w-full">
                Add Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Loyalty</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const loyalty = getLoyaltyBadge(customer.total_orders);
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.first_name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                          {customer.email && (
                            <div className="text-xs text-muted-foreground">{customer.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {customer.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {customer.address}
                            </div>
                          )}
                          {customer.landmark && (
                            <div className="text-xs text-muted-foreground">{customer.landmark}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          <span className="font-semibold">{customer.total_orders}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {loyalty && (
                          <Badge className={loyalty.color}>
                            <Award className="h-3 w-3 mr-1" />
                            {loyalty.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            fetchCustomerOrders(customer.id);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedCustomer.first_name}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedCustomer.phone}</p>
                </div>
                {selectedCustomer.email && (
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                )}
                <div>
                  <Label>Total Orders</Label>
                  <p className="font-medium">{selectedCustomer.total_orders}</p>
                </div>
              </div>

              {selectedCustomer.address && (
                <div>
                  <Label>Address</Label>
                  <p className="font-medium">{selectedCustomer.address}</p>
                  {selectedCustomer.landmark && (
                    <p className="text-sm text-muted-foreground">Near: {selectedCustomer.landmark}</p>
                  )}
                </div>
              )}

              {selectedCustomer.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm">{selectedCustomer.notes}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Order History</h3>
                {customerOrders.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No orders yet</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">KSh {order.total_amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()} • {order.payment_method}
                          </p>
                        </div>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
