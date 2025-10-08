import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import {
  Package,
  Plus,
  Minus,
  Search,
  AlertTriangle,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  description?: string;
}

export const Inventory: React.FC = () => {
  const { selectedBusiness } = useBusinessContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Mock data - in real app, this would come from Supabase
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: '20L Water Bottle', sku: 'WB-20L', price: 180, stock: 45, lowStockThreshold: 10, description: 'Large water bottle for offices' },
    { id: '2', name: '5L Water Bottle', sku: 'WB-5L', price: 80, stock: 120, lowStockThreshold: 20, description: 'Medium water bottle for homes' },
    { id: '3', name: '1L Water Bottle', sku: 'WB-1L', price: 25, stock: 5, lowStockThreshold: 50, description: 'Small water bottle' },
    { id: '4', name: 'Water Dispenser', sku: 'WD-STD', price: 1500, stock: 3, lowStockThreshold: 5, description: 'Standard water dispenser' },
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    price: '',
    stock: '',
    lowStockThreshold: '',
    description: ''
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(product => product.stock <= product.lowStockThreshold);

  const updateStock = (productId: string, adjustment: number) => {
    setProducts(products.map(product =>
      product.id === productId
        ? { ...product, stock: Math.max(0, product.stock + adjustment) }
        : product
    ));
    
    toast({
      title: "Stock Updated",
      description: `Stock ${adjustment > 0 ? 'increased' : 'decreased'} successfully`,
    });
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      sku: newProduct.sku,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock) || 0,
      lowStockThreshold: parseInt(newProduct.lowStockThreshold) || 10,
      description: newProduct.description
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', sku: '', price: '', stock: '', lowStockThreshold: '', description: '' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Product Added",
      description: `${product.name} has been added to inventory`,
    });
  };

  if (!selectedBusiness || selectedBusiness.type !== 'swan') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select Swan Water Distribution to access inventory</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage products and stock levels</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your inventory
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sku" className="text-right">SKU</Label>
                <Input
                  id="sku"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="threshold" className="text-right">Low Stock Alert</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newProduct.lowStockThreshold}
                  onChange={(e) => setNewProduct({...newProduct, lowStockThreshold: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addProduct}>Add Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-warning/10 rounded">
                  <span>{product.name} (SKU: {product.sku})</span>
                  <Badge variant="outline" className="text-warning border-warning">
                    {product.stock} remaining
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className={product.stock <= product.lowStockThreshold ? 'border-warning' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>SKU: {product.sku}</CardDescription>
                </div>
                <Badge className="bg-swan text-swan-foreground">
                  KSh {product.price}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <p className="text-sm text-muted-foreground">{product.description}</p>
              )}
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Stock:</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStock(product.id, -1)}
                    disabled={product.stock === 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Badge variant={product.stock <= product.lowStockThreshold ? "destructive" : "secondary"}>
                    {product.stock}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStock(product.id, 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Low Stock Alert:</span>
                <span>{product.lowStockThreshold}</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No products found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};