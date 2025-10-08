import React, { useState } from 'react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  requiresAftercare: boolean;
  is_active: boolean;
}

export const Services: React.FC = () => {
  const { selectedBusiness } = useBusinessContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    requiresAftercare: false,
  });

  // Mock data - in real app, this would come from Supabase
  const [services, setServices] = useState<Service[]>([
    { id: '1', name: 'Haircut', price: 500, duration: 30, description: 'Professional haircut with styling', requiresAftercare: true, is_active: true },
    { id: '2', name: 'Beard Trim', price: 300, duration: 15, description: 'Beard shaping and trimming', requiresAftercare: true, is_active: true },
    { id: '3', name: 'Shaving', price: 400, duration: 20, description: 'Clean shave with hot towel', requiresAftercare: true, is_active: true },
    { id: '4', name: 'Pedicure', price: 600, duration: 45, description: 'Professional pedicure service', requiresAftercare: false, is_active: true },
    { id: '5', name: 'Manicure', price: 500, duration: 40, description: 'Professional manicure service', requiresAftercare: false, is_active: true },
    { id: '6', name: 'Full Body Massage', price: 1500, duration: 90, description: 'Relaxing full body massage', requiresAftercare: false, is_active: true },
    { id: '7', name: 'Body Scrub', price: 800, duration: 60, description: 'Exfoliating body scrub treatment', requiresAftercare: false, is_active: true },
    { id: '8', name: 'Nail Tech Services', price: 700, duration: 50, description: 'Professional nail care services', requiresAftercare: false, is_active: true },
  ]);

  if (!selectedBusiness || selectedBusiness.type !== 'triplek') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Services management is only available for TrippleK Barbershop.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: service.price.toString(),
        duration: service.duration.toString(),
        description: service.description,
        requiresAftercare: service.requiresAftercare,
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        price: '',
        duration: '',
        description: '',
        requiresAftercare: false,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveService = () => {
    if (!formData.name || !formData.price || !formData.duration) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingService) {
      setServices(services.map(s => 
        s.id === editingService.id 
          ? { ...s, ...formData, price: parseFloat(formData.price), duration: parseInt(formData.duration) }
          : s
      ));
      toast({
        title: 'Success',
        description: 'Service updated successfully',
      });
    } else {
      const newService: Service = {
        id: Date.now().toString(),
        name: formData.name,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        description: formData.description,
        requiresAftercare: formData.requiresAftercare,
        is_active: true,
      };
      setServices([...services, newService]);
      toast({
        title: 'Success',
        description: 'Service created successfully',
      });
    }

    setIsDialogOpen(false);
  };

  const toggleServiceStatus = (id: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, is_active: !s.is_active } : s
    ));
    toast({
      title: 'Success',
      description: 'Service status updated',
    });
  };

  const deleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
    toast({
      title: 'Success',
      description: 'Service deleted successfully',
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Services Management</h1>
          <p className="text-muted-foreground">Manage your barbershop services</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                {editingService ? 'Update service details below' : 'Create a new service for your barbershop'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Haircut"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (KSh) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (min) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="30"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the service"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="aftercare"
                  checked={formData.requiresAftercare}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresAftercare: checked })}
                />
                <Label htmlFor="aftercare">Requires Aftercare (head wash & massage)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveService}>
                {editingService ? 'Update' : 'Create'} Service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
          <CardDescription>
            Manage pricing, duration, and availability of your services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Aftercare</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      {service.description && (
                        <div className="text-sm text-muted-foreground">{service.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>KSh {service.price.toLocaleString()}</TableCell>
                  <TableCell>{service.duration} min</TableCell>
                  <TableCell>
                    {service.requiresAftercare ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={() => toggleServiceStatus(service.id)}
                      />
                      <span className="text-sm">
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
