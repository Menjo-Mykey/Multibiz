import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Scissors,
  Droplets,
  BarChart,
  Users,
  ShoppingCart,
  LogIn,
  Package,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  CheckCircle,
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="flex justify-center gap-8 mb-8 animate-fade-in">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-6 py-3 shadow-sm hover:shadow-md transition-shadow">
              <Scissors className="h-12 w-12 text-triplek" />
              <span className="text-3xl font-bold text-triplek">TrippleK</span>
            </div>
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-6 py-3 shadow-sm hover:shadow-md transition-shadow">
              <Droplets className="h-12 w-12 text-swan" />
              <span className="text-3xl font-bold text-swan">Swan</span>
            </div>
          </div>

          <h1 className="text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary via-triplek to-swan bg-clip-text text-transparent">
            Multibiz — Your all-in-one POS
          </h1>

          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            Streamline your operations across services and products with one
            powerful, integrated platform
          </p>

          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
            <CardHeader>
              <ShoppingCart className="h-10 w-10 mb-3 text-primary" />
              <CardTitle className="text-xl">Point of Sale</CardTitle>
              <CardDescription className="text-base">
                Fast, intuitive POS for processing sales, payments, and
                transactions across both businesses
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-triplek/50">
            <CardHeader>
              <Users className="h-10 w-10 mb-3 text-triplek" />
              <CardTitle className="text-xl">Staff Management</CardTitle>
              <CardDescription className="text-base">
                Track clock-ins, manage commissions, and monitor performance for
                barbers and drivers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-swan/50">
            <CardHeader>
              <BarChart className="h-10 w-10 mb-3 text-swan" />
              <CardTitle className="text-xl">Analytics & Reports</CardTitle>
              <CardDescription className="text-base">
                Real-time insights into sales trends, revenue patterns, and
                business performance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
            <CardHeader>
              <Package className="h-10 w-10 mb-3 text-primary" />
              <CardTitle className="text-xl">Inventory Control</CardTitle>
              <CardDescription className="text-base">
                Smart inventory tracking with automatic stock updates and
                low-stock alerts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-triplek/50">
            <CardHeader>
              <TrendingUp className="h-10 w-10 mb-3 text-triplek" />
              <CardTitle className="text-xl">Revenue Tracking</CardTitle>
              <CardDescription className="text-base">
                Monitor daily sales, track expenses, and manage approvals all in
                one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 hover:border-swan/50">
            <CardHeader>
              <Clock className="h-10 w-10 mb-3 text-swan" />
              <CardTitle className="text-xl">Time Management</CardTitle>
              <CardDescription className="text-base">
                Automated time tracking, scheduling, and attendance management
                for your team
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mt-24 text-center">
          <h2 className="text-4xl font-bold mb-12">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-primary/10 p-4 rounded-full">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Optimized for speed with offline support and instant sync
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="bg-success/10 p-4 rounded-full">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold">Easy to Use</h3>
              <p className="text-muted-foreground">
                Intuitive interface designed for real-world business operations
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="bg-info/10 p-4 rounded-full">
                <Shield className="h-8 w-8 text-info" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with automatic backups and data
                protection
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-gradient-to-r from-primary/10 via-triplek/10 to-swan/10 rounded-2xl p-12 border-2">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join businesses already streamlining their operations with our
            platform
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-10 py-6"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Launch App
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
