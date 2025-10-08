import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Settings as SettingsIcon,
  Building,
  Bell,
  Palette,
  Shield,
  Database,
  Mail,
  FileText,
  DollarSign
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export const Settings: React.FC = () => {
  const { toast } = useToast();

  // Business Settings
  const [businessSettings, setBusinessSettings] = useState({
    triplekName: 'TrippleK Barbershop',
    triplekDescription: 'Professional barbershop services',
    swanName: 'Swan Water Distribution',
    swanDescription: 'Water distribution and delivery services',
    currency: 'KSH',
    timezone: 'Africa/Nairobi',
    taxRate: '16',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    lowStockAlerts: true,
    saleNotifications: true,
    commissionAlerts: true,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '365',
    sessionTimeout: '120',
    twoFactorAuth: false,
    apiAccess: false,
  });

  // Export Settings
  const [exportSettings, setExportSettings] = useState({
    defaultFormat: 'excel',
    includeHeaders: true,
    dateFormat: 'DD/MM/YYYY',
    exportTemplate: 'Name, ID Number, Contact, Group Name',
  });

  const saveSettings = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully`,
    });
  };

  const resetToDefaults = () => {
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your business settings and preferences</p>
        </div>
        <Button onClick={resetToDefaults} variant="outline">
          Reset to Defaults
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Configure your business details and operational settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">TrippleK Barbershop</h3>
                  <div className="space-y-2">
                    <Label htmlFor="triplek-name">Business Name</Label>
                    <Input
                      id="triplek-name"
                      value={businessSettings.triplekName}
                      onChange={(e) => setBusinessSettings({...businessSettings, triplekName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="triplek-desc">Description</Label>
                    <Textarea
                      id="triplek-desc"
                      value={businessSettings.triplekDescription}
                      onChange={(e) => setBusinessSettings({...businessSettings, triplekDescription: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Swan Water Distribution</h3>
                  <div className="space-y-2">
                    <Label htmlFor="swan-name">Business Name</Label>
                    <Input
                      id="swan-name"
                      value={businessSettings.swanName}
                      onChange={(e) => setBusinessSettings({...businessSettings, swanName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="swan-desc">Description</Label>
                    <Textarea
                      id="swan-desc"
                      value={businessSettings.swanDescription}
                      onChange={(e) => setBusinessSettings({...businessSettings, swanDescription: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={businessSettings.currency} onValueChange={(value) => setBusinessSettings({...businessSettings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KSH">KSH - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={businessSettings.timezone} onValueChange={(value) => setBusinessSettings({...businessSettings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={businessSettings.taxRate}
                    onChange={(e) => setBusinessSettings({...businessSettings, taxRate: e.target.value})}
                  />
                </div>
              </div>

              <Button onClick={() => saveSettings('Business')}>
                Save Business Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Alert Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="low-stock">Low Stock Alerts</Label>
                    <Switch
                      id="low-stock"
                      checked={notifications.lowStockAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, lowStockAlerts: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sale-notifications">Sale Notifications</Label>
                    <Switch
                      id="sale-notifications"
                      checked={notifications.saleNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, saleNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="commission-alerts">Commission Alerts</Label>
                    <Switch
                      id="commission-alerts"
                      checked={notifications.commissionAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, commissionAlerts: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Report Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="daily-reports">Daily Reports</Label>
                    <Switch
                      id="daily-reports"
                      checked={notifications.dailyReports}
                      onCheckedChange={(checked) => setNotifications({...notifications, dailyReports: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <Switch
                      id="weekly-reports"
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="monthly-reports">Monthly Reports</Label>
                    <Switch
                      id="monthly-reports"
                      checked={notifications.monthlyReports}
                      onCheckedChange={(checked) => setNotifications({...notifications, monthlyReports: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Delivery Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch
                      id="email-notifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <Switch
                      id="sms-notifications"
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => saveSettings('Notification')}>
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Configure system behavior and data management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Backup & Data</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-backup">Automatic Backup</Label>
                    <Switch
                      id="auto-backup"
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoBackup: checked})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backup-frequency">Backup Frequency</Label>
                      <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings({...systemSettings, backupFrequency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="data-retention">Data Retention (days)</Label>
                      <Input
                        id="data-retention"
                        type="number"
                        value={systemSettings.dataRetention}
                        onChange={(e) => setSystemSettings({...systemSettings, dataRetention: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Session & Access</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <Switch
                      id="two-factor"
                      checked={systemSettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, twoFactorAuth: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="api-access">API Access</Label>
                    <Switch
                      id="api-access"
                      checked={systemSettings.apiAccess}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, apiAccess: checked})}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => saveSettings('System')}>
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Configuration
              </CardTitle>
              <CardDescription>
                Configure default export settings and templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default-format">Default Export Format</Label>
                  <Select value={exportSettings.defaultFormat} onValueChange={(value) => setExportSettings({...exportSettings, defaultFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={exportSettings.dateFormat} onValueChange={(value) => setExportSettings({...exportSettings, dateFormat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-headers">Include Headers in Export</Label>
                <Switch
                  id="include-headers"
                  checked={exportSettings.includeHeaders}
                  onCheckedChange={(checked) => setExportSettings({...exportSettings, includeHeaders: checked})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="export-template">Default Export Template</Label>
                <Textarea
                  id="export-template"
                  value={exportSettings.exportTemplate}
                  onChange={(e) => setExportSettings({...exportSettings, exportTemplate: e.target.value})}
                  placeholder="Enter column names separated by commas"
                />
                <p className="text-sm text-muted-foreground">
                  Define the default columns to include in exports. Example: Name, ID Number, Contact, Group Name
                </p>
              </div>

              <Button onClick={() => saveSettings('Export')}>
                Save Export Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage security and access control settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Password Policy</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Minimum Password Length</Label>
                    <Input type="number" defaultValue="8" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Special Characters</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Numbers</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require Uppercase Letters</Label>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Access Control</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Login Attempts Limit</Label>
                    <Input type="number" defaultValue="5" className="w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Account Lockout Duration (minutes)</Label>
                    <Input type="number" defaultValue="30" className="w-20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Force Password Change (days)</Label>
                    <Input type="number" defaultValue="90" className="w-20" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Audit & Logging</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Log User Activities</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Log Failed Login Attempts</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Log Data Changes</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Button onClick={() => saveSettings('Security')}>
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};