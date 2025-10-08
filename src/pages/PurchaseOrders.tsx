import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date?: string;
  received_date?: string;
  total_cost: number;
  status: string;
  notes?: string;
  suppliers: { name: string };
}

interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  unit_cost?: number;
}

interface POItem {
  inventory_item_id: string;
  quantity: number;
  unit_cost: number;
}

export const PurchaseOrders: React.FC = () => {
  const { selectedBusiness } = useBusinessContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const [formData, setFormData] = useState({
    supplier_id: '',
    expected_delivery_date: '',
    notes: '',
  });

  const [poItems, setPOItems] = useState<POItem[]>([
    { inventory_item_id: '', quantity: 0, unit_cost: 0 },
  ]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchPurchaseOrders();
      fetchSuppliers();
      fetchInventoryItems();
    }
  }, [selectedBusiness]);

  const fetchPurchaseOrders = async () => {
    if (!selectedBusiness) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, suppliers(name)')
        .eq('business_id', selectedBusiness.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchaseOrders(data || []);
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

  const fetchSuppliers = async () => {
    if (!selectedBusiness) return;

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, contact_person, phone')
        .eq('business_id', selectedBusiness.id)
        .eq('is_active', true);

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchInventoryItems = async () => {
    if (!selectedBusiness) return;

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, unit, unit_cost')
        .eq('business_id', selectedBusiness.id)
        .eq('is_active', true);

      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCreatePO = async () => {
    if (!selectedBusiness || !user || !formData.supplier_id) {
      toast({
        title: 'Error',
        description: 'Please select a supplier',
        variant: 'destructive',
      });
      return;
    }

    const validItems = poItems.filter(
      (item) => item.inventory_item_id && item.quantity > 0 && item.unit_cost > 0
    );

    if (validItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Generate PO number
      const { data: poNumberData, error: poNumberError } = await supabase.rpc('generate_po_number');
      if (poNumberError) throw poNumberError;

      const totalCost = validItems.reduce(
        (sum, item) => sum + item.quantity * item.unit_cost,
        0
      );

      // Create PO
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .insert([
          {
            business_id: selectedBusiness.id,
            supplier_id: formData.supplier_id,
            order_number: poNumberData,
            expected_delivery_date: formData.expected_delivery_date || null,
            total_cost: totalCost,
            notes: formData.notes,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (poError) throw poError;

      // Create PO items
      const poItemsData = validItems.map((item) => ({
        purchase_order_id: poData.id,
        inventory_item_id: item.inventory_item_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.quantity * item.unit_cost,
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(poItemsData);

      if (itemsError) throw itemsError;

      toast({
        title: 'Success',
        description: `Purchase Order ${poNumberData} created successfully`,
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchPurchaseOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleReceivePO = async (poId: string) => {
    try {
      // Get PO items
      const { data: items, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select('*, inventory_items(id)')
        .eq('purchase_order_id', poId);

      if (itemsError) throw itemsError;

      // Update inventory for each item
      for (const item of items || []) {
        // Get current quantity
        const { data: currentItem, error: fetchError } = await supabase
          .from('inventory_items')
          .select('quantity')
          .eq('id', item.inventory_item_id)
          .single();

        if (fetchError) throw fetchError;

        // Update with new quantity
        const { error: updateError } = await supabase
          .from('inventory_items')
          .update({ quantity: (currentItem?.quantity || 0) + item.quantity })
          .eq('id', item.inventory_item_id);

        if (updateError) throw updateError;

        // Update received quantity
        await supabase
          .from('purchase_order_items')
          .update({ received_quantity: item.quantity })
          .eq('id', item.id);
      }

      // Mark PO as received
      const { error: poError } = await supabase
        .from('purchase_orders')
        .update({
          status: 'received',
          received_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', poId);

      if (poError) throw poError;

      toast({
        title: 'Success',
        description: 'Purchase order received and inventory updated',
      });

      fetchPurchaseOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addPOItem = () => {
    setPOItems([...poItems, { inventory_item_id: '', quantity: 0, unit_cost: 0 }]);
  };

  const removePOItem = (index: number) => {
    setPOItems(poItems.filter((_, i) => i !== index));
  };

  const updatePOItem = (index: number, field: keyof POItem, value: any) => {
    const newItems = [...poItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPOItems(newItems);
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      expected_delivery_date: '',
      notes: '',
    });
    setPOItems([{ inventory_item_id: '', quantity: 0, unit_cost: 0 }]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'received':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Received</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
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
            <FileText className="h-8 w-8" />
            Purchase Orders
          </h1>
          <p className="text-muted-foreground mt-1">Manage inventory purchase orders</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier *</Label>
                  <Select value={formData.supplier_id} onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Expected Delivery Date</Label>
                  <Input
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Items</Label>
                <div className="space-y-3 mt-2">
                  {poItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Select
                          value={item.inventory_item_id}
                          onValueChange={(value) => updatePOItem(index, 'inventory_item_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoryItems.map((invItem) => (
                              <SelectItem key={invItem.id} value={invItem.id}>
                                {invItem.name} ({invItem.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity || ''}
                          onChange={(e) => updatePOItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          placeholder="Unit Cost"
                          value={item.unit_cost || ''}
                          onChange={(e) => updatePOItem(index, 'unit_cost', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removePOItem(index)}
                        disabled={poItems.length === 1}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={addPOItem} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div>
                <Label>Total Cost</Label>
                <p className="text-2xl font-bold">
                  KSh {poItems.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0).toLocaleString()}
                </p>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>

              <Button onClick={handleCreatePO} className="w-full">
                Create Purchase Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : purchaseOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No purchase orders found
                  </TableCell>
                </TableRow>
              ) : (
                purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.order_number}</TableCell>
                    <TableCell>{po.suppliers.name}</TableCell>
                    <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {po.expected_delivery_date
                        ? new Date(po.expected_delivery_date).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>KSh {po.total_cost.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(po.status)}</TableCell>
                    <TableCell>
                      {po.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReceivePO(po.id)}
                        >
                          Receive
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
