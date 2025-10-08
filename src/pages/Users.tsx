import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Users as UsersIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Briefcase,
  Scissors,
  DollarSign,
  Calculator,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessContext } from "@/contexts/BusinessContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "barber" | "sales_agent" | "accountant";
  businessId?: string;
  commissionRate?: number;
  isActive: boolean;
  createdAt: string;
}

export const Users: React.FC = () => {
  const { toast } = useToast();
  const { selectedBusiness } = useBusinessContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, this would come from Supabase
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Owner",
      email: "john@triplek.com",
      role: "owner",
      isActive: true,
      createdAt: "2024-01-01",
    },
    {
      id: "2",
      name: "Mike Johnson",
      email: "mike@triplek.com",
      role: "barber",
      businessId: "1",
      commissionRate: 40,
      isActive: true,
      createdAt: "2024-01-05",
    },
    {
      id: "3",
      name: "David Brown",
      email: "david@triplek.com",
      role: "barber",
      businessId: "1",
      commissionRate: 35,
      isActive: true,
      createdAt: "2024-01-10",
    },
    {
      id: "4",
      name: "Sarah Admin",
      email: "sarah@swan.com",
      role: "admin",
      businessId: "2",
      isActive: true,
      createdAt: "2024-01-02",
    },
    {
      id: "5",
      name: "Tom Sales",
      email: "tom@swan.com",
      role: "sales_agent",
      businessId: "2",
      isActive: true,
      createdAt: "2024-01-08",
    },
    {
      id: "6",
      name: "Lisa Accountant",
      email: "lisa@business.com",
      role: "accountant",
      isActive: true,
      createdAt: "2024-01-12",
    },
  ]);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "barber" as User["role"],
    businessId: "1",
    commissionRate: "",
    isActive: true,
  });

  const roleIcons = {
    owner: Crown,
    admin: Shield,
    manager: Briefcase,
    barber: Scissors,
    sales_agent: DollarSign,
    accountant: Calculator,
  };

  const roleColors = {
    owner: "bg-yellow-500 text-white",
    admin: "bg-red-500 text-white",
    manager: "bg-blue-500 text-white",
    barber: "bg-triplek text-triplek-foreground",
    sales_agent: "bg-swan text-swan-foreground",
    accountant: "bg-green-500 text-white",
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const addUser = async () => {
    if (!newUser.name || !newUser.email || !selectedBusiness) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
      const { data: signUpRes, error: signErr } = await supabase.auth.signUp({
        email: newUser.email,
        password: tempPassword,
        options: { data: { full_name: newUser.name } },
      });
      if (signErr) throw signErr;
      const newUserId = signUpRes.user?.id;
      if (!newUserId) throw new Error("Failed to create user");

      const { error: roleErr } = await supabase.from("user_roles").insert({
        user_id: newUserId,
        business_id: selectedBusiness.id,
        role:
          newUser.role === "sales_agent" ? "cashier" : (newUser.role as any),
      });
      if (roleErr) throw roleErr;

      const user: User = {
        id: newUserId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        businessId: selectedBusiness.id,
        commissionRate: newUser.commissionRate
          ? parseFloat(newUser.commissionRate)
          : undefined,
        isActive: true,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setUsers([...users, user]);
      setNewUser({
        name: "",
        email: "",
        role: "barber",
        businessId: "1",
        commissionRate: "",
        isActive: true,
      });
      setIsAddDialogOpen(false);
      toast({
        title: "User Added",
        description: `${user.name} has been added successfully`,
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const current = users.find((u) => u.id === userId);
      const nextActive = !current?.isActive;
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: nextActive })
        .eq("id", userId);
      if (error) throw error;
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, isActive: nextActive } : u))
      );
      toast({
        title: "User Status Updated",
        description: `${current?.name} has been ${
          nextActive ? "activated" : "deactivated"
        }`,
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("business_id", selectedBusiness?.id || "");
      await supabase
        .from("profiles")
        .update({ is_active: false })
        .eq("id", userId);
      setUsers(users.filter((u) => u.id !== userId));
      toast({ title: "User Deleted", description: `User has been removed` });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to remove user",
        variant: "destructive",
      });
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    if (!selectedBusiness) return;
    try {
      // Remove existing business role then add new one
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("business_id", selectedBusiness.id);
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          business_id: selectedBusiness.id,
          role: newRole,
        });
      if (error) throw error;
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
      toast({
        title: "Role Updated",
        description: "Employee role changed successfully",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Failed to change role",
        variant: "destructive",
      });
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage staff and user access</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with role-based permissions
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: User["role"]) =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="barber">Barber</SelectItem>
                    <SelectItem value="sales_agent">Sales Agent</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="business" className="text-right">
                  Business
                </Label>
                <Select
                  value={newUser.businessId}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, businessId: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">TrippleK Barbershop</SelectItem>
                    <SelectItem value="2">Swan Water Distribution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newUser.role === "barber" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="commission" className="text-right">
                    Commission %
                  </Label>
                  <Input
                    id="commission"
                    type="number"
                    value={newUser.commissionRate}
                    onChange={(e) =>
                      setNewUser({ ...newUser, commissionRate: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="e.g., 40"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Active
                </Label>
                <Switch
                  id="active"
                  checked={newUser.isActive}
                  onCheckedChange={(checked) =>
                    setNewUser({ ...newUser, isActive: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="barber">Barber</SelectItem>
                  <SelectItem value="sales_agent">Sales Agent</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const RoleIcon = roleIcons[user.role];
          return (
            <Card key={user.id} className={!user.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${roleColors[user.role]}`}
                    >
                      <RoleIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm font-medium">Role:</span>
                  <Select
                    value={user.role}
                    onValueChange={(v) => changeUserRole(user.id, v)}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="barber">Barber</SelectItem>
                      <SelectItem value="sales_agent">Sales Agent</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {user.commissionRate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Commission:</span>
                    <span className="text-sm">{user.commissionRate}%</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Joined:</span>
                  <span className="text-sm text-muted-foreground">
                    {user.createdAt}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleUserStatus(user.id)}
                    className="flex-1"
                  >
                    {user.isActive ? (
                      <>
                        <UserX className="h-3 w-3 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                  {user.role !== "owner" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
