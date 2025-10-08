import React, { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Download, WifiOff } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallDialog, setShowInstallDialog] = useState<boolean>(false);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const snoozeUntil = localStorage.getItem("installPromptSnoozeUntil");
      const dontShow = localStorage.getItem("installPromptDontShow");
      const now = Date.now();
      if (!dontShow && (!snoozeUntil || Number(snoozeUntil) < now)) {
        setShowInstallDialog(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setShowInstallDialog(false);
      toast({
        title: "App Installed",
        description: "You can now launch it from your home screen.",
      });
    });
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [toast]);

  const triggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      toast({
        title: "Installing...",
        description: "Completing installation.",
      });
    }
    setDeferredPrompt(null);
    setShowInstallDialog(false);
  };

  const snoozeInstall = () => {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      "installPromptSnoozeUntil",
      String(Date.now() + sevenDays)
    );
    setShowInstallDialog(false);
  };

  const dontShowAgain = () => {
    localStorage.setItem("installPromptDontShow", "1");
    setShowInstallDialog(false);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {!isOnline && (
            <div className="w-full bg-yellow-100 border-b border-yellow-300 text-yellow-900 px-4 py-2 flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              <span>
                You're offline. Some features are limited. Changes will sync
                when back online.
              </span>
            </div>
          )}
          <div className="container mx-auto p-6">
            <div className="flex justify-end mb-2">
              {deferredPrompt && (
                <Button size="sm" variant="outline" onClick={triggerInstall}>
                  <Download className="h-4 w-4 mr-2" /> Install App
                </Button>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>

      <Dialog open={showInstallDialog} onOpenChange={setShowInstallDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install Multibiz</DialogTitle>
            <DialogDescription>
              Access from your home screen, faster loading, and offline support.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={snoozeInstall}>
              Maybe Later
            </Button>
            <Button variant="secondary" onClick={dontShowAgain}>
              Don't Show Again
            </Button>
            <Button onClick={triggerInstall}>Install Now</Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};
