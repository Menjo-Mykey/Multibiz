import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  stock_quantity: number;
}

interface Customer {
  id: string;
  first_name: string;
  phone: string;
}

interface DeliveryItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export default function Deliveries() {
  const { user } = useAuth();
  const { selectedBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [notes, setNotes] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [items, setItems] = useState<DeliveryItem[]>([]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchProducts();
      fetchCustomers();
      fetchDrivers();
    }
  }, [selectedBusiness]);

  const fetchProducts = async () => {
    if (!selectedBusiness) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', selectedBusiness.id)
      .eq('is_active', true)
      .order('size');

    if (!error) setProducts(data || []);
  };

  const fetchCustomers = async () => {
    if (!selectedBusiness) return;

    const { data, error } = await supabase
      .from('customers')
      .select('id, first_name, phone')
      .eq('business_id', selectedBusiness.id)
      .eq('is_active', true)
      .order('first_name');

    if (!error) setCustomers(data || []);
  };

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id, profiles(full_name)')
      .eq('role', 'delivery_driver');

    if (!error) setDrivers(data || []);
  };

  const addItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = items.find(i => i.product_id === productId);
    if (existingItem) {
      setItems(items.map(i =>
        i.product_id === productId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setItems([...items, {
        product_id: productId,
        quantity: 1,
        unit_price: product.price,
      }]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(items.filter(i => i.product_id !== productId));
    } else {
      setItems(items.map(i =>
        i.product_id === productId ? { ...i, quantity } : i
      ));
    }
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    return itemsTotal + parseFloat(deliveryFee || '0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness || !user) return;

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create or get customer
      let customerId = null;
      if (customerPhone) {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', customerPhone)
          .eq('business_id', selectedBusiness.id)
          .maybeSingle();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert({
              business_id: selectedBusiness.id,
              first_name: customerName,
              phone: customerPhone,
              address: deliveryAddress,
              landmark: landmark,
            })
            .select()
            .single();

          if (customerError) throw customerError;
          customerId = newCustomer.id;
        }
      }

      // Create sale
      const totalAmount = calculateTotal();
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          business_id: selectedBusiness.id,
          staff_id: user.id,
          customer_id: customerId,
          total_amount: totalAmount,
          payment_method: 'cash',
          status: 'pending',
          notes: notes,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Create delivery
      const { error: deliveryError } = await supabase
        .from('deliveries')
        .insert({
          business_id: selectedBusiness.id,
          sale_id: sale.id,
          customer_id: customerId,
          driver_id: selectedDriver || null,
          delivery_address: deliveryAddress,
          landmark: landmark,
          scheduled_date: scheduledDate || null,
          scheduled_time: scheduledTime || null,
          delivery_fee: parseFloat(deliveryFee || '0'),
          status: 'pending',
          notes: notes,
        });

      if (deliveryError) throw deliveryError;

      toast({
        title: "Success",
        description: "Delivery order created successfully",
      });

      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryAddress('');
      setLandmark('');
      setScheduledDate('');
      setScheduledTime('');
      setDeliveryFee('0');
      setNotes('');
      setSelectedDriver('');
      setItems([]);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create delivery order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBusiness) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a business first</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
          <p className="text-muted-foreground">Create and manage delivery orders</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Delivery Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Delivery Order</DialogTitle>
              <DialogDescription>Fill in the delivery details below</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Time Slot</Label>
                  <Select value={scheduledTime} onValueChange={setScheduledTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM-4PM)</SelectItem>
                      <SelectItem value="evening">Evening (4PM-8PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver">Assign Driver</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.user_id} value={driver.user_id}>
                        {driver.profiles?.full_name || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Products</Label>
                <div className="grid grid-cols-2 gap-2">
                  {products.map((product) => (
                    <Button
                      key={product.id}
                      type="button"
                      variant="outline"
                      onClick={() => addItem(product.id)}
                      className="justify-start"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {product.name} ({product.size}) - KSh {product.price}
                    </Button>
                  ))}
                </div>
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  <Label>Order Items</Label>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const product = products.find(p => p.id === item.product_id);
                      return (
                        <div key={item.product_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <span>{product?.name} ({product?.size})</span>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            >
                              +
                            </Button>
                            <span className="ml-4 font-medium">
                              KSh {(item.quantity * item.unit_price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="deliveryFee">Delivery Fee (KSh)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional delivery instructions"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-lg font-medium">Total Amount:</span>
                <span className="text-2xl font-bold">KSh {calculateTotal().toFixed(2)}</span>
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                <Truck className="mr-2 h-4 w-4" />
                Create Delivery Order
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>View and manage delivery orders</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Delivery list view will be implemented here
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
