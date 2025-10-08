import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBusinessContext } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Search,
  Clock,
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: "service" | "product";
}

export const POS: React.FC = () => {
  const { selectedBusiness } = useBusinessContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mpesa" | "card">(
    "cash"
  );
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedAftercare, setSelectedAftercare] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<
    "manager" | "cashier" | "barber"
  >("manager");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Loaded data from Supabase
  const [serviceList, setServiceList] = useState<
    Array<{
      id: string;
      name: string;
      price: number;
      requires_aftercare: boolean;
    }>
  >([]);
  const [productList, setProductList] = useState<
    Array<{ id: string; name: string; price: number; stock_quantity: number }>
  >([]);
  const [barberList, setBarberList] = useState<
    Array<{ id: string; full_name: string }>
  >([]);

  // Check if barber is clocked in
  useEffect(() => {
    if (user && currentUserRole === "barber") {
      checkClockInStatus();
    }
  }, [user, currentUserRole]);

  const checkClockInStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("is_user_clocked_in", {
        _user_id: user.id,
      });

      if (error) throw error;
      setIsClockedIn(data || false);
    } catch (error) {
      console.error("Error checking clock-in status:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!selectedBusiness) return;
      if (selectedBusiness.type === "triplek") {
        const { data } = await supabase
          .from("services")
          .select("id, name, price, requires_aftercare")
          .eq("business_id", selectedBusiness.id)
          .eq("is_active", true)
          .order("name");
        setServiceList(
          (data || []).map((s) => ({
            id: s.id as any,
            name: s.name as any,
            price: Number(s.price),
            requires_aftercare: !!s.requires_aftercare,
          }))
        );
        // Load barbers for selection
        const { data: roleRows } = await supabase
          .from("user_roles")
          .select(
            "user_id, role, profiles:profiles!user_roles_user_id_fkey(full_name)"
          )
          .eq("role", "barber")
          .eq("business_id", selectedBusiness.id);
        setBarberList(
          (roleRows || []).map((r) => ({
            id: r.user_id as any,
            full_name: (r as any).profiles?.full_name || "Barber",
          }))
        );
      } else {
        const { data } = await supabase
          .from("products")
          .select("id, name, price, stock_quantity")
          .eq("business_id", selectedBusiness.id)
          .eq("is_active", true)
          .order("size");
        setProductList(
          (data || []).map((p) => ({
            id: p.id as any,
            name: p.name as any,
            price: Number(p.price),
            stock_quantity: p.stock_quantity as any,
          }))
        );
      }
    };
    loadData();
  }, [selectedBusiness]);

  const addToCart = (item: any, type: "service" | "product") => {
    const existingItem = cart.find(
      (cartItem) => cartItem.id === item.id && cartItem.type === type
    );

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id && cartItem.type === type
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          type,
        },
      ]);
    }
  };

  const updateQuantity = (
    id: string,
    type: "service" | "product",
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(id, type);
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === id && item.type === type ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: string, type: "service" | "product") => {
    setCart(cart.filter((item) => !(item.id === id && item.type === type)));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const hasAftercare = cart.some((item) => {
    if (item.type !== "service") return false;
    const service = serviceList.find((s) => s.id === item.id);
    return !!service?.requires_aftercare;
  });

  const completeSale = async () => {
    if (currentUserRole === "barber" && !isClockedIn) {
      toast({
        title: "Clock In Required",
        description: "You must be clocked in to process sales",
        variant: "destructive",
      });
      return;
    }

    if (currentUserRole !== "manager" && currentUserRole !== "cashier") {
      toast({
        title: "Permission Denied",
        description: "Only cashiers and managers can complete sales",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive",
      });
      return;
    }

    if (selectedBusiness?.type === "triplek" && !selectedBarber) {
      toast({
        title: "Error",
        description: "Please select a barber for barbershop services",
        variant: "destructive",
      });
      return;
    }

    if (
      selectedBusiness?.type === "triplek" &&
      hasAftercare &&
      !selectedAftercare
    ) {
      toast({
        title: "Error",
        description:
          "Please select aftercare staff for services requiring aftercare",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBusiness || !user) return;

    try {
      setLoading(true);
      // Optional: create/get customer by phone
      let customerId: string | null = null;
      if (customerContact) {
        const { data: existing } = await supabase
          .from("customers")
          .select("id")
          .eq("business_id", selectedBusiness.id)
          .eq("phone", customerContact)
          .maybeSingle();
        if (existing?.id) {
          customerId = existing.id;
        } else {
          const { data: created, error: custErr } = await supabase
            .from("customers")
            .insert({
              business_id: selectedBusiness.id,
              first_name: customerName || "Walk-in",
              phone: customerContact,
            })
            .select("id")
            .single();
          if (custErr) throw custErr;
          customerId = created.id;
        }
      }

      // Insert sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          business_id: selectedBusiness.id,
          customer_id: customerId,
          staff_id: user.id,
          aftercare_staff_id:
            selectedBusiness.type === "triplek" && selectedAftercare
              ? selectedAftercare
              : null,
          total_amount: total,
          payment_method: paymentMethod,
          status: "completed",
          notes: null,
        })
        .select("*")
        .single();
      if (saleError) throw saleError;

      // Prepare sale items
      const saleItems = cart.map((ci) => ({
        sale_id: sale.id,
        service_id: ci.type === "service" ? ci.id : null,
        product_id: ci.type === "product" ? ci.id : null,
        quantity: ci.quantity,
        unit_price: ci.price,
        total_price: ci.price * ci.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);
      if (itemsError) throw itemsError;

      // Commissions: KSh 100 per service for the selected barber
      if (selectedBusiness.type === "triplek" && selectedBarber) {
        const serviceItems = cart.filter((ci) => ci.type === "service");
        if (serviceItems.length > 0) {
          const commissionRows = serviceItems.map((si) => ({
            user_id: selectedBarber,
            sale_id: sale.id,
            commission_rate: 0,
            commission_amount: 100 * si.quantity,
            status: "pending",
          }));
          const { error: commErr } = await supabase
            .from("commissions")
            .insert(commissionRows);
          if (commErr) throw commErr;
        }
      }

      // Generate receipt number (client-side)
      const receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;
      setLastSale({
        businessName: selectedBusiness?.name,
        items: cart,
        total,
        paymentMethod,
        customerName,
        staffName: user?.email,
        receiptNumber,
      });
      setShowReceipt(true);

      toast({
        title: "Sale Completed",
        description: `Sale of KSh ${total.toLocaleString()} completed successfully`,
      });

      // Reset form
      setCart([]);
      setCustomerName("");
      setCustomerContact("");
      setSelectedBarber("");
      setSelectedAftercare("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete sale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedBusiness) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          Please select a business to access POS
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products/Services */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Point of Sale</h1>
            <p className="text-muted-foreground">
              {selectedBusiness.name} -{" "}
              {selectedBusiness.type === "triplek" ? "Services" : "Products"}
            </p>
            {currentUserRole === "barber" && (
              <div className="mt-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span
                  className={`text-sm font-medium ${
                    isClockedIn ? "text-success" : "text-destructive"
                  }`}
                >
                  {isClockedIn ? "Clocked In" : "Not Clocked In"}
                </span>
              </div>
            )}
          </div>

          {selectedBusiness.type === "triplek" && (
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>Available barbershop services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceList.map((service) => (
                    <div
                      key={service.id}
                      className="border rounded-lg p-4 hover:bg-accent cursor-pointer"
                      onClick={() =>
                        addToCart(
                          {
                            id: service.id,
                            name: service.name,
                            price: service.price,
                          },
                          "service"
                        )
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                        </div>
                        <Badge>KSh {service.price}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedBusiness.type === "swan" && (
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Available water products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productList.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-4 hover:bg-accent cursor-pointer"
                      onClick={() =>
                        addToCart(
                          {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                          },
                          "product"
                        )
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Stock: {product.stock_quantity}
                          </p>
                        </div>
                        <Badge>KSh {product.price}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Cart is empty
                </p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${item.type}`}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          KSh {item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.type,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.type,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id, item.type)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>KSh {total.toLocaleString()}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Temporary Role Selector (will be replaced by server role) */}
              <div>
                <label className="text-sm font-medium">
                  Current User Role (Testing)
                </label>
                <Select
                  value={currentUserRole}
                  onValueChange={(value: any) => setCurrentUserRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="barber">Barber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium">Customer Name</label>
                <Input
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact</label>
                <Input
                  placeholder="Phone or email"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                />
              </div>
              {selectedBusiness.type === "triplek" && (
                <>
                  <div>
                    <label className="text-sm font-medium">
                      Barber <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={selectedBarber}
                      onValueChange={setSelectedBarber}
                    >
                      <SelectTrigger
                        className={
                          !selectedBarber && cart.length > 0
                            ? "border-destructive"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select barber" />
                      </SelectTrigger>
                      <SelectContent>
                        {barberList.map((barber) => (
                          <SelectItem key={barber.id} value={barber.id}>
                            {barber.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!selectedBarber && cart.length > 0 && (
                      <p className="text-xs text-destructive mt-1">
                        Barber selection is required
                      </p>
                    )}
                  </div>
                  {hasAftercare && (
                    <div>
                      <label className="text-sm font-medium">
                        Aftercare Staff{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={selectedAftercare}
                        onValueChange={setSelectedAftercare}
                      >
                        <SelectTrigger
                          className={
                            !selectedAftercare && cart.length > 0
                              ? "border-destructive"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Select aftercare staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Optional: populate from roles if you distinguish aftercare */}
                          {barberList.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!selectedAftercare && cart.length > 0 && (
                        <p className="text-xs text-destructive mt-1">
                          Aftercare staff required for head wash & massage
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value: any) => setPaymentMethod(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="mpesa">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        M-Pesa
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Card
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={completeSale}
                disabled={
                  cart.length === 0 ||
                  (currentUserRole === "barber" && !isClockedIn) ||
                  (currentUserRole !== "cashier" &&
                    currentUserRole !== "manager") ||
                  (selectedBusiness.type === "triplek" && !selectedBarber) ||
                  (selectedBusiness.type === "triplek" &&
                    hasAftercare &&
                    !selectedAftercare)
                }
                className="w-full"
              >
                {currentUserRole === "barber" && !isClockedIn
                  ? "Clock In to Process Sales"
                  : currentUserRole !== "cashier" &&
                    currentUserRole !== "manager"
                  ? "Only Cashiers Can Complete Sales"
                  : `Complete Sale - KSh ${total.toLocaleString()}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Modal */}
      {lastSale && (
        <ReceiptModal
          open={showReceipt}
          onOpenChange={setShowReceipt}
          businessName={lastSale.businessName}
          items={lastSale.items}
          total={lastSale.total}
          paymentMethod={lastSale.paymentMethod}
          customerName={lastSale.customerName}
          staffName={lastSale.staffName}
          receiptNumber={lastSale.receiptNumber}
        />
      )}
    </>
  );
};
